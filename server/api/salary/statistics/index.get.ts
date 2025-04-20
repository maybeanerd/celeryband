import { getSalaryStatistics } from '~/server/src/modules/salary/salaries';

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  return getSalaryStatistics();
});
