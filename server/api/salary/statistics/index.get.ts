import { getSalaryStatistics } from '~/server/src/modules/salary/salaries';
import { loadServerConfig, getRolesMap, idToLabel } from '~/server/config/serverConfig';

export type SalaryStatistics = {
  average: number;
  median: number;
  max: number;
  min: number;
  count: number;
}

type Labeled<T> = T & { label: string };

// Enriched statistics with labels (for the frontend API response)
export type DetailedStatistics = {
  overallStatistics: SalaryStatistics | null;
  byDepartment: Array<Labeled<{ department: string }>>;
  byRole: Array<Labeled<{ role: string }>>;
  bySeniorityLevel: Array<Labeled<{ seniorityLevel: string }>>;
  byDepartmentAndRole: Array<Labeled<{
    department: string;
    roles: Array<Labeled<{ role: string }>>;
  }>>;
  byRoleAndSeniority: Array<Labeled<{
    role: string;
    seniorityLevels: Array<Labeled<{ seniorityLevel: string }>>;
  }>>;
  byDepartmentAndRoleAndSeniority: Array<Labeled<{
    department: string;
    roles: Array<Labeled<{
      role: string;
      seniorityLevels: Array<Labeled<{ seniorityLevel: string }>>;
    }>>;
  }>>;
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

type BaseStatistics = Awaited<ReturnType<typeof getSalaryStatistics>>['statistics'];

type LabelResolvers = {
  deptLabel: (id: string) => string;
  roleLabel: (id: string) => string;
  seniorityLabel: (id: string) => string;
};

function createLabelResolvers (): LabelResolvers {
  const config = loadServerConfig();
  const rolesMap = getRolesMap();

  return {
    deptLabel: (id: string) => config.departments.find(d => d.name === id)?.label ?? idToLabel(id),
    roleLabel: (id: string) => rolesMap[id]?.label ?? idToLabel(id),
    seniorityLabel: (id: string) => idToLabel(id),
  };
}

export function enrichWithLabels (baseStatistics: BaseStatistics): DetailedStatistics {
  const resolvers = createLabelResolvers();

  if (baseStatistics === null) {
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
    overallStatistics: baseStatistics.overallStatistics,
    byDepartment: baseStatistics.byDepartment.map(d => ({ ...d, label: resolvers.deptLabel(d.department) })),
    byRole: baseStatistics.byRole.map(r => ({ ...r, label: resolvers.roleLabel(r.role) })),
    bySeniorityLevel: baseStatistics.bySeniorityLevel.map(s => ({ ...s, label: resolvers.seniorityLabel(s.seniorityLevel) })),
    byDepartmentAndRole: baseStatistics.byDepartmentAndRole.map(d => ({
      ...d,
      label: resolvers.deptLabel(d.department),
      roles: d.roles.map(r => ({ ...r, label: resolvers.roleLabel(r.role) })),
    })),
    byRoleAndSeniority: baseStatistics.byRoleAndSeniority.map(r => ({
      ...r,
      label: resolvers.roleLabel(r.role),
      seniorityLevels: r.seniorityLevels.map(s => ({ ...s, label: resolvers.seniorityLabel(s.seniorityLevel) })),
    })),
    byDepartmentAndRoleAndSeniority: baseStatistics.byDepartmentAndRoleAndSeniority.map(d => ({
      ...d,
      label: resolvers.deptLabel(d.department),
      roles: d.roles.map(r => ({
        ...r,
        label: resolvers.roleLabel(r.role),
        seniorityLevels: r.seniorityLevels.map(s => ({ ...s, label: resolvers.seniorityLabel(s.seniorityLevel) })),
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
