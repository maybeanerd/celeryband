import { type NodePgQueryResultHKT, drizzle } from 'drizzle-orm/node-postgres';
import * as PG from 'pg';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from './schema';
import * as drizzleConfig from '~/drizzle.config';

// TODO use nuxt and nitros internal DB system with sqlite and drizzle
// https://nitro.unjs.io/guide/database
// https://db0.unjs.io/integrations/drizzle

async function runMigrations () {
  const dbClient = new PG.Client(drizzleConfig.default.dbCredentials);
  const db = drizzle(dbClient);
  await dbClient.connect();
  await migrate(db, { migrationsFolder: './server/db/migrations' });
  await dbClient.end();
}

export async function initializeDb () {
  await runMigrations();
}

export type DbTransaction = PgTransaction<
  NodePgQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;
