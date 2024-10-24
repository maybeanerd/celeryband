import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const userSchema = sqliteTable('user', {
  id: text().primaryKey(), // TODO somehow generate UUIDs here, preferrably by default
  emailHash: text().unique().notNull(),
});

export type User = typeof userSchema.$inferSelect;
export type NewUser = typeof userSchema.$inferInsert;
