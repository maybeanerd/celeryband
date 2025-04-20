<template>
  <div class="flex flex-col gap-2 p-4">
    <h1>
      Salary Statistics
    </h1>

    <p> {{ data }}</p>
  </div>
</template>

<script setup lang="ts">
import { useSalaryStatistics } from '~/composables/api/useSalaryStatistics';

const data = await useSalaryStatistics();
</script>
