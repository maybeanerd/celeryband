import { initializeDb } from '~/server/db';

export default defineNitroPlugin(async () => {
  await initializeDb();
});
