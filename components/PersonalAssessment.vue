<template>
  <div class="flex flex-col gap-2 p-4">
    <p v-if="data === null || !data.areAvailable">
      You need to first configure your salary before we can provide you with insights.
    </p>
    <template v-else>
      <h1>
        Your Salary is
      </h1>

      <p v-if="data.salaryAssessment.overall">
        Overall {{ data.salaryAssessment.overall.average }}% better than the average and {{
          data.salaryAssessment.overall.median }}% better than the median.
      </p>
      <p v-if="data.salaryAssessment.department">
        In you department, {{ data.salaryAssessment.department.average }}% better than the average and {{
          data.salaryAssessment.department.median }}% better than the median.
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useSalaryStatistics } from '~/composables/api/useSalaryStatistics';

const data = await useSalaryStatistics();
</script>
