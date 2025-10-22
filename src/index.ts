import { getInputParameters } from './input-parameters'
import { debug, error, info, isDebug, setFailed, warning } from '@actions/core'
import { Client, ClientConfiguration, Logger } from '@octopusdeploy/api-client'

// GitHub actions entrypoint
import { createEphemeralEnvironmentFromInputs } from './api-wrapper'
import { writeFileSync } from 'fs'

;(async (): Promise<void> => {
  try {
    const logger: Logger = {
      debug: message => {
        if (isDebug()) {
          debug(message)
        }
      },
      info: message => info(message),
      warn: message => warning(message),
      error: (message, err) => {
        if (err !== undefined) {
          error(err.message)
        } else {
          error(message)
        }
      }
    }

    const parameters = getInputParameters()

    const config: ClientConfiguration = {
      userAgentApp: 'GitHubActions create-ephemeral-environment-action',
      instanceURL: parameters.server,
      apiKey: parameters.apiKey,
      logging: logger
    }

    const client = await Client.create(config)

    const environmentId = await createEphemeralEnvironmentFromInputs(client, parameters)

    const stepSummaryFile = process.env.GITHUB_STEP_SUMMARY
    if (stepSummaryFile && environmentId) {
      writeFileSync(
        stepSummaryFile,
        `🐙 Octopus Deploy created an ephemeral environment **${parameters.name}** for project **${parameters.project}**.`
      )
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      setFailed(e)
    } else {
      setFailed(`Unknown error: ${e}`)
    }
  }
})()