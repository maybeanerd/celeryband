import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

export default defineNitroPlugin(() => {
  console.info('Initializing DB');

  const { db } = useDrizzle();

  console.info('Running DB migrations');
  migrate(db, { migrationsFolder: './server/db/migrations' });

  console.info('Finished initializing DB');
});
