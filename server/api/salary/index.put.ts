import { z } from 'zod';
import { serverCnfiguration } from '~/server/config/server';
import { storeSalaryForUser } from '~/server/src/modules/salary/salaries';

const salaryValidator = z.object({
  yearlyAmount: z.number().min(1),
  hoursPerWeek: z.number().min(1).max(168),
  department: z.enum(serverCnfiguration.departments),
  role: z.enum(serverCnfiguration.roles),
  seniorityLevel: z.enum(serverCnfiguration.seniorityLevels),
});

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
