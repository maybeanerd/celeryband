import { loadServerConfig, getRolesMap, idToLabel } from '~/server/config/serverConfig';
import type { TransformedDepartment } from '~/server/config/serverConfig';

export type ConfigurationResponse = {
  currency: string;
  acceptedDomain: string;
  departments: Array<{
    name: string;
    label: string;
    roles: Array<{ id: string; label: string }>;
    roleSeniorityLevels: Record<string, Array<{ id: string; label: string }>>;
  }>;
  roles: Record<string, { label: string; seniorityLevels: string[] }>;
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
    roleSeniorityLevels: Object.fromEntries(
      Object.entries(dept.roleSeniorityLevels).map(([roleId, levels]) => [
        roleId,
        levels.map(level => ({ id: level, label: idToLabel(level) })),
      ]),
    ),
  }));

  return {
    currency: serverConfig.currency,
    acceptedDomain: serverConfig.acceptedDomain,
    departments: departmentsWithDetails,
    roles: rolesMap,
  };
});
