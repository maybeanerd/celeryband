import { type NodePgQueryResultHKT, drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from './schema';
import * as drizzleConfig from '~/drizzle.config';

async function runMigrations () {
  const dbClient = new Client(drizzleConfig.default.dbCredentials);
  const db = drizzle(dbClient);
  await dbClient.connect();
  await migrate(db, { migrationsFolder: './server/db/migrations' });
  await dbClient.end();
}

const client = new Client(drizzleConfig.default.dbCredentials);

export async function initializeDb () {
  await runMigrations();

  await client.connect();
}

export const drizz = drizzle(client, { schema });

export type DbTransaction = PgTransaction<
  NodePgQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;
