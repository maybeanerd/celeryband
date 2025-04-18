<template>
  <div class="flex flex-col gap-2 border-primary-500 border-2 rounded-lg p-4">
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

    <template v-if="attributes">
      <p>
        role: {{ selectedRole }}
      </p>
      <p>
        seniorityLevel: {{ selectedSeniorityLevel }}
      </p>
      <p>
        department: {{ selectedDepartment }}
      </p>
      <p>
        yearlyAmount: {{ selectedYearlyAmount }} {{ attributes.currency }}
      </p>
      <p>
        hoursPerWeek: {{ selectedHoursPerWeek }}
      </p>
    </template>

    <UButton class="max-w-36" @click="() => updateSalary()">
      Change Salary
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { SalarySchema } from '~/server/db/schemas/Salary.schema';
const { data: attributes } = await useFetch<{
  roles: readonly [string, ...string[]];
  seniorityLevels: readonly [string, ...string[]];
  departments: readonly [string, ...string[]];
  currency: string;
}>('/api/salary/attributes', {
  lazy: true,
});

const { data, error, refresh } = await useFetch<SalarySchema>('/api/salary', {
  lazy: false,
});

const selectedRole = ref(data.value?.role || '');
const selectedSeniorityLevel = ref(data.value?.seniorityLevel || '');
const selectedDepartment = ref(data.value?.department || '');
const selectedYearlyAmount = ref(data.value?.yearlyAmount || 0);
const selectedHoursPerWeek = ref(data.value?.hoursPerWeek || 0);

async function updateSalary() {
  const salaryValues = {
    role: selectedRole.value,
    seniorityLevel: selectedSeniorityLevel.value,
    department: selectedDepartment.value,
    yearlyAmount: selectedYearlyAmount.value,
    hoursPerWeek: selectedHoursPerWeek.value,

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
