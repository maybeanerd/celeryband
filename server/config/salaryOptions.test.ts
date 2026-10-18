import { readFileSync } from 'fs';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { hasRoleInDepartment, getSeniorityLevelsForRole, getAllRoles, getAllSeniorityLevels, getAllDepartmentNames } from './salaryOptions';

vi.mock('fs', () => ({
  readFileSync: vi.fn(),
}));

describe('loadSalaryOptions', () => {
  let loadSalaryOptions: typeof import('./salaryOptions').loadSalaryOptions;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    const mod = await import('./salaryOptions');
    loadSalaryOptions = mod.loadSalaryOptions;
  });

  it('should load and validate a valid config file', () => {
    vi.mocked(readFileSync).mockReturnValue(`
serverUrl: 'https://celery.band'
acceptedDomain: 'celery.band'
currency: '€'
disclaimer: null
departments:
  engineering:
    roles:
      'software engineer':
        seniorityLevels:
          - junior
          - professional
          - senior
          - staff
          - principal
`);

    const result = loadSalaryOptions();

    expect(result.serverUrl).toBe('https://celery.band');
    expect(result.acceptedDomain).toBe('celery.band');
    expect(result.currency).toBe('€');
    expect(result.departments).toHaveProperty('engineering');
  });

  it('should cache the result on subsequent calls', () => {
    vi.mocked(readFileSync).mockReturnValue(`
serverUrl: 'https://celery.band'
acceptedDomain: 'celery.band'
currency: '€'
disclaimer: null
departments:
  engineering:
    roles:
      'software engineer':
        seniorityLevels:
          - junior
          - professional
          - senior
          - staff
          - principal
`);

    const first = loadSalaryOptions();
    const second = loadSalaryOptions();

    expect(first).toBe(second);
    expect(readFileSync).toHaveBeenCalledTimes(1);
  });

  it('should throw if config file does not exist', () => {
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error('ENOENT: no such file or directory');
    });

    expect(() => loadSalaryOptions()).toThrow('Cannot load config.yaml from');
  });

  it('should throw TypeError for invalid YAML syntax', () => {
    vi.mocked(readFileSync).mockReturnValue('invalid: yaml: [[[');
    expect(() => loadSalaryOptions()).toThrow(TypeError);
  });

  it('should throw Error for schema validation failures', () => {
    vi.mocked(readFileSync).mockReturnValue('invalid: true');

    expect(() => loadSalaryOptions()).toThrow('config.yaml validation failed');
  });

  it('should support nullable disclaimer field', () => {
    vi.mocked(readFileSync).mockReturnValue(`
serverUrl: 'https://celery.band'
acceptedDomain: 'celery.band'
currency: '€'
disclaimer: 'Some legal text'
departments:
  engineering:
    roles:
      'software engineer':
        seniorityLevels:
          - junior
          - professional
          - senior
          - staff
          - principal
`);

    const result = loadSalaryOptions();
    expect(result.disclaimer).toBe('Some legal text');
  });
});

describe('hasRoleInDepartment', () => {
  it('should return true when role exists in department', () => {
    expect(
      hasRoleInDepartment(
        {
          engineering: { roles: { 'software engineer': { seniorityLevels: ['junior'] } } },
        },
        'engineering',
        'software engineer',
      ),
    ).toBe(true);
  });

  it('should return false when department does not exist', () => {
    expect(
      hasRoleInDepartment(
        {
          engineering: { roles: {} },
        },
        'marketing',
        'manager',
      ),
    ).toBe(false);
  });

  it('should return false when role does not exist in department', () => {
    expect(
      hasRoleInDepartment(
        {
          engineering: { roles: { 'software engineer': { seniorityLevels: ['junior'] } } },
        },
        'engineering',
        'designer',
      ),
    ).toBe(false);
  });

  it('should return false when departments object is empty', () => {
    expect(
      hasRoleInDepartment({}, 'engineering', 'designer'),
    ).toBe(false);
  });
});

describe('getSeniorityLevelsForRole', () => {
  it('should return seniority levels for a valid department and role', () => {
    const levels = getSeniorityLevelsForRole(
      {
        engineering: {
          roles: { 'software engineer': { seniorityLevels: ['junior', 'senior'] } },
        },
      },
      'engineering',
      'software engineer',
    );
    expect(levels).toEqual(['junior', 'senior']);
  });

  it('should return undefined for non-existent department', () => {
    expect(
      getSeniorityLevelsForRole(
        { engineering: { roles: {} } },
        'marketing',
        'manager',
      ),
    ).toBeUndefined();
  });

  it('should return undefined for non-existent role', () => {
    expect(
      getSeniorityLevelsForRole(
        { engineering: { roles: {} } },
        'engineering',
        'designer',
      ),
    ).toBeUndefined();
  });
});

describe('getAllRoles', () => {
  it('should return sorted list of all role names across all departments', () => {
    const roles = getAllRoles({
      engineering: {
        roles: { 'software engineer': { seniorityLevels: [] } },
      },
      sales: {
        roles: {
          'sales rep': { seniorityLevels: [] },
          'account manager': { seniorityLevels: [] },
        },
      },
    });

    expect(roles).toEqual(['account manager', 'sales rep', 'software engineer']);
  });

  it('should return empty array when no departments exist', () => {
    expect(getAllRoles({})).toEqual([]);
  });
});

describe('getAllSeniorityLevels', () => {
  it('should return sorted unique list of all seniority levels', () => {
    const levels = getAllSeniorityLevels({
      engineering: {
        roles: {
          'software engineer': { seniorityLevels: ['junior', 'senior'] },
          'product manager': { seniorityLevels: ['junior', 'mid'] },
        },
      },
    });

    expect(levels).toEqual(['junior', 'mid', 'senior']);
  });

  it('should deduplicate levels across departments', () => {
    const levels = getAllSeniorityLevels({
      engineering: {
        roles: { dev: { seniorityLevels: ['junior', 'senior'] } },
      },
      design: {
        roles: { designer: { seniorityLevels: ['junior', 'lead'] } },
      },
    });

    expect(levels).toEqual(['junior', 'lead', 'senior']);
  });
});

describe('getAllDepartmentNames', () => {
  it('should return sorted list of department names', () => {
    const depts = getAllDepartmentNames({
      sales: { roles: {} },
      engineering: { roles: {} },
      hr: { roles: {} },
    });

    expect(depts).toEqual(['engineering', 'hr', 'sales']);
  });

  it('should return empty array when no departments exist', () => {
    expect(getAllDepartmentNames({})).toEqual([]);
  });
});
