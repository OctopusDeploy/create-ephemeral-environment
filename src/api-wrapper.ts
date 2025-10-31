import { ActionContext } from './ActionContext';
import { InputParameters } from './input-parameters';
import { Client, EnvironmentRepository, Project, ProjectRepository } from '@octopusdeploy/api-client';

export async function createEphemeralEnvironmentFromInputs(client: Client, parameters: InputParameters, context: ActionContext): Promise<string> {
  client.info('🐙 Creating an ephemeral environment in Octopus Deploy...');

  const project = await GetProjectByName(client, parameters.project, parameters.space, context);

  const environmentRepository = new EnvironmentRepository(client, parameters.space);

  const response = await environmentRepository.createEphemeralEnvironment(
    parameters.name,
    project.Id
  );
    client.info(`🎉 Ephemeral environment '${parameters.name}' created successfully!`);

  return response.Id;
}

export async function GetProjectByName(client: Client, projectName: string, spaceName: string, context: ActionContext): Promise<Project> {
  const projectRepository = new ProjectRepository(client, spaceName);

  let project: Project | undefined;

  try {
    const response = await projectRepository.list({ partialName: projectName });
    const projects = response.Items;
    project = projects.find(p => p.Name === projectName);

  } catch (error) {
    context.error(`Error getting project by name: ${error}`);
  }

  if (project !== null && project !== undefined) {
    return project;
  } else {
    context.error(`Project, "${projectName}" not found`);
    throw new Error(`Project, "${projectName}" not found`);
  }
}

export async function GetExistingEnvironmentIdByName(client: Client, environmentName: string, spaceName: string, context: ActionContext): Promise<string | null> {
  const environmentRepository = new EnvironmentRepository(client, spaceName);
  const existingEnvironment = await environmentRepository.getEnvironmentByName(environmentName);
        
  if (existingEnvironment) {
    return existingEnvironment.Id;
  } 

  context.info(`Environment, "${environmentName}" not found`);
  return null;
}

export async function GetEnvironmentProjectState(client: Client, environmentId: string, projectId: string, spaceName: string, context: ActionContext): Promise<string | null> {
  const environmentRepository = new EnvironmentRepository(client, spaceName);
  const projectStatus = await environmentRepository.getEphemeralEnvironmentProjectStatus(environmentId, projectId);
  
  context.info(`Environment, "${projectStatus}" not found`);
  return projectStatus.Status;
}