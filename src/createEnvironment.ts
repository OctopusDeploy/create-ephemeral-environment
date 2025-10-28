import { getInputParameters } from './input-parameters';
import { Client, ClientConfiguration } from '@octopusdeploy/api-client';
import { createEphemeralEnvironmentFromInputs, GetExistingEnvironmentIdByName } from './api-wrapper';
import { ActionContext } from './ActionContext';
import { OctopusError } from '@octopusdeploy/api-client/dist/octopusError';

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

  try {
    await createEphemeralEnvironmentFromInputs(client, parameters, context);
  } catch (e: unknown) {
    if (e instanceof OctopusError) {
      if (
        e.ErrorMessage &&
        e.ErrorMessage.includes('The project is already connected to this ephemeral environment')
      ) {
        await GetExistingEnvironmentIdByName(client, parameters.name, parameters.space, context);

        context.writeStepSummary(
          `🐙 Octopus Deploy reused the existing ephemeral environment **${parameters.name}** for project **${parameters.project}**.`
        );
        return;
      }

      throw e;
    }
  }

  context.writeStepSummary(
    `🐙 Octopus Deploy created an ephemeral environment **${parameters.name}** for project **${parameters.project}**.`
  );
}