import { serverConfiguration } from '~/server/config/server';

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  const { departments, currency, acceptedDomain } = serverConfiguration;

  // Build the nested structure that the frontend expects
  // Each department → list of roles → seniority levels for each role
  const departmentsWithDetails = Object.entries(departments).map(
    ([deptName, deptConfig]) => ({
      name: deptName,
      roles: Object.keys(deptConfig.roles),
      roleSeniorityLevels: Object.fromEntries(
        Object.entries(deptConfig.roles).map(([roleName, roleConfig]) => [
          roleName,
          roleConfig.seniorityLevels,
        ]),
      ),
    }),
  );

  return {
    currency,
    acceptedDomain,
    departments: departmentsWithDetails,
  };
});
