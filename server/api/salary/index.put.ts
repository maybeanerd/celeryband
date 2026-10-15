import { z } from 'zod';
import { serverConfiguration } from '~/server/config/server';
import { storeSalaryForUser } from '~/server/src/modules/salary/salaries';

const { departments: deptConfig } = serverConfiguration;

function buildValidationSchema (departments: typeof deptConfig) {
  // Gather all valid values for top-level enum checks
  const allDepartments = Object.keys(departments) as [string, ...string[]];
  const allRoles: string[] = [];
  const allSeniorityLevels: string[] = [];

  for (const dept of Object.values(departments)) {
    for (const roleName of Object.keys(dept.roles)) {
      allRoles.push(roleName);
    }
    for (const role of Object.values(dept.roles)) {
      for (const lvl of role.seniorityLevels) {
        allSeniorityLevels.push(lvl);
      }
    }
  }

  return z.object({
    yearlyAmount: z.number().min(1),
    hoursPerWeek: z.number().min(1).max(168),
    department: z.enum(allDepartments),
    role: z.enum(allRoles as [string, ...string[]]),
    seniorityLevel: z.enum(allSeniorityLevels as [string, ...string[]]),
  })
    .refine(
      (data) => {
        const dept = departments[data.department];
        return dept?.roles && data.role in dept.roles;
      },
      {
        message: 'Role is not available in the selected department.',
        path: ['role'],
      },
    )
    .refine(
      (data) => {
        const dept = departments[data.department];
        const roleConfig = dept?.roles?.[data.role];
        return roleConfig?.seniorityLevels.includes(data.seniorityLevel);
      },
      {
        message: 'Seniority level is not available for the selected role.',
        path: ['seniorityLevel'],
      },
    );
}

const salaryValidator = buildValidationSchema(deptConfig);

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const body = await readBody(event);

  const { error, data } = salaryValidator.safeParse(body);

  if (error) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Invalid salary data.',
      data: error.flatten(),
    });
  }

  await storeSalaryForUser(user.id, data);
});
