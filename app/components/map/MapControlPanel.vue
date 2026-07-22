<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    :enter-from-class="isMobile ? 'opacity-0 translate-y-full' : 'opacity-0 -translate-x-full'"
    :enter-to-class="isMobile ? 'opacity-100 translate-y-0' : 'opacity-100 translate-x-0'"
    leave-active-class="transition duration-200 ease-in"
    :leave-from-class="isMobile ? 'opacity-100 translate-y-0' : 'opacity-100 translate-x-0'"
    :leave-to-class="isMobile ? 'opacity-0 translate-y-full' : 'opacity-0 -translate-x-full'"
  >
    <div
      v-if="showPanel"
      :class="[
        'map-filter-sheet absolute overflow-hidden flex flex-col z-[1000]',
        isMobile 
          ? 'map-filter-sheet-mobile left-0 right-0 bottom-0'
          : 'map-filter-sheet-desktop'
      ]"
    >
      <!-- 標題列 -->
      <div 
        class="map-filter-header relative px-4 py-3 md:px-5 md:py-4 flex items-center justify-between touch-none shrink-0"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <div 
          v-if="isMobile"
          class="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300/60 rounded-full"
        ></div>
        
        <div class="flex items-center gap-3 mt-1 md:mt-0">
          <div class="map-filter-mark w-9 h-9 flex items-center justify-center">
            <Icon name="lucide:map" class="w-[18px] h-[18px] text-white" />
          </div>
          <div>
            <h2 class="font-bold text-gray-800 text-[15px] tracking-tight">{{ $t('map.panel.title') }}</h2>
            <p class="text-[11px] text-gray-400 hidden md:block">{{ $t('map.panel.subtitle') }}</p>
          </div>
        </div>
        <button
          @click="$emit('update:showPanel', false)"
          class="map-filter-close w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
          :title="isMobile ? $t('map.panel.close') : $t('map.panel.hide')"
        >
          <Icon :name="isMobile ? 'lucide:x' : 'lucide:chevron-left'" class="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <!-- 統計 + 操作 -->
      <div class="px-4 pb-3 md:px-5 md:pb-4 shrink-0">
        <div class="flex gap-2 mb-3">
          <div class="map-filter-stat flex-1 px-3 py-2">
            <div class="text-[10px] text-emerald-600/70 font-medium mb-0.5">{{ $t('map.stats.selected') }}</div>
            <div class="text-lg font-bold text-emerald-600 tabular-nums leading-tight">{{ selectedFilters.length }}</div>
          </div>
          <div class="map-filter-stat map-filter-stat-found flex-1 px-3 py-2">
            <div class="text-[10px] text-teal-600/70 font-medium mb-0.5">{{ $t('map.stats.found') }}</div>
            <div class="text-lg font-bold text-teal-600 tabular-nums leading-tight">
              {{ fetchedPoints.length }}
              <span class="text-xs font-normal text-teal-400">{{ $t('map.stats.places') }}</span>
            </div>
          </div>
        </div>
        
        <div v-if="selectedFilters.length > 10" class="map-filter-warning mb-3 px-3 py-2 text-xs flex items-center gap-2">
          <Icon name="lucide:alert-triangle" class="w-3.5 h-3.5 shrink-0 text-amber-500" />
          <span class="font-medium">{{ $t('map.stats.warning') }}</span>
        </div>

        <div class="flex gap-2">
          <button
            @click="selectAll"
            class="map-panel-action map-panel-action-primary flex-1 px-3 py-2 text-xs font-semibold cursor-pointer"
          >
            {{ $t('map.stats.select_all') }}
          </button>
          <button
            @click="clearAll"
            class="map-panel-action map-panel-action-secondary flex-1 px-3 py-2 text-xs font-semibold cursor-pointer"
          >
            {{ $t('map.stats.clear') }}
          </button>
        </div>
      </div>

      <div class="h-px bg-gradient-to-r from-transparent via-gray-200/60 to-transparent mx-4 shrink-0"></div>

      <!-- 篩選列表 -->
      <div 
        :class="[
          'map-filter-list flex-1 overflow-y-auto min-h-0',
          isMobile ? 'p-2.5 grid grid-cols-2 gap-1.5 content-start auto-rows-min' : 'p-3 space-y-0.5'
        ]"
      >
        <!-- ===== 手機版：橫向 Chip ===== -->
        <label
          v-if="isMobile"
          v-for="rule in decorRules"
          :key="rule.id"
          :class="[
            'map-filter-chip decor-chip relative flex items-center gap-2.5 cursor-pointer overflow-hidden rounded-xl transition-all duration-200 active:scale-[0.97]',
            'px-2.5 py-2',
            selectedFilters.includes(rule.id) 
              ? 'is-selected bg-emerald-50 border border-emerald-300/50 shadow-sm'
              : 'bg-white/70 border border-gray-100',
          ]"
        >
          <input type="checkbox" :value="rule.id" v-model="internalSelectedFilters" class="peer sr-only" />

          <!-- 壓印背景 -->
          <div :class="[
            'absolute -right-1 top-1/2 -translate-y-1/2 pointer-events-none select-none transition-opacity duration-300',
            selectedFilters.includes(rule.id) ? 'opacity-[0.18]' : 'opacity-[0.06]'
          ]">
            <Icon v-if="rule.iconName" :name="rule.iconName" class="w-11 h-11" />
          </div>

          <!-- 圖示 -->
          <Icon v-if="rule.iconName" :name="rule.iconName" class="shrink-0 w-7 h-7" />
          <span v-else class="shrink-0 text-xl">{{ rule.icon }}</span>

          <!-- 文字 -->
          <span :class="[
            'relative z-10 text-[12px] leading-tight font-medium line-clamp-1 flex-1',
            selectedFilters.includes(rule.id) ? 'text-emerald-700' : 'text-gray-600'
          ]">
            {{ $t('decor_types.' + rule.id) }}
          </span>

          <!-- 選中指示 -->
          <div :class="[
            'shrink-0 w-[18px] h-[18px] rounded-full flex items-center justify-center transition-all duration-150',
            selectedFilters.includes(rule.id)
              ? 'bg-emerald-500'
              : 'border-[1.5px] border-gray-300/80'
          ]">
            <Icon v-if="selectedFilters.includes(rule.id)" name="lucide:check" class="w-2.5 h-2.5 text-white" />
          </div>
        </label>

        <!-- ===== 桌面版：行列式 ===== -->
        <label
          v-if="!isMobile"
          v-for="rule in decorRules"
          :key="rule.id"
          :class="[
            'map-filter-item decor-item relative flex items-center cursor-pointer transition-all duration-200 overflow-hidden group',
            'gap-3 px-3 py-2.5 rounded-xl',
            selectedFilters.includes(rule.id) 
              ? 'is-selected bg-emerald-50/90 ring-1 ring-emerald-300/60'
              : 'hover:bg-gray-50/80',
          ]"
        >
          <div class="absolute -right-1 top-1/2 -translate-y-1/2 opacity-[0.35] pointer-events-none select-none transition-opacity duration-300 group-hover:opacity-[0.8]">
            <Icon v-if="rule.iconName" :name="rule.iconName" class="w-16 h-16" />
            <span v-else class="text-5xl">{{ rule.icon }}</span>
          </div>

          <input type="checkbox" :value="rule.id" v-model="internalSelectedFilters" class="peer sr-only" />
          
          <div :class="[
            'shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200',
            selectedFilters.includes(rule.id)
              ? 'bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-200/60'
              : 'border-gray-300 group-hover:border-emerald-300'
          ]">
            <Icon v-if="selectedFilters.includes(rule.id)" name="lucide:check" class="w-3 h-3 text-white" />
          </div>

          <span :class="[
            'relative z-10 text-[13px] font-medium flex-1 transition-colors duration-200',
            selectedFilters.includes(rule.id) ? 'text-emerald-800' : 'text-gray-600 group-hover:text-gray-800'
          ]">
            {{ $t('decor_types.' + rule.id) }}
          </span>

          <span 
            v-if="getCountForRule(rule.id)" 
            class="relative z-10 text-[11px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums bg-gray-100 px-1.5 py-0.5 rounded-md"
          >
            {{ getCountForRule(rule.id) }}
          </span>
        </label>
      </div>

      <!-- 載入狀態 -->
      <div v-if="isLoading" class="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center shrink-0">
        <div class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span class="text-sm font-medium">{{ $t('map.loading') }}</span>
        </div>
      </div>

      <div v-if="error" class="p-3 bg-red-50 border-t border-red-100 text-red-600 shrink-0">
        <div class="flex items-start gap-2">
          <Icon name="lucide:alert-circle" class="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <span class="text-xs">{{ error }}</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { DecorRule } from '~/types/map';
import type { POIPoint } from '~/types/map';

const props = defineProps<{
  showPanel: boolean;
  isLoading: boolean;
  error: string | null;
  selectedFilters: string[];
  decorRules: DecorRule[];
  fetchedPoints: POIPoint[];
  isMobile: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:showPanel', value: boolean): void;
  (e: 'update:selectedFilters', value: string[]): void;
}>();

const internalSelectedFilters = computed({
  get: () => props.selectedFilters,
  set: (val) => emit('update:selectedFilters', val)
});

const selectAll = () => emit('update:selectedFilters', props.decorRules.map(r => r.id));
const clearAll = () => emit('update:selectedFilters', []);
const getCountForRule = (ruleId: string) => props.fetchedPoints.filter(p => p.decorType === ruleId).length;

const touchStartY = ref(0);
const touchCurrentY = ref(0);
const isPanelDragging = ref(false);

const handleTouchStart = (e: TouchEvent) => {
  if (!props.isMobile) return;
  const touch = e.touches[0];
  if (!touch) return;
  touchStartY.value = touch.clientY;
  isPanelDragging.value = true;
};
const handleTouchMove = (e: TouchEvent) => {
  if (!isPanelDragging.value) return;
  const touch = e.touches[0];
  if (!touch) return;
  touchCurrentY.value = touch.clientY;
};
const handleTouchEnd = () => {
  if (!isPanelDragging.value) return;
  if (touchCurrentY.value - touchStartY.value > 50 && touchCurrentY.value !== 0) {
    emit('update:showPanel', false);
  }
  isPanelDragging.value = false;
  touchStartY.value = 0;
  touchCurrentY.value = 0;
};
</script>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 185, 47, 0.2) transparent;
}
.overflow-y-auto::-webkit-scrollbar { width: 4px; }
.overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(0, 185, 47, 0.2);
  border-radius: 4px;
}

.decor-chip {
  -webkit-tap-highlight-color: transparent;
}

.map-filter-sheet {
  border: 1px solid rgba(148, 163, 184, 0.26);
  background: rgba(255, 255, 255, 0.94);
  box-shadow:
    0 18px 46px rgba(15, 23, 42, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.map-filter-sheet-desktop {
  top: 0.75rem;
  bottom: 0.75rem;
  left: 0.75rem;
  width: 20.5rem;
  border-radius: 1rem;
}

.map-filter-sheet-mobile {
  max-height: min(64dvh, 35rem);
  padding-bottom: env(safe-area-inset-bottom);
  border-width: 1px 0 0;
  border-radius: 1.15rem 1.15rem 0 0;
}

.map-filter-header {
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.map-filter-mark {
  flex: 0 0 auto;
  border: 1px solid rgba(13, 148, 136, 0.22);
  border-radius: 0.68rem;
  background: rgb(15 118 110);
  color: white;
  box-shadow: 0 6px 14px rgba(15, 118, 110, 0.18);
}

.map-filter-close {
  border-radius: 0.6rem;
  color: rgb(100 116 139);
}

.map-filter-close:hover,
.map-filter-close:focus-visible {
  background: rgb(241 245 249);
  color: rgb(15 118 110);
  outline: none;
}

.map-filter-stat {
  border: 1px solid rgba(20, 184, 166, 0.18);
  border-radius: 0.72rem;
  background: rgb(240 253 250 / 0.74);
}

.map-filter-stat-found {
  border-color: rgba(148, 163, 184, 0.2);
  background: rgb(248 250 252 / 0.86);
}

.map-filter-warning {
  border: 1px solid rgba(245, 158, 11, 0.28);
  border-radius: 0.68rem;
  background: rgb(255 251 235);
  color: rgb(161 98 7);
  line-height: 1.45;
}

.map-panel-action {
  min-height: 2.35rem;
  border-radius: 0.66rem;
  transition:
    color 150ms ease,
    border-color 150ms ease,
    background 150ms ease,
    box-shadow 150ms ease,
    transform 120ms ease;
}

.map-panel-action:focus-visible {
  outline: 2px solid rgba(20, 184, 166, 0.35);
  outline-offset: 2px;
}

.map-panel-action:active {
  transform: scale(0.98);
}

.map-panel-action-primary {
  border: 1px solid rgb(15 118 110);
  background: rgb(15 118 110);
  color: white;
  box-shadow: 0 5px 12px rgba(15, 118, 110, 0.15);
}

.map-panel-action-primary:hover {
  background: rgb(13 148 136);
}

.map-panel-action-secondary {
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgb(248 250 252);
  color: rgb(71 85 105);
}

.map-panel-action-secondary:hover {
  background: rgb(241 245 249);
  color: rgb(15 23 42);
}

.map-filter-list {
  overscroll-behavior: contain;
}

.map-filter-chip,
.map-filter-item {
  min-width: 0;
  -webkit-tap-highlight-color: transparent;
}

.map-filter-chip {
  min-height: 2.8rem;
  border-radius: 0.72rem;
  background: rgba(255, 255, 255, 0.76);
}

.map-filter-chip.is-selected {
  border-color: rgba(20, 184, 166, 0.34);
  background: rgb(240 253 250);
  box-shadow: 0 2px 7px rgba(15, 118, 110, 0.06);
}

.map-filter-chip:hover,
.map-filter-chip:focus-within,
.map-filter-item:hover,
.map-filter-item:focus-within {
  border-color: rgba(20, 184, 166, 0.34);
  outline: none;
}

.map-filter-chip > div:nth-of-type(1) {
  opacity: 0.05 !important;
}

.map-filter-item {
  min-height: 2.55rem;
  border: 1px solid transparent;
  border-radius: 0.66rem;
}

.map-filter-item.is-selected {
  border-color: rgba(20, 184, 166, 0.24);
  box-shadow: none;
}

.map-filter-item > div:first-child {
  opacity: 0.16;
}

@media (max-width: 767px) {
  .map-filter-header {
    padding-top: 1.05rem;
    padding-bottom: 0.72rem;
  }

  .map-filter-list {
    gap: 0.4rem;
    padding: 0.65rem;
  }

  .map-filter-chip {
    min-height: 2.9rem;
    padding: 0.48rem 0.62rem;
  }

  .map-filter-chip > svg {
    width: 1.65rem;
    height: 1.65rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .map-filter-chip,
  .map-filter-item,
  .map-panel-action {
    transition-duration: 0.01ms;
  }
}
</style>
