<template>
  <div class="flex flex-col gap-2 p-4">
    <p v-if="data === null || !data.areAvailable">
      You need to first configure your salary before we can provide you with insights.
    </p>
    <template v-else>
      <h1>
        Your Salary is
      </h1>

      <p v-if="data.salaryAssessment.sameRoleAndSeniority">
        Compared to same role and seniority: {{ data.salaryAssessment.sameRoleAndSeniority.average }}% compared to the average and {{
          data.salaryAssessment.sameRoleAndSeniority.median }}% compared to the median.
      </p>
      <p v-if="data.salaryAssessment.sameRoleAndSeniorityAndDepartment">
        Within your department, role and seniority: {{ data.salaryAssessment.sameRoleAndSeniorityAndDepartment.average }}% compared to the average and {{
          data.salaryAssessment.sameRoleAndSeniorityAndDepartment.median }}% compared to the median.
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useSalaryStatistics } from '~/composables/api/useSalaryStatistics';

const data = await useSalaryStatistics();
</script>
