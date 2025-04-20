<template>
  <UTabs :items="items" class="w-full">
    <template #statistics="{ item }">
      <SalaryStatistics />
    </template>
    <template #account="{ item }">
      <div class="flex flex-col gap-2">
        <UButton class="max-w-36" @click="clear">
          Log Out
        </UButton>

        <SalaryConfigurator />
      </div>
    </template>
  </UTabs>
</template>

<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui';

const { clear } = useUserSession();

const items = ref<TabsItem[]>([

  {
    label: 'Statistics',
    icon: 'i-lucide-bar-chart-big',
    slot: 'statistics' as const,
  },
  {
    label: 'Account',
    icon: 'i-lucide-user',
    slot: 'account' as const,
  },
]);
</script>
