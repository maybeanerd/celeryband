import { randomUUID } from 'crypto';
import { count } from 'drizzle-orm';
import { salarySchema } from '~/server/db/schemas/Salary.schema';
import { userSchema } from '~/server/db/schemas/User.schema';
import { serverConfiguration } from '~/server/config/server';
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
    if (option === undefined) continue;

    random -= weight;
    if (random <= 0) {
      return option;
    }
  }

  // Should never reach here if weights sum > 0
  return options.at(-1) ?? options[0];
}

/**
 * Generate a valid (department, role, seniority) triplet.
 */
function pickValidTriplet (departments: typeof serverConfiguration.departments) {
  const deptNames = Object.keys(departments);
  const department = deptNames[Math.floor(Math.random() * deptNames.length)];
  const dept = departments[department];
  const roleNames = Object.keys(dept.roles);
  const role = roleNames[Math.floor(Math.random() * roleNames.length)];
  const seniorityLevels = dept.roles[role].seniorityLevels;
  const seniorityLevel = seniorityLevels[Math.floor(Math.random() * seniorityLevels.length)];

  return { department, role, seniorityLevel };
}

async function generateRandomUserBatch (
  batchSize: number,
  departments: typeof serverConfiguration.departments,
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

    // Generate valid salary data (respects the nested config)
    const { department, role, seniorityLevel } = pickValidTriplet(departments);

    // Base salary range (30k-130k)
    let baseSalary = 30000 + Math.floor(Math.random() * 100000);

    // Adjust based on seniority level
    const allLevels: string[] = [];
    for (const dept of Object.values(departments)) {
      for (const role of Object.values(dept.roles)) {
        for (const lvl of role.seniorityLevels) {
          if (!allLevels.includes(lvl)) {
            allLevels.push(lvl);
          }
        }
      }
    }
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
      role,
      seniorityLevel,
      department,
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

export default defineNitroPlugin(async () => {
  // Only run the seeder in development mode
  if (!serverConfiguration.developmentMode) {
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

    // Get available options from server config
    const { departments, acceptedDomain } = serverConfiguration;

    // Generate 10,000 users with salaries
    const batchSize = 100; // Process in batches to avoid memory issues
    const totalToGenerate = 10000;

    for (let i = 0; i < totalToGenerate; i += batchSize) {
      const currentBatchSize = Math.min(batchSize, totalToGenerate - i);
      console.info(`Generating batch ${i / batchSize + 1}/${Math.ceil(totalToGenerate / batchSize)} (${currentBatchSize} users)...`);

      await generateRandomUserBatch(currentBatchSize, departments, acceptedDomain);

      // Simple progress report
      console.info(`Generated ${Math.min(i + currentBatchSize, totalToGenerate)}/${totalToGenerate} random users with salaries`);
    }

    console.info('Finished generating random salary data.');
  } catch (error) {
    console.error('Error generating random salary data:', error);
  }
});
