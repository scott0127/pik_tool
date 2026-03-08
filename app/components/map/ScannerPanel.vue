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
      class="fixed bottom-0 left-0 w-full z-[2000] p-4 md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:w-auto md:min-w-[400px]"
    >
      <div 
        class="bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-3xl p-5 overflow-hidden relative"
      >
        <!-- Background decorative elements -->
        <div class="absolute -top-20 -right-20 w-40 h-40 bg-blue-400 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        <div class="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-400 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

        <!-- Header -->
        <div class="flex items-center justify-between mb-4 relative z-10">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <span class="text-sm">📡</span>
            </div>
            <div>
              <h3 class="font-bold text-gray-800 leading-tight">探測器預測</h3>
              <p class="text-[10px] text-gray-500 font-medium">範圍 100m 內的飾品</p>
            </div>
          </div>
          
          <button 
            @click="$emit('close')"
            class="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 hover:text-gray-700 transition-colors active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
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
            <span class="text-4xl filter grayscale opacity-50">🍃</span>
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
                    class="flex flex-col items-center justify-center w-[60px] h-[68px] bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all"
                  >
                    <span class="text-2xl mb-1 drop-shadow-sm">{{ decor.icon }}</span>
                    <span class="text-[10px] text-gray-600 font-medium w-full text-center truncate px-1">{{ decor.name }}</span>
                  </div>
                </TransitionGroup>

                <!-- More indicator -->
                <button 
                  v-if="hasMore && !isExpanded" 
                  @click="isExpanded = true"
                  class="flex flex-col items-center justify-center w-[60px] h-[68px] bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-100 shadow-inner transition-colors active:scale-95"
                >
                  <span class="text-sm font-bold text-gray-400">+{{ overflowCount }}</span>
                </button>

                <button 
                  v-if="hasMore && isExpanded" 
                  @click="isExpanded = false"
                  class="flex flex-col items-center justify-center w-[60px] h-[68px] bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-100 shadow-inner transition-colors active:scale-95"
                >
                  <span class="text-xs font-bold text-gray-400 leading-tight">收合<br>顯示</span>
                </button>
             </div>

             <div class="bg-blue-50 border border-blue-100 rounded-xl p-2.5 flex items-start gap-2">
                <span class="text-blue-500 mt-0.5">ℹ️</span>
                <p class="text-xs text-blue-700 leading-relaxed font-medium">
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
