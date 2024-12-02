import { lt } from 'drizzle-orm';
import { defineCronHandler } from '#nuxt/cron';
import { loginTokenSchema } from '~/server/db/schemas/LoginToken.schema';

export default defineCronHandler('everyFiveMinutes', async () => {
  const { db } = useDrizzle();

  const { changes } = await db.delete(loginTokenSchema).where(lt(loginTokenSchema.expirationDate, Date.now()));
  console.info(`[CRON] Deleted ${changes} expired tokens.`);
});
