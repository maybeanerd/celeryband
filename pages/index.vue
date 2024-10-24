<template>
  <div>
    <h1>Celery Band</h1>
    <br>
    <UButton :loading="loading" @click="addUser">
      Add user
    </UButton>
    <br>
    <br>
    <p>users: {{ data }}</p>
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/server/db/schemas/User.schema';

const { data, refresh } = await useFetch<Array<User>>('/api/users', {
  lazy: true,
});

const loading = ref(false);

const addUser = async () => {
  loading.value = true;
  await fetch('/api/users', {
    method: 'POST',
  });

  await refresh();

  loading.value = false;
};
</script>
