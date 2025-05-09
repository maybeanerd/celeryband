<template>
  <div class="mt-4">
    <div class="relative w-full h-[300px] rounded-lg p-4">
      <!-- Y-axis labels (seniority levels) -->
      <div class="absolute left-0 top-0 bottom-0 w-[120px] flex flex-col justify-around pr-2">
        <div v-for="(item, index) in salaryData" :key="index" class="text-sm font-medium truncate">
          {{ item.seniorityLevel }}
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
          <div class="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
          <span>Median</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
          <span>Average</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SalaryBandLine from '~/components/SalaryBandLine.vue';

interface SalaryDataItem {
  seniorityLevel: string;
  min: string | number;
  max: string | number;
  average: string | number;
  median: string | number;
}

const props = defineProps<{
  salaryData: SalaryDataItem[];
  currency?: string;
}>();

// Find global min and max for scaling
const globalMin = computed(() => {
  const values = props.salaryData.map(item => parseValue(item.min));
  return Math.min(...values);
});

const globalMax = computed(() => {
  const values = props.salaryData.map(item => parseValue(item.max));
  return Math.max(...values);
});

// Helper function to parse string values with currency
function parseValue(value: string | number): number {
  if (typeof value === 'number') {
    return value;
  }
  // Remove currency symbol and any non-numeric characters except for decimal point
  return parseFloat(value.toString().replace(/[^\d.-]/g, ''));
}
</script> 