import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle as ogDrizzle } from 'drizzle-orm/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle';
import * as schema from '~/server/db/schema';

export function useMigrationDrizzle () {
  // TODO find out why db0/connectors drizzle is different from the normal drizzle, and if we could use either
  return { db: ogDrizzle() };
}

// Initialize DB instance
// You can use any other available connector
const db = createDatabase(sqlite({ }));

// And then leverage drizzle typed API to make more advanced ones
export function useDrizzle () {
  return { db: drizzle<typeof schema>(db) };
}
