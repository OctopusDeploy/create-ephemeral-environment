import { getInputParameters } from './input-parameters';
import { setFailed } from '@actions/core';
import { Client, ClientConfiguration } from '@octopusdeploy/api-client';

// GitHub actions entrypoint
import { createEphemeralEnvironmentFromInputs } from './api-wrapper';
import { ActionContext } from './ActionContext';

export async function createEnvironment(context: ActionContext): Promise<void> {
    try {
        const parameters = getInputParameters(context);

        const config: ClientConfiguration = {
            userAgentApp: 'GitHubActions create-ephemeral-environment',
            instanceURL: parameters.server,
            apiKey: parameters.apiKey,
            accessToken: parameters.accessToken,
            logging: context
        }

        const client = await Client.create(config);

        await createEphemeralEnvironmentFromInputs(client, parameters, context);

        context.writeStepSummary(`🐙 Octopus Deploy created an ephemeral environment **${parameters.name}** for project **${parameters.project}**.`);

    } catch (e: unknown) {
        if (e instanceof Error) {
            setFailed(e);
        } else {
            setFailed(`Unknown error: ${e}`);
        }
    }
}