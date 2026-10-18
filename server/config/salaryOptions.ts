import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parse } from 'yaml';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Zod schema — single source of truth for config shape + validation
// ---------------------------------------------------------------------------

const DepartmentRoleSchema = z.object({
  seniorityLevels: z.array(z.string()).min(1),
});

const DepartmentSchema = z.object({
  roles: z.record(z.string(), DepartmentRoleSchema),
});

export const ConfigSchema = z.object({
  serverUrl: z.string().min(1),
  acceptedDomain: z.string().min(1),
  currency: z.string().min(1),
  disclaimer: z.string().nullable().default(null),
  departments: z.record(z.string(), DepartmentSchema),
});

export type SalaryOptions = z.infer<typeof ConfigSchema>;

export type DepartmentConfig = z.infer<typeof DepartmentSchema>;

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

const CONFIG_PATH = resolve(process.cwd(), 'config.yaml');

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

  _salaryOptions = result.data;
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
