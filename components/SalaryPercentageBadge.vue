<template>
  <UBadge
    :color="getPercentageSign() >= 0 ? 'success' : 'warning'"
    variant="soft"
    class="mt-1 self-start"
  >
    You're {{ getFormattedPercentage() }}% {{ getPercentageSign() >= 0 ? 'above' : 'below' }} {{ context }}
  </UBadge>
</template>

<script setup lang="ts">
const props = defineProps<{
  percentage: string | number;
  context: string;
}>();

function getPercentageSign(): number {
  if (typeof props.percentage === 'string') {
    return parseFloat(props.percentage) >= 0 ? 1 : -1;
  }
  return props.percentage >= 0 ? 1 : -1;
}

function getFormattedPercentage(): string {
  if (typeof props.percentage === 'string') {
    return Math.abs(parseFloat(props.percentage)).toString();
  }
  return Math.abs(props.percentage).toFixed(2);
}
</script>
