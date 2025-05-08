import { randomUUID } from 'crypto';
import { sql } from 'drizzle-orm';
import { salarySchema } from '~/server/db/schemas/Salary.schema';
import { userSchema } from '~/server/db/schemas/User.schema';
import { serverConfiguration } from '~/server/config/server';
import { obfuscateEmail } from '~/server/src/modules/authentification';

// Helper function for weighted random selection
function weightedRandom<T> (options: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < options.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return options[i];
    }
  }

  // Fallback (should never reach here if weights sum > 0)
  return options[options.length - 1];
}

async function generateRandomUserBatch (
  batchSize: number,
  roles: readonly string[],
  seniorityLevels: readonly string[],
  departments: readonly string[],
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

    // Generate random salary data
    const role = roles[Math.floor(Math.random() * roles.length)];
    const seniorityLevel = seniorityLevels[Math.floor(Math.random() * seniorityLevels.length)];
    const department = departments[Math.floor(Math.random() * departments.length)];

    // Base salary range (50k-150k)
    let baseSalary = 50000 + Math.floor(Math.random() * 100000);

    // Adjust based on seniority level (junior: -20%, professional: +0%, senior: +20%, etc.)
    const seniorityIndex = seniorityLevels.indexOf(seniorityLevel);
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
  try {
    console.log('Checking if random salary data needs to be generated...');
    const { db } = useDrizzle();

    // Check if we have at least 100 salaries
    const salaryCount = await db.select({ count: sql<number>`count(*)` }).from(salarySchema);
    const count = salaryCount[0]?.count ?? 0;

    if (count >= 100) {
      console.log(`Found ${count} existing salaries, no need to generate random data.`);
      return;
    }

    console.log(`Only ${count} salaries found. Generating 10,000 random salaries...`);

    // Get available options from server config
    const { roles, seniorityLevels, departments, acceptedDomain } = serverConfiguration;

    // Generate 10,000 users with random salaries
    const batchSize = 100; // Process in batches to avoid memory issues
    const totalToGenerate = 10000;

    for (let i = 0; i < totalToGenerate; i += batchSize) {
      const currentBatchSize = Math.min(batchSize, totalToGenerate - i);
      console.log(`Generating batch ${i / batchSize + 1}/${Math.ceil(totalToGenerate / batchSize)} (${currentBatchSize} users)...`);

      await generateRandomUserBatch(currentBatchSize, roles, seniorityLevels, departments, acceptedDomain);

      // Simple progress report
      console.log(`Generated ${Math.min(i + currentBatchSize, totalToGenerate)}/${totalToGenerate} random users with salaries`);
    }

    console.log('Finished generating random salary data.');
  } catch (error) {
    console.error('Error generating random salary data:', error);
  }
});
