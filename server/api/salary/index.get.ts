import { getSalaryForUser } from '~/server/src/modules/salary/salaries';

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const salary = await getSalaryForUser(user.id);

  if (salary === null) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Salary not found.',
    });
  }

  return salary;
});
