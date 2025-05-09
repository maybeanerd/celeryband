<template>
  <UCard class="w-full">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-bar-chart-big" class="text-xl" />
        <h2 class="text-xl font-semibold">
          Overall Statistics
        </h2>
      </div>
    </template>
    <div v-if="salaryStatistics" class="flex flex-col gap-4">
      <!-- Global statistics -->
      <div>
        <h3 class="text-lg font-medium mb-1">
          All Employees
        </h3>
        <div v-if="overallStats">
          <p class="text-xs text-gray-500 mb-2">
            Based on {{ overallStats.count }} data points
          </p>

          <!-- Add visualization for overall statistics -->
          <div class="mb-4 mt-4">
            <div class="relative">
              <SalaryBandLine
                :min="overallStats.min"
                :max="overallStats.max"
                :median="overallStats.median"
                :average="overallStats.average"
                :global-min="globalMinValue"
                :global-max="globalMaxValue"
                :currency="currency"
                :own-salary="ownSalary?.yearlyAmount"
              />
            </div>
          </div>
        </div>
        <NoStatisticsAvailable v-else />
      </div>

      <!-- Your role and seniority statistics -->
      <div>
        <h3 class="text-lg font-medium mb-1">
          {{ capitalizeFirstCharacterOfWords(ownSalary?.seniorityLevel) }} {{ capitalizeFirstCharacterOfWords(ownSalary?.role) }}s
        </h3>
        <div v-if="ownRoleSeniorityStats">
          <p class="text-xs text-gray-500 mb-2">
            Based on {{ ownRoleSeniorityStats.count }} data points
          </p>

          <!-- Add visualization for role & seniority statistics -->
          <div class="mb-4 mt-4">
            <div class="relative">
              <SalaryBandLine
                :min="ownRoleSeniorityStats.min"
                :max="ownRoleSeniorityStats.max"
                :median="ownRoleSeniorityStats.median"
                :average="ownRoleSeniorityStats.average"
                :global-min="globalMinValue"
                :global-max="globalMaxValue"
                :currency="currency"
                :own-salary="ownSalary?.yearlyAmount"
              />
            </div>
          </div>

          <div v-if="props.salaryAssessment.sameRoleAndSeniority" class="flex gap-4">
            <SalaryPercentageBadge
              :percentage="props.salaryAssessment.sameRoleAndSeniority.average"
              context="average"
            />
            <SalaryPercentageBadge
              :percentage="props.salaryAssessment.sameRoleAndSeniority.median"
              context="median"
            />
          </div>
        </div>
        <NoStatisticsAvailable v-else />
      </div>

      <div>
        <h3 class="text-lg font-medium mb-1">
          {{ capitalizeFirstCharacterOfWords(ownSalary?.seniorityLevel) }} {{ capitalizeFirstCharacterOfWords(ownSalary?.role) }}s
          in {{ capitalizeFirstCharacterOfWords(ownSalary?.department) }}
        </h3>
        <div v-if="ownRoleAndSeniorityAndDepartmentStats">
          <p class="text-xs text-gray-500 mb-2">
            Based on {{ ownRoleAndSeniorityAndDepartmentStats.count }} data
            points
          </p>

          <div class="mb-4 mt-4">
            <div class="relative">
              <SalaryBandLine
                :min="ownRoleAndSeniorityAndDepartmentStats.min"
                :max="ownRoleAndSeniorityAndDepartmentStats.max"
                :median="ownRoleAndSeniorityAndDepartmentStats.median"
                :average="ownRoleAndSeniorityAndDepartmentStats.average"
                :global-min="globalMinValue"
                :global-max="globalMaxValue"
                :currency="currency"
                :own-salary="ownSalary?.yearlyAmount"
              />
            </div>
          </div>

          <div v-if="props.salaryAssessment.sameRoleAndSeniorityAndDepartment" class="flex gap-4">
            <SalaryPercentageBadge
              :percentage="props.salaryAssessment.sameRoleAndSeniorityAndDepartment.average"
              context="average"
            />
            <SalaryPercentageBadge
              :percentage="props.salaryAssessment.sameRoleAndSeniorityAndDepartment.median"
              context="median"
            />
          </div>
        </div>
        <NoStatisticsAvailable v-else />
      </div>

      <!-- Legend for all visualizations moved to the end -->
      <div class="flex items-center gap-4 text-xs mt-2 mb-2 justify-center">
        <div class="flex items-center">
          <div class="w-3 h-3 bg-blue-500 rounded-full mr-1" />
          <span>Median</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-green-500 rounded-full mr-1" />
          <span>Average</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-purple-500 rounded-full mr-1" />
          <span>Your Salary</span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import SalaryBandLine from '~/components/SalaryBandLine.vue';
import type { DetailedStatistics, SalaryStatistics, SalaryAssessment } from '~/server/api/salary/statistics/index.get';
import type { SalarySchema } from '~/server/db/schemas/Salary.schema';

const props = defineProps<{
  salaryStatistics: DetailedStatistics | null;
  salaryAssessment: SalaryAssessment;
  ownSalary: SalarySchema | null;
  currency?: string;
}>();

const ownRoleSeniorityStats = computed<SalaryStatistics | null>(() => {
  if (!props.salaryStatistics?.byRoleAndSeniority ||
    !props.ownSalary?.role ||
    !props.ownSalary?.seniorityLevel) {
    return null;
  }

  // Find the role item
  const roleItem = props.salaryStatistics.byRoleAndSeniority.find(
    item => item.role === props.ownSalary?.role,
  );

  if (!roleItem) {
    return null;
  }

  // Find the seniority level item
  const seniorityItem = roleItem.seniorityLevels.find(
    item => item.seniorityLevel === props.ownSalary?.seniorityLevel,
  );

  if (!seniorityItem || seniorityItem.statistics.count < 3) {
    return null;
  }

  return seniorityItem.statistics;
});

const overallStats = computed<SalaryStatistics | null>(() => {
  return props.salaryStatistics?.overallStatistics ?? null;
});

const ownRoleAndSeniorityAndDepartmentStats = computed<SalaryStatistics | null>(() => {
  if (!props.salaryStatistics?.byDepartmentAndRoleAndSeniority || !props.ownSalary?.department) {
    return null;
  }

  const departmentStat = props.salaryStatistics.byDepartmentAndRoleAndSeniority.find(
    item => item.department === props.ownSalary?.department,
  );

  if (!departmentStat) {
    return null;
  }

  const roleStat = departmentStat.roles.find(
    item => item.role === props.ownSalary?.role,
  );

  if (!roleStat) {
    return null;
  }

  const seniorityStat = roleStat.seniorityLevels.find(
    item => item.seniorityLevel === props.ownSalary?.seniorityLevel,
  );

  if (!seniorityStat || seniorityStat.statistics.count < 3) {
    return null;
  }

  return seniorityStat.statistics;
});

const globalMinValue = computed(() => {
  return props.salaryStatistics?.overallStatistics?.min ?? 0;
});

const globalMaxValue = computed(() => {
  return props.salaryStatistics?.overallStatistics?.max ?? 0;
});
</script>
