<template>
  <div class="relative h-10 flex items-center">
    <!-- Salary band line -->
    <div class="absolute h-2 bg-gray-200 dark:bg-gray-700 rounded-full"
      :style="{
        left: `${getPercentPosition(min)}%`,
        width: `${getPercentWidth(min, max)}%`
      }">
    </div>
    
    <!-- Min marker -->
    <div class="absolute top-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap"
      :style="{ 
        left: `${getPercentPosition(min)}%`, 
        transform: 'translateX(-100%) translateY(-50%)', 
        marginLeft: '-4px' 
      }">
      {{ formatValue(min) }}
    </div>
    
    <!-- Max marker -->
    <div class="absolute top-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap"
      :style="{ 
        left: `${getPercentPosition(max)}%`, 
        transform: 'translateY(-50%)', 
        marginLeft: '4px' 
      }">
      {{ formatValue(max) }}
    </div>
    
    <!-- Median marker -->
    <div class="absolute w-1 h-4 bg-blue-500 rounded-full transform -translate-x-1/2"
      :style="{ left: `${getPercentPosition(median)}%` }">
      <div class="absolute top-4 transform -translate-x-1/2 text-xs text-blue-500 whitespace-nowrap">
        {{ formatValue(median) }}
      </div>
    </div>
    
    <!-- Average marker -->
    <div class="absolute w-1 h-4 bg-green-500 rounded-full transform -translate-x-1/2"
      :style="{ left: `${getPercentPosition(average)}%` }">
      <div class="absolute top-[-16px] transform -translate-x-1/2 text-xs text-green-500 whitespace-nowrap">
        {{ formatValue(average) }}
      </div>
    </div>

    <!-- Own salary marker (optional) -->
    <div v-if="ownSalary" 
      class="absolute w-1 h-6 bg-purple-500 rounded-full transform -translate-x-1/2"
      :style="{ left: `${getPercentPosition(ownSalary)}%` }">
      <div class="absolute top-8 transform -translate-x-1/2 text-xs text-purple-500 whitespace-nowrap">
        {{ formatValue(ownSalary) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  min: string | number;
  max: string | number;
  average: string | number;
  median: string | number;
  globalMin: number;
  globalMax: number;
  currency?: string;
  ownSalary?: string | number;
  count?: number;
}>();

// Helper function to parse string values with currency
function getSalaryNumericValue (value: string | number): number {
  if (typeof value === 'number') {
    return value;
  }
  // Parse string to number without removing currency symbols
  return parseFloat(value);
}

// Calculate position percentage based on the global scale
function getPercentPosition (value: string | number) {
  const numValue = getSalaryNumericValue(value);
  const range = props.globalMax - props.globalMin;
  if (range === 0) {
    return 50;
  }
  // Add padding of 10% on each side
  return 10 + ((numValue - props.globalMin) / range) * 80;
}

// Calculate width percentage for the salary band
function getPercentWidth (min: string | number, max: string | number) {
  const minValue = getSalaryNumericValue(min);
  const maxValue = getSalaryNumericValue(max);
  const range = props.globalMax - props.globalMin;
  if (range === 0) {
    return 80;
  }
  return ((maxValue - minValue) / range) * 80;
}

// Format the value for display
function formatValue (value: string | number): string {
  if (typeof value === 'string') {
    return value;
  }
  return `${value}${props.currency ? ` ${props.currency}` : ''}`;
}
</script>