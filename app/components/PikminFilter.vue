<template>
  <div class="flex flex-wrap gap-2">
    <!-- All Types -->
    <button
      @click="$emit('select', null)"
      class="pikmin-filter-btn"
      :class="[selected === null ? 'ring-2 ring-gray-400' : '']"
    >
      <span class="w-6 h-6 rounded-full bg-gradient-to-br from-red-400 via-blue-400 to-purple-400"></span>
      <span class="text-xs">全部</span>
    </button>

    <!-- Individual Pikmin Types -->
    <button
      v-for="type in PIKMIN_TYPES"
      :key="type"
      @click="$emit('select', type)"
      class="pikmin-filter-btn"
      :class="[selected === type ? `ring-2 ${getRingColor(type)}` : '']"
    >
      <span 
        class="w-6 h-6 rounded-full"
        :class="PIKMIN_TYPE_COLORS[type]"
      ></span>
      <span class="text-xs">{{ PIKMIN_TYPE_NAMES[type] }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { PIKMIN_TYPES, PIKMIN_TYPE_NAMES, PIKMIN_TYPE_COLORS, type PikminType } from '~/types/decor';

defineProps<{
  selected: PikminType | null;
}>();

defineEmits<{
  select: [type: PikminType | null];
}>();

const getRingColor = (type: PikminType): string => {
  const colors: Record<PikminType, string> = {
    red: 'ring-pikmin-red',
    yellow: 'ring-pikmin-yellow',
    blue: 'ring-pikmin-blue',
    purple: 'ring-pikmin-purple',
    white: 'ring-gray-400',
    rock: 'ring-pikmin-rock',
    winged: 'ring-pikmin-winged',
  };
  return colors[type];
};
</script>

<style scoped>
.pikmin-filter-btn {
  @apply flex flex-col items-center gap-1 p-2 rounded-lg bg-white/70 hover:bg-white transition-all duration-200 cursor-pointer min-w-[50px];
}
</style>
