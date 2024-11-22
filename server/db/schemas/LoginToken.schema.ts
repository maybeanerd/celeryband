import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const loginTokenSchema = sqliteTable('loginToken', {
  token: text().primaryKey(),
  emailHash: text().notNull(),
  expirationDate: int().notNull(), // There is no date type, but this is at least comparable
});

export type LoginToken = typeof loginTokenSchema.$inferSelect;
export type LoginTokenInsert = typeof loginTokenSchema.$inferInsert;
