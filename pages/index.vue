<template>
  <UTabs :items="items" class="w-full">
    <template #statistics="{ item }">
      <SalaryStatistics />
    </template>
    <template #normalized="{ item }">
      <p>normalizes salaries...</p>
    </template>
  </UTabs>
</template>

<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui';

const items = ref<TabsItem[]>([

  {
    label: 'Salary Statistics',
    icon: 'i-lucide-bar-chart-big',
    slot: 'statistics' as const,
  },
  {
    label: 'Normalized Salaries',
    icon: 'i-lucide-chart-column-stacked',
    slot: 'normalized' as const,
  },
]);
</script>
