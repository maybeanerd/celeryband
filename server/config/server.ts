import { loadServerConfig } from '~/server/config/serverConfig';

const developmentMode = process.env.DEVELOPMENT_MODE === 'true';

if (developmentMode) {
  console.warn('Development mode is enabled. This will generate test data and leak sensitive information like emails into the logs. DO NOT USE IN PRODUCTION.');
}

const config = loadServerConfig();

export const serverConfiguration = {
  developmentMode,
  ...config,
};
