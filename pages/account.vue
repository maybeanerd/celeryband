<template>
  <div class="flex flex-col gap-4">
    <SalaryConfigurator />
    <div class="flex gap-4 p-4 border-2 border-warning-500 rounded-lg">
      <UButton class="max-w-36" variant="soft" @click="clear">
        Log Out
      </UButton>
      <UButton class="max-w-64" variant="ghost" color="error" @click="deleteAccount">
        Delete Account
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const { clear } = useUserSession();

const { showErrorToast } = useToastNotifications();
function deleteAccount() {
  showErrorToast('Failed to delete account.', 'This feature is not implemented yet.');
}

</script>
