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
      <div class="pointer-events-auto max-w-md w-full bg-white border-l-4 border-emerald-500 shadow-xl rounded-r-lg p-4 flex flex-col gap-3">
        <!-- 頂部標題與關閉按鈕 -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="shrink-0 text-emerald-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <!-- 分頁切換 -->
            <div class="flex gap-1">
              <button 
                @click="currentTab = 'update'" 
                class="px-2 py-1 text-xs rounded-full transition-colors"
                :class="currentTab === 'update' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              >
                📢 更新
              </button>
              <button 
                @click="currentTab = 'event'" 
                class="px-2 py-1 text-xs rounded-full transition-colors"
                :class="currentTab === 'event' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              >
                🎉 活動
              </button>
            </div>
          </div>
          <button @click="isVisible = false" class="shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- 更新內容 -->
        <div v-show="currentTab === 'update'" class="flex-1">
          <ul class="text-sm text-gray-600 leading-relaxed list-disc list-inside space-y-1">
            <li><span class="text-red-600 font-medium">農曆新年裝飾品盆栽打彩色蘑菇有機會掉落</span></li>
            <li>2/5 新增 2026 巧克力特殊類別</li>
            <li>新增稀有廚師冰皮、鍬形蟲冰皮、橡栗冰皮</li>
            <li><span class="text-indigo-600 font-medium">點擊咖啡按鈕可小額贊助鼓勵開發 ☕</span></li>
          </ul>
        </div>

        <!-- LINE 散步趣活動 -->
        <div v-show="currentTab === 'event'" class="flex-1">
          <div class="flex gap-3 items-center">
            <!-- QR Code -->
            <img 
              src="/260108172000.png" 
              alt="LINE 散步趣 QR Code" 
              class="w-20 h-20 rounded-lg border border-gray-200 shrink-0"
            />
            <!-- 活動說明 -->
            <div class="text-sm text-gray-600 space-y-1">
              <p class="font-medium text-green-600">🚶 走路集點優惠！</p>
              <p class="text-xs">邊玩 Pikmin Bloom 邊用 LINE 散步趣集點</p>
              <p class="text-xs">最高可獲 <span class="font-bold text-orange-500">10,000 點</span></p>
              <p class="text-xs flex items-center gap-1">
                邀請碼：
                <button 
                  @click="copyInviteCode"
                  class="font-mono bg-gray-100 px-1.5 py-0.5 rounded hover:bg-emerald-100 active:bg-emerald-200 transition-colors cursor-pointer inline-flex items-center gap-1"
                  :title="copied ? '已複製！' : '點擊複製'"
                >
                  G79K77XF
                  <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </p>
            </div>
          </div>
        </div>

        <!-- 進度條 -->
        <div class="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
          <div class="bg-emerald-500 h-full transition-all duration-[8000ms] ease-linear w-full" :class="{ '!w-0': startProgress }"></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const isVisible = ref(true);
const startProgress = ref(false);
const currentTab = ref<'update' | 'event'>('event'); // 預設顯示活動頁
const copied = ref(false);

const INVITE_CODE = 'G79K77XF';

async function copyInviteCode() {
  try {
    await navigator.clipboard.writeText(INVITE_CODE);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = INVITE_CODE;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
}

onMounted(() => {
  // Start progress bar animation slightly after mount
  setTimeout(() => {
    startProgress.value = true;
  }, 100);

  // Auto hide after 8 seconds (給用戶更多時間看活動)
  setTimeout(() => {
    isVisible.value = false;
  }, 28100);
});
</script>
