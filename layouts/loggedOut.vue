<template>
  <div>
    <div class="flex flex-col min-h-screen">
      <div class="w-screen p-4 overflow-x-hidden flex-grow flex items-center justify-center">
        <slot />
      </div>
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
const { loggedIn } = useUserSession();

watch(loggedIn,
  (isLoggedIn) => {
    if (isLoggedIn) {
      const router = useRouter();
      router.push('/');
    }
  },
  { immediate: true },
);
</script>
