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

  const newSalaryData = {
    yearlyAmount: salary.yearlyAmount,
    department: salary.department,
    hoursPerWeek: salary.hoursPerWeek,
    role: salary.role,
    seniorityLevel: salary.seniorityLevel,
    updatedAt: now,
  };

  if (existingSalary) {
    await db.update(salarySchema).set(
      newSalaryData,
    ).where(eq(salarySchema.ownerId, userId));
    return;
  }

  await db.insert(salarySchema).values({
    ...newSalaryData,
    ownerId: userId,
    createdAt: now,
  });
}

export async function getSalaryForUser (userId: string): Promise<SalarySchema | null> {
  const { db } = useDrizzle();

  const salary = await db.query.salary.findFirst({
    where: eq(salarySchema.ownerId, userId),
  });

  return salary ?? null;
}

function calculateStatistics (salaries: SalarySchema[]): {
  average: number;
  median: number;
  max: number;
  min: number;
} {
  const amounts = salaries.map(s => s.yearlyAmount);
  const sum = amounts.reduce((a, b) => a + b, 0);
  const average = sum / amounts.length;
  const sortedAmounts = [...amounts].sort((a, b) => a - b);
  const median = sortedAmounts.length % 2 === 0
    ? ((sortedAmounts.at(sortedAmounts.length / 2 - 1) ?? 0) + (sortedAmounts.at(sortedAmounts.length / 2) ?? 0)) / 2
    : sortedAmounts.at(Math.floor(sortedAmounts.length / 2)) ?? 0;

  const min = sortedAmounts.at(0) ?? 0;
  const max = sortedAmounts.pop() ?? 0;

  return { average, median, max, min };
}

function groupAndCalculate (salaries: SalarySchema[], groupByKey: keyof SalarySchema) {
  const grouped = salaries.reduce((acc, salary) => {
    const aggregationKey = String(salary[groupByKey]);
    if (!acc[aggregationKey]) {
      acc[aggregationKey] = [];
    }
    acc[aggregationKey].push(salary);
    return acc;
  }, {} as Record<string, SalarySchema[]>);

  return Object.entries(grouped).map(([key, group]) => ({
    [groupByKey]: key,
    statistics: calculateStatistics(group),
  }));
}

function getStatisticsForSalaries (salaries: SalarySchema[]) {
  const overallStatistics = calculateStatistics(salaries);

  const byDepartment = groupAndCalculate(salaries, 'department');
  const byRole = groupAndCalculate(salaries, 'role');
  const bySeniorityLevel = groupAndCalculate(salaries, 'seniorityLevel');

  const byDepartmentAndRole = byDepartment.map(department => ({
    department: department.department,
    roles: groupAndCalculate(
      salaries.filter(s => s.department === department.department),
      'role',
    ),
  }));

  const byRoleAndSeniority = byRole.map(role => ({
    role: role.role,
    seniorityLevels: groupAndCalculate(
      salaries.filter(s => s.role === role.role),
      'seniorityLevel',
    ),
  }));

  const byDepartmentAndRoleAndSeniority = byDepartmentAndRole.map(department => ({
    department: department.department,
    roles: department.roles.map(role => ({
      role: role.role,
      seniorityLevels: groupAndCalculate(
        salaries.filter(s => s.department === department.department && s.role === role.role),
        'seniorityLevel',
      ),
    })),
  }));

  return {
    overallStatistics,
    byDepartment,
    byRole,
    bySeniorityLevel,
    byDepartmentAndRole,
    byRoleAndSeniority,
    byDepartmentAndRoleAndSeniority,
  };
}

export async function getSalaryStatistics () {
  const { db } = useDrizzle();

  const salaries = await db.query.salary.findMany();

  const normalizedSalaries = salaries.map(s => ({
    ...s,
    yearlyAmount: (s.yearlyAmount / s.hoursPerWeek) * 40,
  }));

  const statistics = getStatisticsForSalaries(salaries);
  const normalizedStatistics = getStatisticsForSalaries(normalizedSalaries);

  return {
    statistics,
    normalizedStatistics,
  };
}
