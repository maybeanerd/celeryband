<template>
  <div class="mt-4">
    <div class="w-full rounded-lg p-2">
      <div class="flex flex-col gap-6">
        <div v-for="(item, index) in salaryData" :key="index" class="flex w-full">
          <div class="w-32 flex flex-col justify-around pr-2">
            <div class="text-sm font-medium">
              <div class="truncate">
                {{ item.seniorityLevel }}
              </div> <div class="text-xs text-gray-500">
                {{ item.count }} data points
              </div>
            </div>
          </div>
          <div class="w-full">
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
