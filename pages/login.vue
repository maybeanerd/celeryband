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
definePageMeta({
  layout: 'logged-out',
});

const { fetch: fetchUserSession } = useUserSession();

const loading = ref(false);

const email = ref('celeryBandTestEmail@diluz.io');

const requestToken = async () => {
  await useFetch<{ token: string }>('/api/login', {
    method: 'PUT',
    body: {
      email: email.value,
    },
  });
};

const route = useRoute();

const loginToken = ref(route.query.token);

onMounted(async () => {
  if (!loginToken.value) {
    return;
  }

  loading.value = true;

  const { error } = await useFetch('/api/login', {
    method: 'POST',
    body: {
      token: loginToken.value,
    },
  });

  await fetchUserSession();

  if (error.value) {
    const { push } = useRouter();
    await push({ query: { token: undefined } });
    loginToken.value = null;
  }

  loading.value = false;
});

</script>
