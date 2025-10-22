import { InputParameters } from './input-parameters'
import { Client, EnvironmentRepository, Project, ProjectRepository } from '@octopusdeploy/api-client'

export async function createEphemeralEnvironmentFromInputs(client: Client, parameters: InputParameters): Promise<string> {
  client.info('🐙 Creating an ephemeral environment in Octopus Deploy...')

  const project = await GetProject(client, parameters.project);

  const environmentRepository = new EnvironmentRepository(client, parameters.space)
  const response = await environmentRepository.createEphemeralEnvironment(parameters.environment_name, project.Id)

  client.info(`🎉 Ephemeral environment '${parameters.environment_name}' created successfully!`)

  return response.Id
}

export async function GetProject(client: Client, projectNameOrId: string): Promise<Project> {
    const projectRepository = new ProjectRepository(client, "Default");

    console.log(`Getting Project, "${projectNameOrId}"...`);

    let project: Project | undefined;

    try {
        console.log(await projectRepository.list()) // remove line // cc
        project = (await projectRepository.list({ partialName: projectNameOrId })).Items[0];
    } catch (error) {
        console.error(error);
    }

    if (project !== null && project !== undefined) {
        console.log(`Project found: "${project?.Name}" (${project?.Id})`);
        return project;
    } else {
        console.error(`Project, "${projectNameOrId}" not found`);
        throw new Error(`Project, "${projectNameOrId}" not found`);
    }
}