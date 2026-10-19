import { z } from 'zod';
import type { TransformedDepartment } from '~/server/config/serverConfig';
import { loadServerConfig } from '~/server/config/serverConfig';
import { storeSalaryForUser } from '~/server/src/modules/salary/salaries';

const serverConfig = loadServerConfig();

function buildValidationSchema (departments: TransformedDepartment[]) {
  // Gather all valid values for top-level enum checks
  const allDepartments = departments.map(d => d.name) as [string, ...string[]];
  const allRoles: string[] = [];
  const allSeniorityLevels: string[] = [];

  for (const dept of departments) {
    for (const roleId of dept.roles) {
      allRoles.push(roleId);
      const seniorityForRole = dept.roleSeniorityLevels[roleId];
      if (seniorityForRole) {
        for (const lvl of seniorityForRole) {
          allSeniorityLevels.push(lvl);
        }
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
        const dept = departments.find(d => d.name === data.department);
        return dept?.roles.includes(data.role);
      },
      {
        message: 'Role is not available in the selected department.',
        path: ['role'],
      },
    )
    .refine(
      (data) => {
        const dept = departments.find(d => d.name === data.department);
        const seniorityForRole = dept?.roleSeniorityLevels[data.role];
        return seniorityForRole?.includes(data.seniorityLevel);
      },
      {
        message: 'Seniority level is not available for the selected role.',
        path: ['seniorityLevel'],
      },
    );
}

const salaryValidator = buildValidationSchema(serverConfig.departments);

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
