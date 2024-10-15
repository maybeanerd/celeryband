import 'dotenv/config';
import type { Config } from 'drizzle-kit';
import { dbConfig } from './server/db/config';

export default {
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: dbConfig.host,
    port: 5432,
    user: 'root',
    password: 'root',
    database: 'celery',
  },
} satisfies Config;
