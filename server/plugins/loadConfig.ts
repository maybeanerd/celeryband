import { loadServerConfig } from '~/server/config/serverConfig';

export default defineNitroPlugin(() => {
  const config = loadServerConfig();
  console.info(`[loadConfig] YAML config loaded -- ${config.serverUrl}`);
});
