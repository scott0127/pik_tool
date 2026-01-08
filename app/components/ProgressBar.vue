<template>
  <div>
    <div class="flex items-center justify-between mb-1" v-if="label">
      <span class="text-sm font-medium text-gray-600">{{ label }}</span>
      <span class="text-sm font-bold text-emerald-600">{{ percentage }}%</span>
    </div>
    <div class="h-2.5 bg-gray-200 rounded-full overflow-hidden">
      <div 
        class="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-700 ease-out rounded-full"
        :style="{ width: `${percentage}%` }"
      ></div>
    </div>
    <p v-if="showCount" class="text-xs text-gray-500 mt-1 text-right">
      {{ collected }} / {{ total }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  label?: string;
  collected: number;
  total: number;
  showCount?: boolean;
}>(), {
  showCount: false
});

const percentage = computed(() => {
  if (props.total === 0) return 0;
  return Math.round((props.collected / props.total) * 100);
});
</script>
