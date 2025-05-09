<template>
  <UCard class="w-full">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-briefcase" class="text-xl" />
          <h2 class="text-xl font-semibold">
            Statistics for {{ capitalizeFirstCharacterOfWords(ownSalary?.role) }}s
          </h2>
        </div>
        <div class="flex items-center gap-2">
          <USwitch v-model="showOnlyYourDepartment" />
          <span class="text-sm font-medium">Only include salaries from {{ capitalizeFirstCharacterOfWords(ownSalary?.department) ||
            'your department'
          }}</span>
        </div>
      </div>
    </template>
    <div v-if="sameRoleAllSeniorityData.length > 0" class="mt-4">
      <div class="w-full rounded-lg p-2">
        <div class="flex flex-col gap-6">
          <div v-for="(item, index) in sameRoleAllSeniorityData" :key="index" class="flex w-full flex-wrap md:flex-nowrap">
            <div class="w-32 flex flex-col justify-around pr-2">
              <div class="text-sm font-medium">
                <div class="truncate">
                  {{ capitalizeFirstCharacterOfWords(item.seniorityLevel) }}
                </div> <div class="text-xs text-gray-500">
                  {{ item.count }} data points
                </div>
              </div>
            </div>
            <div class="w-full mt-1">
              <SalaryBandLine
                :key="index"
                :min="item.min"
                :max="item.max"
                :median="item.median"
                :average="item.average"
                :global-min="globalMin"
                :global-max="globalMax"
                :currency="currency"
              />
            </div>
          </div>

          <!-- Legend moved below the visualization -->
          <div class="flex items-center gap-4 text-xs mt-4 justify-center">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-blue-500 rounded-full mr-1" />
              <span>Median</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 bg-green-500 rounded-full mr-1" />
              <span>Average</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <NoStatisticsAvailable v-else />
  </UCard>
</template>

<script setup lang="ts">
import SalaryBandLine from '~/components/SalaryBandLine.vue';
import type { DetailedStatistics } from '~/server/api/salary/statistics/index.get';
import type { SalarySchema } from '~/server/db/schemas/Salary.schema';

const props = defineProps<{
  salaryStatistics: DetailedStatistics|null;
  ownSalary: SalarySchema |null;
  currency?: string;
}>();

const showOnlyYourDepartment = ref(true);

type ResultItem= {
  seniorityLevel: string;
  average: number;
  median: number;
  min: number;
  max: number;
  count: number;
}

// Computed property for Same Role (All Seniorities) data that switches data sources based on toggle
const sameRoleAllSeniorityData = computed(() => {
  if (!props.salaryStatistics || !props.ownSalary) {
    return [];
  }

  // Choose the appropriate data source based on the toggle
  if (!showOnlyYourDepartment.value) {
    // Use byRoleAndSeniority (across all departments)
    if (!props.salaryStatistics.byRoleAndSeniority) {
      return [];
    }

    const result: ResultItem[] = [];
    const roleItem = props.salaryStatistics.byRoleAndSeniority.find(
      item => item.role === props.ownSalary?.role,
    );

    if (!roleItem) {
      return [];
    }

    // Process each seniority level for this role
    roleItem.seniorityLevels.forEach((seniorityItem) => {
      result.push({
        seniorityLevel: seniorityItem.seniorityLevel,
        average: seniorityItem.statistics.average,
        median: seniorityItem.statistics.median,
        min: seniorityItem.statistics.min,
        max: seniorityItem.statistics.max,
        count: seniorityItem.statistics.count,
      });
    });

    return result;
  } else {
    // Use byDepartmentAndRoleAndSeniority filtered to own department
    if (!props.salaryStatistics.byDepartmentAndRoleAndSeniority || !props.ownSalary?.department) {
      return [];
    }

    const result: ResultItem[] = [];
    const deptItem = props.salaryStatistics.byDepartmentAndRoleAndSeniority.find(
      item => item.department === props.ownSalary?.department,
    );

    if (!deptItem) {
      return [];
    }

    const roleItem = deptItem.roles.find(
      item => item.role === props.ownSalary?.role,
    );

    if (!roleItem) {
      return [];
    }

    // Process each seniority level for this role
    roleItem.seniorityLevels.forEach((seniorityItem) => {
      result.push({
        seniorityLevel: seniorityItem.seniorityLevel,
        average: seniorityItem.statistics.average,
        median: seniorityItem.statistics.median,
        min: seniorityItem.statistics.min,
        max: seniorityItem.statistics.max,
        count: seniorityItem.statistics.count,
      });
    });

    return result;
  }
});

// Find global min and max for scaling
const globalMin = computed(() => {
  const values = sameRoleAllSeniorityData.value.map(item => item.min);
  return Math.min(...values);
});

const globalMax = computed(() => {
  const values = sameRoleAllSeniorityData.value.map(item => item.max);
  return Math.max(...values);
});

</script>
