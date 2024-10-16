import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

export default defineNitroPlugin(() => {
  const db = useDrizzle();
  migrate(db, { migrationsFolder: './server/db/migrations' });
});
