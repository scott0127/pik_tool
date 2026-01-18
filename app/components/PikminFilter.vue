<template>
  <div class="flex flex-wrap gap-2">
    <!-- All Types -->
    <button
      @click="$emit('select', null)"
      class="pikmin-filter-btn"
      :class="[selected === null ? 'ring-2 ring-emerald-400 ring-offset-2' : '']"
    >
      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 via-blue-400 to-purple-400 shadow-md"></div>
      <span class="text-xs font-semibold">{{ $t('components.pikmin_filter.all') }}</span>
    </button>

    <!-- Individual Pikmin Types -->
    <button
      v-for="type in PIKMIN_TYPES"
      :key="type"
      @click="$emit('select', type)"
      class="pikmin-filter-btn"
      :class="[selected === type ? `ring-2 ring-offset-2 ${getRingColor(type)}` : '']"
    >
      <div 
        class="w-8 h-8 rounded-full shadow-md transition-transform group-hover:scale-110"
        :class="PIKMIN_TYPE_COLORS[type]"
      ></div>
      <span class="text-xs font-semibold">{{ $t(`pikmin_types.${type}`) }}</span>
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
    red: 'ring-red-400',
    yellow: 'ring-yellow-400',
    blue: 'ring-blue-400',
    purple: 'ring-purple-400',
    white: 'ring-gray-400',
    rock: 'ring-gray-500',
    winged: 'ring-pink-400',
    ice: 'ring-cyan-400',
  };
  return colors[type] || 'ring-emerald-400';
};
</script>

<style scoped>
.pikmin-filter-btn {
  @apply flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white/80 hover:bg-white transition-all duration-200 cursor-pointer min-w-[56px] border-2 border-transparent hover:border-gray-200;
}
</style>
