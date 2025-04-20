<template>
  <div class="flex flex-col gap-2">
    <SalaryConfigurator />
    <div class="flex gap-4 p-4 border-2 border-warning-500 rounded-lg">
      <UButton class="max-w-36" @click="clear">
        Log Out
      </UButton>
      <UButton class="max-w-64" color="error">
        Delete Account (TODO)
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const { clear } = useUserSession();

</script>
