import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { userSchema } from './User.schema';

export const salarySchema = sqliteTable('salary', {
  ownerId: text().primaryKey().references(() => userSchema.id),

  role: text().notNull(),
  seniorityLevel: text().notNull(),
  department: text().notNull(),

  yearlyAmount: int().notNull(),
  hoursPerWeek: int().notNull(),

  createdAt: int().notNull(),
  updatedAt: int().notNull(),
});

export type SalarySchema = typeof salarySchema.$inferSelect;
export type SalarySchemaInsert = typeof salarySchema.$inferInsert;
