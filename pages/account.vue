<template>
  <div class="flex flex-col gap-2">
    <UButton class="max-w-36" @click="clear">
      Log Out
    </UButton>

    <SalaryConfigurator />
  </div>
</template>

<script setup lang="ts">
const { clear } = useUserSession();

</script>
