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
        'absolute bg-white shadow-2xl overflow-hidden flex flex-col z-[1000] border border-gray-200',
        isMobile 
          ? 'left-0 right-0 bottom-0 max-h-[60vh] rounded-t-3xl' 
          : 'top-4 left-4 bottom-4 w-80 rounded-2xl'
      ]"
    >
      <!-- 標題列 -->
      <div 
        class="relative p-3 md:p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 touch-none"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- 手機拖動指示條 -->
        <div 
          v-if="isMobile"
          class="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-300/50 rounded-full"
        ></div>
        
        <div class="flex items-center gap-2 md:gap-3 mt-1 md:mt-0">
          <span class="text-xl md:text-2xl">🗺️</span>
          <div>
            <h2 class="font-bold text-gray-800 text-sm md:text-base">{{ $t('map.panel.title') }}</h2>
            <p class="text-xs text-gray-500 hidden md:block">{{ $t('map.panel.subtitle') }}</p>
          </div>
        </div>
        <button
          @click="$emit('update:showPanel', false)"
          class="p-2 hover:bg-white/50 rounded-lg transition-colors"
          :title="isMobile ? $t('map.panel.close') : $t('map.panel.hide')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path v-if="isMobile" fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            <path v-else fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- 統計資訊 -->
      <div class="p-3 md:p-4 bg-gray-50 border-b border-gray-200">
        <div class="flex items-center justify-between text-xs md:text-sm mb-2">
          <div>
            <span class="text-gray-600">{{ $t('map.stats.selected') }}</span>
            <span class="font-bold ml-1 text-emerald-600">
              {{ selectedFilters.length }}
            </span>
          </div>
          <div>
            <span class="text-gray-600">{{ $t('map.stats.found') }}</span>
            <span class="font-bold text-teal-600 ml-1">{{ fetchedPoints.length }}</span>
            <span class="text-gray-400">{{ $t('map.stats.places') }}</span>
          </div>
        </div>
        
        <!-- 警告訊息 -->
        <div v-if="selectedFilters.length > 10" class="mb-2 px-2 py-1 rounded bg-orange-50 text-orange-600 text-xs flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          {{ $t('map.stats.warning') }}
        </div>

        <div class="flex gap-2">
          <button
            @click="selectAll"
            class="flex-1 px-3 py-2 bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 text-emerald-700 rounded-lg text-xs font-medium transition-colors"
          >
            {{ $t('map.stats.select_all') }}
          </button>
          <button
            @click="clearAll"
            class="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 rounded-lg text-xs font-medium transition-colors"
          >
            {{ $t('map.stats.clear') }}
          </button>
        </div>
      </div>

      <!-- 篩選列表 -->
      <div 
        :class="[
          'flex-1 overflow-y-auto p-2 md:p-4 bg-white',
          isMobile ? 'grid grid-cols-3 gap-1 content-start' : 'space-y-1'
        ]"
      >
        <label
          v-for="rule in decorRules"
          :key="rule.id"
          :class="[
            'flex items-center cursor-pointer transition-all relative',
            isMobile 
              ? 'flex-col gap-1 p-2 rounded-xl text-center'
              : 'gap-3 p-3 rounded-xl hover:bg-gray-100 group',
            selectedFilters.includes(rule.id) 
              ? 'bg-emerald-50 border border-emerald-200' 
              : isMobile ? 'bg-gray-50' : '',
            ''
          ]"
        >
          <input
            type="checkbox"
            :value="rule.id"
            v-model="internalSelectedFilters"
            :class="[
              'rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0',
              isMobile ? 'w-3 h-3 absolute opacity-0' : 'w-4 h-4'
            ]"
          />
          <span :class="isMobile ? 'text-2xl' : 'text-2xl group-hover:scale-110 transition-transform'">{{ rule.icon }}</span>
          <span :class="isMobile ? 'text-[10px] leading-tight text-gray-600 line-clamp-2' : 'text-sm font-medium text-gray-700 flex-1'">
            {{ $t('decor_types.' + rule.id) }}
          </span>
          <span v-if="!isMobile" class="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
            {{ getCountForRule(rule.id) }}
          </span>
        </label>
      </div>

      <!-- 載入狀態指示器 -->
      <div
        v-if="isLoading"
        class="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center"
      >
        <div class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span class="text-sm font-medium">{{ $t('map.loading') }}</span>
        </div>
      </div>

      <!-- 錯誤訊息 -->
      <div
        v-if="error"
        class="p-3 bg-red-50 border-t border-red-200 text-red-600 text-sm"
      >
        <div class="flex items-start gap-2">
          <span>⚠️</span>
          <span>{{ error }}</span>
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

// computed shim for v-model
const internalSelectedFilters = computed({
  get: () => props.selectedFilters,
  set: (val) => emit('update:selectedFilters', val)
});

const selectAll = () => {
  emit('update:selectedFilters', props.decorRules.map(r => r.id));
};

const clearAll = () => {
  emit('update:selectedFilters', []);
};

const getCountForRule = (ruleId: string) => {
  return props.fetchedPoints.filter(p => p.decorType === ruleId).length;
};

// Mobile drag logic
const touchStartY = ref(0);
const touchCurrentY = ref(0);
const isPanelDragging = ref(false);

const handleTouchStart = (e: TouchEvent) => {
  if (!props.isMobile) return;
  touchStartY.value = e.touches[0].clientY;
  isPanelDragging.value = true;
};

const handleTouchMove = (e: TouchEvent) => {
  if (!isPanelDragging.value) return;
  touchCurrentY.value = e.touches[0].clientY;
};

const handleTouchEnd = () => {
  if (!isPanelDragging.value) return;
  const distance = touchCurrentY.value - touchStartY.value;
  if (distance > 50 && touchCurrentY.value !== 0) {
    emit('update:showPanel', false);
  }
  isPanelDragging.value = false;
  touchStartY.value = 0;
  touchCurrentY.value = 0;
};
</script>

<style scoped>
/* 自訂捲軸樣式 */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(16, 185, 129, 0.3) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(16, 185, 129, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(16, 185, 129, 0.5);
}
</style>
