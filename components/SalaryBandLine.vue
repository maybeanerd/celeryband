<template>
  <div class="flex gap-1 items-center">
    <!-- Min label -->
    <div
      class="text-xs text-gray-500 dark:text-gray-400 w-16 whitespace-nowrap"
    >
      {{ formatValue(min) }}
    </div>

    <!-- Line with markers -->
    <div class="relative h-10 flex items-center w-full">
      <!-- Salary band line -->
      <div
        class="absolute h-2 bg-gray-200 dark:bg-gray-700 rounded-full"
        :style="{
          left: `${getPercentPosition(min)}%`,
          width: `${getPercentWidth(min, max)}%`
        }"
      />

      <!-- Median marker -->
      <div
        class="absolute w-1 h-4 bg-blue-500 rounded-full transform -translate-x-1/2"
        :style="{ left: `${getPercentPosition(median)}%` }"
      >
        <div class="absolute top-4 transform -translate-x-1/2 text-xs text-blue-500 whitespace-nowrap">
          {{ formatValue(median) }}
        </div>
      </div>

      <!-- Average marker -->
      <div
        class="absolute w-1 h-4 bg-green-500 rounded-full transform -translate-x-1/2"
        :style="{ left: `${getPercentPosition(average)}%` }"
      >
        <div class="absolute top-[-16px] transform -translate-x-1/2 text-xs text-green-500 whitespace-nowrap">
          {{ formatValue(average) }}
        </div>
      </div>

      <!-- Own salary marker (optional) -->
      <div
        v-if="ownSalary"
        class="absolute w-1 h-6 bg-purple-500 rounded-full transform -translate-x-1/2"
        :style="{ left: `${getPercentPosition(ownSalary)}%` }"
      >
        <div class="absolute top-8 transform -translate-x-1/2 text-xs text-purple-500 whitespace-nowrap">
          {{ formatValue(ownSalary) }}
        </div>
      </div>
    </div>

    <!-- Max label -->
    <div
      class="text-xs text-gray-500 dark:text-gray-400 w-18 whitespace-nowrap"
    >
      {{ formatValue(max) }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  min: number;
  max: number;
  average: number;
  median: number;
  globalMin: number;
  globalMax: number;
  currency?: string;
  ownSalary?: string | number;
}>();

// Calculate position percentage based on the global scale
function getPercentPosition (value: number | string) {
  const numValue = Number(value);
  const range = props.globalMax - props.globalMin;
  if (range <= 0) {
    return 50;
  }
  return ((numValue - props.globalMin) / range) * 100;
}

// Calculate width percentage for the salary band
function getPercentWidth (min: number, max: number) {
  const minValue = min;
  const maxValue = max;
  const range = props.globalMax - props.globalMin;
  if (range <= 0) {
    return 100;
  }
  return ((maxValue - minValue) / range) * 100;
}

// Format the value for display
function formatValue (value: string | number): string {
  return `${value}${props.currency ? ` ${props.currency}` : ''}`;
}
</script>
