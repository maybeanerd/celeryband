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
          <UIcon name="i-lucide-info" class="inline mr-1" />
          Normalized statistics adjust for part-time positions and show all values adjusted to your amount of weekly
          hours. ({{ ownSalary?.hoursPerWeek ?? 'unknown' }} hours per week)
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
        <div v-if="statistics?.statistics" class="flex flex-col gap-4">
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
            <h3 class="text-lg font-medium mb-2">Same Role & Seniority ({{ ownSalary?.role }} - {{
              ownSalary?.seniorityLevel }})
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
            <h3 class="text-lg font-medium mb-2">Same Role & Seniority in {{ ownSalary?.department }}</h3>
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

      <!-- Department Statistics -->
      <UCard class="w-full">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-briefcase" class="text-xl" />
            <h2 class="text-xl font-semibold">
              Statistics by Department
            </h2>
          </div>
        </template>
        <div>
          <UTable :data="departmentData" />
        </div>
      </UCard>

      <!-- Combined Role and Seniority Statistics -->
      <UCard class="w-full">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-users" class="text-xl" />
            <h2 class="text-xl font-semibold">Statistics by Role and Seniority</h2>
          </div>
        </template>
        <div>
          <UTable :data="combinedRoleSeniorityData" />
        </div>
      </UCard>

      <!-- Detailed Overview -->
      <UCard class="w-full">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-layers" class="text-xl" />
            <h2 class="text-xl font-semibold">
              Comprehensive Breakdown by Department, Role, and Seniority
            </h2>
          </div>
        </template>
        <div>
          <UTable :data="comprehensiveData" />
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

await useServerConfiguration();
const normalized = ref(true);
const statistics = await useSalaryStatistics();
const ownSalary = await useOwnSalary();

const dataIsAvailable = computed(() => {
  return statistics.value?.areAvailable === true && !!statistics.value?.statistics;
});

const departmentData = computed(() => {
  if (!dataIsAvailable.value || !statistics.value?.statistics?.byDepartment) {
    return [];
  }

  return statistics.value.statistics.byDepartment.map((item) => {
    // Choose statistics based on normalization toggle
    const stats = normalized.value && (item as any).normalizedStatistics
      ? (item as any).normalizedStatistics
      : item.statistics;

    return {
      department: item.department,
      average: stats.average,
      median: stats.median,
      min: stats.min,
      max: stats.max,
    };
  });
});

// Combined role and seniority data directly from backend
const combinedRoleSeniorityData = computed(() => {
  if (!dataIsAvailable.value || !statistics.value?.statistics?.byRoleAndSeniority) {
    return [];
  }

  // Define the result type
  interface ResultItem {
    role: string;
    seniorityLevel: string;
    average: number;
    median: number;
    min: number;
    max: number;
  }

  // The data is structured as roles with nested seniorityLevels
  const result: ResultItem[] = [];
  statistics.value.statistics.byRoleAndSeniority.forEach((roleItem) => {
    // For each role
    const roleName = roleItem.role;

    // Process each seniority level for this role
    roleItem.seniorityLevels.forEach((seniorityItem) => {
      const stats = normalized.value && (seniorityItem as any).normalizedStatistics
        ? (seniorityItem as any).normalizedStatistics
        : seniorityItem.statistics;

      result.push({
        role: roleName,
        seniorityLevel: seniorityItem.seniorityLevel,
        average: stats.average,
        median: stats.median,
        min: stats.min,
        max: stats.max,
      });
    });
  });

  return result;
});

// Comprehensive data directly from backend
const comprehensiveData = computed(() => {
  if (!dataIsAvailable.value || !statistics.value?.statistics?.byDepartmentAndRoleAndSeniority) {
    return [];
  }

  // Define the result type
  interface ResultItem {
    department: string;
    role: string;
    seniorityLevel: string;
    average: number;
    median: number;
    min: number;
    max: number;
  }

  // The data is deeply nested: departments -> roles -> seniorityLevels
  const result: ResultItem[] = [];
  statistics.value.statistics.byDepartmentAndRoleAndSeniority.forEach((deptItem) => {
    const deptName = deptItem.department;

    // Process each role in this department
    deptItem.roles.forEach((roleItem) => {
      const roleName = roleItem.role;

      // Process each seniority level for this role
      roleItem.seniorityLevels.forEach((seniorityItem) => {
        const stats = normalized.value && (seniorityItem as any).normalizedStatistics
          ? (seniorityItem as any).normalizedStatistics
          : seniorityItem.statistics;

        result.push({
          department: deptName,
          role: roleName,
          seniorityLevel: seniorityItem.seniorityLevel,
          average: stats.average,
          median: stats.median,
          min: stats.min,
          max: stats.max,
        });
      });
    });
  });

  return result;
});

// Overall statistics computed property
const overallStats = computed(() => {
  if (!statistics.value?.statistics?.overallStatistics) {
    return { average: 0, median: 0, max: 0, min: 0 };
  }

  const overallData = statistics.value.statistics.overallStatistics;
  // Choose statistics based on normalization toggle
  const stats = normalized.value && (overallData as any).normalizedStatistics
    ? (overallData as any).normalizedStatistics
    : overallData;

  return {
    average: stats.average,
    median: stats.median,
    max: stats.max,
    min: stats.min,
  };
});

// Own department statistics
const ownDepartmentStats = computed(() => {
  if (!dataIsAvailable.value || !statistics.value?.statistics?.byDepartment || !ownSalary.value?.department) {
    return null;
  }

  const departmentStat = statistics.value.statistics.byDepartment.find(
    (item) => item.department === ownSalary.value?.department,
  );

  if (!departmentStat) {
    return null;
  }

  const stats = normalized.value && (departmentStat as any).normalizedStatistics
    ? (departmentStat as any).normalizedStatistics
    : departmentStat.statistics;

  return {
    average: stats.average,
    median: stats.median,
    max: stats.max,
    min: stats.min,
  };
});

// Own role and seniority statistics
const ownRoleSeniorityStats = computed(() => {
  if (!dataIsAvailable.value ||
    !statistics.value?.statistics?.byRoleAndSeniority ||
    !ownSalary.value?.role ||
    !ownSalary.value?.seniorityLevel) {
    return null;
  }

  // Find the role item
  const roleItem = statistics.value.statistics.byRoleAndSeniority.find(
    (item) => item.role === ownSalary.value?.role,
  );

  if (!roleItem) {
    return null;
  }

  // Find the seniority level item
  const seniorityItem = roleItem.seniorityLevels.find(
    (item) => item.seniorityLevel === ownSalary.value?.seniorityLevel,
  );

  if (!seniorityItem) {
    return null;
  }

  const stats = normalized.value && (seniorityItem as any).normalizedStatistics
    ? (seniorityItem as any).normalizedStatistics
    : seniorityItem.statistics;

  return {
    average: stats.average,
    median: stats.median,
    max: stats.max,
    min: stats.min,
  };
});
</script>
