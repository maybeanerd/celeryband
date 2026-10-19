import { readFileSync } from 'fs';

import { hasRoleInDepartment, getSeniorityLevelsForDeptRole, getAllRoles, getAllSeniorityLevels, getAllDepartmentNames, loadServerConfig, getRoleLabel } from './serverConfig';

vi.mock('fs', () => ({
  readFileSync: vi.fn(),
}));

describe('loadServerConfig', () => {
  beforeEach(async () => {
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
`);

    const result = load();

    expect(result.currency).toBe('€');
    expect(result.acceptedDomain).toBe('celery.band');
    expect(result.departments).toHaveLength(1);
    expect(result.departments[0].name).toBe('engineering');
    expect(result.departments[0].label).toBe('Engineering');
    expect(result.departments[0].roles).toEqual(['software_engineer']);
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
  it('should return sorted list of all role ids across all departments', () => {
    const roles = getAllRoles([
      {
        name: 'engineering',
        label: 'Engineering',
        roles: ['software_engineer'],
        roleSeniorityLevels: {},
      },
      {
        name: 'sales',
        label: 'Sales',
        roles: ['sales_representative', 'account_manager'],
        roleSeniorityLevels: {},
      },
    ]);

    expect(roles).toEqual(['account_manager', 'sales_representative', 'software_engineer']);
  });

  it('should return empty array when no departments exist', () => {
    expect(getAllRoles([])).toEqual([]);
  });
});

describe('getAllSeniorityLevels', () => {
  it('should return sorted unique list of all seniority levels', () => {
    const levels = getAllSeniorityLevels([
      {
        name: 'engineering',
        label: 'Engineering',
        roles: ['software_engineer', 'product_manager'],
        roleSeniorityLevels: {
          software_engineer: ['junior', 'senior'],
          product_manager: ['junior', 'mid'],
        },
      },
    ]);

    expect(levels).toEqual(['junior', 'mid', 'senior']);
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
        roleSeniorityLevels: { designer: ['junior', 'lead'] },
      },
    ]);

    expect(levels).toEqual(['junior', 'lead', 'senior']);
  });
});

describe('getAllDepartmentNames', () => {
  it('should return sorted list of department names', () => {
    const depts = getAllDepartmentNames([
      { name: 'sales', label: 'Sales', roles: [], roleSeniorityLevels: {} },
      { name: 'engineering', label: 'Engineering', roles: [], roleSeniorityLevels: {} },
      { name: 'hr', label: 'HR', roles: [], roleSeniorityLevels: {} },
    ]);

    expect(depts).toEqual(['engineering', 'hr', 'sales']);
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
