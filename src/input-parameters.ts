import { getInput } from '@actions/core'

const EnvironmentVariables = {
  URL: 'OCTOPUS_URL',
  ApiKey: 'OCTOPUS_API_KEY',
  AccessToken: 'OCTOPUS_ACCESS_TOKEN',
  Space: 'OCTOPUS_SPACE'
} as const

export interface InputParameters {
  name: string
  project: string
  space: string
  server: string
  apiKey?: string
  accessToken?: string
}

export function getInputParameters(): InputParameters {
  const parameters = {
    server: getInput('server') || process.env[EnvironmentVariables.URL] || '',
    apiKey: getInput('api_key') || process.env[EnvironmentVariables.ApiKey],
    accessToken: getInput('service_account_id') || process.env[EnvironmentVariables.AccessToken],
    space: getInput('space') || process.env[EnvironmentVariables.Space] || '',
    name: getInput('name', { required: true }),
    project: getInput('project', { required: true }),
  }

  const errors: string[] = []
  if (!parameters.server) {
    errors.push(
      "The Octopus instance URL is required, please specify explicitly through the 'server' input or set the OCTOPUS_URL environment variable."
    )
  }

  if (!parameters.apiKey && !parameters.accessToken) {
    errors.push(
      "The Octopus API Key is required or OIDC access token, please specify an API key through the 'api_key' input or OCTOPUS_API_KEY environment variable, or supply an OIDC access token through the 'service_account_id' input or OCTOPUS_ACCESS_TOKEN environment variable."
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