<template>
  <Transition
    enter-active-class="transition duration-300 ease-out transform"
    enter-from-class="translate-y-full opacity-0 scale-95"
    enter-to-class="translate-y-0 opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in transform"
    leave-from-class="translate-y-0 opacity-100 scale-100"
    leave-to-class="translate-y-full opacity-0 scale-95"
  >
    <div
      v-if="show"
      class="scanner-panel-wrap fixed left-0 w-full z-[2000] p-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:min-w-[400px]"
    >
      <div 
        class="scanner-panel-card p-5 overflow-hidden relative"
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-4 relative z-10">
          <div class="flex items-center gap-2">
            <div class="scanner-panel-mark w-8 h-8 flex items-center justify-center">
              <Icon name="lucide:radar" class="w-4 h-4" />
            </div>
            <div>
              <h3 class="font-bold text-gray-800 leading-tight">探測器預測</h3>
              <p class="text-[10px] text-gray-500 font-medium">範圍 100m 內的飾品</p>
            </div>
          </div>
          
          <button 
            @click="$emit('close')"
            class="scanner-panel-close w-8 h-8 flex items-center justify-center transition-colors active:scale-95"
          >
            <Icon name="lucide:x" class="h-4 w-4" />
          </button>
        </div>

        <!-- Content Area -->
        <div class="relative z-10 flex-1">
          <!-- Loading State -->
          <div v-if="isCalculating" class="flex flex-col items-center justify-center py-6 gap-3">
            <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <p class="text-sm text-gray-500 font-medium animate-pulse">正在掃描周遭環境...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="predictedDecors.length === 0" class="flex flex-col items-center justify-center py-6 gap-2 opacity-80">
            <Icon name="lucide:leaf" class="w-10 h-10 text-gray-300" />
            <p class="text-sm text-gray-500 font-medium">附近好像什麼都沒有...</p>
            <p class="text-xs text-gray-400">試著移動掃描器到其他地方</p>
          </div>

          <!-- Results State (Shows up to 6 icons) -->
          <div v-else class="flex flex-col">
             <div class="flex flex-wrap gap-2 justify-center mb-3">
               <TransitionGroup
                  enter-active-class="transition duration-500 ease-out"
                  enter-from-class="opacity-0 scale-50"
                  enter-to-class="opacity-100 scale-100"
                  leave-active-class="transition duration-300 ease-in absolute"
                  leave-from-class="opacity-100 scale-100"
                  leave-to-class="opacity-0 scale-50"
                  move-class="transition duration-500 ease-in-out"
                >
                  <div 
                    v-for="decor in displayedDecors" 
                    :key="decor.id"
                    class="scanner-result-tile flex flex-col items-center justify-center w-[60px] h-[68px] transition-all"
                  >
                    <Icon v-if="decor.iconName" :name="decor.iconName" class="w-7 h-7 mb-1 drop-shadow-sm" />
                    <span v-else class="text-2xl mb-1 drop-shadow-sm">{{ decor.icon }}</span>
                    <span class="text-[10px] text-gray-600 font-medium w-full text-center truncate px-1">{{ decor.name }}</span>
                  </div>
                </TransitionGroup>

                <!-- More indicator -->
                <button 
                  v-if="hasMore && !isExpanded" 
                  @click="isExpanded = true"
                  class="scanner-result-tile flex flex-col items-center justify-center w-[60px] h-[68px] transition-colors active:scale-95"
                >
                  <span class="text-sm font-bold text-gray-400">+{{ overflowCount }}</span>
                </button>

                <button 
                  v-if="hasMore && isExpanded" 
                  @click="isExpanded = false"
                  class="scanner-result-tile flex flex-col items-center justify-center w-[60px] h-[68px] transition-colors active:scale-95"
                >
                  <span class="text-xs font-bold text-gray-400 leading-tight">收合<br>顯示</span>
                </button>
             </div>

             <div class="scanner-info-note p-2.5 flex items-start gap-2">
                <Icon name="lucide:info" class="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                <p class="text-xs text-teal-800 leading-relaxed font-medium">
                  真實遊戲通常只會顯示最多 6 種圖示。使用雷達必定會出現在清單中顯示的其中一種飾品。
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { DecorRule } from '~/types/map';

const props = defineProps<{
  show: boolean;
  predictedDecors: DecorRule[];
  isCalculating: boolean;
}>();

defineEmits(['close']);

const MAX_DISPLAY = 6;
const isExpanded = ref(false);

// Auto collapse when data changes significantly
watch(() => props.predictedDecors, () => {
    isExpanded.value = false;
});

// Get items based on expanded state
const displayedDecors = computed(() => {
  return isExpanded.value ? props.predictedDecors : props.predictedDecors.slice(0, MAX_DISPLAY);
});

const hasMore = computed(() => props.predictedDecors.length > MAX_DISPLAY);
const overflowCount = computed(() => props.predictedDecors.length - MAX_DISPLAY);

</script>

<style scoped>
.scanner-panel-wrap {
  bottom: 0;
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}

.scanner-panel-card {
  border: 1px solid rgba(148, 163, 184, 0.26);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.95);
  box-shadow:
    0 18px 44px rgba(15, 23, 42, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.scanner-panel-mark {
  border: 1px solid rgba(13, 148, 136, 0.2);
  border-radius: 0.62rem;
  background: rgb(240 253 250);
  color: rgb(15 118 110);
}

.scanner-panel-close {
  border-radius: 0.58rem;
  background: rgb(248 250 252);
  color: rgb(100 116 139);
}

.scanner-panel-close:hover,
.scanner-panel-close:focus-visible {
  background: rgb(241 245 249);
  color: rgb(15 118 110);
  outline: none;
}

.scanner-result-tile {
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 0.72rem;
  background: rgb(255 255 255);
  box-shadow: 0 3px 9px rgba(15, 23, 42, 0.045);
}

.scanner-result-tile:hover,
.scanner-result-tile:focus-visible {
  border-color: rgba(20, 184, 166, 0.34);
  background: rgb(240 253 250);
  box-shadow: 0 7px 16px rgba(15, 118, 110, 0.08);
  outline: none;
}

.scanner-info-note {
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 0.68rem;
  background: rgb(240 253 250 / 0.72);
}

@media (min-width: 768px) {
  .scanner-panel-wrap {
    bottom: 1rem;
  }
}

@media (max-width: 767px) {
  .scanner-panel-wrap {
    padding-inline: 0.7rem;
  }

  .scanner-panel-card {
    padding: 0.9rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .scanner-result-tile {
    transition-duration: 0.01ms;
  }
}
</style>
