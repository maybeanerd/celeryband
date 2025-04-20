<template>
  <div class="flex flex-col gap-2 border-primary-500 border-2 rounded-lg p-4">
    <h1>
      Your Salary
    </h1>
    <div v-if="config" class="flex flex-col gap-2">
      <p>
        Role:
      </p>
      <USelect v-model="selectedRole" :items="config.roles" class="w-48" />

      <p>
        Seniority Level:
      </p>
      <USelect v-model="selectedSeniorityLevel" :items="config.seniorityLevels" class="w-48" />

      <p>
        Department:
      </p>
      <USelect v-model="selectedDepartment" :items="config.departments" class="w-48" />

      <p>
        Yearly Amount:
      </p>
      <div>
        <UInput v-model="selectedYearlyAmount" type="number" class="w-48">
          <template #trailing>
            {{ config.currency }}
          </template>
        </UInput>
      </div>
      <p>
        Hours Per Week:
      </p>
      <UInput v-model="selectedHoursPerWeek" type="number" class="w-48" />

      <UButton class="max-w-36" :loading="loadingSalaryChange" @click="() => updateSalary()">
        Update Salary
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SalarySchema } from '~/server/db/schemas/Salary.schema';
import { useServerConfiguration } from '~/composables/api/useServerConfiguration';

const { showErrorToast, showSuccessToast } = useToastNotifications();

const { config } = await useServerConfiguration();

const { data } = await useFetch<SalarySchema>('/api/salary', {
  lazy: false,
});

const selectedRole = ref(data.value?.role || '');
const selectedSeniorityLevel = ref(data.value?.seniorityLevel || '');
const selectedDepartment = ref(data.value?.department || '');
const selectedYearlyAmount = ref(data.value?.yearlyAmount || 0);
const selectedHoursPerWeek = ref(data.value?.hoursPerWeek || 0);

const loadingSalaryChange = ref(false);

async function updateSalary () {
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
}

</script>
