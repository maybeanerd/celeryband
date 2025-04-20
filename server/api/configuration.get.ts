import { serverConfiguration } from '~/server/config/server';

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  return {
    roles: serverConfiguration.roles,
    seniorityLevels: serverConfiguration.seniorityLevels,
    departments: serverConfiguration.departments,
    currency: serverConfiguration.currency,
    acceptedDomain: serverConfiguration.acceptedDomain,
  };
});
