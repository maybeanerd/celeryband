<template>
  <div class="mt-4">
    <div class="relative w-full h-[300px] rounded-lg p-4">
      <!-- TODO move to flex to make nicer on mobile -->

      <!-- Y-axis labels (seniority levels) -->
      <div class="absolute left-0 top-0 bottom-0 w-[120px] flex flex-col justify-around pr-2">
        <div v-for="(item, index) in salaryData" :key="index" class="text-sm font-medium">
          <div class="truncate">
            {{ item.seniorityLevel }}
          </div>
        </div>
      </div>

      <!-- Visualization area -->
      <div class="ml-[120px] h-full flex flex-col justify-around">
        <SalaryBandLine
          v-for="(item, index) in salaryData"
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

      <!-- Legend -->
      <div class="absolute bottom-[-30px] left-[120px] right-0 flex justify-center gap-4 text-xs">
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
</template>

<script setup lang="ts">
import SalaryBandLine from '~/components/SalaryBandLine.vue';

type SalaryDataItem = {
  seniorityLevel: string;
  min: number;
  max: number;
  average:number;
  median: number;
  count: number;
}

const props = defineProps<{
  salaryData: SalaryDataItem[];
  currency?: string;
}>();

// Find global min and max for scaling
const globalMin = computed(() => {
  const values = props.salaryData.map(item => item.min);
  return Math.min(...values);
});

const globalMax = computed(() => {
  const values = props.salaryData.map(item => item.max);
  return Math.max(...values);
});

</script>
