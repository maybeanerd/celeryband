<template>
  <div v-if="loginToken" class="flex flex-col gap-2">
    <h1>Logging in...</h1>
  </div>
  <div v-else class="flex flex-col gap-2">
    <UTextarea v-model="email" placeholder="Email" class="max-w-64" :rows="1" />
    <UButton class="max-w-36" @click="requestToken">
      Request Token
    </UButton>
  </div>
</template>

<script setup lang="ts">

const { loggedIn, fetch: fetchUserSession } = useUserSession();

watch(loggedIn,
  (isLoggedIn) => {
    if (isLoggedIn) {
      const router = useRouter();
      router.push('/');
    }
  },
  { immediate: true },
);

const loading = ref(false);

const route = useRoute();

const loginToken = route.params.token;

const logIn = async () => {
  loading.value = true;

  await useFetch('/api/login', {
    method: 'POST',
    body: {
      token: loginToken,
    },
  });

  await fetchUserSession();

  loading.value = false;
};

const email = ref('celeryBandTestEmail@diluz.io');

const requestToken = async () => {
  await useFetch<{ token: string }>('/api/login', {
    method: 'PUT',
    body: {
      email: email.value,
    },
  });
};

if (loginToken) {
  await logIn();
}
</script>
