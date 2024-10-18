import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { useOgDrizzle } from '~/server/utils/useOgDrizzle';

export default defineNitroPlugin(() => {
  console.log('Initializing DB');

  const { db } = useOgDrizzle();
  migrate(db, { migrationsFolder: './server/db/migrations' });

  console.log('Finished initializing DB');
});
