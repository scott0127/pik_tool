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
      <div class="glass-surface-readable announcement-panel pointer-events-auto max-w-md w-full rounded-3xl p-4 flex flex-col gap-3">
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
                :class="currentTab === 'update' ? 'bg-emerald-500 text-white shadow-sm' : 'glass-control text-gray-700 hover:text-emerald-700'"
              >
                📢 更新
              </button>
              <button 
                @click="currentTab = 'event'" 
                class="px-2 py-1 text-xs rounded-full transition-colors"
                :class="currentTab === 'event' ? 'bg-green-500 text-white shadow-sm' : 'glass-control text-gray-700 hover:text-emerald-700'"
              >
                🎉 活動
              </button>
            </div>
          </div>
          <button
            @click="isVisible = false"
            class="announcement-close-button shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all"
            aria-label="關閉公告"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- 更新內容 -->
        <div v-show="currentTab === 'update'" class="flex-1">
          <ul class="announcement-copy text-sm leading-relaxed list-disc list-inside space-y-1">
            <li>
              <span class="inline-flex items-center gap-1.5 align-middle">
                4/26 號更新地圖，優化地圖面積邏輯與準確度。
              </span>
            </li>
            <li>3/14 主頁現在會顯示<span class="text-green-600 font-medium">當月全新與復刻的裝飾品</span>皮克敏了!新增<span class="bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 bg-clip-text text-transparent font-bold">彩色粉末皮克敏系列</span></li>
            <li class="flex items-center gap-1 flex-wrap">新增 <span class="ios-badge inline-flex items-center gap-0.5 bg-gray-900 text-white px-1.5 py-[1.5px] rounded-[5px] text-[11px] font-semibold tracking-wide shadow-sm" style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;"><Icon name="lucide:apple" class="w-3 h-3 mb-[0.5px]"/> iOS</span> 專屬「加到主畫面」捷徑按鈕</li>
            <li>
              <div class="flex items-start gap-3"> <!-- items-start 讓文字對齊網格頂部 -->
                
                <!-- 國旗網格容器 -->
                <div class="grid grid-cols-2 gap-1 w-fit">
                  <Icon name="circle-flags:tw" class="text-xl" />
                  <Icon name="circle-flags:us" class="text-xl" />
                  <!-- col-span-2 讓第三個國旗佔滿兩格並置中 -->
                  <Icon name="circle-flags:jp" class="text-xl col-span-2 justify-self-center" />
                </div>
                
                <span class="flex-1">
                  好友功能可以為自己設定出沒區域了！想拿外國/漂亮明信片嗎！快去設定你的區域吧
                </span>
              </div>
            </li>
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
            <div class="announcement-copy text-sm space-y-1">
              <p class="font-medium text-green-600">🚶 走路集點優惠！</p>
              <p class="text-xs">邊玩 Pikmin Bloom 邊用 LINE 散步趣集點</p>
              <p class="text-xs">最高可獲 <span class="font-bold text-orange-500">10,000 點</span></p>
              <p class="text-xs flex items-center gap-1">
                邀請碼：
                <button 
                  @click="copyInviteCode"
                  class="font-mono glass-control px-1.5 py-0.5 rounded active:bg-emerald-200 transition-colors cursor-pointer inline-flex items-center gap-1"
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
        <div class="w-full glass-control rounded-full h-1 overflow-hidden">
          <div class="bg-emerald-500 h-full transition-all duration-[10000ms] ease-linear w-full" :class="{ '!w-0': startProgress }"></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const isVisible = ref(true);
const startProgress = ref(false);
const currentTab = ref<'update' | 'event'>('update'); // 預設先顯示更新
const copied = ref(false);

const INVITE_CODE = 'G79K77XF';
const timers: ReturnType<typeof setTimeout>[] = [];
let copyResetTimer: ReturnType<typeof setTimeout> | null = null;

const schedule = (callback: () => void, delay: number) => {
  const timer = setTimeout(() => {
    const index = timers.indexOf(timer);
    if (index >= 0) timers.splice(index, 1);
    callback();
  }, delay);
  timers.push(timer);
  return timer;
};

const scheduleCopyReset = () => {
  if (copyResetTimer) clearTimeout(copyResetTimer);
  copyResetTimer = setTimeout(() => {
    copied.value = false;
    copyResetTimer = null;
  }, 2000);
};

async function copyInviteCode() {
  try {
    await navigator.clipboard.writeText(INVITE_CODE);
    copied.value = true;
    scheduleCopyReset();
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = INVITE_CODE;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    copied.value = true;
    scheduleCopyReset();
  }
}

onMounted(() => {
  // Start progress bar animation slightly after mount
  schedule(() => {
    startProgress.value = true;
  }, 100);

  // 3秒後自動切換到活動分頁
  schedule(() => {
    if (currentTab.value === 'update') {
      currentTab.value = 'event';
    }
  }, 3000);

  // 10秒後自動隱藏
  schedule(() => {
    isVisible.value = false;
  }, 10000);
});

onBeforeUnmount(() => {
  timers.splice(0).forEach(clearTimeout);
  if (copyResetTimer) {
    clearTimeout(copyResetTimer);
    copyResetTimer = null;
  }
});
</script>

<style scoped>
.announcement-panel :deep(*) {
  -webkit-text-stroke: 0;
  paint-order: normal;
}

.announcement-copy {
  color: rgb(15 23 42 / 0.9);
  text-shadow: none;
}

.announcement-close-button {
  color: rgb(31 41 55);
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(75, 85, 99, 0.28);
  box-shadow:
    0 1px 6px rgba(255, 255, 255, 0.82) inset,
    0 3px 10px rgba(15, 23, 42, 0.12);
}

.announcement-close-button:hover {
  color: rgb(3 7 18);
  background: rgba(255, 255, 255, 0.92);
  border-color: rgba(31, 41, 55, 0.42);
}

.ios-badge,
.ios-badge :deep(*) {
  color: #fff;
  -webkit-text-stroke: 0;
  paint-order: normal;
  text-shadow: none;
}
</style>
