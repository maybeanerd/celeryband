<template>
  <div class="flex flex-col gap-2 p-4">
    <h1>
      Salary Statistics
    </h1>

    <p> {{ statistics }}</p>
  </div>
</template>

<script setup lang="ts">

const { data: statistics } = await useFetch<unknown>('/api/salary/statistics', {
  lazy: true,
});

</script>
