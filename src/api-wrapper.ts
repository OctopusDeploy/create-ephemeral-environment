import { InputParameters } from './input-parameters'
import { Client, EnvironmentRepository } from '@octopusdeploy/api-client'

export async function createEphemeralEnvironmentFromInputs(client: Client, parameters: InputParameters): Promise<string> {
  client.info('🐙 Creating an ephemeral environment in Octopus Deploy...')

  const repository = new EnvironmentRepository(client, parameters.space)
  const response = await repository.createEphemeralEnvironment(parameters.environment_name, parameters.project)

  client.info(`🎉 Ephemeral environment '${parameters.environment_name}' created successfully!`)

  return response.Id
}