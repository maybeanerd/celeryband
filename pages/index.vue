<template>
  <div class="flex flex-col gap-2">
    <h1>Celery Band</h1>
    <div v-if="loggedIn">
      <UButton class="max-w-36" :loading="loading" @click="clear">
        Log Out
      </UButton>
      <p>
        Logged in as: {{ user }}
      </p>
      <p>
        Session data: {{ session }}
      </p>
    </div>
    <UButton v-else class="max-w-36" :loading="loading" @click="logIn">
      Log In
    </UButton>

    <UButton class="max-w-36" @click="refresh">
      Refresh
    </UButton>

    <p v-if="data">
      users: {{ data }}
    </p>
    <p v-else>
      error: {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/server/db/schemas/User.schema';

const { loggedIn, user, session, fetch: fetchUserSession, clear } = useUserSession();

const { data, error, refresh } = await useFetch<Array<User>>('/api/users', {
  lazy: true,
});

const loading = ref(false);

const logIn = async () => {
  loading.value = true;
  await fetch('/api/login', {
    method: 'POST',
  });

  await refresh();
  await fetchUserSession();

  loading.value = false;
};

</script>
