import { readFileSync } from 'fs';

import { hasRoleInDepartment, getSeniorityLevelsForDeptRole, getAllRoles, getAllSeniorityLevels, getAllDepartmentNames, idToLabel, getSeniorityLevelsForRole } from './serverConfig';

vi.mock('fs', () => ({
  readFileSync: vi.fn(),
}));

describe('loadServerConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should load and validate a valid config file', async () => {
    const { loadServerConfig: load } = await import('./serverConfig');

    vi.mocked(readFileSync).mockReturnValue(`
serverUrl: 'https://celery.band'
acceptedDomain: 'celery.band'
currency: '€'
disclaimer: null
departments:
  engineering:
    label: Engineering
    roles:
      - software_engineer
roles:
  software_engineer:
    label: Software Engineer
    seniorityLevels:
      - junior
      - professional
      - senior
      - staff
      - principal
`);

    const result = load();

    expect(result.currency).toBe('€');
    expect(result.acceptedDomain).toBe('celery.band');
    expect(result.departments).toHaveLength(1);
    const firstDept = result.departments[0]!;
    expect(firstDept.name).toBe('engineering');
    expect(firstDept.label).toBe('Engineering');
    expect(firstDept.roles).toEqual(['software_engineer']);
  });

  it('should cache the result on subsequent calls', async () => {
    const { loadServerConfig: load } = await import('./serverConfig');

    vi.mocked(readFileSync).mockReturnValue(`
serverUrl: 'https://celery.band'
acceptedDomain: 'celery.band'
currency: '€'
disclaimer: null
departments:
  engineering:
    label: Engineering
    roles:
      - software_engineer
roles:
  software_engineer:
    label: Software Engineer
    seniorityLevels:
      - junior
`);

    const first = load();
    const second = load();

    expect(first).toBe(second);
    expect(readFileSync).toHaveBeenCalledTimes(1);
  });

  it('should preserve department order from config', async () => {
    const { loadServerConfig: load } = await import('./serverConfig');

    vi.mocked(readFileSync).mockReturnValue(`
serverUrl: 'https://celery.band'
acceptedDomain: 'celery.band'
currency: '€'
disclaimer: null
departments:
  finance:
    label: Finance
    roles:
      - accountant
  engineering:
    label: Engineering
    roles:
      - software_engineer
  marketing:
    label: Marketing
    roles:
      - content_writer
roles:
  accountant:
    label: Accountant
    seniorityLevels:
      - junior
  software_engineer:
    label: Software Engineer
    seniorityLevels:
      - junior
  content_writer:
    label: Content Writer
    seniorityLevels:
      - junior
`);

    const result = load();

    expect(result.departments.map(d => d.name)).toEqual(['finance', 'engineering', 'marketing']);
    expect(result.departments.map(d => d.label)).toEqual(['Finance', 'Engineering', 'Marketing']);
  });

  it('should preserve role order from config', async () => {
    const { loadServerConfig: load } = await import('./serverConfig');

    vi.mocked(readFileSync).mockReturnValue(`
serverUrl: 'https://celery.band'
acceptedDomain: 'celery.band'
currency: '€'
disclaimer: null
departments:
  engineering:
    label: Engineering
    roles:
      - qa_engineer
      - principal_engineer
      - junior_engineer
roles:
  qa_engineer:
    label: QA Engineer
    seniorityLevels:
      - junior
  principal_engineer:
    label: Principal Engineer
    seniorityLevels:
      - senior
  junior_engineer:
    label: Junior Engineer
    seniorityLevels:
      - junior
`);

    const result = load();

    const engineering = result.departments.find(d => d.name === 'engineering')!;
    expect(engineering.roles).toEqual(['qa_engineer', 'principal_engineer', 'junior_engineer']);
  });

  it('should throw if config file does not exist', async () => {
    const { loadServerConfig: load } = await import('./serverConfig');

    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error('ENOENT: no such file or directory');
    });

    expect(() => load()).toThrow('Cannot load config.yaml from');
  });

  it('should throw TypeError for invalid YAML syntax', async () => {
    const { loadServerConfig: load } = await import('./serverConfig');

    vi.mocked(readFileSync).mockReturnValue('invalid: yaml: [[[');
    expect(() => load()).toThrow(TypeError);
  });

  it('should throw Error for schema validation failures', async () => {
    const { loadServerConfig: load } = await import('./serverConfig');

    vi.mocked(readFileSync).mockReturnValue('invalid: true');

    expect(() => load()).toThrow('config.yaml validation failed');
  });

  it('should support nullable disclaimer field', async () => {
    const { loadServerConfig: load } = await import('./serverConfig');

    vi.mocked(readFileSync).mockReturnValue(`
serverUrl: 'https://celery.band'
acceptedDomain: 'celery.band'
currency: '€'
disclaimer: 'Some legal text'
departments:
  engineering:
    label: Engineering
    roles:
      - software_engineer
roles:
  software_engineer:
    label: Software Engineer
    seniorityLevels:
      - junior
`);

    const result = load();
    expect(result.currency).toBe('€');
  });
});

describe('hasRoleInDepartment', () => {
  it('should return true when role exists in department', () => {
    expect(
      hasRoleInDepartment(
        [{ name: 'engineering', label: 'Engineering', roles: ['software_engineer'], roleSeniorityLevels: {} }],
        'engineering',
        'software_engineer',
      ),
    ).toBe(true);
  });

  it('should return false when department does not exist', () => {
    expect(
      hasRoleInDepartment(
        [{ name: 'engineering', label: 'Engineering', roles: [], roleSeniorityLevels: {} }],
        'marketing',
        'manager',
      ),
    ).toBe(false);
  });

  it('should return false when role does not exist in department', () => {
    expect(
      hasRoleInDepartment(
        [{ name: 'engineering', label: 'Engineering', roles: ['software_engineer'], roleSeniorityLevels: {} }],
        'engineering',
        'designer',
      ),
    ).toBe(false);
  });

  it('should return false when departments array is empty', () => {
    expect(hasRoleInDepartment([], 'engineering', 'designer')).toBe(false);
  });
});

describe('getSeniorityLevelsForDeptRole', () => {
  it('should return seniority levels for a valid department and role', () => {
    const levels = getSeniorityLevelsForDeptRole(
      [{
        name: 'engineering',
        label: 'Engineering',
        roles: ['software_engineer'],
        roleSeniorityLevels: { software_engineer: ['junior', 'senior'] },
      }],
      'engineering',
      'software_engineer',
    );
    expect(levels).toEqual(['junior', 'senior']);
  });

  it('should return undefined for non-existent department', () => {
    expect(
      getSeniorityLevelsForDeptRole(
        [{ name: 'engineering', label: 'Engineering', roles: [], roleSeniorityLevels: {} }],
        'marketing',
        'manager',
      ),
    ).toBeUndefined();
  });

  it('should return undefined for non-existent role', () => {
    expect(
      getSeniorityLevelsForDeptRole(
        [{ name: 'engineering', label: 'Engineering', roles: [], roleSeniorityLevels: {} }],
        'engineering',
        'designer',
      ),
    ).toBeUndefined();
  });
});

describe('getAllRoles', () => {
  it('should return role ids across all departments in config order', () => {
    const roles = getAllRoles([
      {
        name: 'engineering',
        label: 'Engineering',
        roles: ['software_engineer', 'qa_engineer'],
        roleSeniorityLevels: {},
      },
      {
        name: 'sales',
        label: 'Sales',
        roles: ['account_manager', 'sales_representative'],
        roleSeniorityLevels: {},
      },
    ]);

    expect(roles).toEqual(['software_engineer', 'qa_engineer', 'account_manager', 'sales_representative']);
  });

  it('should deduplicate roles while preserving first occurrence order', () => {
    const roles = getAllRoles([
      {
        name: 'engineering',
        label: 'Engineering',
        roles: ['software_engineer'],
        roleSeniorityLevels: {},
      },
      {
        name: 'design',
        label: 'Design',
        roles: ['software_engineer', 'ui_designer'],
        roleSeniorityLevels: {},
      },
    ]);

    expect(roles).toEqual(['software_engineer', 'ui_designer']);
  });

  it('should return empty array when no departments exist', () => {
    expect(getAllRoles([])).toEqual([]);
  });
});

describe('getAllSeniorityLevels', () => {
  it('should return unique seniority levels in order of first appearance', () => {
    const levels = getAllSeniorityLevels([
      {
        name: 'engineering',
        label: 'Engineering',
        roles: ['software_engineer', 'product_manager'],
        roleSeniorityLevels: {
          software_engineer: ['senior', 'junior'],
          product_manager: ['mid', 'senior'],
        },
      },
    ]);

    expect(levels).toEqual(['senior', 'junior', 'mid']);
  });

  it('should deduplicate levels across departments', () => {
    const levels = getAllSeniorityLevels([
      {
        name: 'engineering',
        label: 'Engineering',
        roles: ['dev'],
        roleSeniorityLevels: { dev: ['junior', 'senior'] },
      },
      {
        name: 'design',
        label: 'Design',
        roles: ['designer'],
        roleSeniorityLevels: { designer: ['lead', 'junior'] },
      },
    ]);

    expect(levels).toEqual(['junior', 'senior', 'lead']);
  });
});

describe('getAllDepartmentNames', () => {
  it('should return department names in config order', () => {
    const depts = getAllDepartmentNames([
      { name: 'hr', label: 'HR', roles: [], roleSeniorityLevels: {} },
      { name: 'sales', label: 'Sales', roles: [], roleSeniorityLevels: {} },
      { name: 'engineering', label: 'Engineering', roles: [], roleSeniorityLevels: {} },
    ]);

    expect(depts).toEqual(['hr', 'sales', 'engineering']);
  });

  it('should return empty array when no departments exist', () => {
    expect(getAllDepartmentNames([])).toEqual([]);
  });
});

describe('getRoleLabel', () => {
  it('should return the role label from roles map', async () => {
    vi.mocked(readFileSync).mockReturnValue(`
serverUrl: 'https://celery.band'
acceptedDomain: 'celery.band'
currency: '€'
disclaimer: null
departments:
  engineering:
    label: Engineering
    roles:
      - software_engineer
roles:
  software_engineer:
    label: Software Engineer
    seniorityLevels:
      - junior
`);
    const mod = await import('./serverConfig');
    mod.loadServerConfig();
    expect(mod.getRoleLabel('software_engineer')).toBe('Software Engineer');
  });

  it('should auto-format identifier when no label is provided', async () => {
    vi.mocked(readFileSync).mockReturnValue(`
serverUrl: 'https://celery.band'
acceptedDomain: 'celery.band'
currency: '€'
disclaimer: null
departments:
  engineering:
    label: Engineering
    roles:
      - software_engineer
roles:
  software_engineer:
    seniorityLevels:
      - junior
`);
    const mod = await import('./serverConfig');
    mod.loadServerConfig();
    expect(mod.getRoleLabel('software_engineer')).toBe('Software Engineer');
  });
});

describe('getSeniorityLevelsForRole', () => {
  it('should return seniority levels for a role that exists in the roles map', () => {
    const rolesMap: Record<string, { label: string; seniorityLevels: string[] }> = {
      software_engineer: {
        label: 'Software Engineer',
        seniorityLevels: ['junior', 'professional', 'senior'],
      },
    };
    expect(getSeniorityLevelsForRole(rolesMap, 'software_engineer')).toEqual(['junior', 'professional', 'senior']);
  });

  it('should return empty array for a role that does not exist in the roles map', () => {
    const rolesMap: Record<string, { label: string; seniorityLevels: string[] }> = {
      software_engineer: { label: 'Software Engineer', seniorityLevels: ['junior'] },
    };
    expect(getSeniorityLevelsForRole(rolesMap, 'nonexistent_role')).toEqual([]);
  });

  it('should return empty array when roles map is empty', () => {
    expect(getSeniorityLevelsForRole({}, 'any_role')).toEqual([]);
  });
});

describe('idToLabel', () => {
  it('should convert single word to title case', () => {
    expect(idToLabel('engineering')).toBe('Engineering');
  });

  it('should convert multi-word snake_case to title case', () => {
    expect(idToLabel('software_engineer')).toBe('Software Engineer');
  });

  it('should handle three-word snake_case', () => {
    expect(idToLabel('chief_executive_officer')).toBe('Chief Executive Officer');
  });

  it('should handle already title-cased input', () => {
    expect(idToLabel('Engineering')).toBe('Engineering');
  });

  it('should handle mixed case input (no underscores, treated as single word)', () => {
    expect(idToLabel('So Ft WaRe EnGiNeEr')).toBe('So ft ware engineer');
  });

  it('should handle single character words', () => {
    expect(idToLabel('a_and_b')).toBe('A And B');
  });
});
