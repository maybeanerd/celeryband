import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '~/server/db/schema';

export function useDrizzle () {
  return { db: drizzle('celery.sqlite', { schema }) };
}
