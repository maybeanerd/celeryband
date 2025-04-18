import { eq } from 'drizzle-orm';
import { type SalarySchema, salarySchema } from '~/server/db/schemas/Salary.schema';

export async function storeSalaryForUser (userId: string, salary: {
yearlyAmount: number;
department: string;
hoursPerWeek: number;
role: string;
seniorityLevel: string;
}) {
  const { db } = useDrizzle();

  const existingSalary = await db.query.salary.findFirst({ where: eq(salarySchema.ownerId, userId) });

  const now = new Date().getTime();

  if (existingSalary) {
    await db.update(salarySchema).set({
      yearlyAmount: salary.yearlyAmount,
      department: salary.department,
      hoursPerWeek: salary.hoursPerWeek,
      role: salary.role,
      seniorityLevel: salary.seniorityLevel,
      updatedAt: now,
    }).where(eq(salarySchema.ownerId, userId));
    return;
  }

  await db.insert(salarySchema).values({
    ownerId: userId,
    yearlyAmount: salary.yearlyAmount,
    department: salary.department,
    hoursPerWeek: salary.hoursPerWeek,
    role: salary.role,
    seniorityLevel: salary.seniorityLevel,
    createdAt: now,
    updatedAt: now,
  });
}

export async function getSalaryForUser (userId: string): Promise<SalarySchema | null> {
  const { db } = useDrizzle();

  const salary = await db.query.salary.findFirst({
    where: eq(salarySchema.ownerId, userId),
  });

  return salary ?? null;
}
