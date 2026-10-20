import type { TransformedSalaryOptions } from '~/server/config/serverConfig';
import { loadServerConfig } from '~/server/config/serverConfig';

const developmentMode = process.env.DEVELOPMENT_MODE === 'true';

if (developmentMode) {
  console.warn('Development mode is enabled. This will generate test data and leak sensitive information like emails into the logs. DO NOT USE IN PRODUCTION.');
}

let _cached: TransformedSalaryOptions | null = null;

function getConfig (): TransformedSalaryOptions {
  if (!_cached) {
    _cached = loadServerConfig();
  }
  return _cached;
}

export const serverConfiguration = {
  get developmentMode () { return developmentMode; },
  get serverUrl () { return getConfig().serverUrl; },
  get currency () { return getConfig().currency; },
  get acceptedDomain () { return getConfig().acceptedDomain; },
  get disclaimer () { return getConfig().disclaimer; },
  get departments () { return getConfig().departments; },
};
