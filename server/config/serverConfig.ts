import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parse } from 'yaml';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Zod schema — single source of truth for config shape + validation
// ---------------------------------------------------------------------------

const DepartmentRoleSchema = z.object({
  label: z.string().optional(),
  seniorityLevels: z.array(z.string()).min(1),
});

const DepartmentSchema = z.object({
  label: z.string().optional(),
  roles: z.array(z.string()).min(1),
});

export const ConfigSchema = z.object({
  serverUrl: z.string().min(1),
  acceptedDomain: z.string().min(1),
  currency: z.string().min(1),
  disclaimer: z.string().nullable().default(null),
  departments: z.record(z.string(), DepartmentSchema),
  roles: z.record(z.string(), DepartmentRoleSchema),
});

// ---------------------------------------------------------------------------
// Transformed (enriched) types — the structure the rest of the app works with
// ---------------------------------------------------------------------------

/** A department entry as exposed to the frontend API */
export interface TransformedDepartment {
  name: string;
  label: string;
  roles: string[];
  roleSeniorityLevels: Record<string, string[]>;
}

export interface TransformedSalaryOptions {
  serverUrl: string;
  currency: string;
  acceptedDomain: string;
  departments: TransformedDepartment[];
}

export interface RoleDefinition {
  label: string;
  seniorityLevels: string[];
}

/** Full roles map, keyed by role id */
export interface RolesMap {
  [roleId: string]: RoleDefinition;
}

// ---------------------------------------------------------------------------
// Helpers — formatting identifiers for display
// ---------------------------------------------------------------------------

/** Convert an underscore-separated id to title-case display text. */
export function idToLabel (id: string): string {
  return id
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// ---------------------------------------------------------------------------
// Transformer — raw config → enriched structure used by the rest of the app
// ---------------------------------------------------------------------------

/** Build the enriched department list + roles map from raw parsed config. */
function transformConfig (raw: z.infer<typeof ConfigSchema>): {
  result: TransformedSalaryOptions;
  rolesMap: RolesMap;
} {
  const { departments: deptRaw, roles: roleRaw, currency, acceptedDomain, serverUrl } = raw;

  // Build a map of role id → enriched role definition
  const rolesMap: RolesMap = Object.fromEntries(
    Object.entries(roleRaw).map(([id, def]) => [id, {
      label: def.label ?? idToLabel(id),
      seniorityLevels: def.seniorityLevels,
    }]),
  );

  // Build the department list, resolving role references
  const enrichedDepartments: TransformedDepartment[] = Object.entries(deptRaw)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, dept]) => {
      const label = dept.label ?? idToLabel(id);
      const roles = dept.roles.sort();
      const roleSeniorityLevels: Record<string, string[]> = Object.fromEntries(
        roles.map(roleId => [roleId, rolesMap[roleId]?.seniorityLevels ?? []]),
      );
      return { name: id, label, roles, roleSeniorityLevels };
    });

  return {
    result: {
      serverUrl,
      currency,
      acceptedDomain,
      departments: enrichedDepartments,
    },
    rolesMap,
  };
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

const CONFIG_PATH = resolve(process.cwd(), 'config.yaml');

let _transformed: TransformedSalaryOptions | null = null;
let _rolesMap: RolesMap | null = null;

export function loadServerConfig (): TransformedSalaryOptions {
  if (_transformed) {
    return _transformed;
  }

  let raw: string;
  try {
    raw = readFileSync(CONFIG_PATH, 'utf-8');
  } catch {
    throw new Error(
      `Cannot load config.yaml from ${CONFIG_PATH}. The file is required for the application to start.`,
    );
  }

  let parsed: unknown;
  try {
    parsed = parse(raw);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new TypeError(`config.yaml is invalid YAML: ${err.message}`);
    }
    if (err instanceof Error) {
      throw new TypeError(`Failed to parse config.yaml: ${err.message}`);
    }
    throw new TypeError('Failed to parse config.yaml');
  }

  const result = ConfigSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `config.yaml validation failed:\n${result.error.issues.map(i => `  - ${i.path.join('.')}: ${i.message}`).join('\n')}`,
    );
  }

  const { result: transformed, rolesMap } = transformConfig(result.data);
  _transformed = transformed;
  _rolesMap = rolesMap;
  return _transformed;
}

/** Returns the enriched roles map, keyed by role id. */
export function getRolesMap (): RolesMap {
  loadServerConfig(); // ensure it's loaded
  return _rolesMap!;
}

/** Get the label (display name) for a role id. */
export function getRoleLabel (roleId: string): string {
  return getRolesMap()[roleId]?.label ?? idToLabel(roleId);
}

/** Get the seniority levels for a specific role id. */
export function getSeniorityLevelsForRole (rolesMap: RolesMap, roleId: string): string[] {
  return rolesMap[roleId]?.seniorityLevels ?? [];
}

/**
 * Helper to check if a role exists in a department.
 */
export function hasRoleInDepartment (
  departments: TransformedDepartment[],
  department: string,
  role: string,
): boolean {
  const dept = departments.find(d => d.name === department);
  if (!dept) {
    return false;
  }
  return dept.roles.includes(role);
}

/**
 * Get the seniority levels for a specific department + role.
 */
export function getSeniorityLevelsForDeptRole (
  departments: TransformedDepartment[],
  department: string,
  role: string,
): string[] | undefined {
  const dept = departments.find(d => d.name === department);
  if (!dept) {
    return undefined;
  }
  return dept.roleSeniorityLevels[role];
}

/**
 * Flatten all role ids across all departments.
 */
export function getAllRoles (departments: TransformedDepartment[]): string[] {
  const roles = new Set<string>();
  for (const dept of departments) {
    for (const roleId of dept.roles) {
      roles.add(roleId);
    }
  }
  return Array.from(roles).sort();
}

/**
 * Flatten all seniority levels (for backward-compat / display).
 */
export function getAllSeniorityLevels (departments: TransformedDepartment[]): string[] {
  const levels = new Set<string>();
  for (const dept of departments) {
    for (const roleId of dept.roles) {
      const levelsForRole = dept.roleSeniorityLevels[roleId];
      if (levelsForRole) {
        for (const lvl of levelsForRole) {
          levels.add(lvl);
        }
      }
    }
  }
  return Array.from(levels).sort();
}

/**
 * Flatten all department names.
 */
export function getAllDepartmentNames (departments: TransformedDepartment[]): string[] {
  return departments.map(d => d.name).sort();
}
