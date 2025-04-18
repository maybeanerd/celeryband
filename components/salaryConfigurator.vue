<template>
  <div class="flex flex-col gap-2">
    <h1>Your Salary</h1>

    <UButton class="max-w-36" @click="() => refresh()">
      Refresh
    </UButton>

    <p v-if="data">
      salary: {{ data }}
    </p>
    <p v-else>
      error: {{ error }}
    </p>

    <p>Attributes: {{ attributes }}</p>

    <UButton class="max-w-36" @click="() => updateSalary()">
      Update Salary
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { SalarySchema } from '~/server/db/schemas/Salary.schema';

const { data, error, refresh } = await useFetch<SalarySchema>('/api/salary', {
  lazy: true,
});
const { data: attributes } = await useFetch<{
  roles: readonly [string, ...string[]];
  seniorityLevels: readonly [string, ...string[]];
  departments: readonly [string, ...string[]];
  currency: string;
}>('/api/salary/attributes', {
  lazy: true,
});

async function updateSalary() {
  const salaryValues = {
    role: 'software engineer',
    seniorityLevel: 'senior',
    department: 'beta',
    yearlyAmount: 100000,
    hoursPerWeek: 40,
  };

  const { data, error } = await useFetch<SalarySchema>('/api/salary', {
    method: 'PUT',
    body: salaryValues,
  });
  if (error.value) {
    console.error('Error updating salary:', error.value);
  } else {
    console.log('Salary updated successfully:', data.value);
  }
}

</script>
