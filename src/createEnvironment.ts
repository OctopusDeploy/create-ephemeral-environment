import { getInputParameters } from './input-parameters';
import { Client, ClientConfiguration } from '@octopusdeploy/api-client';
import { createEphemeralEnvironmentFromInputs, GetEnvironmentProjectState, GetExistingEnvironmentIdByName, GetProjectByName } from './api-wrapper';
import { ActionContext } from './ActionContext';

export async function createEnvironment(context: ActionContext): Promise<void> {
  const parameters = getInputParameters(context);

  const config: ClientConfiguration = {
    userAgentApp: 'GitHubActions create-ephemeral-environment',
    instanceURL: parameters.server,
    apiKey: parameters.apiKey,
    accessToken: parameters.accessToken,
    logging: context,
  };
  const client = await Client.create(config);

    const environmentId = await GetExistingEnvironmentIdByName(client, parameters.name, parameters.space, context);
    if (!environmentId) {
      await createEphemeralEnvironmentFromInputs(client, parameters, context);
      context.writeStepSummary(
        `🐙 Octopus Deploy created an ephemeral environment **${parameters.name}** for project **${parameters.project}**.`
      );
      return;
    } else {
      const project = await GetProjectByName(client, parameters.project, parameters.space, context);
      const environmentProjectState = await GetEnvironmentProjectState(client, environmentId!, project.Id, parameters.space, context);
      if (environmentProjectState == "NotConnected ") {
        await createEphemeralEnvironmentFromInputs(client, parameters, context);
        context.writeStepSummary(
          `🐙 Octopus Deploy created an ephemeral environment **${parameters.name}** for project **${parameters.project}**.`
        );
        return;
    } else {
      context.writeStepSummary(
        `🐙 Octopus Deploy reused the existing ephemeral environment **${parameters.name}** for project **${parameters.project}**.`
      );
        return;
      }
    }
  }
