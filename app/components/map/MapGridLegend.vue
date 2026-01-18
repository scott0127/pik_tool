<template>
  <div>
    <!-- S2 網格圖例面板（可摺疊）-->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="visible && showGridLegend"
        :class="[
          'absolute bg-white rounded-xl shadow-lg z-[999] border border-gray-200',
          'bottom-3 md:bottom-4 left-3 md:left-4',
          'max-w-[calc(100vw-1.5rem)] md:max-w-xs'
        ]"
      >
        <!-- 標題列（可點擊摺疊）-->
        <div 
          class="flex items-center justify-between p-3 cursor-pointer select-none"
          @click="showGridLegend = false"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-gray-800">{{ isSingleMode ? '🦄 純種模式說明' : '🔲 網格顏色說明' }}</span>
          </div>
          <button class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <!-- 內容區 -->
        <div class="px-3 pb-3 space-y-2">
          <!-- Grid Mode Legend -->
          <template v-if="isGridMode">
              <div class="flex items-center gap-2 text-xs">
              <div class="w-4 h-4 rounded-sm flex-shrink-0" style="background-color: #10B981; opacity: 0.5;"></div>
              <span class="text-gray-700"><span class="font-semibold">綠色</span>：單一飾品類型</span>
              </div>
              <div class="flex items-center gap-2 text-xs">
              <div class="w-4 h-4 rounded-sm flex-shrink-0" style="background-color: #F59E0B; opacity: 0.5;"></div>
              <span class="text-gray-700"><span class="font-semibold">黃色</span>：2-3 種飾品混合</span>
              </div>
              <div class="flex items-center gap-2 text-xs">
              <div class="w-4 h-4 rounded-sm flex-shrink-0" style="background-color: #EF4444; opacity: 0.5;"></div>
              <span class="text-gray-700"><span class="font-semibold">紅色</span>：4+ 種飾品混雜</span>
              </div>
              <div class="flex items-center gap-2 text-xs">
              <div class="w-4 h-4 rounded-sm flex-shrink-0" style="background-color: #9CA3AF; opacity: 0.5;"></div>
              <span class="text-gray-700"><span class="font-semibold">灰色</span>：路邊區域（無標籤）</span>
              </div>
              <div class="pt-2 mt-2 border-t border-gray-200 text-xs text-gray-500">
              點擊網格可查看詳細資訊
              </div>
          </template>

          <!-- Single Mode Legend -->
          <template v-if="isSingleMode">
              <div class="flex items-center gap-2 text-xs">
              <div class="w-4 h-4 rounded-sm flex-shrink-0" style="background-color: #10B981; opacity: 0.5;"></div>
              <span class="text-gray-700"><span class="font-semibold">綠色</span>：單一飾品類型 (純種)</span>
              </div>
              <div class="flex items-center gap-2 text-xs">
              <div class="w-4 h-4 rounded-sm flex-shrink-0 border border-purple-300" style="background-color: #9333ea; opacity: 0.5;"></div>
              <span class="text-gray-700"><span class="font-semibold text-purple-700">紫色</span>：已被回報 (非純種)</span>
              </div>
              
              <div class="pt-2 mt-2 border-t border-gray-200 text-xs text-gray-500 leading-relaxed">
                若發現綠色格子非純種，<br>請點擊格子回報 ⚠️
              </div>
          </template>
        </div>
      </div>
    </Transition>
    
    <!-- 圖例開啟按鈕（當圖例關閉時顯示）-->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-90"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-90"
    >
      <button
        v-if="visible && !showGridLegend"
        @click="showGridLegend = true"
        class="absolute bottom-3 md:bottom-4 right-3 md:right-4 bg-white rounded-xl p-2.5 md:p-3 shadow-lg hover:shadow-xl active:scale-95 transition-all z-[999] border border-gray-200"
        title="顯示說明"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  isGridMode: boolean;
  isSingleMode: boolean;
}>();

const visible = computed(() => props.isGridMode || props.isSingleMode);
const showGridLegend = ref(true);
</script>
