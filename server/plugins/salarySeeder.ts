import { randomUUID } from 'crypto';
import { count } from 'drizzle-orm';
import type { TransformedDepartment, RolesMap } from '~/server/config/serverConfig';
import { salarySchema } from '~/server/db/schemas/Salary.schema';
import { userSchema } from '~/server/db/schemas/User.schema';
import { loadServerConfig, getRolesMap } from '~/server/config/serverConfig';
import { obfuscateEmail } from '~/server/src/modules/authentification';

// Helper function for weighted random selection
function weightedRandom<T> (options: T[], weights: number[]): T {
  if (options.length === 0) {
    throw new Error('options must not be empty');
  }
  if (weights.length !== options.length) {
    throw new Error('weights and options must have the same length');
  }

  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  let random = Math.random() * totalWeight;

  for (const [i, weight] of weights.entries()) {
    const option = options[i];
    if (option === undefined) { continue; }

    random -= weight;
    if (random <= 0) {
      return option;
    }
  }

  // Should never reach here if weights sum > 0
  const last = options.at(-1);
  if (last !== undefined) { return last; }
  return options[0]!;
}

/**
 * Generate a valid (department, role, seniority) triplet.
 */
function pickValidTriplet (departments: TransformedDepartment[], rolesMap: RolesMap) {
  const deptIndex = Math.floor(Math.random() * departments.length);
  const dept = departments[deptIndex]!;
  const roleIndex = Math.floor(Math.random() * dept.roles.length);
  const roleId = dept.roles[roleIndex]!;
  const seniorityLevels = rolesMap[roleId]?.seniorityLevels ?? [];
  const seniorityLevel = seniorityLevels[Math.floor(Math.random() * seniorityLevels.length)]!;

  return { department: dept.name, role: roleId, seniorityLevel };
}

async function generateRandomUserBatch (
  batchSize: number,
  departments: TransformedDepartment[],
  rolesMap: RolesMap,
  acceptedDomain: string,
) {
  const { db } = useDrizzle();
  const now = new Date().getTime();

  // Create arrays for batch insert
  const userInserts = [];
  const salaryInserts = [];

  for (let i = 0; i < batchSize; i++) {
    // Generate random user data
    const userId = randomUUID();
    const email = `random.user${userId}@${acceptedDomain}`;
    const emailHash = await obfuscateEmail(email);

    // Generate valid salary data (respects the config)
    const { department, role, seniorityLevel } = pickValidTriplet(departments, rolesMap);

    // Base salary range (30k-130k)
    let baseSalary = 30000 + Math.floor(Math.random() * 100000);

    // Adjust based on seniority level
    const allLevels = Array.from(getAllSeniorityLevelsFlat(departments, rolesMap));
    const seniorityIndex = allLevels.indexOf(seniorityLevel);
    const seniorityMultiplier = 0.8 + (seniorityIndex * 0.2);
    baseSalary = Math.floor(baseSalary * seniorityMultiplier);

    // Add some random variation (±10%)
    const variation = 0.9 + (Math.random() * 0.2);
    const yearlyAmount = Math.floor(baseSalary * variation);

    // Hours per week (mostly 40, but some part-time)
    const hoursOptions = [20, 30, 40];
    const hoursWeights = [1, 2, 7]; // 10% 20h, 20% 30h, 70% 40h
    const hoursPerWeek = weightedRandom(hoursOptions, hoursWeights);

    userInserts.push({
      id: userId,
      emailHash,
    });

    salaryInserts.push({
      ownerId: userId,
      role: role!,
      seniorityLevel,
      department: department!,
      yearlyAmount,
      hoursPerWeek,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Batch insert users
  if (userInserts.length > 0) {
    await db.insert(userSchema).values(userInserts);
  }

  // Batch insert salaries
  if (salaryInserts.length > 0) {
    await db.insert(salarySchema).values(salaryInserts);
  }
}

/** Collect all unique seniority levels from the departments + roles. */
function getAllSeniorityLevelsFlat (departments: TransformedDepartment[], rolesMap: RolesMap): string[] {
  const levels = new Set<string>();
  for (const dept of departments) {
    for (const roleId of dept.roles) {
      for (const lvl of rolesMap[roleId]?.seniorityLevels ?? []) {
        levels.add(lvl);
      }
    }
  }
  return Array.from(levels).sort();
}

export default defineNitroPlugin(async () => {
  // Only run the seeder in development mode
  const serverConfig = loadServerConfig();
  const rolesMap = getRolesMap();
  const developmentMode = process.env.DEVELOPMENT_MODE === 'true';
  if (!developmentMode) {
    return;
  }

  console.info('Salary seeder is enabled due to development mode.');

  try {
    const { db } = useDrizzle();

    // Check if we have at least 100 salaries
    const salaryCount = (await db.select({ count: count(salarySchema.ownerId) }).from(salarySchema)).at(0)?.count ?? 0;

    if (salaryCount >= 2000) {
      console.info(`Found ${salaryCount} existing salaries, no need to generate random data.`);
      return;
    }

    console.info(`Only ${salaryCount} salaries found. Generating 10,000 random salaries...`);

    // Generate 10,000 users with salaries
    const batchSize = 100; // Process in batches to avoid memory issues
    const totalToGenerate = 10000;

    for (let i = 0; i < totalToGenerate; i += batchSize) {
      const currentBatchSize = Math.min(batchSize, totalToGenerate - i);
      console.info(`Generating batch ${i / batchSize + 1}/${Math.ceil(totalToGenerate / batchSize)} (${currentBatchSize} users)...`);

      await generateRandomUserBatch(currentBatchSize, serverConfig.departments, rolesMap, serverConfig.acceptedDomain);

      // Simple progress report
      console.info(`Generated ${Math.min(i + currentBatchSize, totalToGenerate)}/${totalToGenerate} random users with salaries`);
    }

    console.info('Finished generating random salary data.');
  } catch (error) {
    console.error('Error generating random salary data:', error);
  }
});
