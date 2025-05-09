<template>
  <div class="flex flex-col gap-4 p-4">
    <div v-if="!dataIsAvailable"
      class="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg text-center flex flex-col gap-4 items-center">
      <UIcon name="i-lucide:database-zap" class="text-4xl mb-2 text-gray-500 dark:text-gray-400" />
      <p class="text-lg dark:text-white">No statistics available.</p>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Please configure your salary information first.
      </p>
      <UButton to="/account">
        Go to account
      </UButton>
    </div>
    <template v-else-if="statistics && statistics.statistics">
      <!-- Normalization Toggle -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-start gap-2">
          <USwitch v-model="normalized" />
          <span class="text-sm font-medium">Show normalized data</span>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Normalized statistics adjust for part-time positions and show all values adjusted to your amount of weekly
          hours. ({{ ownSalary?.hoursPerWeek ?? 'unknown' }} hours per week)
          <br>
          Percentages are always normalized to working hours.
        </p>
      </div>

      <!-- Overall Statistics -->
      <UCard class="w-full">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-bar-chart-big" class="text-xl" />
            <h2 class="text-xl font-semibold">Overall Statistics</h2>
          </div>
        </template>
        <div v-if="chosenStatistics" class="flex flex-col gap-4">
          <!-- Shared legend for all visualizations -->
          <div class="flex items-center gap-4 text-xs mb-2">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
              <span>Median</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span>Average</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
              <span>Your Salary</span>
            </div>
          </div>

          <!-- Global statistics -->
          <div>
            <h3 class="text-lg font-medium mb-1">All Employees</h3>
            <div v-if="chosenStatistics?.overallStatistics">
              <p class="text-xs text-gray-500 mb-2">Based on {{ overallStats.count }} data points</p>

              <!-- Add visualization for overall statistics -->
              <div class="mb-6 mt-4">
                <div class="relative">
                  <SalaryBandLine :min="overallStats.min" :max="overallStats.max" :median="overallStats.median"
                    :average="overallStats.average" :global-min="globalMinValue" :global-max="globalMaxValue"
                    :currency="currency" :own-salary="ownSalary?.yearlyAmount" />
                </div>
              </div>
            </div>
            <NoStatisticsAvailable v-else />
          </div>

          <!-- Your role and seniority statistics -->
          <div>
            <h3 class="text-lg font-medium mb-1">
              {{ ownSalary?.seniorityLevel }} {{ ownSalary?.role }}s
            </h3>
            <div v-if="ownRoleSeniorityStats">
              <p class="text-xs text-gray-500 mb-2">Based on {{ ownRoleSeniorityStats.count }} data points</p>

              <!-- Add visualization for role & seniority statistics -->
              <div class="mb-6 mt-4">
                <div class="relative">
                  <SalaryBandLine :min="ownRoleSeniorityStats.min" :max="ownRoleSeniorityStats.max"
                    :median="ownRoleSeniorityStats.median" :average="ownRoleSeniorityStats.average"
                    :global-min="globalMinValue" :global-max="globalMaxValue" :currency="currency"
                    :own-salary="ownSalary?.yearlyAmount" />
                </div>
              </div>

              <!-- Keep percentage badges but in a simpler layout -->
              <div v-if="statistics.salaryAssessment?.sameRoleAndSeniority" class="flex gap-4">
                <SalaryPercentageBadge :percentage="statistics.salaryAssessment.sameRoleAndSeniority.average"
                  context="average" />
                <SalaryPercentageBadge :percentage="statistics.salaryAssessment.sameRoleAndSeniority.median"
                  context="median" />
              </div>
            </div>
            <NoStatisticsAvailable v-else />
          </div>

          <!-- Your department statistics -->
          <div>
            <h3 class="text-lg font-medium mb-1">
              {{ ownSalary?.seniorityLevel }} {{ ownSalary?.role }}s
              in {{ ownSalary?.department }}
            </h3>
            <div v-if="ownRoleAndSeniorityAndDepartmentStats">
              <p class="text-xs text-gray-500 mb-2">Based on {{ ownRoleAndSeniorityAndDepartmentStats.count }} data
                points
              </p>

              <!-- Add visualization for department statistics -->
              <div class="mb-6 mt-4">
                <div class="relative">
                  <SalaryBandLine :min="ownRoleAndSeniorityAndDepartmentStats.min"
                    :max="ownRoleAndSeniorityAndDepartmentStats.max"
                    :median="ownRoleAndSeniorityAndDepartmentStats.median"
                    :average="ownRoleAndSeniorityAndDepartmentStats.average" :global-min="globalMinValue"
                    :global-max="globalMaxValue" :currency="currency" :own-salary="ownSalary?.yearlyAmount" />
                </div>
              </div>

              <!-- Keep percentage badges but in a simpler layout -->
              <div v-if="statistics.salaryAssessment?.sameRoleAndSeniorityAndDepartment" class="flex gap-4">
                <SalaryPercentageBadge
                  :percentage="statistics.salaryAssessment.sameRoleAndSeniorityAndDepartment.average"
                  context="average" />
                <SalaryPercentageBadge
                  :percentage="statistics.salaryAssessment.sameRoleAndSeniorityAndDepartment.median" context="median" />
              </div>
            </div>
            <NoStatisticsAvailable v-else />
          </div>
        </div>
      </UCard>

      <!-- Statistics for Same Role (All Seniorities) -->
      <UCard class="w-full">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-briefcase" class="text-xl" />
              <h2 class="text-xl font-semibold">
                Statistics for {{ ownSalary?.role }}s
              </h2>
            </div>
            <div class="flex items-center gap-2">
              <USwitch v-model="showOnlyYourDepartment" />
              <span class="text-sm font-medium">Only include salaries from {{ ownSalary?.department || 'your department'
                }}</span>
            </div>
          </div>
        </template>
        <div v-if="sameRoleAllSeniorityData.length > 0">
          <div class="relative mt-4">
            <div class="w-full h-[300px] rounded-lg p-4">
              <!-- Y-axis labels (seniority levels) with data point counts -->
              <div class="absolute left-0 top-0 bottom-0 w-[180px] flex flex-col justify-around pr-2">
                <div v-for="(item, index) in sameRoleAllSeniorityData" :key="index" class="text-sm">
                  <div class="font-medium truncate">{{ item.seniorityLevel }}</div>
                  <div class="text-xs text-gray-500">Based on {{ item.count }} data points</div>
                </div>
              </div>

              <!-- Visualization area -->
              <div class="ml-[180px] h-full flex flex-col justify-around">
                <SalaryBandLine v-for="(item, index) in sameRoleAllSeniorityData" :key="index" :min="item.min"
                  :max="item.max" :median="item.median" :average="item.average" :global-min="roleStatsMinValue"
                  :global-max="roleStatsMaxValue" :currency="currency" />
              </div>

              <!-- Legend -->
              <div class="absolute bottom-[-30px] left-[180px] right-0 flex justify-center gap-4 text-xs">
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                  <span>Median</span>
                </div>
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                  <span>Average</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <NoStatisticsAvailable v-else />
      </UCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useOwnSalary } from '~/composables/api/useOwnSalary';
import { useSalaryStatistics } from '~/composables/api/useSalaryStatistics';
import { useServerConfiguration } from '~/composables/api/useServerConfiguration';
import SalaryPercentageBadge from '~/components/SalaryPercentageBadge.vue';
import SalaryBandVisualization from '~/components/SalaryBandVisualization.vue';
import SalaryBandLine from '~/components/SalaryBandLine.vue';
import NoStatisticsAvailable from '~/components/NoStatisticsAvailable.vue';

// Define interfaces to ensure types are correct
interface SalaryStatistics {
  average: number;
  median: number;
  max: number;
  min: number;
  count: number;
}

interface ResultItem {
  seniorityLevel: string;
  average: number;
  median: number;
  min: number;
  max: number;
  count: number;
}

const { config: serverConfig } = await useServerConfiguration();
const normalized = ref(true);
const showOnlyYourDepartment = ref(true);
const statistics = await useSalaryStatistics();
const ownSalary = await useOwnSalary({ lazy: true });

const currency = computed(() => serverConfig.value?.currency || '');

const dataIsAvailable = computed(() => {
  return statistics.value?.areAvailable === true && !!statistics.value?.statistics;
});

// Central computed property that decides which statistics to use based on the normalized toggle
const chosenStatistics = computed(() => {
  if (!dataIsAvailable.value || !statistics.value?.statistics) {
    return null;
  }

  return normalized.value && statistics.value.normalizedStatistics
    ? statistics.value.normalizedStatistics
    : statistics.value.statistics;
});

// Computed property for Same Role (All Seniorities) data that switches data sources based on toggle
const sameRoleAllSeniorityData = computed(() => {
  if (!chosenStatistics.value || !ownSalary.value) {
    return [];
  }

  // Choose the appropriate data source based on the toggle
  if (!showOnlyYourDepartment.value) {
    // Use byRoleAndSeniority (across all departments)
    if (!chosenStatistics.value.byRoleAndSeniority) {
      return [];
    }

    const result: ResultItem[] = [];
    const roleItem = chosenStatistics.value.byRoleAndSeniority.find(
      item => item.role === ownSalary.value?.role,
    );

    if (!roleItem) {
      return [];
    }

    // Process each seniority level for this role
    roleItem.seniorityLevels.forEach((seniorityItem) => {
      if (seniorityItem.statistics.count >= 3) {
        result.push({
          seniorityLevel: seniorityItem.seniorityLevel,
          average: seniorityItem.statistics.average,
          median: seniorityItem.statistics.median,
          min: seniorityItem.statistics.min,
          max: seniorityItem.statistics.max,
          count: seniorityItem.statistics.count
        });
      }
    });

    return result;
  } else {
    // Use byDepartmentAndRoleAndSeniority filtered to own department
    if (!chosenStatistics.value.byDepartmentAndRoleAndSeniority || !ownSalary.value?.department) {
      return [];
    }

    const result: ResultItem[] = [];
    const deptItem = chosenStatistics.value.byDepartmentAndRoleAndSeniority.find(
      item => item.department === ownSalary.value?.department,
    );

    if (!deptItem) {
      return [];
    }

    const roleItem = deptItem.roles.find(
      item => item.role === ownSalary.value?.role,
    );

    if (!roleItem) {
      return [];
    }

    // Process each seniority level for this role
    roleItem.seniorityLevels.forEach((seniorityItem) => {
      if (seniorityItem.statistics.count >= 3) {
        result.push({
          seniorityLevel: seniorityItem.seniorityLevel,
          average: seniorityItem.statistics.average,
          median: seniorityItem.statistics.median,
          min: seniorityItem.statistics.min,
          max: seniorityItem.statistics.max,
          count: seniorityItem.statistics.count
        });
      }
    });

    return result;
  }
});

// Overall statistics computed property
const overallStats = computed<SalaryStatistics>(() => {
  if (!chosenStatistics.value?.overallStatistics) {
    return { average: 0, median: 0, max: 0, min: 0, count: 0 };
  }

  return chosenStatistics.value.overallStatistics;
});

// Own department statistics
const ownRoleAndSeniorityAndDepartmentStats = computed<SalaryStatistics | null>(() => {
  if (!chosenStatistics.value?.byDepartmentAndRoleAndSeniority || !ownSalary.value?.department) {
    return null;
  }

  const departmentStat = chosenStatistics.value.byDepartmentAndRoleAndSeniority.find(
    item => item.department === ownSalary.value?.department,
  );

  if (!departmentStat) {
    return null;
  }

  const roleStat = departmentStat.roles.find(
    item => item.role === ownSalary.value?.role,
  );

  if (!roleStat) {
    return null;
  }

  const seniorityStat = roleStat.seniorityLevels.find(
    item => item.seniorityLevel === ownSalary.value?.seniorityLevel,
  );

  if (!seniorityStat || seniorityStat.statistics.count < 3) {
    return null;
  }

  return seniorityStat.statistics;
});

// Own department statistics
// This could be removed as it's not used, but keeping for reference
const ownDepartmentStats = computed<SalaryStatistics | null>(() => {
  if (!chosenStatistics.value?.byDepartment || !ownSalary.value?.department) {
    return null;
  }

  const departmentStat = chosenStatistics.value.byDepartment.find(
    item => item.department === ownSalary.value?.department,
  );

  if (!departmentStat) {
    return null;
  }

  return departmentStat.statistics;
});

// Own role and seniority statistics
const ownRoleSeniorityStats = computed<SalaryStatistics | null>(() => {
  if (!chosenStatistics.value?.byRoleAndSeniority ||
    !ownSalary.value?.role ||
    !ownSalary.value?.seniorityLevel) {
    return null;
  }

  // Find the role item
  const roleItem = chosenStatistics.value.byRoleAndSeniority.find(
    item => item.role === ownSalary.value?.role,
  );

  if (!roleItem) {
    return null;
  }

  // Find the seniority level item
  const seniorityItem = roleItem.seniorityLevels.find(
    item => item.seniorityLevel === ownSalary.value?.seniorityLevel,
  );

  if (!seniorityItem || seniorityItem.statistics.count < 3) {
    return null;
  }

  return seniorityItem.statistics;
});

// Helper function to parse salary values for legacy string values - can be removed if all values are now numbers
function getSalaryNumericValue(value: string | number): number {
  if (typeof value === 'number') return value;
  return parseFloat(value);
}

// Define global min and max values for consistent scaling across all visualizations
const globalMinValue = computed(() => {
  if (!chosenStatistics.value?.overallStatistics) {
    return 0;
  }
  return getSalaryNumericValue(chosenStatistics.value.overallStatistics.min);
});

const globalMaxValue = computed(() => {
  if (!chosenStatistics.value?.overallStatistics) {
    return 0;
  }
  return getSalaryNumericValue(chosenStatistics.value.overallStatistics.max);
});

// Compute min and max values for the role statistics visualization
const roleStatsMinValue = computed<number>(() => {
  if (sameRoleAllSeniorityData.value.length === 0) {
    return 0;
  }

  // Find the minimum value across all seniority levels
  return Math.min(...sameRoleAllSeniorityData.value.map(item => getSalaryNumericValue(item.min)));
});

const roleStatsMaxValue = computed<number>(() => {
  if (sameRoleAllSeniorityData.value.length === 0) {
    return 0;
  }

  // Find the maximum value across all seniority levels
  return Math.max(...sameRoleAllSeniorityData.value.map(item => getSalaryNumericValue(item.max)));
});

// Helper function to format numbers with currency for display
function formatCurrency(value: string | number): string {
  if (typeof value === 'string') {
    return `${value} ${currency.value}`;
  }
  return `${value} ${currency.value}`;
}
</script>
