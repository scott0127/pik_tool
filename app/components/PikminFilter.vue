<template>
  <div class="pikmin-type-index">
    <button type="button" class="pikmin-filter-btn" :class="{ 'is-selected': selected === null }" :aria-pressed="selected === null" @click="$emit('select', null)">
      <span class="type-all" aria-hidden="true">08</span><span>{{ $t('components.pikmin_filter.all') }}</span>
    </button>
    <button v-for="type in PIKMIN_TYPES" :key="type" type="button" class="pikmin-filter-btn" :class="{ 'is-selected': selected === type }" :aria-pressed="selected === type" @click="$emit('select', type)">
      <span class="type-dot" :class="PIKMIN_TYPE_COLORS[type]" aria-hidden="true" /><span>{{ $t(`pikmin_types.${type}`) }}</span>
    </button>
  </div>
</template>
<script setup lang="ts">
import { PIKMIN_TYPES, PIKMIN_TYPE_COLORS, type PikminType } from '~/types/decor';
defineProps<{ selected: PikminType | null }>();
defineEmits<{ select: [type: PikminType | null] }>();
</script>
<style scoped>
.pikmin-type-index { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .5rem; }
.pikmin-filter-btn { display: flex; align-items: center; justify-content: flex-start; gap: .5rem; min-width: 0; min-height: 48px; padding: .65rem .6rem; border: 1px solid #d6e2d5; border-radius: .6rem; background: #f5f7ed; color: #345848; font-size: .72rem; font-weight: 700; text-align: left; transition: color .18s, background-color .18s; }
.pikmin-filter-btn.is-selected { background: #10b981; color: white; border-color: #10b981; box-shadow: 0 2px 0 #078966; }
.type-dot { width: 14px; height: 14px; flex-shrink: 0; border: 2px solid white; border-radius: 50%; box-shadow: 0 1px 2px #234c4022; }
.type-all { font: 600 .66rem ui-monospace, monospace; width: 14px; flex-shrink: 0; }
.pikmin-filter-btn:focus-visible { outline: 3px solid #10b981; outline-offset: 3px; }
@media (min-width: 640px) { .pikmin-type-index { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (prefers-reduced-motion: reduce) { .pikmin-filter-btn { transition: none; } }
</style>
