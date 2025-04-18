import { salaryAttributes } from '~/server/config/attributes';

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  return {
    roles: salaryAttributes.roles,
    seniorityLevels: salaryAttributes.seniorityLevels,
    departments: salaryAttributes.departments,
    currency: salaryAttributes.currency,
  };
});
