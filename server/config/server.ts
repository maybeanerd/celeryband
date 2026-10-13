import { loadSalaryOptions } from '~/server/config/salaryOptions';

// ---------------------------------------------------------------------------
// Non-YAML settings (still from env vars, required)
// ---------------------------------------------------------------------------

const serverUrl = process.env.SERVER_URL;
if (serverUrl === undefined) {
  throw new Error('SERVER_URL is not set. This is necessary to generate login links correctly.');
}

const acceptedDomain = process.env.ACCEPTED_DOMAIN;
if (acceptedDomain === undefined) {
  throw new Error('ACCEPTED_DOMAIN is not set. This is necessary to limit signups to your company.');
}

const developmentMode = process.env.DEVELOPMENT_MODE === 'true';

if (developmentMode) {
  console.warn('Development mode is enabled. This will generate test data and leak sensitive information like emails into the logs. DO NOT USE IN PRODUCTION.');
}

// ---------------------------------------------------------------------------
// YAML-backed salary options
// ---------------------------------------------------------------------------

const { departments, currency } = loadSalaryOptions();

export const serverConfiguration = {
  // From env vars
  serverUrl,
  acceptedDomain,
  developmentMode,

  // From config.yaml
  currency,
  departments,
};
