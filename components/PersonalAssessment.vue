<template>
  <div class="flex flex-col gap-2 p-4">
    <h1>
      Your Salary is
    </h1>

    <p> {{ statistics }}</p>
  </div>
</template>

<script setup lang="ts">
import { useSalaryStatistics } from '~/composables/api/useSalaryStatistics';

const { statistics } = await useSalaryStatistics();
</script>
