<template>
  <div>
    <div class="flex flex-col min-h-full justify-between">
      <div v-if="loggedIn" class="p-4 lg:p-8 w-screen overflow-x-hidden">
        <slot />
      </div>
      <div v-else class="p-4 lg:p-8 w-screen overflow-x-hidden">
        Validating Login
      </div>
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
const { loggedIn } = useUserSession();

watch(loggedIn,
  (isLoggedIn) => {
    if (!isLoggedIn) {
      const router = useRouter();
      router.push('/login');
    }
  },
  { immediate: true },
);
</script>
