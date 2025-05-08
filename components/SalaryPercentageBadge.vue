<template>
  <UBadge
    :color="!percentage.startsWith('-') ? 'success' : 'error'"
    variant="soft"
    class="mt-1 self-start"
  >
    {{ percentage }}% {{ context }}
  </UBadge>
</template>

<script setup lang="ts">
defineProps<{
  percentage: string;
  context: string;
}>();
</script>
