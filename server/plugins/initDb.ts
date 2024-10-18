import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { useMigrationDrizzle } from '~/server/utils/useDrizzle';

export default defineNitroPlugin(() => {
  console.log('Initializing DB');

  const { db } = useMigrationDrizzle();
  migrate(db, { migrationsFolder: './server/db/migrations' });

  console.log('Finished initializing DB');
});
