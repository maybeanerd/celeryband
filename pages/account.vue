<template>
  <div class="flex flex-col gap-4">
    <!-- Salary Configuration Card -->
    <UCard class="w-full">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-user-cog" class="text-xl" />
          <h2 class="text-xl font-semibold">Your Salary Information</h2>
        </div>
      </template>
      <SalaryConfigurator />
    </UCard>

    <!-- Danger Zone Card -->
    <UCard class="w-full">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-alert-triangle" class="text-xl" />
          <h2 class="text-xl font-semibold">Danger Zone</h2>
        </div>
      </template>
      <div class="flex gap-4 p-4">
        <UButton class="max-w-36" variant="soft" @click="clear">
          Log Out
        </UButton>
        <UButton class="max-w-64" variant="ghost" color="error" @click="deleteAccount">
          Delete Account
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { clear } = useUserSession();

const { showErrorToast } = useToastNotifications();
function deleteAccount () {
  showErrorToast('Failed to delete account.', 'This feature is not implemented yet.');
}
</script>
