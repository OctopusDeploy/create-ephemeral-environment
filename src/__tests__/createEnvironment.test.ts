import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { ActionContextTesting } from "../ActionContextTesting";
import { createEnvironment } from "../createEnvironment";

test("Test 1", async () => {
    const context = new ActionContextTesting();
    const serverUrl = "https://my.octopus.app";
    context.addInput("server", serverUrl);
    context.addInput("api_key", "API-XXXXXXXXXXXXXXXXXXXXXXXX");
    context.addInput("space", "Default");
    context.addInput("project", "My Project");
    context.addInput("name", "My Ephemeral Environment");

    const server = setupServer(
        http.post("https://my.octopus.app/api/Default/projects/{projectId}/environments/ephemeral", () => {
            return HttpResponse.json({
                Id: "Environments-123",
            });
        }),
        http.get("https://my.octopus.app/api/Default/projects", () => {
            return HttpResponse.json([{
                Name: "My Project",
                Id: "Projects-123",
            }])
        }),
        // Do we actually need these?
        http.get("https://my.octopus.app/api", () => {
            return HttpResponse.json([{
            }])
        }),
        http.get("https://my.octopus.app/api/spaces", () => {
            return HttpResponse.json([{
                Name: "Default",
                Id: "Spaces-1",
            }])
        })
    );

    server.listen();

    await createEnvironment(context)
});