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
          <div class="flex items-center gap-4 text-xs mb-2 ml-[120px]">
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
            <h3 class="text-lg font-medium mb-2">All Employees</h3>

            <!-- Add visualization for overall statistics -->
            <div class="mb-6 mt-4 ml-2">
              <div class="relative ml-[120px]">
                <SalaryBandLine :min="parseSalaryValue(overallStats.min)" :max="parseSalaryValue(overallStats.max)"
                  :median="parseSalaryValue(overallStats.median)" :average="parseSalaryValue(overallStats.average)"
                  :global-min="parseSalaryValue(overallStats.min)" :global-max="parseSalaryValue(overallStats.max)"
                  :currency="currency" :own-salary="ownSalary?.yearlyAmount" />
              </div>
            </div>
          </div>

          <!-- Your role and seniority statistics -->
          <div v-if="ownRoleSeniorityStats">
            <h3 class="text-lg font-medium mb-2">
              {{ ownSalary?.seniorityLevel }} {{ ownSalary?.role }}s
            </h3>

            <!-- Add visualization for role & seniority statistics -->
            <div class="mb-6 mt-4 ml-2">
              <div class="relative ml-[120px]">
                <SalaryBandLine :min="parseSalaryValue(ownRoleSeniorityStats.min)"
                  :max="parseSalaryValue(ownRoleSeniorityStats.max)"
                  :median="parseSalaryValue(ownRoleSeniorityStats.median)"
                  :average="parseSalaryValue(ownRoleSeniorityStats.average)"
                  :global-min="parseSalaryValue(overallStats.min)" :global-max="parseSalaryValue(overallStats.max)"
                  :currency="currency" :own-salary="ownSalary?.yearlyAmount" />
              </div>
            </div>

            <!-- Keep percentage badges but in a simpler layout -->
            <div v-if="statistics.salaryAssessment?.sameRoleAndSeniority" class="flex gap-4 ml-[120px]">
              <SalaryPercentageBadge :percentage="statistics.salaryAssessment.sameRoleAndSeniority.average"
                context="average" />
              <SalaryPercentageBadge :percentage="statistics.salaryAssessment.sameRoleAndSeniority.median"
                context="median" />
            </div>
          </div>

          <!-- Your department statistics -->
          <div v-if="ownDepartmentStats">
            <h3 class="text-lg font-medium mb-2">
              {{ ownSalary?.seniorityLevel }} {{ ownSalary?.role }}s
              in {{ ownSalary?.department }}</h3>

            <!-- Add visualization for department statistics -->
            <div class="mb-6 mt-4 ml-2">
              <div class="relative ml-[120px]">
                <SalaryBandLine :min="parseSalaryValue(ownDepartmentStats.min)"
                  :max="parseSalaryValue(ownDepartmentStats.max)" :median="parseSalaryValue(ownDepartmentStats.median)"
                  :average="parseSalaryValue(ownDepartmentStats.average)"
                  :global-min="parseSalaryValue(overallStats.min)" :global-max="parseSalaryValue(overallStats.max)"
                  :currency="currency" :own-salary="ownSalary?.yearlyAmount" />
              </div>
            </div>

            <!-- Keep percentage badges but in a simpler layout -->
            <div v-if="statistics.salaryAssessment?.sameRoleAndSeniorityAndDepartment" class="flex gap-4 ml-[120px]">
              <SalaryPercentageBadge :percentage="statistics.salaryAssessment.sameRoleAndSeniorityAndDepartment.average"
                context="average" />
              <SalaryPercentageBadge :percentage="statistics.salaryAssessment.sameRoleAndSeniorityAndDepartment.median"
                context="median" />
            </div>
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
          <SalaryBandVisualization :salary-data="sameRoleAllSeniorityData" :currency="currency" />
        </div>
        <div v-else>
          <p>No data available</p>
        </div>
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

  // Define the result type
  interface ResultItem {
    seniorityLevel: string;
    average: string;
    median: string;
    min: string;
    max: string;
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
      result.push({
        seniorityLevel: seniorityItem.seniorityLevel,
        average: seniorityItem.statistics.average + ' ' + currency.value,
        median: seniorityItem.statistics.median + ' ' + currency.value,
        min: seniorityItem.statistics.min + ' ' + currency.value,
        max: seniorityItem.statistics.max + ' ' + currency.value,
      });
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
      result.push({
        seniorityLevel: seniorityItem.seniorityLevel,
        average: seniorityItem.statistics.average + ' ' + currency.value,
        median: seniorityItem.statistics.median + ' ' + currency.value,
        min: seniorityItem.statistics.min + ' ' + currency.value,
        max: seniorityItem.statistics.max + ' ' + currency.value,
      });
    });

    return result;
  }
});

// Overall statistics computed property
const overallStats = computed(() => {
  if (!chosenStatistics.value?.overallStatistics) {
    return { average: '0', median: '0', max: '0', min: '0' };
  }

  const stats = chosenStatistics.value.overallStatistics;

  return {
    average: stats.average + ' ' + currency.value,
    median: stats.median + ' ' + currency.value,
    max: stats.max + ' ' + currency.value,
    min: stats.min + ' ' + currency.value,
  };
});

// Own department statistics
const ownDepartmentStats = computed(() => {
  if (!chosenStatistics.value?.byDepartment || !ownSalary.value?.department) {
    return null;
  }

  const departmentStat = chosenStatistics.value.byDepartment.find(
    item => item.department === ownSalary.value?.department,
  );

  if (!departmentStat) {
    return null;
  }

  const stats = departmentStat.statistics;

  return {
    average: stats.average + ' ' + currency.value,
    median: stats.median + ' ' + currency.value,
    max: stats.max + ' ' + currency.value,
    min: stats.min + ' ' + currency.value,
  };
});

// Own role and seniority statistics
const ownRoleSeniorityStats = computed(() => {
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

  if (!seniorityItem) {
    return null;
  }

  const stats = seniorityItem.statistics;

  return {
    average: stats.average + ' ' + currency.value,
    median: stats.median + ' ' + currency.value,
    max: stats.max + ' ' + currency.value,
    min: stats.min + ' ' + currency.value,
  };
});

// Helper function to parse salary values
function parseSalaryValue(value: string): number {
  return parseFloat(value.replace(/[^\d.-]/g, ''));
}
</script>
