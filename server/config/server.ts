import { loadSalaryOptions } from '~/server/config/salaryOptions';

const developmentMode = process.env.DEVELOPMENT_MODE === 'true';

if (developmentMode) {
  console.warn('Development mode is enabled. This will generate test data and leak sensitive information like emails into the logs. DO NOT USE IN PRODUCTION.');
}

const config = loadSalaryOptions();

export const serverConfiguration = {
  developmentMode,
  ...config,
};
