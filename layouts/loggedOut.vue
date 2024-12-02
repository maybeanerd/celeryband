<template>
  <div>
    <div class="flex flex-col min-h-full justify-between">
      <h1>You're logged out. Sign in by requesting a link to your email:</h1>
      <div class="p-4 lg:p-8 w-screen overflow-x-hidden">
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
