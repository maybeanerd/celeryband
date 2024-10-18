import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  dialect: 'sqlite',
} satisfies Config;
