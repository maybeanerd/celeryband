import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
  id: text().primaryKey(), // TODO somehow generate UUIDs here, preferrably by default
  emailHash: text().unique().notNull(),
});

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
