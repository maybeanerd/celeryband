import { getSalaryStatistics } from '~/server/src/modules/salary/salaries';

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const { statistics, normalizedStatistics, salaryAssessment } = await getSalaryStatistics(user.id);

  return {
    areAvailable: statistics !== null,
    statistics,
    normalizedStatistics,
    salaryAssessment,
  };
});
