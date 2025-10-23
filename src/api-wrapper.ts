import { InputParameters } from './input-parameters';
import { Client, EnvironmentRepository, Logger, Project, ProjectRepository } from '@octopusdeploy/api-client';

export async function createEphemeralEnvironmentFromInputs(client: Client, parameters: InputParameters, logger: Logger): Promise<string> {
  client.info('🐙 Creating an ephemeral environment in Octopus Deploy...');

  const project = await GetProjectByName(client, parameters.project, parameters.space, logger);

  const environmentRepository = new EnvironmentRepository(client, parameters.space);
  const response = await environmentRepository.createEphemeralEnvironment(parameters.name, project.Id);

  client.info(`🎉 Ephemeral environment '${parameters.name}' created successfully!`);

  return response.Id;
}

export async function GetProjectByName(client: Client, projectName: string, spaceName: string, logger: Logger): Promise<Project> {
  const projectRepository = new ProjectRepository(client, spaceName);

  let project: Project | undefined;

  try {
    const projects = (await projectRepository.list({ partialName: projectName })).Items;
    project = projects.find(p => p.Name === projectName);

  } catch (error) {
    logger.error?.("Error getting project by name:", error as Error);
  }

  if (project !== null && project !== undefined) {
    return project;
  } else {
    logger.error?.(`Project, "${projectName}" not found`, undefined);
    throw new Error(`Project, "${projectName}" not found`);
  }
}