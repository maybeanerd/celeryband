<template>
  <div class="flex flex-col items-center justify-center max-w-md mx-auto py-8">
    <div class="mb-8 text-center">
      <h1 class="text-2xl font-bold mb-1 dark:text-white">
        CeleryBand
      </h1>
      <p v-if="serverInfo" class="text-md text-neutral-400 mb-3">
        for {{ serverInfo.acceptedDomain }}
      </p>
      <p class="text-gray-700 dark:text-gray-300 text-left">
        Welcome to CeleryBand, an open source platform that brings transparency to workplace compensation
        at your organization. Share and compare salaries anonymously within your organization
        to understand your market value and advocate for fair pay.
      </p>
    </div>

    <div v-if="loginToken" class="flex flex-col gap-2 items-center">
      <h2 class="text-xl dark:text-white">
        Login link detected
      </h2>
      <p class="dark:text-gray-300 mb-4">
        Click below to complete your login
      </p>
      <UButton :loading="loadingLogin" @click="completeLogin">
        Complete Login
      </UButton>
    </div>
    <div v-else-if="emailSent" class="flex flex-col gap-2 items-center">
      <h2 class="text-xl dark:text-white">
        Login Email was sent to
      </h2>
      <p class="text-primary">
        {{ email }}
      </p>
      <p class="dark:text-gray-300">
        Please check your inbox.
      </p>
    </div>
    <div v-else class="flex flex-col gap-4 w-full items-center">
      <form class="flex flex-col gap-4 items-center w-full max-w-xs" @submit.prevent="requestToken">
        <UInput v-model="email" type="email" placeholder="Your email address" class="w-full" />
        <UButton type="submit" class="w-full max-w-36" :loading="loading">
          Send Login Email
        </UButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePublicServerInformation } from '~/composables/api/usePublicServerInformation';

definePageMeta({
  layout: 'logged-out',
});

useHead({
  title: 'Login - CeleryBand',
  meta: [
    { name: 'description', content: 'Log in to CeleryBand to access transparent workplace compensation data' },
  ],
});

const { fetch: fetchUserSession } = useUserSession();
const { showErrorToast } = useToastNotifications();
const { serverInfo } = await usePublicServerInformation();

const loading = ref(false);
const email = ref('');
const emailSent = ref(false);

const requestToken = async () => {
  loading.value = true;
  const { error } = await useFetch<{ token: string }>('/api/login', {
    method: 'PUT',
    body: {
      email: email.value,
    },
  });
  loading.value = false;

  if (error.value) {
    showErrorToast('Failed log in.', error.value.statusMessage ?? error.value.message);
    return;
  }
  emailSent.value = true;
};

const route = useRoute();
const loginToken = ref(route.query.token);
const loadingLogin = ref(false);

const completeLogin = async () => {
  if (!loginToken.value) { return; }
  loadingLogin.value = true;

  const { error } = await useFetch('/api/login', {
    method: 'POST',
    body: {
      token: loginToken.value,
    },
  });

  await fetchUserSession();

  loadingLogin.value = false;

  if (error.value) {
    const { push } = useRouter();
    await push({ query: { token: undefined } });
    loginToken.value = null;
  }
};
</script>
