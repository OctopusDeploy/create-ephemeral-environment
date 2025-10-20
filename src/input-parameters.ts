import { getInput } from '@actions/core'

const EnvironmentVariables = {
  URL: 'OCTOPUS_URL',
  ApiKey: 'OCTOPUS_API_KEY',
  Space: 'OCTOPUS_SPACE'
} as const

export interface InputParameters {
  environment_name: string
  project: string
  space: string
  server: string
  apiKey?: string
}

export function getInputParameters(): InputParameters {
  const parameters = {
    server: getInput('server') || process.env[EnvironmentVariables.URL] || '',
    apiKey: getInput('api_key') || process.env[EnvironmentVariables.ApiKey],
    space: getInput('space') || process.env[EnvironmentVariables.Space] || '',
    environment_name: getInput('environment_name', { required: true }),
    project: getInput('project', { required: true }),
  }

  const errors: string[] = []
  if (!parameters.server) {
    errors.push(
      "The Octopus instance URL is required, please specify explicitly through the 'server' input or set the OCTOPUS_URL environment variable."
    )
  }

  if (!parameters.apiKey) {
    errors.push(
      "The Octopus API Key is required, please specify explicitly through the 'api_key' input or set the OCTOPUS_API_KEY environment variable."
    )
  }

  if (!parameters.space) {
    errors.push(
      "The Octopus space name is required, please specify explicitly through the 'space' input or set the OCTOPUS_SPACE environment variable."
    )
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n'))
  }

  return parameters
}