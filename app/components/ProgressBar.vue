<template>
  <div class="space-y-1">
    <div class="flex justify-between items-center text-sm">
      <span class="text-gray-600">{{ label }}</span>
      <span class="font-medium">
        <span class="text-primary-600">{{ collected }}</span>
        <span class="text-gray-400">/</span>
        <span class="text-gray-600">{{ total }}</span>
      </span>
    </div>
    <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
      <div 
        class="h-full rounded-full transition-all duration-500 ease-out"
        :class="barColorClass"
        :style="{ width: `${percentage}%` }"
      ></div>
    </div>
    <p class="text-right text-xs text-gray-500">{{ percentage }}%</p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string;
  collected: number;
  total: number;
  colorClass?: string;
}>(), {
  colorClass: 'bg-gradient-to-r from-primary-500 to-leaf-500',
});

const percentage = computed(() => {
  if (props.total === 0) return 0;
  return Math.round((props.collected / props.total) * 100);
});

const barColorClass = computed(() => props.colorClass);
</script>
