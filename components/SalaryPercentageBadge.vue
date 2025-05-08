<template>
  <UBadge
    :color="!percentage.startsWith('-') ? 'success' : 'warning'"
    variant="soft"
    class="mt-1 self-start"
  >
    You're {{ percentage.startsWith('-') ? percentage.substring(1) : percentage }}% {{ percentage.startsWith('-') ? 'below' : 'above' }} {{ context }}
  </UBadge>
</template>

<script setup lang="ts">
defineProps<{
  percentage: string;
  context: string;
}>();
</script>
