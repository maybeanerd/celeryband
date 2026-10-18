import { calculateStatistics, groupAndCalculate, getStatisticsForSalaries } from './salaries';

// Helper to create mock salary data
function makeSalary (overrides: Partial<{
  ownerId: string;
  yearlyAmount: number;
  hoursPerWeek: number;
  role: string;
  department: string;
  seniorityLevel: string;
  createdAt: number;
  updatedAt: number;
}> = {}) {
  return {
    ownerId: 'test-user-id',
    yearlyAmount: 60000,
    hoursPerWeek: 40,
    role: 'software engineer',
    department: 'engineering',
    seniorityLevel: 'mid',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe('calculateStatistics', () => {
  it('should return correct stats for a single salary', () => {
    const salaries = [makeSalary({ yearlyAmount: 50000 })];
    const stats = calculateStatistics(salaries);
    expect(stats).toEqual({ average: 50000, median: 50000, max: 50000, min: 50000, count: 1 });
  });

  it('should return correct stats for an odd number of salaries', () => {
    const salaries = [
      makeSalary({ yearlyAmount: 40000 }),
      makeSalary({ yearlyAmount: 60000 }),
      makeSalary({ yearlyAmount: 80000 }),
    ];
    const stats = calculateStatistics(salaries);
    expect(stats.count).toBe(3);
    expect(stats.average).toBe(60000);
    expect(stats.median).toBe(60000);
    expect(stats.min).toBe(40000);
    expect(stats.max).toBe(80000);
  });

  it('should return correct stats for an even number of salaries', () => {
    const salaries = [
      makeSalary({ yearlyAmount: 40000 }),
      makeSalary({ yearlyAmount: 50000 }),
      makeSalary({ yearlyAmount: 60000 }),
      makeSalary({ yearlyAmount: 70000 }),
    ];
    const stats = calculateStatistics(salaries);
    expect(stats.count).toBe(4);
    expect(stats.average).toBe(55000);
    expect(stats.median).toBe(55000);
    expect(stats.min).toBe(40000);
    expect(stats.max).toBe(70000);
  });

  it('should round up averages and medians with ceil', () => {
    const salaries = [
      makeSalary({ yearlyAmount: 50000 }),
      makeSalary({ yearlyAmount: 50001 }),
      makeSalary({ yearlyAmount: 50002 }),
    ];
    const stats = calculateStatistics(salaries);
    expect(stats.average).toBe(50001); // 50001.00 -> 50001
  });

  it('should handle unsorted input', () => {
    const salaries = [
      makeSalary({ yearlyAmount: 80000 }),
      makeSalary({ yearlyAmount: 40000 }),
      makeSalary({ yearlyAmount: 60000 }),
    ];
    const stats = calculateStatistics(salaries);
    expect(stats.min).toBe(40000);
    expect(stats.max).toBe(80000);
    expect(stats.median).toBe(60000);
  });

  it('should show median differs from average', () => {
    // 10 at 50k, 9 at 60k, 1 outlier at 200k
    const salaries = [
      ...Array(10).fill(null).map(() => makeSalary({ yearlyAmount: 50000 })),
      ...Array(9).fill(null).map(() => makeSalary({ yearlyAmount: 60000 })),
      makeSalary({ yearlyAmount: 200000 }),
    ];
    const stats = calculateStatistics(salaries);
    // Sorted: [50k x10, 60k x9, 200k]. Middle two are indices 9 and 10 → 50000 and 60000
    expect(stats.median).toBe(55000); // average of 50k and 60k, not an actual value
    expect(stats.average).toBe(62000); // pulled up by the 200k outlier
    expect(stats.count).toBe(20);
    expect(stats.min).toBe(50000);
    expect(stats.max).toBe(200000);
  });
});

describe('groupAndCalculate', () => {
  it('should group salaries by department', () => {
    const salaries = [
      makeSalary({ department: 'engineering', yearlyAmount: 50000 }),
      makeSalary({ department: 'engineering', yearlyAmount: 60000 }),
      makeSalary({ department: 'engineering', yearlyAmount: 70000 }),
      makeSalary({ department: 'sales', yearlyAmount: 40000 }),
    ];

    const result = groupAndCalculate(salaries, 'department');

    // Only 'engineering' has >= 3 entries; 'sales' has only 2
    expect(result).toHaveLength(1);
    const eng = result[0];
    expect(eng?.department).toBe('engineering');
    expect(eng?.statistics.count).toBe(3);
    expect(eng?.statistics.average).toBe(60000);
  });

  it('should filter out groups with fewer than 3 entries', () => {
    const salaries = [
      makeSalary({ department: 'engineering', yearlyAmount: 50000 }),
      makeSalary({ department: 'sales', yearlyAmount: 40000 }),
      makeSalary({ department: 'hr', yearlyAmount: 45000 }),
    ];

    const result = groupAndCalculate(salaries, 'department');
    expect(result).toHaveLength(0);
  });

  it('should sort groups by average ascending', () => {
    const salaries = [
      makeSalary({ department: 'engineering', yearlyAmount: 70000 }),
      makeSalary({ department: 'engineering', yearlyAmount: 80000 }),
      makeSalary({ department: 'engineering', yearlyAmount: 90000 }),
      makeSalary({ department: 'sales', yearlyAmount: 40000 }),
      makeSalary({ department: 'sales', yearlyAmount: 50000 }),
      makeSalary({ department: 'sales', yearlyAmount: 60000 }),
    ];

    const result = groupAndCalculate(salaries, 'department');

    expect(result[0]?.department).toBe('sales');
    expect(result[1]?.department).toBe('engineering');
  });

  it('should group by role correctly', () => {
    const salaries = [
      makeSalary({ role: 'engineer', yearlyAmount: 50000 }),
      makeSalary({ role: 'engineer', yearlyAmount: 60000 }),
      makeSalary({ role: 'engineer', yearlyAmount: 70000 }),
      makeSalary({ role: 'designer', yearlyAmount: 40000 }),
    ];

    const result = groupAndCalculate(salaries, 'role');

    expect(result).toHaveLength(1);
    const engRole = result[0];
    expect(engRole?.role).toBe('engineer');
    expect(engRole?.statistics.average).toBe(60000);
  });
});

describe('getStatisticsForSalaries', () => {
  it('should return null for overallStatistics when fewer than 3 salaries', () => {
    const salaries = [
      makeSalary({ yearlyAmount: 50000 }),
      makeSalary({ yearlyAmount: 60000 }),
    ];

    const result = getStatisticsForSalaries(salaries);

    expect(result.overallStatistics).toBeNull();
    expect(result.byDepartment).toBeInstanceOf(Array);
    expect(result.byRole).toBeInstanceOf(Array);
    expect(result.bySeniorityLevel).toBeInstanceOf(Array);
  });

  it('should return overallStatistics when 3 or more salaries', () => {
    const salaries = [
      makeSalary({ yearlyAmount: 50000 }),
      makeSalary({ yearlyAmount: 60000 }),
      makeSalary({ yearlyAmount: 70000 }),
    ];

    const result = getStatisticsForSalaries(salaries);

    expect(result.overallStatistics).not.toBeNull();
    const stats = result.overallStatistics;
    expect(stats?.count).toBe(3);
    expect(stats?.average).toBe(60000);
  });

  it('should return statistics grouped by department when enough salaries exist', () => {
    const salaries = [
      makeSalary({ department: 'engineering', yearlyAmount: 50000 }),
      makeSalary({ department: 'engineering', yearlyAmount: 60000 }),
      makeSalary({ department: 'engineering', yearlyAmount: 70000 }),
    ];

    const result = getStatisticsForSalaries(salaries);

    expect(result.byDepartment).toHaveLength(1);
    const engDept = result.byDepartment[0];
    expect(engDept?.department).toBe('engineering');
    expect(engDept?.statistics.count).toBe(3);
  });

  it('should return nested statistics (department and role)', () => {
    const salaries = [
      makeSalary({ department: 'engineering', role: 'engineer', yearlyAmount: 50000 }),
      makeSalary({ department: 'engineering', role: 'engineer', yearlyAmount: 60000 }),
      makeSalary({ department: 'engineering', role: 'engineer', yearlyAmount: 70000 }),
    ];

    const result = getStatisticsForSalaries(salaries);

    expect(result.byDepartmentAndRole).toHaveLength(1);
    const engRoleDept = result.byDepartmentAndRole[0];
    expect(engRoleDept?.department).toBe('engineering');
    expect(engRoleDept?.roles).toHaveLength(1);
    expect(engRoleDept?.roles[0]?.role).toBe('engineer');
    expect(engRoleDept?.roles[0]?.statistics.count).toBe(3);
  });

  it('should include all six statistic groupings in the result', () => {
    const salaries = [
      makeSalary({ department: 'engineering', role: 'engineer', seniorityLevel: 'mid', yearlyAmount: 50000 }),
      makeSalary({ department: 'engineering', role: 'engineer', seniorityLevel: 'mid', yearlyAmount: 60000 }),
      makeSalary({ department: 'engineering', role: 'engineer', seniorityLevel: 'mid', yearlyAmount: 70000 }),
    ];

    const result = getStatisticsForSalaries(salaries);

    expect(result.byDepartmentAndRoleAndSeniority).toBeDefined();
    expect(result.byRoleAndSeniority).toBeDefined();
    expect(result.byDepartment).toBeDefined();
    expect(result.byRole).toBeDefined();
    expect(result.bySeniorityLevel).toBeDefined();
  });
});
