import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fs and yaml before importing the module under test
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
}));

vi.mock('yaml', () => ({
  parse: vi.fn(),
}));

describe('loadSalaryOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the module cache so each test gets a fresh load
    vi.resetModules();
  });

  const validConfig = {
    serverUrl: 'https://celery.band',
    acceptedDomain: 'celery.band',
    currency: '€',
    disclaimer: null,
    departments: {
      engineering: {
        roles: {
          'software engineer': {
            seniorityLevels: ['junior', 'professional', 'senior', 'staff', 'principal'],
          },
        },
      },
    },
  };

  it('should load and validate a valid config file', async () => {
    vi.mocked(readFileSync).mockReturnValueOnce(JSON.stringify(validConfig));
    vi.mocked(parse).mockReturnValueOnce(validConfig);

    const { loadSalaryOptions } = await import('../../../../server/config/salaryOptions');
    const result = loadSalaryOptions();

    expect(result.serverUrl).toBe('https://celery.band');
    expect(result.acceptedDomain).toBe('celery.band');
    expect(result.currency).toBe('€');
    expect(result.departments).toHaveProperty('engineering');
  });

  it('should cache the result on subsequent calls', async () => {
    vi.mocked(readFileSync).mockReturnValueOnce(JSON.stringify(validConfig));
    vi.mocked(parse).mockReturnValueOnce(validConfig);

    const { loadSalaryOptions } = await import('../../../../server/config/salaryOptions');
    const first = loadSalaryOptions();
    const second = loadSalaryOptions();

    expect(first).toBe(second);
    expect(readFileSync).toHaveBeenCalledTimes(1);
  });

  it('should throw if config file does not exist', async () => {
    vi.mocked(readFileSync).mockImplementationOnce(() => {
      throw new Error('ENOENT: no such file or directory');
    });

    const { loadSalaryOptions } = await import('../../../../server/config/salaryOptions');

    expect(() => loadSalaryOptions()).toThrow(
      'Cannot load config.yaml from',
    );
  });

  it('should throw TypeError for invalid YAML syntax', async () => {
    vi.mocked(readFileSync).mockReturnValueOnce('invalid: yaml: [[[');

    vi.mocked(parse).mockImplementationOnce(() => {
      throw new SyntaxError('bad YAML');
    });

    const { loadSalaryOptions } = await import('../../../../server/config/salaryOptions');

    expect(() => loadSalaryOptions()).toThrow(TypeError);
  });

  it('should throw Error for schema validation failures', async () => {
    vi.mocked(readFileSync).mockReturnValueOnce(JSON.stringify({ invalid: true }));
    vi.mocked(parse).mockReturnValueOnce({ invalid: true });

    const { loadSalaryOptions } = await import('../../../../server/config/salaryOptions');

    expect(() => loadSalaryOptions()).toThrow(
      'config.yaml validation failed',
    );
  });

  it('should support nullable disclaimer field', async () => {
    const configWithDisclaimer = {
      ...validConfig,
      disclaimer: 'Some legal text',
    };
    vi.mocked(readFileSync).mockReturnValueOnce(JSON.stringify(configWithDisclaimer));
    vi.mocked(parse).mockReturnValueOnce(configWithDisclaimer);

    const { loadSalaryOptions } = await import('../../../../server/config/salaryOptions');
    const result = loadSalaryOptions();

    expect(result.disclaimer).toBe('Some legal text');
  });
});

describe('hasRoleInDepartment', () => {
  it('should return true when role exists in department', async () => {
    const { hasRoleInDepartment } = await import('../../../../server/config/salaryOptions');
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

  it('should return false when department does not exist', async () => {
    const { hasRoleInDepartment } = await import('../../../../server/config/salaryOptions');
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

  it('should return false when role does not exist in department', async () => {
    const { hasRoleInDepartment } = await import('../../../../server/config/salaryOptions');
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

  it('should return false when departments object is empty', async () => {
    const { hasRoleInDepartment } = await import('../../../../server/config/salaryOptions');
    expect(
      hasRoleInDepartment({}, 'engineering', 'designer'),
    ).toBe(false);
  });
});

describe('getSeniorityLevelsForRole', () => {
  it('should return seniority levels for a valid department and role', async () => {
    const { getSeniorityLevelsForRole } = await import('../../../../server/config/salaryOptions');
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

  it('should return undefined for non-existent department', async () => {
    const { getSeniorityLevelsForRole } = await import('../../../../server/config/salaryOptions');
    expect(
      getSeniorityLevelsForRole(
        { engineering: { roles: {} } },
        'marketing',
        'manager',
      ),
    ).toBeUndefined();
  });

  it('should return undefined for non-existent role', async () => {
    const { getSeniorityLevelsForRole } = await import('../../../../server/config/salaryOptions');
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
  it('should return sorted list of all role names across all departments', async () => {
    const { getAllRoles } = await import('../../../../server/config/salaryOptions');
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

  it('should return empty array when no departments exist', async () => {
    const { getAllRoles } = await import('../../../../server/config/salaryOptions');
    expect(getAllRoles({})).toEqual([]);
  });
});

describe('getAllSeniorityLevels', () => {
  it('should return sorted unique list of all seniority levels', async () => {
    const { getAllSeniorityLevels } = await import('../../../../server/config/salaryOptions');
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

  it('should deduplicate levels across departments', async () => {
    const { getAllSeniorityLevels } = await import('../../../../server/config/salaryOptions');
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
  it('should return sorted list of department names', async () => {
    const { getAllDepartmentNames } = await import('../../../../server/config/salaryOptions');
    const depts = getAllDepartmentNames({
      sales: { roles: {} },
      engineering: { roles: {} },
      hr: { roles: {} },
    });

    expect(depts).toEqual(['engineering', 'hr', 'sales']);
  });

  it('should return empty array when no departments exist', async () => {
    const { getAllDepartmentNames } = await import('../../../../server/config/salaryOptions');
    expect(getAllDepartmentNames({})).toEqual([]);
  });
});
