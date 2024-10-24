import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '~/server/db/schema';

export function useOgDrizzle () {
  // TODO find out why db0/connectors drizzle is different from the normal drizzle, and if we could use either
  return { db: drizzle('celery.sqlite', { schema }) };
}
