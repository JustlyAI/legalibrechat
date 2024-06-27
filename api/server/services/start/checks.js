const {
  Constants,
  deprecatedAzureVariables,
  conflictingAzureVariables,
} = require('legallibrechat-data-provider');
const { isEnabled, checkEmailConfig } = require('~/server/utils');
const { logger } = require('~/config');

const secretDefaults = {
  CREDS_KEY: 'b460d9867a26d092464f58abd9970b6585c17bf350a9e21274296e8883fd0557',
  CREDS_IV: '66473f98e42bfab07f83f811497e42e7',
  JWT_SECRET: '115454fa6bb0c5e641008d4e9c14918cccf2514bd607d9697229d1f8a6a501c1',
  JWT_REFRESH_SECRET: '6e616c539ee43bdf677ecc04fb59efa5c5ee7abf01ce3e0b6c510219b0a656d3',
};

/**
 * Checks environment variables for default secrets and deprecated variables.
 * Logs warnings for any default secret values being used and for usage of deprecated `GOOGLE_API_KEY`.
 * Advises on replacing default secrets and updating deprecated variables.
 */
function checkVariables() {
  let hasDefaultSecrets = false;
  for (const [key, value] of Object.entries(secretDefaults)) {
    if (process.env[key] === value) {
      logger.warn(`Default value for ${key} is being used.`);
      !hasDefaultSecrets && (hasDefaultSecrets = true);
    }
  }

  if (hasDefaultSecrets) {
    logger.info('Please replace any default secret values.');
    logger.info(`\u200B

    For your convenience, use this tool to generate your own secret values:
    https://www.librechat.ai/toolkit/creds_generator

    \u200B`);
  }

  if (process.env.GOOGLE_API_KEY) {
    logger.warn(
      'The `GOOGLE_API_KEY` environment variable is deprecated.\nPlease use the `GOOGLE_SEARCH_API_KEY` environment variable instead.',
    );
  }

  if (process.env.OPENROUTER_API_KEY) {
    logger.warn(
      `The \`OPENROUTER_API_KEY\` environment variable is deprecated and its functionality will be removed soon.
      Use of this environment variable is highly discouraged as it can lead to unexpected errors when using custom endpoints.
      Please use the config (\`legallibrechat.yaml\`) file for setting up OpenRouter, and use \`OPENROUTER_KEY\` or another environment variable instead.`,
    );
  }

  checkPasswordReset();
}

/**
 * Checks the health of auxiliary API's by attempting a fetch request to their respective `/health` endpoints.
 * Logs information or warning based on the API's availability and response.
 */
async function checkHealth() {
  try {
    const response = await fetch(`${process.env.RAG_API_URL}/health`);
    if (response?.ok && response?.status === 200) {
      logger.info(`RAG API is running and reachable at ${process.env.RAG_API_URL}.`);
    }
  } catch (error) {
    logger.warn(
      `RAG API is either not running or not reachable at ${process.env.RAG_API_URL}, you may experience errors with file uploads.`,
    );
  }
}

/**
 * Checks for the usage of deprecated and conflicting Azure variables.
 * Logs warnings for any deprecated or conflicting environment variables found, indicating potential issues with `azureOpenAI` endpoint configuration.
 */
function checkAzureVariables() {
  deprecatedAzureVariables.forEach(({ key, description }) => {
    if (process.env[key]) {
      logger.warn(
        `The \`${key}\` environment variable (related to ${description}) should not be used in combination with the \`azureOpenAI\` endpoint configuration, as you will experience conflicts and errors.`,
      );
    }
  });

  conflictingAzureVariables.forEach(({ key }) => {
    if (process.env[key]) {
      logger.warn(
        `The \`${key}\` environment variable should not be used in combination with the \`azureOpenAI\` endpoint configuration, as you may experience with the defined placeholders for mapping to the current model grouping using the same name.`,
      );
    }
  });
}

/**
 * Performs basic checks on the loaded config object.
 * @param {TCustomConfig} config - The loaded custom configuration.
 */
function checkConfig(config) {
  if (config.version !== Constants.CONFIG_VERSION) {
    logger.info(
      `\nOutdated Config version: ${config.version}
Latest version: ${Constants.CONFIG_VERSION}

      Check out the Config changelogs for the latest options and features added.

      https://www.librechat.ai/changelog\n\n`,
    );
  }
}

function checkPasswordReset() {
  const emailEnabled = checkEmailConfig();
  const passwordResetAllowed = isEnabled(process.env.ALLOW_PASSWORD_RESET);

  if (!emailEnabled && passwordResetAllowed) {
    logger.warn(
      `❗❗❗

      Password reset is enabled with \`ALLOW_PASSWORD_RESET\` but email service is not configured.
      
      This setup is insecure as password reset links will be issued with a recognized email.
      
      Please configure email service for secure password reset functionality.
      
      https://www.librechat.ai/docs/configuration/authentication/password_reset

      ❗❗❗`,
    );
  }
}

module.exports = { checkVariables, checkHealth, checkConfig, checkAzureVariables };
