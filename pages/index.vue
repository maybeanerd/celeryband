<template>
  <div class="flex flex-col gap-2">
    <h1>Celery Band</h1>
    <UButton class="max-w-36" @click="clear">
      Log Out
    </UButton>
    <p>
      Logged in as: {{ user }}
    </p>

    <SalaryConfigurator />
  </div>
</template>

<script setup lang="ts">
const { user, clear } = useUserSession();
</script>
