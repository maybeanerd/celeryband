import { loadSalaryOptions } from '~/server/config/salaryOptions';

export default defineNitroPlugin(() => {
  const config = loadSalaryOptions();
  console.info(`[loadConfig] YAML config loaded -- ${config.serverUrl}`);
});
