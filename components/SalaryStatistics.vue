<template>
  <div class="flex flex-col gap-4">
    <div
      v-if="!dataIsAvailable"
      class="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg text-center flex flex-col gap-4 items-center"
    >
      <UIcon name="i-lucide-file-lock-2" class="text-4xl mb-2 text-gray-500 dark:text-gray-400" />
      <p class="text-lg dark:text-white">
        No statistics available.
      </p>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Please configure your salary information first.
      </p>
      <UButton to="/account">
        Go to account
      </UButton>
    </div>
    <template v-else-if="statistics && statistics.statistics">
      <div class="flex flex-col gap-2 p-2 md:p-4">
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

      <OverallStatistics :salary-statistics="chosenStatistics" :salary-assessment="statistics.salaryAssessment" :own-salary="ownSalary" :currency="currency" />

      <SalaryBandVisualization :salary-statistics="chosenStatistics" :own-salary="ownSalary" :currency="currency" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useOwnSalary } from '~/composables/api/useOwnSalary';
import { useSalaryStatistics } from '~/composables/api/useSalaryStatistics';
import { useServerConfiguration } from '~/composables/api/useServerConfiguration';

const { config: serverConfig } = await useServerConfiguration();
const normalized = ref(true);
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

</script>
