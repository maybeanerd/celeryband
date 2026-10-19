<template>
  <div class="flex flex-col gap-2">
    <div v-if="config">
      <div class="flex gap-4 flex-wrap">
        <div>
          <p>
            Department:
          </p>
          <USelect
            v-model="selectedDepartment"
            :items="config.departments.map(d => ({ label: d.label, value: d.name }))"
            class="w-48"
            @update:model-value="onDepartmentChange"
          />
        </div>
        <div>
          <p>
            Role:
          </p>
          <USelect
            v-model="selectedRole"
            :items="availableRoles"
            option-label="label"
            option-value="id"
            class="w-48"
            :disabled="!selectedDepartment"
            @update:model-value="onRoleChange"
          />
        </div>
        <div>
          <p>
            Seniority Level:
          </p>
          <USelect
            v-model="selectedSeniorityLevel"
            :items="availableSeniorityLevels"
            class="w-48"
            :disabled="!selectedRole"
          />
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
          </div>
          <div>
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
import { isZodErrorResponse } from '~/utils/zodErrorHandling';

const { showErrorToast, showZodErrorToast, showSuccessToast } = useToastNotifications();

const { config } = await useServerConfiguration();

const ownSalary = await useOwnSalary();

const selectedDepartment = ref(ownSalary.value?.department || '');
const selectedRole = ref(ownSalary.value?.role || '');
const selectedSeniorityLevel = ref(ownSalary.value?.seniorityLevel || '');
const selectedYearlyAmount = ref(ownSalary.value?.yearlyAmount || 0);
const selectedHoursPerWeek = ref(ownSalary.value?.hoursPerWeek || 0);

const loadingSalaryChange = ref(false);

// --- Dependent dropdown logic ---

function getAvailableRoles (department: string): {
  id: string;
  label: string;
}[] {
  const dept = config.value?.departments?.find(d => d.name === department);
  return dept?.roles ?? [];
}

function getAvailableSeniorityLevels (department: string, role: string): string[] {
  const dept = config.value?.departments?.find(d => d.name === department);
  return dept?.roleSeniorityLevels?.[role] ?? [];
}

const availableRoles = computed(() => getAvailableRoles(selectedDepartment.value));

const availableSeniorityLevels = computed(() =>
  selectedDepartment.value && selectedRole.value
    ? getAvailableSeniorityLevels(selectedDepartment.value, selectedRole.value)
    : [],
);

function onDepartmentChange () {
  // Reset dependent fields when department changes
  selectedRole.value = '';
  selectedSeniorityLevel.value = '';
}

function onRoleChange () {
  // Reset seniority level when role changes
  selectedSeniorityLevel.value = '';
}

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
    if (isZodErrorResponse(error.value)) {
      showZodErrorToast('Error while updating salary', error.value);
    } else {
      showErrorToast('Error while updating salary', error.value.data?.message ?? 'An unexpected error occurred.');
    }
    return;
  }
  showSuccessToast('Salary updated',
    'Your salary has been updated successfully.');

  navigateTo('/');
}

</script>
