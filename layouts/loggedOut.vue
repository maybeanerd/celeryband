<template>
  <div>
    <div class="flex flex-col min-h-screen justify-between">
      <div class="h-8 mb-4 px-4 pt-4 w-full flex justify-start items-center">
        <div class="flex items-center gap-2">
          <p class="text-xl">
            CeleryBand
          </p>
          <p class="text-md self-end text-neutral-400">
            for {{ config?.acceptedDomain }}
          </p>
        </div>

      </div>
      <div class="w-screen p-4 overflow-x-hidden">
        <h1>You're logged out. Sign in by requesting a link to your email:</h1>
        <div>
          <slot />
        </div>
      </div>
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useServerConfiguration } from '~/composables/api/useServerConfiguration';

const { loggedIn } = useUserSession();
const { config } = await useServerConfiguration();

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
