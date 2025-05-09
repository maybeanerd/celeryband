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
        <div
          v-for="(item, index) in salaryData"
          :key="index"
          class="relative h-10 flex items-center"
        >
          <!-- Salary band line -->
          <div class="absolute h-2 bg-gray-200 dark:bg-gray-700 rounded-full"
               :style="{
                 left: `${getPercentPosition(item.min)}%`,
                 width: `${getPercentWidth(item.min, item.max)}%`
               }">
          </div>
          
          <!-- Min marker -->
          <div class="absolute bottom-6 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400"
               :style="{ left: `${getPercentPosition(item.min)}%` }">
            {{ formatValue(item.min) }}
          </div>
          
          <!-- Max marker -->
          <div class="absolute bottom-6 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400"
               :style="{ left: `${getPercentPosition(item.max)}%` }">
            {{ formatValue(item.max) }}
          </div>
          
          <!-- Median marker -->
          <div class="absolute w-2 h-4 bg-blue-500 rounded-full transform -translate-x-1/2"
               :style="{ left: `${getPercentPosition(item.median)}%` }">
            <div class="absolute top-4 transform -translate-x-1/2 text-xs text-blue-500 whitespace-nowrap">
              {{ formatValue(item.median) }}
            </div>
          </div>
          
          <!-- Average marker -->
          <div class="absolute w-2 h-4 bg-green-500 rounded-full transform -translate-x-1/2"
               :style="{ left: `${getPercentPosition(item.average)}%` }">
            <div class="absolute top-[-16px] transform -translate-x-1/2 text-xs text-green-500 whitespace-nowrap">
              {{ formatValue(item.average) }}
            </div>
          </div>
        </div>
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
  if (typeof value === 'number') return value;
  // Remove currency symbol and any non-numeric characters except for decimal point
  return parseFloat(value.toString().replace(/[^\d.-]/g, ''));
}

// Calculate position percentage based on the global scale
function getPercentPosition(value: string | number) {
  const numValue = parseValue(value);
  const range = globalMax.value - globalMin.value;
  if (range === 0) { return 50; } // Handle case where all values are the same
  // Add padding of 10% on each side
  return 10 + ((numValue - globalMin.value) / range) * 80;
}

// Calculate width percentage for the salary band
function getPercentWidth(min: string | number, max: string | number) {
  const minValue = parseValue(min);
  const maxValue = parseValue(max);
  const range = globalMax.value - globalMin.value;
  if (range === 0) { return 80; } // Handle case where all values are the same
  return ((maxValue - minValue) / range) * 80;
}

// Format the value for display
function formatValue(value: string | number): string {
  if (typeof value === 'string') {
    return value;
  }
  return `${value} ${props.currency || ''}`;
}
</script> 