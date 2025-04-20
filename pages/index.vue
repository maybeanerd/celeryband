<template>
  <UTabs :items="items" class="w-full">
    <template #statistics="{ item }">
      <SalaryStatistics />
    </template>
    <template #personal="{ item }">
      <p>TODO, how good is your pay in relation to similar positions</p>
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
    label: 'Personal Assessment',
    icon: 'i-lucide-user-check',
    slot: 'personal' as const,
  },
]);
</script>
