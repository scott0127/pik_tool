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
          <ul class="announcement-copy announcement-list text-sm leading-relaxed">
            <li class="announcement-update-item announcement-update-item-feature">
              <span class="announcement-update-date">6/11</span>
              <span class="announcement-update-icon announcement-update-icon-emerald">
                <Icon name="lucide:sprout" class="h-3.5 w-3.5" />
              </span>
              <span class="announcement-update-copy">
                <span class="announcement-update-kicker">全新功能</span>
                <span class="announcement-update-highlight">放生皮克敏的回憶</span>
              </span>
            </li>
            <li class="announcement-update-item">
              <span class="announcement-update-date">iOS</span>
              <span class="announcement-update-icon announcement-update-icon-dark">
                <svg
                  class="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83ZM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z" />
                </svg>
              </span>
              <span class="announcement-update-copy">
                <span class="announcement-update-kicker">新增捷徑</span>
                <span>專屬「加到主畫面」按鈕</span>
              </span>
            </li>
            <li class="announcement-update-item">
              <span class="announcement-update-date">好友</span>
              <span class="announcement-update-icon announcement-update-flags">
                <Icon name="circle-flags:tw" class="h-3.5 w-3.5" />
                <Icon name="circle-flags:us" class="h-3.5 w-3.5" />
                <Icon name="circle-flags:jp" class="h-3.5 w-3.5" />
              </span>
              <span class="announcement-update-copy">
                <span class="announcement-update-kicker">區域設定</span>
                <span>設定出沒區域，尋找外國/漂亮明信片</span>
              </span>
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
  paint-order: normal;
}

.announcement-copy {
  color: rgb(15 23 42 / 0.9);
  text-shadow: none;
}

.announcement-list {
  display: grid;
  gap: 0.45rem;
}

.announcement-update-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  padding: 0.42rem 0.55rem;
  overflow: hidden;
  list-style: none;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 0.9rem;
  background:
    radial-gradient(circle at 16% 0%, rgba(255, 255, 255, 0.92), transparent 42%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.66), rgba(241, 245, 249, 0.42));
  box-shadow:
    0 8px 18px rgba(15, 23, 42, 0.05),
    0 1px 8px rgba(255, 255, 255, 0.72) inset;
}

.announcement-update-item-feature {
  border-color: rgba(16, 185, 129, 0.24);
  background:
    radial-gradient(circle at 16% 0%, rgba(255, 255, 255, 0.96), transparent 42%),
    linear-gradient(135deg, rgba(236, 253, 245, 0.92), rgba(255, 255, 255, 0.62));
}

.announcement-update-item-feature::after {
  position: absolute;
  inset: 0;
  content: "";
  background: linear-gradient(110deg, transparent 0%, rgba(255, 255, 255, 0.78) 44%, transparent 58%);
  opacity: 0.42;
  transform: translateX(-115%);
  animation: announcement-feature-sheen 3.6s ease-in-out infinite;
  pointer-events: none;
}

.announcement-update-date {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  min-width: 2.35rem;
  padding: 0.18rem 0.42rem;
  color: white;
  font-size: 0.68rem;
  font-weight: 900;
  line-height: 1;
  text-align: center;
  border-radius: 999px;
  background: linear-gradient(135deg, #00b92f, #008523);
  box-shadow: 0 6px 14px rgba(0, 133, 35, 0.2);
}

.announcement-update-icon {
  position: relative;
  z-index: 1;
  display: inline-flex;
  width: 1.65rem;
  height: 1.65rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  color: rgb(5, 150, 105);
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 0.65rem;
  background: rgba(255, 255, 255, 0.58);
  box-shadow: 0 1px 6px rgba(255, 255, 255, 0.68) inset;
}

.announcement-update-icon-emerald {
  color: rgb(5, 150, 105);
  background: rgba(209, 250, 229, 0.64);
}

.announcement-update-icon-dark {
  color: white;
  background: rgb(17, 24, 39);
}

.announcement-update-flags {
  width: auto;
  min-width: 2.55rem;
  gap: 0.08rem;
  padding-inline: 0.2rem;
}

.announcement-update-copy {
  position: relative;
  z-index: 1;
  display: inline-flex;
  flex-wrap: wrap;
  min-width: 0;
  align-items: center;
  gap: 0.24rem 0.38rem;
  color: rgb(15, 23, 42);
  font-size: 0.78rem;
  font-weight: 850;
  line-height: 1.35;
}

.announcement-update-kicker {
  color: rgb(4, 120, 87);
  font-weight: 950;
}

.announcement-update-highlight {
  overflow: hidden;
  color: transparent;
  font-weight: 950;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: linear-gradient(90deg, #047857, #00b92f, #0ea5e9);
  -webkit-background-clip: text;
  background-clip: text;
}

@keyframes announcement-feature-sheen {
  0%, 42% {
    transform: translateX(-115%);
  }
  72%, 100% {
    transform: translateX(115%);
  }
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
  paint-order: normal;
  text-shadow: none;
}
</style>
