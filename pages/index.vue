<template>
  <div>
    <h1>Celery Band</h1>
    <p>users: {{ data }}</p>
  </div>
</template>

<script setup lang="ts">
const { data } = await useFetch<Array<{ id: string }>>('/api/users', {
  lazy: true,
});
</script>
