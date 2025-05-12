<template>
  <div class="flex flex-col gap-4">
    <!-- Salary Configuration Card -->
    <UCard class="w-full">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-user-cog" class="text-xl" />
          <h2 class="text-xl font-semibold">
            Your Salary Information
          </h2>
        </div>
      </template>
      <SalaryConfigurator />
    </UCard>

    <!-- Danger Zone Card -->
    <UCard class="w-full">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-alert-triangle" class="text-xl" />
          <h2 class="text-xl font-semibold">
            Danger Zone
          </h2>
        </div>
      </template>
      <div class="flex gap-4">
        <UButton class="max-w-36" variant="soft" @click="clear">
          Log Out
        </UButton>
        <UModal
          v-model:open="deleteAccountModalOpen"
          title="Do you really want to delete your account?"
          description="This will permanently remove all your data. Your datapoints will not be part of the statistics anymore. You will be able to create a new account with the same email."
        >
          <UButton class="max-w-64" variant="ghost" color="error">
            Delete Account
          </UButton>
          <template #body>
            <div class="w-full flex justify-between gap-4">
              <UButton
                class="max-w-64"
                variant="soft"
                color="neutral"
                @click="()=> {deleteAccountModalOpen = false}"
              >
                Keep Account
              </UButton>
              <UButton
                class="max-w-64"
                color="error"
                @click="deleteAccount"
              >
                Permanently Delete Account
              </UButton>
            </div>
          </template>
        </UModal>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Account Settings - CeleryBand',
  meta: [
    { name: 'description', content: 'Manage your salary information and account settings' },
  ],
});

const { clear } = useUserSession();

const deleteAccountModalOpen = ref(false);

const { showErrorToast, showSuccessToast } = useToastNotifications();
async function deleteAccount () {
  const { error } = await useFetch<{}>('/api/account', {
    method: 'delete',
  });

  if (error.value) {
    showErrorToast('Failed to delete account.', error.value.data.statusMessage ?? error.value.data.message);
    return;
  }

  showSuccessToast('Deleted account.', 'Sad to see you go.');
  await clear();
}
</script>
