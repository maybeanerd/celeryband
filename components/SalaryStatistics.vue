<template>
  <div class="flex flex-col gap-4 p-4">
    <h1 class="text-2xl font-bold">
      Salary Statistics
    </h1>

    <div v-if="!data?.areAvailable" class="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
      <UIcon name="i-lucide-database-x" class="text-4xl mb-2 text-gray-500 dark:text-gray-400" />
      <p class="text-lg dark:text-white">No salary data available yet.</p>
      <p class="text-sm text-gray-500 dark:text-gray-400">Please configure your salary information first.</p>
    </div>

    <template v-else-if="data?.areAvailable && data.statistics">
      <!-- Overall Statistics -->
      <UCard class="w-full">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-bar-chart-big" class="text-xl" />
            <h2 class="text-xl font-semibold">Overall Statistics</h2>
          </div>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <UMetric :value="formatNumber(data.statistics.overallStatistics.average)" label="Average" color="primary"
            class="p-2" />
          <UMetric :value="formatNumber(data.statistics.overallStatistics.median)" label="Median" color="primary"
            class="p-2" />
          <UMetric :value="formatNumber(data.statistics.overallStatistics.min)" label="Minimum" color="gray"
            class="p-2" />
          <UMetric :value="formatNumber(data.statistics.overallStatistics.max)" label="Maximum" color="gray"
            class="p-2" />
        </div>
        <template v-if="data.salaryAssessment?.overall" #footer>
          <div class="flex flex-col gap-2">
            <p class="text-sm font-medium">Your salary compared to others:</p>
            <div class="flex gap-4">
              <UBadge color="success" variant="soft">
                {{ formatPercentage(data.salaryAssessment.overall.average) }} of average
              </UBadge>
              <UBadge color="primary" variant="soft">
                {{ formatPercentage(data.salaryAssessment.overall.median) }} of median
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
            <h2 class="text-xl font-semibold">Statistics by Department</h2>
          </div>
        </template>
        <div>
          <UTable :columns="departmentColumns" :rows="departmentRows" />
        </div>
        <template v-if="data.salaryAssessment?.department" #footer>
          <div class="flex flex-col gap-2">
            <p class="text-sm font-medium">Your salary compared to your department:</p>
            <div class="flex gap-4">
              <UBadge color="success" variant="soft">
                {{ formatPercentage(data.salaryAssessment.department.average) }} of average
              </UBadge>
              <UBadge color="primary" variant="soft">
                {{ formatPercentage(data.salaryAssessment.department.median) }} of median
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
            <h2 class="text-xl font-semibold">Statistics by Seniority Level</h2>
          </div>
        </template>
        <div>
          <UTable :columns="seniorityColumns" :rows="seniorityRows" />
        </div>
      </UCard>

      <!-- Normalized Stats Disclaimer -->
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
        <UIcon name="i-lucide-info" class="inline mr-1" />
        Normalized statistics adjust for part-time positions and show full-time equivalent values.
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useSalaryStatistics } from '~/composables/api/useSalaryStatistics';
import { useServerConfiguration } from '~/composables/api/useServerConfiguration';

const data = await useSalaryStatistics();
const { config } = await useServerConfiguration();

// Get currency from server config
const currencySymbol = computed(() => {
  return config?.currency || 'USD';
});

// Format number values
const formatNumber = (value: number) => {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value) + ' ' + currencySymbol.value;
};

// Format percentage values
const formatPercentage = (value: number) => {
  return new Intl.NumberFormat(undefined, {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value);
};

// Department table configuration
const departmentColumns = [
  { key: 'department', label: 'Department' },
  { key: 'average', label: 'Average' },
  { key: 'median', label: 'Median' },
  { key: 'min', label: 'Minimum' },
  { key: 'max', label: 'Maximum' },
] as any[];

const departmentRows = computed(() => {
  if (!data.value?.areAvailable || !data.value.statistics) {
    return [];
  }

  return data.value.statistics.byDepartment.map(item => ({
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
  if (!data.value?.areAvailable || !data.value.statistics) {
    return [];
  }

  return data.value.statistics.byRole.map(item => ({
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
  if (!data.value?.areAvailable || !data.value.statistics) {
    return [];
  }

  return data.value.statistics.bySeniorityLevel.map(item => ({
    seniorityLevel: item.seniorityLevel,
    average: formatNumber(item.statistics.average),
    median: formatNumber(item.statistics.median),
    min: formatNumber(item.statistics.min),
    max: formatNumber(item.statistics.max),
  }));
});
</script>
