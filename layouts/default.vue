<template>
  <div>
    <div class="flex flex-col min-h-full justify-between">
      <div v-if="loggedIn" class="p-4 lg:p-8 w-screen overflow-x-hidden">
        <div class="h-8 mb-4 w-full flex justify-between items-center">
          <div class="flex items-center gap-2">
            <ULink to="/" class="flex items-center gap-2">
              <UIcon class="text-xl" name="i-lucide-house" />
              <p class="text-xl">
                CeleryBand
              </p>
            </ULink>
            <p class="text-md self-end text-neutral-400">
              for {{ config?.acceptedDomain }}
            </p>
          </div>
          <ULink to="/account" class="flex items-center">
            <UIcon class="text-xl" name="i-lucide-settings" />
          </ULink>
        </div>
        <slot />
      </div>
      <div v-else class="p-4 lg:p-8 w-screen overflow-x-hidden">
        Validating Login...
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
    if (!isLoggedIn) {
      const router = useRouter();
      router.push('/login');
    }
  },
  { immediate: true },
);
</script>
