import { InputParameters } from './input-parameters'
import { Client, EnvironmentRepository, Project, ProjectRepository } from '@octopusdeploy/api-client'

export async function createEphemeralEnvironmentFromInputs(client: Client, parameters: InputParameters): Promise<string> {
  client.info('🐙 Creating an ephemeral environment in Octopus Deploy...')

  const project = await GetProjectByName(client, parameters.project, parameters.space);

  const environmentRepository = new EnvironmentRepository(client, parameters.space)
  const response = await environmentRepository.createEphemeralEnvironment(parameters.name, project.Id)

  client.info(`🎉 Ephemeral environment '${parameters.name}' created successfully!`)

  return response.Id
}

export async function GetProjectByName(client: Client, projectName: string, spaceName: string): Promise<Project> {
    const projectRepository = new ProjectRepository(client, spaceName);

    let project: Project | undefined;

    try {
        project = (await projectRepository.list({ partialName: projectName })).Items[0];
    } catch (error) {
        console.error(error);
    }

    if (project !== null && project !== undefined) {
        return project;
    } else {
        console.error(`Project, "${projectName}" not found`);
        throw new Error(`Project, "${projectName}" not found`);
    }
}