import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { ActionContextForTesting } from "../ActionContextForTesting";
import { createEnvironment } from "../createEnvironment";

describe("createEnvironment", () => {
    const serverUrl = "https://my.octopus.app";
    const testData = {
        projectName: "My Project",
        projectId: "Projects-123",
        environmentName: "My Ephemeral Environment",
        environmentId: "Environments-123",
        spaceName: "Default",
        spaceId: "Spaces-1",
        apiKey: "API-XXXXXXXXXXXXXXXXXXXXXXXX"
    };

    const createTestContext = (): ActionContextForTesting => {
        const context = new ActionContextForTesting();
        context.addInput("server", serverUrl);
        context.addInput("api_key", testData.apiKey);
        context.addInput("space", testData.spaceName);
        context.addInput("project", testData.projectName);
        context.addInput("name", testData.environmentName);
        return context;
    };

    const createBaseHandlers = (): ReturnType<typeof http.get>[] => [
        http.get("https://my.octopus.app/api", () => {
            return HttpResponse.json([{}]);
        }),
        http.get("https://my.octopus.app/api/spaces", () => {
            return HttpResponse.json({
                Items: [{
                    Name: testData.spaceName,
                    Id: testData.spaceId,
                }]
            });
        }),
        http.get("https://my.octopus.app/api/:spaceId/projects", () => {
            return HttpResponse.json({
                Items: [{
                    Name: testData.projectName,
                    Id: testData.projectId,
                }]
            });
        })
    ];

    describe("when creating a new ephemeral environment", () => {
        test("should output success step summary on successful creation", async () => {
            const context = createTestContext();
            
            const server = setupServer(
                ...createBaseHandlers(),
                http.post("https://my.octopus.app/api/:spaceId/projects/:projectId/environments/ephemeral", () => {
                    return HttpResponse.json({
                        Id: testData.environmentId,
                    });
                })
            );
            server.listen();

            await createEnvironment(context);
            
            expect(context.getStepSummary()).toEqual(
                `🐙 Octopus Deploy created an ephemeral environment **${testData.environmentName}** for project **${testData.projectName}**.`
            );
            
            server.close();
        });
    });

    describe("when environment already exists", () => {
        const createErrorHandlers = () => [
            ...createBaseHandlers(),
            http.post("https://my.octopus.app/api/:spaceId/projects/:projectId/environments/ephemeral", () => {
                return HttpResponse.json({
                    ErrorMessage: "The project is already connected to this ephemeral environment"
                }, { status: 400 });
            })
        ] as const;

        test("should reuse existing environment when it can be retrieved", async () => {
            const context = createTestContext();
            
            const server = setupServer(
                ...createErrorHandlers(),
                http.get("https://my.octopus.app/api/:spaceId/environments/v2", () => {
                    return HttpResponse.json({
                        Items: [{
                            Name: testData.environmentName,
                            Id: testData.environmentId,
                        }]
                    });
                })
            );
            server.listen();

            await createEnvironment(context);
            
            expect(context.getStepSummary()).toEqual(
                `🐙 Octopus Deploy reused the existing ephemeral environment **${testData.environmentName}** for project **${testData.projectName}**.`
            );
            
            server.close();
        });

        test("should throw error when environment exists but cannot be retrieved", async () => {
            const context = createTestContext();
            
            const server = setupServer(
                ...createErrorHandlers(),
                http.get("https://my.octopus.app/api/:spaceId/environments/v2", () => {
                    return HttpResponse.json({
                        Items: [] // Simulate that the environment cannot be found
                    });
                })
            );
            server.listen();

            await expect(createEnvironment(context)).rejects.toThrowError(
                `Environment '${testData.environmentName}' already exists but could not be retrieved.`
            );
            
            server.close();
        });
    });
});
