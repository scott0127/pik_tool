<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div 
      v-if="isVisible" 
      class="fixed inset-x-0 bottom-0 sm:top-16 sm:bottom-auto sm:right-4 sm:left-auto z-[9999] p-4 flex justify-center sm:justify-end pointer-events-none"
    >
      <div class="pointer-events-auto max-w-md w-full bg-white border-l-4 border-emerald-500 shadow-xl rounded-r-lg p-4 flex items-start gap-3">
        <div class="shrink-0 text-emerald-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="font-bold text-gray-900 text-sm mb-1">📢 最新更新</h3>
          <ul class="text-sm text-gray-600 leading-relaxed mb-2 list-disc list-inside space-y-1">
            <li><span class="text-red-600 font-medium">地圖服務會在流量額度達95%時暫時關閉</span>，其他功能運作正常，<span class="text-green-600 font-medium">如暫停將於 2/1 重新開放。</span></li>
            <li>掃描雷達範圍更接近遊戲內的掃描器範圍</li>
            <li>特殊種類校正：<span class="text-emerald-600 font-medium">麻將、撲克牌、花札(花卡片)</span> 精確更正了!</li>
          </ul>
          <div class="w-full bg-gray-100 rounded-full h-1 mt-1 overflow-hidden">
             <div class="bg-emerald-500 h-full transition-all duration-[3000ms] ease-linear w-full" :class="{ '!w-0': startProgress }"></div>
          </div>
        </div>
        <button @click="isVisible = false" class="shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const isVisible = ref(true); // 暫時關閉公告
const startProgress = ref(false);

onMounted(() => {
  // Start progress bar animation slightly after mount
  setTimeout(() => {
    startProgress.value = true;
  }, 100);

  // Auto hide after 3 seconds (plus a small buffer for animation)
  setTimeout(() => {
    isVisible.value = false;
  }, 3100);
});
</script>
