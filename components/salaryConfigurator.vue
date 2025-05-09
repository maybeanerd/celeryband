<template>
  <div class="flex flex-col gap-2">
    <div v-if="config">
      <div class="flex gap-4 flex-wrap">
        <div>
          <p>
            Seniority Level:
          </p>
          <USelect v-model="selectedSeniorityLevel" :items="config.seniorityLevels" class="w-48" />
        </div>
        <div>
          <p>
            Role:
          </p>
          <USelect v-model="selectedRole" :items="config.roles" class="w-48" />
        </div>
        <div>
          <p>
            Department:
          </p>
          <USelect v-model="selectedDepartment" :items="config.departments" class="w-48" />
        </div>
        <div class="flex gap-4 flex-wrap">
          <div>
            <p>
              Yearly Amount:
            </p>

            <UInput v-model="selectedYearlyAmount" type="number" class="w-48">
              <template #trailing>
                {{ config.currency }}
              </template>
            </UInput>
          </div>      <div>
            <p>
              Hours Per Week:
            </p>
            <UInput v-model="selectedHoursPerWeek" type="number" class="w-48" />
          </div>
        </div>
      </div>

      <UButton class="max-w-36 mt-6" :loading="loadingSalaryChange" @click="() => updateSalary()">
        Update Salary
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SalarySchema } from '~/server/db/schemas/Salary.schema';
import { useOwnSalary } from '~/composables/api/useOwnSalary';
import { useServerConfiguration } from '~/composables/api/useServerConfiguration';

const { showErrorToast, showSuccessToast } = useToastNotifications();

const { config } = await useServerConfiguration();

const ownSalary = await useOwnSalary();

const selectedRole = ref(ownSalary.value?.role || '');
const selectedSeniorityLevel = ref(ownSalary.value?.seniorityLevel || '');
const selectedDepartment = ref(ownSalary.value?.department || '');
const selectedYearlyAmount = ref(ownSalary.value?.yearlyAmount || 0);
const selectedHoursPerWeek = ref(ownSalary.value?.hoursPerWeek || 0);

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

  navigateTo('/');
}

</script>
