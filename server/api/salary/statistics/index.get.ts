import { getSalaryStatistics } from '~/server/src/modules/salary/salaries';

export type SalaryStatistics = {
  average: number;
  median: number;
  max: number;
  min: number;
  count: number;
}

export type DetailedStatistics = {
  overallStatistics: SalaryStatistics | null;
  byDepartment: Array<{
    department: string;
    statistics: SalaryStatistics;
  }>;
  byRole: Array<{
    role: string;
    statistics: SalaryStatistics;
  }>;
  bySeniorityLevel: Array<{
    seniorityLevel: string;
    statistics: SalaryStatistics;
  }>;
  byDepartmentAndRole: Array<{
    department: string;
    roles: Array<{
      role: string;
      statistics: SalaryStatistics;
    }>;
  }>;
  byRoleAndSeniority: Array<{
    role: string;
    seniorityLevels: Array<{
      seniorityLevel: string;
      statistics: SalaryStatistics;
    }>;
  }>;
  byDepartmentAndRoleAndSeniority: Array<{
    department: string;
    roles: Array<{
      role: string;
      seniorityLevels: Array<{
        seniorityLevel: string;
        statistics: SalaryStatistics;
      }>;
    }>;
  }>;
};

export type SalaryAssessment = {
  sameRoleAndSeniority: {
    average: string;
    median: string;
  } | null;
  sameRoleAndSeniorityAndDepartment: {
    average: string;
    median: string;
  } | null
}

export type Statistics = {
  areAvailable: false;
  statistics: null;
  normalizedStatistics: null;
  salaryAssessment: null;
} | {
  areAvailable: true;
  statistics: DetailedStatistics;
  normalizedStatistics: DetailedStatistics;
  salaryAssessment: SalaryAssessment;
}

export default defineEventHandler(async (event): Promise<Statistics> => {
  const { user } = await requireUserSession(event);

  const { statistics, normalizedStatistics, salaryAssessment } = await getSalaryStatistics(user.id);

  if (statistics === null) {
    return {
      areAvailable: false,
      statistics: null,
      normalizedStatistics: null,
      salaryAssessment: null,
    };
  }

  return {
    areAvailable: true,
    statistics,
    normalizedStatistics,
    salaryAssessment,
  };
});
