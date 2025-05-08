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
          <!-- Global statistics -->
          <div>
            <h3 class="text-lg font-medium mb-2">All Employees</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="p-2 flex flex-col">
                <p>Average: {{ overallStats.average }}</p>
              </div>
              <div class="p-2 flex flex-col">
                <p>Median: {{ overallStats.median }}</p>
              </div>
              <p class="p-2">Maximum: {{ overallStats.max }}</p>
              <p class="p-2">Minimum: {{ overallStats.min }}</p>
            </div>
          </div>

          <!-- Your role and seniority statistics -->
          <div v-if="ownRoleSeniorityStats">
            <h3 class="text-lg font-medium mb-2">
              {{ ownSalary?.seniorityLevel }} {{ ownSalary?.role }}s
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="p-2 flex flex-col">
                <p>Average: {{ ownRoleSeniorityStats.average }}</p>
                <SalaryPercentageBadge v-if="statistics.salaryAssessment?.sameRoleAndSeniority"
                  :percentage="statistics.salaryAssessment.sameRoleAndSeniority.average" context="of average" />
              </div>
              <div class="p-2 flex flex-col">
                <p>Median: {{ ownRoleSeniorityStats.median }}</p>
                <SalaryPercentageBadge v-if="statistics.salaryAssessment?.sameRoleAndSeniority"
                  :percentage="statistics.salaryAssessment.sameRoleAndSeniority.median" context="of median" />
              </div>
              <p class="p-2">Maximum: {{ ownRoleSeniorityStats.max }}</p>
              <p class="p-2">Minimum: {{ ownRoleSeniorityStats.min }}</p>
            </div>
          </div>

          <!-- Your department statistics -->
          <div v-if="ownDepartmentStats">
            <h3 class="text-lg font-medium mb-2">
              {{ ownSalary?.seniorityLevel }} {{ ownSalary?.role }}s
              in {{ ownSalary?.department }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="p-2 flex flex-col">
                <p>Average: {{ ownDepartmentStats.average }}</p>
                <SalaryPercentageBadge v-if="statistics.salaryAssessment?.sameRoleAndSeniorityAndDepartment"
                  :percentage="statistics.salaryAssessment.sameRoleAndSeniorityAndDepartment.average"
                  context="of average" />
              </div>
              <div class="p-2 flex flex-col">
                <p>Median: {{ ownDepartmentStats.median }}</p>
                <SalaryPercentageBadge v-if="statistics.salaryAssessment?.sameRoleAndSeniorityAndDepartment"
                  :percentage="statistics.salaryAssessment.sameRoleAndSeniorityAndDepartment.median"
                  context="of median" />
              </div>
              <p class="p-2">Maximum: {{ ownDepartmentStats.max }}</p>
              <p class="p-2">Minimum: {{ ownDepartmentStats.min }}</p>
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
          <UTable :data="sameRoleAllSeniorityData" />
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
</script>
