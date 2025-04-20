<template>
  <div class="flex flex-col gap-2 border-primary-500 border-2 rounded-lg p-4">
    <h1>
      Your Salary
    </h1>
    <div v-if="attributes" class="flex flex-col gap-2">
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

      <UButton class="max-w-36" :loading="loadingSalaryChange" @click="() => updateSalary()">
        Change Salary
      </UButton>
    </div>

    <div>Statistics: {{ statistics }}</div>
  </div>
</template>

<script setup lang="ts">
import type { SalarySchema } from '~/server/db/schemas/Salary.schema';

const toast = useToast();

function showErrorToast(error: string, description: string) {
  toast.add({
    title: error,
    description,
    color: 'error',
  });
}

function showSuccessToast(title: string, description: string) {
  toast.add({
    title,
    description,
    color: 'success',
  });
}

const { data: attributes } = await useFetch<{
  roles: Array<string>;
  seniorityLevels: Array<string>;
  departments: Array<string>;
  currency: string;
}>('/api/salary/attributes', {
  lazy: true,
});

const { data } = await useFetch<SalarySchema>('/api/salary', {
  lazy: false,
});

const selectedRole = ref(data.value?.role || '');
const selectedSeniorityLevel = ref(data.value?.seniorityLevel || '');
const selectedDepartment = ref(data.value?.department || '');
const selectedYearlyAmount = ref(data.value?.yearlyAmount || 0);
const selectedHoursPerWeek = ref(data.value?.hoursPerWeek || 0);

const loadingSalaryChange = ref(false);

async function updateSalary() {
  loadingSalaryChange.value = true;

  const salaryValues = {
    role: selectedRole.value,
    seniorityLevel: selectedSeniorityLevel.value,
    department: selectedDepartment.value,
    yearlyAmount: selectedYearlyAmount.value,
    hoursPerWeek: selectedHoursPerWeek.value,

  };

  const { error } = await useFetch<SalarySchema>('/api/salary', {
    method: 'PUT',
    body: salaryValues,
  });
  loadingSalaryChange.value = false;

  if (error.value) {
    showErrorToast('Error while updating salary', JSON.stringify(error.value.data?.data?.fieldErrors));
    return;
  }
  showSuccessToast('Salary updated',
    'Your salary has been updated successfully.');

  await refreshStatistics();
}

const { data: statistics, refresh: refreshStatistics } = await useFetch<unknown>('/api/salary/statistics', {
  lazy: true,
});

</script>
