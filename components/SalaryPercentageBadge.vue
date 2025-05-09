<template>
  <UBadge
    :color="isPositive ? 'success' : 'warning'"
    variant="soft"
    class="mt-1 self-start"
  >
    You're {{ percentage }}% {{ isPositive ? 'above' : 'below' }} {{ context }}
  </UBadge>
</template>

<script setup lang="ts">
const props = defineProps<{
  percentage: string;
  context: string;
}>();

const isPositive = computed(() => {
  return parseFloat(props.percentage) >= 0;
});
</script>
