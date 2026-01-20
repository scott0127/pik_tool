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
      <div class="pointer-events-auto max-w-md w-full bg-white border-l-4 border-amber-500 shadow-xl rounded-r-lg p-4 flex items-start gap-3">
        <div class="shrink-0 text-amber-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="font-bold text-gray-900 text-sm mb-1">【網站營運公告】</h3>
          <p class="text-sm text-gray-600 leading-relaxed mb-2">
            目前我在Rneder的伺服器流量已使用 80% 雖然每個月會重置流量，但本月底可能面臨<span class="text-red-600 font-bold">網路流量額度達到上限而導致網頁服務中斷</span>。
            為求網站永續經營，<br><span class="text-green-600 font-bold">誠徵伺服器資源GCP(Google Cloud Platform)/Render/小額贊助</span>，這部分的款項僅用於維持網站運作。
            如有意願協助，請與我聯繫，謝謝大家！
          </p>
          <div class="w-full bg-gray-100 rounded-full h-1 mt-1 overflow-hidden">
             <div class="bg-amber-500 h-full transition-all duration-[3000ms] ease-linear w-full" :class="{ '!w-0': startProgress }"></div>
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
const isVisible = ref(false); // 暫時關閉公告
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
