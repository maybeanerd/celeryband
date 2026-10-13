import { readFileSync } from 'fs';
import { resolve } from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DepartmentConfig {
  roles: Record<string, {
    seniorityLevels: string[];
  }>;
}

export interface SalaryOptions {
  currency: string;
  departments: Record<string, DepartmentConfig>;
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function validateSalaryOptions (config: unknown): SalaryOptions {
  if (!config || typeof config !== 'object') {
    throw new Error('config.yaml must be a YAML object');
  }

  const obj = config as Record<string, unknown>;

  // currency
  if (typeof obj.currency !== 'string' || obj.currency.length === 0) {
    throw new Error('config.yaml: "currency" must be a non-empty string');
  }

  // departments
  if (!obj.departments || typeof obj.departments !== 'object') {
    throw new Error('config.yaml: "departments" is required');
  }

  const departments = obj.departments as Record<string, unknown>;

  for (const [deptName, deptConfig] of Object.entries(departments)) {
    if (!deptConfig || typeof deptConfig !== 'object') {
      throw new Error(`config.yaml: departments."${deptName}" must be an object`);
    }

    const dept = deptConfig as Record<string, unknown>;

    if (!dept.roles || typeof dept.roles !== 'object') {
      throw new Error(`config.yaml: departments."${deptName}".roles is required`);
    }

    const roles = dept.roles as Record<string, unknown>;

    for (const [roleName, roleConfig] of Object.entries(roles)) {
      if (!roleConfig || typeof roleConfig !== 'object') {
        throw new Error(`config.yaml: departments."${deptName}".roles."${roleName}" must be an object`);
      }

      const role = roleConfig as Record<string, unknown>;

      if (!Array.isArray(role.seniorityLevels) || role.seniorityLevels.length === 0) {
        throw new Error(
          `config.yaml: departments."${deptName}".roles."${roleName}".seniorityLevels must be a non-empty array`,
        );
      }

      for (const level of role.seniorityLevels) {
        if (typeof level !== 'string') {
          throw new TypeError(
            `config.yaml: departments."${deptName}".roles."${roleName}".seniorityLevels must contain only strings`,
          );
        }
      }
    }
  }

  return {
    currency: obj.currency as string,
    departments: departments as Record<string, DepartmentConfig>,
  };
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

const CONFIG_PATH = resolve(process.cwd(), 'config', 'config.yaml');

let _salaryOptions: SalaryOptions | null = null;

export function loadSalaryOptions (): SalaryOptions {
  if (_salaryOptions) {
    return _salaryOptions;
  }

  let raw: string;
  try {
    raw = readFileSync(CONFIG_PATH, 'utf-8');
  } catch {
    throw new Error(
      `Cannot load config.yaml from ${CONFIG_PATH}. The file is required for the application to start.`,
    );
  }

  // Lazy require to avoid bundling yaml in client-side code
  // Using synchronous require since this runs at Nitro startup, not during requests
  const { parse } = globalThis.require('yaml');

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

  _salaryOptions = validateSalaryOptions(parsed);
  return _salaryOptions;
}

/**
 * Helper to check if a role exists in a department.
 */
export function hasRoleInDepartment (
  departments: SalaryOptions['departments'],
  department: string,
  role: string,
): boolean {
  const dept = departments[department];
  if (!dept?.roles) {
    return false;
  }
  return role in dept.roles;
}

/**
 * Helper to get the seniority levels for a specific department + role.
 */
export function getSeniorityLevelsForRole (
  departments: SalaryOptions['departments'],
  department: string,
  role: string,
): string[] | undefined {
  const dept = departments[department];
  if (!dept?.roles) {
    return undefined;
  }
  return dept.roles[role]?.seniorityLevels;
}

/**
 * Flatten all roles across all departments (for backward-compat / display).
 */
export function getAllRoles (departments: SalaryOptions['departments']): string[] {
  const roles = new Set<string>();
  for (const dept of Object.values(departments)) {
    for (const roleName of Object.keys(dept.roles)) {
      roles.add(roleName);
    }
  }
  return Array.from(roles).sort();
}

/**
 * Flatten all seniority levels (for backward-compat / display).
 */
export function getAllSeniorityLevels (departments: SalaryOptions['departments']): string[] {
  const levels = new Set<string>();
  for (const dept of Object.values(departments)) {
    for (const role of Object.values(dept.roles)) {
      for (const lvl of role.seniorityLevels) {
        levels.add(lvl);
      }
    }
  }
  return Array.from(levels).sort();
}

/**
 * Flatten all department names.
 */
export function getAllDepartmentNames (departments: SalaryOptions['departments']): string[] {
  return Object.keys(departments).sort();
}
