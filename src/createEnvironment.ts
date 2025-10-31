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

  context.info(`🐙 Creating ephemeral environment with name ${parameters.name}...`);
  const environmentId = await GetExistingEnvironmentIdByName(client, parameters.name, parameters.space, context);
  context.info(`🔍 Environment lookup result: ${environmentId ? `Found ID: ${environmentId}` : 'Not found'}`);
  
  if (!environmentId) {
    context.info(`🆕 Environment not found - creating new environment`);
    await createEphemeralEnvironmentFromInputs(client, parameters, context);
    context.writeStepSummary(
      `🐙 Octopus Deploy created an ephemeral environment **${parameters.name}** for project **${parameters.project}**.`
    );
    return;
  } else {
    context.info(`✅ Environment found - checking project connection`);
    const project = await GetProjectByName(client, parameters.project, parameters.space, context);
    const environmentProjectState = await GetEnvironmentProjectState(client, environmentId!, project.Id, parameters.space, context);
    context.info(`🔗 Environment project state: ${environmentProjectState}`);
    
    if (environmentProjectState == 'NotConnected') {
      context.info(`🔌 Connecting existing environment to project`);
      await createEphemeralEnvironmentFromInputs(client, parameters, context);
      context.info(`🐙 Connecting existing ephemeral environment ${parameters.name} to project ${parameters.project}.`);

      context.writeStepSummary(
        `🐙 Octopus Deploy connected ephemeral environment **${parameters.name}** to project **${parameters.project}**.`
      );
      context.info(`📝 Step summary written: Connected existing environment`);
      return;
    } else {
      context.info(`♻️ Environment already connected - reusing`);
      context.info(`🐙 Ephemeral environment ${parameters.name} already exists and is connected to project ${parameters.project}. Reusing existing environment.`);

      context.writeStepSummary(
        `🐙 Octopus Deploy reused the existing ephemeral environment **${parameters.name}** for project **${parameters.project}**.`
      );
      context.info(`📝 Step summary written: Reused existing environment`);
      return;
    }
  }
}
