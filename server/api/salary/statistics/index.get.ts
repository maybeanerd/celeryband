import { getSalaryStatistics } from '~/server/src/modules/salary/salaries';
import { loadServerConfig, getRolesMap, idToLabel } from '~/server/config/serverConfig';

export type SalaryStatistics = {
  average: number;
  median: number;
  max: number;
  min: number;
  count: number;
}

// Base statistics shape (from the salary module, no labels)
type BaseStatisticsItem = {
  average: number;
  median: number;
  max: number;
  min: number;
  count: number;
};

// Enriched statistics with labels (for the frontend API response)
export type DetailedStatistics = {
  overallStatistics: SalaryStatistics | null;
  byDepartment: Array<{
    department: string;
    label: string;
    statistics: SalaryStatistics;
  }>;
  byRole: Array<{
    role: string;
    label: string;
    statistics: SalaryStatistics;
  }>;
  bySeniorityLevel: Array<{
    seniorityLevel: string;
    label: string;
    statistics: SalaryStatistics;
  }>;
  byDepartmentAndRole: Array<{
    department: string;
    label: string;
    roles: Array<{
      role: string;
      label: string;
      statistics: SalaryStatistics;
    }>;
  }>;
  byRoleAndSeniority: Array<{
    role: string;
    label: string;
    seniorityLevels: Array<{
      seniorityLevel: string;
      label: string;
      statistics: SalaryStatistics;
    }>;
  }>;
  byDepartmentAndRoleAndSeniority: Array<{
    department: string;
    label: string;
    roles: Array<{
      role: string;
      label: string;
      seniorityLevels: Array<{
        seniorityLevel: string;
        label: string;
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

function enrichWithLabels (detailed: ReturnType<typeof getSalaryStatistics>['statistics']): DetailedStatistics {
  const config = loadServerConfig();
  const rolesMap = getRolesMap();

  const deptLabel = (id: string) => config.departments.find(d => d.name === id)?.label ?? idToLabel(id);
  const roleLabel = (id: string) => rolesMap[id]?.label ?? idToLabel(id);
  const seniorityLabel = (id: string) => idToLabel(id);

  if (detailed === null) {
    return {
      overallStatistics: null,
      byDepartment: [],
      byRole: [],
      bySeniorityLevel: [],
      byDepartmentAndRole: [],
      byRoleAndSeniority: [],
      byDepartmentAndRoleAndSeniority: [],
    };
  }

  return {
    overallStatistics: detailed.overallStatistics,
    byDepartment: detailed.byDepartment.map(d => ({ ...d, label: deptLabel(d.department) })),
    byRole: detailed.byRole.map(r => ({ ...r, label: roleLabel(r.role) })),
    bySeniorityLevel: detailed.bySeniorityLevel.map(s => ({ ...s, label: seniorityLabel(s.seniorityLevel) })),
    byDepartmentAndRole: detailed.byDepartmentAndRole.map(d => ({
      ...d,
      label: deptLabel(d.department),
      roles: d.roles.map(r => ({ ...r, label: roleLabel(r.role) })),
    })),
    byRoleAndSeniority: detailed.byRoleAndSeniority.map(r => ({
      ...r,
      label: roleLabel(r.role),
      seniorityLevels: r.seniorityLevels.map(s => ({ ...s, label: seniorityLabel(s.seniorityLevel) })),
    })),
    byDepartmentAndRoleAndSeniority: detailed.byDepartmentAndRoleAndSeniority.map(d => ({
      ...d,
      label: deptLabel(d.department),
      roles: d.roles.map(r => ({
        ...r,
        label: roleLabel(r.role),
        seniorityLevels: r.seniorityLevels.map(s => ({ ...s, label: seniorityLabel(s.seniorityLevel) })),
      })),
    })),
  };
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
    statistics: enrichWithLabels(statistics),
    normalizedStatistics: enrichWithLabels(normalizedStatistics),
    salaryAssessment,
  };
});
