import { loadServerConfig, getRolesMap, idToLabel } from '~/server/config/serverConfig';
import type { TransformedDepartment } from '~/server/config/serverConfig';

type DepartmentDetail = {
  name: string;
  label: string;
  roles: Array<{ id: string; label: string }>;
  roleSeniorityLevels: Record<string, string[]>;
};

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  const serverConfig = loadServerConfig();
  const rolesMap = getRolesMap();

  // Build department entries with enriched role metadata (labels)
  const departmentsWithDetails: DepartmentDetail[] = serverConfig.departments.map((dept: TransformedDepartment) => ({
    name: dept.name,
    label: dept.label,
    roles: dept.roles.map((roleId: string) => ({
      id: roleId,
      label: rolesMap[roleId]?.label ?? idToLabel(roleId),
    })),
    roleSeniorityLevels: dept.roleSeniorityLevels,
  }));

  return {
    currency: serverConfig.currency,
    acceptedDomain: serverConfig.acceptedDomain,
    departments: departmentsWithDetails,
    roles: rolesMap,
  };
});
