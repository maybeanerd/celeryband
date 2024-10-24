import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '~/server/db/schema';

const db = drizzle('./data/db.sqlite3', { schema });

export function useDrizzle () {
  return { db };
}
