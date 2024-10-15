import { drizzle } from 'drizzle-orm/node-postgres';
import * as PG from 'pg';
import * as schema from '~/server/db/schema';
import * as drizzleConfig from '~/drizzle.config';

export function useDrizzle () {
  const client = new PG.Client(drizzleConfig.default.dbCredentials);
  return drizzle(client, { schema });
}
