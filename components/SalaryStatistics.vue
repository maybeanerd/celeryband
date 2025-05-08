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
        <div v-if="statistics?.statistics" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <p class="p-2">Average: {{ overallStats.average }}</p>
          <p class="p-2">Median: {{ overallStats.median }}</p>
          <p class="p-2">Maximum: {{ overallStats.max }}</p>
          <p class="p-2">Minimum: {{ overallStats.min }}</p>
        </div>
        <template v-if="statistics.salaryAssessment?.overall" #footer>
          <div class="flex flex-col gap-2">
            <p class="text-sm font-medium">
              Your salary compared to others:
            </p>
            <div class="flex gap-4">
              <UBadge color="success" variant="soft">
                {{ salaryAssessmentValues.avgPercentage }}% of average
              </UBadge>
              <UBadge color="primary" variant="soft">
                {{ salaryAssessmentValues.medianPercentage }}% of median
              </UBadge>
            </div>
          </div>
        </template>
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
        <template v-if="statistics.salaryAssessment?.department" #footer>
          <div class="flex flex-col gap-2">
            <p class="text-sm font-medium">
              Your salary compared to your department:
            </p>
            <div class="flex gap-4">
              <UBadge color="success" variant="soft">
                {{ statistics.salaryAssessment.department.average }}% of average
              </UBadge>
              <UBadge color="primary" variant="soft">
                {{ statistics.salaryAssessment.department.median }}% of median
              </UBadge>
            </div>
          </div>
        </template>
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

// Salary assessment computed property
const salaryAssessmentValues = computed(() => {
  if (!statistics.value?.salaryAssessment?.overall) {
    return { avgPercentage: 0, medianPercentage: 0 };
  }

  const assessment = statistics.value.salaryAssessment;
  // Choose assessment based on normalization toggle
  const values = normalized.value && (assessment as any).normalizedOverall
    ? (assessment as any).normalizedOverall
    : assessment.overall || { average: 0, median: 0 };

  return {
    avgPercentage: values.average,
    medianPercentage: values.median,
  };
});
</script>
