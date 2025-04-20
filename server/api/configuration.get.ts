import { serverCnfiguration } from '~/server/config/server';

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  return {
    roles: serverCnfiguration.roles,
    seniorityLevels: serverCnfiguration.seniorityLevels,
    departments: serverCnfiguration.departments,
    currency: serverCnfiguration.currency,
  };
});
