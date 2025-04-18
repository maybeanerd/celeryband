<template>
  <div class="flex flex-col gap-2 border-primary-500 border-2 rounded-lg p-4">
    <div class="flex gap-4 items-center">
      <h1>Your Current Salary</h1>
      <UButton class="max-w-36" @click="() => refresh()">
        Refresh
      </UButton>
    </div>
    <div v-if="data" class="flex flex-col gap-2 p-4 border-2 border-info-500 rounded-lg">
      <p>role: {{ data.role }}</p>
      <p> seniority level: {{ data.seniorityLevel }}</p>
      <p>department: {{ data.department }}</p>
      <p>yearly amount: {{ data.yearlyAmount }} {{ attributes?.currency }}</p>
      <p>hours per week: {{ data.hoursPerWeek }}</p>
      <p>last updated at: {{ data.updatedAt }}</p>
    </div>
    <p v-else>
      error: {{ error }}
    </p>
    <h1 class="mt-6">
      Adjust your Salary
    </h1>
    <div v-if="attributes" class="flex flex-col gap-2 p-4 border-2 border-white rounded-lg">
      <p>
        Role:
      </p>
      <USelect v-model="selectedRole" :items="attributes.roles" class="w-48" />

      <p>
        Seniority Level:
      </p>
      <USelect v-model="selectedSeniorityLevel" :items="attributes.seniorityLevels" class="w-48" />

      <p>
        Department:
      </p>
      <USelect v-model="selectedDepartment" :items="attributes.departments" class="w-48" />

      <p>
        Yearly Amount:
      </p>
      <div>
        <UInput v-model="selectedYearlyAmount" type="number" class="w-48">
          <template #trailing>
            {{ attributes.currency }}
          </template>
        </UInput>
      </div>
      <p>
        Hours Per Week:
      </p>
      <UInput v-model="selectedHoursPerWeek" type="number" class="w-48" />

      <UButton class="max-w-36" @click="() => updateSalary()">
        Change Salary
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SalarySchema } from '~/server/db/schemas/Salary.schema';
const { data: attributes } = await useFetch<{
  roles: Array<string>;
  seniorityLevels: Array<string>;
  departments: Array<string>;
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
