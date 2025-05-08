<template>
  <div class="flex flex-col gap-4 p-4">
    <h1 class="text-2xl font-bold">
      Salary Statistics
    </h1>
    <div v-if="!dataIsAvailable" class="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
      <UIcon name="i-lucide-database-x" class="text-4xl mb-2 text-gray-500 dark:text-gray-400" />
      <p class="text-lg dark:text-white">No salary data available yet.</p>
      <p class="text-sm text-gray-500 dark:text-gray-400">Please configure your salary information first.</p>
    </div>
    <template v-else-if="statistics && statistics.statistics">
      <!-- Overall Statistics -->
      <UCard class="w-full">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-bar-chart-big" class="text-xl" />
            <h2 class="text-xl font-semibold">Overall Statistics</h2>
          </div>
        </template>
        <div v-if="statistics?.statistics" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <p class="p-2">Average: {{ formatNumber(statistics.statistics.overallStatistics.average) }}</p>
          <p class="p-2">Median: {{ formatNumber(statistics.statistics.overallStatistics.median) }}</p>
          <p class="p-2">Maximum: {{ formatNumber(statistics.statistics.overallStatistics.max) }}</p>
          <p class="p-2">Minimum: {{ formatNumber(statistics.statistics.overallStatistics.min) }}</p>
        </div>
        <template v-if="statistics.salaryAssessment?.overall" #footer>
          <div class="flex flex-col gap-2">
            <p class="text-sm font-medium">
              Your salary compared to others:
            </p>
            <div class="flex gap-4">
              <UBadge color="success" variant="soft">
                {{ statistics.salaryAssessment.overall.average }}% of average
              </UBadge>
              <UBadge color="primary" variant="soft">
                {{ statistics.salaryAssessment.overall.median }}% of median
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
          <UTable :columns="departmentColumns" :rows="departmentRows" />
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

      <!-- Roles Statistics -->
      <UCard class="w-full">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-users" class="text-xl" />
            <h2 class="text-xl font-semibold">Statistics by Role</h2>
          </div>
        </template>
        <div>
          <UTable :columns="roleColumns" :rows="roleRows" />
        </div>
      </UCard>

      <!-- Seniority Level Statistics -->
      <UCard class="w-full">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-line-chart" class="text-xl" />
            <h2 class="text-xl font-semibold">
              Statistics by Seniority Level
            </h2>
          </div>
        </template>
        <div>
          <UTable :columns="seniorityColumns" :rows="seniorityRows" />
        </div>
      </UCard>

      <!-- Normalized Stats Disclaimer -->
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
        <UIcon name="i-lucide-info" class="inline mr-1" />
        Normalized statistics adjust for part-time positions and show all values adjusted to your amount of weekly
        hours.
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useSalaryStatistics } from '~/composables/api/useSalaryStatistics';
import { useServerConfiguration } from '~/composables/api/useServerConfiguration';

const { config } = await useServerConfiguration();

const statistics = await useSalaryStatistics();

const dataIsAvailable = computed(() => {
  return statistics.value?.areAvailable === true && !!statistics.value?.statistics;
});

const currencySymbol = computed(() => {
  return config.value?.currency ?? '';
});

const formatNumber = (value: number) => {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value) + ' ' + currencySymbol.value;
};

const departmentColumns = [
  { key: 'department', label: 'Department' },
  { key: 'average', label: 'Average' },
  { key: 'median', label: 'Median' },
  { key: 'min', label: 'Minimum' },
  { key: 'max', label: 'Maximum' },
] as any[];

const departmentRows = computed(() => {
  if (!dataIsAvailable.value || !statistics.value?.statistics?.byDepartment) {
    return [];
  }

  return statistics.value.statistics.byDepartment.map(item => ({
    department: item.department,
    average: formatNumber(item.statistics.average),
    median: formatNumber(item.statistics.median),
    min: formatNumber(item.statistics.min),
    max: formatNumber(item.statistics.max),
  }));
});

// Role table configuration
const roleColumns = [
  { key: 'role', label: 'Role' },
  { key: 'average', label: 'Average' },
  { key: 'median', label: 'Median' },
  { key: 'min', label: 'Minimum' },
  { key: 'max', label: 'Maximum' },
] as any[];

const roleRows = computed(() => {
  if (!dataIsAvailable.value || !statistics.value?.statistics?.byRole) {
    return [];
  }

  return statistics.value.statistics.byRole.map(item => ({
    role: item.role,
    average: formatNumber(item.statistics.average),
    median: formatNumber(item.statistics.median),
    min: formatNumber(item.statistics.min),
    max: formatNumber(item.statistics.max),
  }));
});

// Seniority table configuration
const seniorityColumns = [
  { key: 'seniorityLevel', label: 'Seniority Level' },
  { key: 'average', label: 'Average' },
  { key: 'median', label: 'Median' },
  { key: 'min', label: 'Minimum' },
  { key: 'max', label: 'Maximum' },
] as any[];

const seniorityRows = computed(() => {
  if (!dataIsAvailable.value || !statistics.value?.statistics?.bySeniorityLevel) {
    return [];
  }

  return statistics.value.statistics.bySeniorityLevel.map(item => ({
    seniorityLevel: item.seniorityLevel,
    average: formatNumber(item.statistics.average),
    median: formatNumber(item.statistics.median),
    min: formatNumber(item.statistics.min),
    max: formatNumber(item.statistics.max),
  }));
});
</script>
