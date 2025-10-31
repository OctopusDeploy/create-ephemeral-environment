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
        shortEnvironmentName: "My Ephemeral Env",
        shortNameEnvironmentId: "Environments-124",
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
      http.get('https://my.octopus.app/api', () => {
        return HttpResponse.json([{}]);
      }),
      http.get('https://my.octopus.app/api/spaces', () => {
        return HttpResponse.json({
          Items: [
            {
              Name: testData.spaceName,
              Id: testData.spaceId,
            },
          ],
        });
      }),
      http.get('https://my.octopus.app/api/:spaceId/projects', () => {
        return HttpResponse.json({
          Items: [
            {
              Name: testData.projectName,
              Id: testData.projectId,
            },
          ],
        });
      }),
      http.post(
        'https://my.octopus.app/api/:spaceId/projects/:projectId/environments/ephemeral',
        () => {
          return HttpResponse.json({
            Id: testData.environmentId,
          });
        }
      ),
    ];

    describe("when creating a new ephemeral environment", () => {
        test("should create a new environment with the project connected", async () => {
            const context = createTestContext();
            
            const server = setupServer(
              ...createBaseHandlers(),
              http.get('https://my.octopus.app/api/:spaceId/environments/v2', () => {
                return HttpResponse.json({
                  Items: [],
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

    describe("when environment already exists and is connected", () => {
        test("should reuse existing environment", async () => {
            const context = createTestContext();
            
            const server = setupServer(
                ...createBaseHandlers(),
                http.get("https://my.octopus.app/api/:spaceId/environments/v2", () => {
                    return HttpResponse.json({
                      Items: [
                        {
                          Name: testData.environmentName,
                          Id: testData.environmentId,
                        },
                      ],
                    });}),
                http.get('https://my.octopus.app/api/:spaceId/projects/:projectId/environments/ephemeral/:id/status', () => {
                    return HttpResponse.json({
                            Status: 'NotProvisioned',
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

        test("should not care about environment name case", async () => {
            const context = createTestContext();
            
            const server = setupServer(
                ...createBaseHandlers(),
                http.get("https://my.octopus.app/api/:spaceId/environments/v2", () => {
                    return HttpResponse.json({
                      Items: [
                        {
                          Name: testData.environmentName.toUpperCase(),
                          Id: testData.environmentId,
                        },
                      ],
                    });
                }),
                http.get('https://my.octopus.app/api/:spaceId/projects/:projectId/environments/ephemeral/:id/status', () => {
                    return HttpResponse.json({
                            Status: 'NotProvisioned',
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

        
        test("should not match on partial environment name", async () => {
            const context = createTestContext();
            
            const server = setupServer(
                ...createBaseHandlers(),
                http.get("https://my.octopus.app/api/:spaceId/environments/v2", () => {
                    return HttpResponse.json({
                      Items: [
                         {
                          Name: testData.shortEnvironmentName,
                          Id: testData.shortNameEnvironmentId,
                        },
                        {
                          Name: testData.environmentName,
                          Id: testData.environmentId,
                        },
                      ],
                    });}),
                http.get('https://my.octopus.app/api/:spaceId/projects/:projectId/environments/ephemeral/:id/status', () => {
                    return HttpResponse.json({
                            Status: 'NotProvisioned',
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

        test("should reuse existing environment", async () => {
            const context = createTestContext();
            
            const server = setupServer(
                ...createBaseHandlers(),
                http.get("https://my.octopus.app/api/:spaceId/environments/v2", () => {
                    return HttpResponse.json({
                      Items: [
                        {
                          Name: testData.environmentName,
                          Id: testData.environmentId,
                        },
                      ],
                    });}),
                http.get('https://my.octopus.app/api/:spaceId/projects/:projectId/environments/ephemeral/:id/status', () => {
                    return HttpResponse.json({
                            Status: 'NotProvisioned',
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
    });

     describe("when environment already exists and is not connected", () => {
        test("should connect existing environment", async () => {
            const context = createTestContext();
            
             const server = setupServer(
               ...createBaseHandlers(),
               http.get('https://my.octopus.app/api/:spaceId/environments/v2', () => {
                 return HttpResponse.json({
                   Items: [
                     {
                       Name: testData.environmentName,
                       Id: testData.environmentId,
                     },
                   ],
                 });
               }),
               http.get(
                 'https://my.octopus.app/api/:spaceId/projects/:projectId/environments/ephemeral/:id/status',
                 () => {
                   return HttpResponse.json({
                     Status: 'NotConnected',
                   });
                 }
               ),
             );
            server.listen();

            await createEnvironment(context);
            
             expect(context.getStepSummary()).toEqual(
                `🐙 Octopus Deploy connected ephemeral environment **${testData.environmentName}** to project **${testData.projectName}**.`
            );
            
            server.close();
        });
    });
});
