import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const obfuscationSaltSchema = sqliteTable('obfuscationSalt', {
  salt: text().primaryKey(),
});

export type ObfuscationSalt = typeof obfuscationSaltSchema.$inferSelect;
export type ObfuscationSaltInsert = typeof obfuscationSaltSchema.$inferInsert;
