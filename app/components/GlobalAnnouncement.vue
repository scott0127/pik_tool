<template>
  <Transition
    appear
    :css="false"
    @before-enter="beforeEnter"
    @enter="enter"
    @leave="leave"
    @enter-cancelled="stopPanelMotion"
    @leave-cancelled="stopPanelMotion"
    @after-leave="cleanupMotion"
  >
    <div 
      v-if="isVisible" 
      class="fixed inset-x-0 bottom-0 sm:top-16 sm:bottom-auto sm:right-4 sm:left-auto z-[9999] p-4 flex justify-center sm:justify-end pointer-events-none"
    >
      <div class="announcement-panel scrollbar-hide pointer-events-auto max-w-md w-full rounded-3xl p-4 flex flex-col gap-3">
        <div class="announcement-backdrop glass-surface-readable" aria-hidden="true">
          <div class="announcement-ambient"></div>
          <div class="announcement-rim-glint"></div>
        </div>
        <!-- 頂部標題與關閉按鈕 -->
        <div class="announcement-header flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="shrink-0 text-emerald-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <!-- 分頁切換 -->
            <div class="announcement-tabs">
              <span ref="tabIndicator" class="announcement-tab-indicator" aria-hidden="true"></span>
              <button 
                @click="selectTab('update')"
                :aria-pressed="selectedTab === 'update'"
                class="px-2 py-1 text-xs rounded-full transition-colors"
                :class="selectedTab === 'update' ? 'text-white' : 'text-gray-700 hover:text-emerald-700'"
              >
                📢 更新
              </button>
              <button 
                @click="selectTab('event')"
                :aria-pressed="selectedTab === 'event'"
                class="px-2 py-1 text-xs rounded-full transition-colors"
                :class="selectedTab === 'event' ? 'text-white' : 'text-gray-700 hover:text-emerald-700'"
              >
                🎉 活動
              </button>
            </div>
          </div>
          <button
            @click="dismiss"
            class="announcement-close-button shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all"
            aria-label="關閉公告"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <div class="announcement-content-stage">
        <!-- 更新內容 -->
        <div ref="updateContent" class="announcement-page" :class="{ 'is-current': currentTab === 'update' }"
          :aria-hidden="currentTab !== 'update'" :inert="currentTab !== 'update'">
          <ul class="announcement-copy announcement-list text-sm leading-relaxed">
            <li class="announcement-update-item announcement-update-item-feature">
              <span class="announcement-update-date">10/7</span>
              <span class="announcement-update-icon announcement-update-icon-emerald">
                <Icon name="lucide:sparkles" class="h-3.5 w-3.5" />
              </span>
              <span class="announcement-update-copy">
                <span class="announcement-update-kicker">圖鑑更新</span>
                <span class="announcement-update-highlight">萬聖節彩繪玻璃 8 款上線</span>
              </span>
            </li>
            <li class="announcement-update-item announcement-update-item-feature">
              <span class="announcement-update-date">9月</span>
              <span class="announcement-update-icon announcement-update-icon-emerald">
                <Icon name="lucide:calendar" class="h-3.5 w-3.5" />
              </span>
              <span class="announcement-update-copy">
                <span class="announcement-update-kicker">9月活動</span>
                <span class="announcement-update-highlight">香腸・月餅・秋季貼紙</span>
              </span>
            </li>
            <li class="announcement-update-item">
              <span class="announcement-update-date">8月</span>
              <span class="announcement-update-icon announcement-update-icon-emerald">
                <Icon name="lucide:sparkles" class="h-3.5 w-3.5" />
              </span>
              <span class="announcement-update-copy">
                <span class="announcement-update-kicker">裝飾更新</span>
                <span class="announcement-update-highlight">峇里島雕刻</span>
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
          </ul>
        </div>

        <!-- 9月皮克敏活動 -->
        <div ref="eventContent" class="announcement-page space-y-3" :class="{ 'is-current': currentTab === 'event' }"
          :aria-hidden="currentTab !== 'event'" :inert="currentTab !== 'event'">
          <div class="announcement-event-card announcement-copy text-sm space-y-2">
            <p class="font-medium text-green-600">🌾 皮克敏9月活動</p>
            <p class="text-xs">活動時間：<span class="font-bold">2026/9/1 – 9/30</span></p>
            <p class="text-xs font-medium">🌱 本月金色花苗飾品：</p>
            <div class="flex flex-wrap gap-1.5">
              <span class="text-xs glass-control px-2 py-0.5 rounded-full font-bold">🌭 香腸</span>
              <span class="text-xs glass-control px-2 py-0.5 rounded-full font-bold">🥮 月餅</span>
              <span class="text-xs glass-control px-2 py-0.5 rounded-full font-bold">🍂 秋季貼紙</span>
            </div>
          </div>

          <!-- LINE 散步趣活動 -->
          <div class="announcement-event-card flex gap-3 items-center pt-2 border-t border-gray-200/50">
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
                  ref="copyButton"
                  @click="copyInviteCode"
                  class="announcement-invite-button font-mono glass-control px-1.5 py-0.5 rounded transition-colors cursor-pointer inline-flex items-center justify-center gap-1"
                  :data-copied="copied"
                  :title="copied ? '已複製！' : '點擊複製'"
                >
                  {{ copied ? '已複製！' : INVITE_CODE }}
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

        </div>
        <!-- 進度條 -->
        <div class="announcement-progress w-full glass-control rounded-full h-1 overflow-hidden">
          <div class="announcement-progress-fill bg-emerald-500 h-full w-full origin-left"></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';

type Tab = 'update' | 'event';
const isVisible = ref(true);
const currentTab = ref<Tab>('update');
const selectedTab = ref<Tab>('update');
const copied = ref(false);
const updateContent = ref<HTMLElement | null>(null);
const eventContent = ref<HTMLElement | null>(null);
const tabIndicator = ref<HTMLElement | null>(null);
const copyButton = ref<HTMLButtonElement | null>(null);
const INVITE_CODE = 'G79K77XF';

let root: Element | null = null;
let context: gsap.Context | null = null;
let panelMotion: gsap.core.Timeline | null = null;
let pageMotion: gsap.core.Timeline | null = null;
let indicatorMotion: gsap.core.Tween | null = null;
let progressMotion: gsap.core.Tween | null = null;
let motionPreference: MediaQueryList | null = null;
let enterDone: (() => void) | null = null;
let tabRequest = 0;
let manualTabSelected = false;
let readingStarted = false;
let disposed = false;
const timers: ReturnType<typeof setTimeout>[] = [];
let copyResetTimer: ReturnType<typeof setTimeout> | null = null;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pageFor = (tab: Tab) => tab === 'update' ? updateContent.value : eventContent.value;
const cardsIn = (page: Element) => Array.from(page.querySelectorAll<HTMLElement>(
  '.announcement-update-item, .announcement-event-card',
));
const movingParts = (page: Element) => [
  page, ...page.querySelectorAll('.announcement-update-item, .announcement-event-card, .announcement-update-date, .announcement-update-icon, .announcement-update-copy'),
];

// offsetTop/offsetHeight describe the resting layout even during an interrupted transform.
function stackOffsets(cards: HTMLElement[]) {
  const first = cards[0];
  if (!first) return [];
  const list = first.parentElement!;
  const stackTop = (list.offsetHeight - first.offsetHeight) / 2;
  return cards.map((card, index) => stackTop + index * 5 - card.offsetTop);
}

function schedule(callback: () => void, delay: number) {
  const timer = setTimeout(() => {
    const index = timers.indexOf(timer);
    if (index >= 0) timers.splice(index, 1);
    if (!disposed) callback();
  }, delay);
  timers.push(timer);
}

function startReading() {
  if (readingStarted || !isVisible.value || disposed) return;
  readingStarted = true;
  const progress = root?.querySelector('.announcement-progress-fill');
  if (progress) progressMotion = gsap.to(progress, { scaleX: 0, duration: 10, ease: 'none' });
  schedule(() => {
    if (!manualTabSelected) selectTab('event', false);
  }, 3000);
  schedule(dismiss, 10000);
}

function finishOpening() {
  const done = enterDone;
  enterDone = null;
  done?.();
  startReading();
}

function stopPanelMotion() {
  panelMotion?.kill();
  panelMotion = null;
  enterDone = null;
}

function beforeEnter(element: Element) {
  root = element;
  context?.revert();
  context = gsap.context(() => {
    if (!reducedMotion()) gsap.set('.announcement-panel', { autoAlpha: 0 });
  }, element);
}

function enter(element: Element, done: () => void) {
  enterDone = done;
  if (reducedMotion()) { finishOpening(); return; }
  const cards = cardsIn(element.querySelector('.announcement-page.is-current')!);
  const offsets = stackOffsets(cards);
  context?.add(() => {
    gsap.set('.announcement-backdrop', { autoAlpha: 0, y: 16, scale: 0.96 });
    gsap.set('.announcement-ambient', { x: -6, y: 6 });
    gsap.set('.announcement-header, .announcement-progress', { autoAlpha: 0, y: 8 });
    gsap.set(cards, {
      y: index => offsets[index], x: index => index * 4, rotation: index => -2 + index * 1.4,
      scale: index => 0.94 - index * 0.018, zIndex: index => cards.length - index,
      willChange: 'transform',
    });
    gsap.set('.announcement-update-copy, .announcement-update-icon', { autoAlpha: 0 });
    gsap.set('.announcement-update-date', { autoAlpha: 0, scale: 0.8 });
    gsap.set(cards[0]!.querySelector('.announcement-update-date'), { autoAlpha: 1, scale: 1 });
    gsap.set('.announcement-panel', { autoAlpha: 1 });

    panelMotion = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: finishOpening })
      .addLabel('stack', 0)
      .fromTo('.announcement-content-stage', { y: 26, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: 0.28, clearProps: 'transform,opacity,visibility',
      }, 'stack')
      .to('.announcement-backdrop', {
        autoAlpha: 1, y: 0, scale: 1, duration: 0.34, clearProps: 'transform,opacity,visibility',
      }, 0.1)
      .to('.announcement-header, .announcement-progress', {
        autoAlpha: 1, y: 0, duration: 0.24, clearProps: 'transform,opacity,visibility',
      }, 0.14)
      .addLabel('unfold', 0.16)
      .to(cards, {
        x: 0, y: 0, rotation: 0, scale: 1, duration: 0.46, stagger: 0.085, ease: 'power2.inOut',
        clearProps: 'transform,zIndex',
      }, 'unfold')
      .to('.announcement-update-date', {
        autoAlpha: 1, scale: 1, duration: 0.22, stagger: 0.085,
        clearProps: 'transform,opacity,visibility',
      }, 0.37)
      .to('.announcement-update-copy', {
        autoAlpha: 1, duration: 0.22, stagger: 0.085, clearProps: 'opacity,visibility',
      }, 0.4)
      .fromTo('.announcement-update-icon', { scale: 0.72, rotation: -8 }, {
        autoAlpha: 1, scale: 1, rotation: 0, duration: 0.26, stagger: 0.085,
        ease: 'back.out(1.1)', clearProps: 'transform,opacity,visibility',
      }, 0.43)
      .to('.announcement-ambient', { x: 0, y: 0, duration: 0.65, clearProps: 'transform' }, 0.15)
      .addLabel('settle', 0.7)
      .fromTo('.announcement-rim-glint', { xPercent: -120, opacity: 0 }, {
        xPercent: 120, opacity: 0.65, duration: 0.25,
      }, 'settle')
      .set('.announcement-rim-glint', { opacity: 0 })
      .set(cards, { clearProps: 'willChange' });
  });
}

// A tab click can take over before the opening finishes without snapping the cards.
function settleShell() {
  if (!enterDone) return;
  panelMotion?.kill();
  context?.add(() => {
    panelMotion = gsap.timeline({ onComplete: finishOpening })
      .to('.announcement-backdrop, .announcement-header, .announcement-progress, .announcement-content-stage', {
        autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.18,
        clearProps: 'transform,opacity,visibility',
      })
      .set('.announcement-ambient', { clearProps: 'transform' })
      .set('.announcement-rim-glint', { opacity: 0 });
  });
}

async function selectTab(tab: Tab, manual = true) {
  if (manual) manualTabSelected = true;
  if (!isVisible.value || disposed || selectedTab.value === tab) return;
  selectedTab.value = tab;
  const request = ++tabRequest;
  const direction = tab === 'event' ? 1 : -1;
  pageMotion?.kill();
  indicatorMotion?.kill();
  settleShell();
  context?.add(() => {
    indicatorMotion = gsap.to(tabIndicator.value, {
      xPercent: tab === 'event' ? 100 : 0, duration: reducedMotion() ? 0 : 0.3, ease: 'power3.out',
    });
  });

  const reveal = async () => {
    if (request !== tabRequest || !isVisible.value || disposed) return;
    const previousPage = pageFor(currentTab.value);
    currentTab.value = tab;
    await nextTick();
    if (request !== tabRequest || !isVisible.value || disposed) return;
    const incoming = pageFor(tab);
    if (!incoming) return;
    if (previousPage) gsap.set(movingParts(previousPage), { clearProps: 'transform,opacity,visibility,zIndex,willChange' });
    gsap.set(movingParts(incoming), { clearProps: 'transform,opacity,visibility,zIndex,willChange' });
    if (reducedMotion()) return;
    context?.add(() => {
      pageMotion = gsap.timeline({ defaults: { ease: 'power3.out' } })
        .fromTo(incoming, { x: direction * 24, autoAlpha: 0 }, {
          x: 0, autoAlpha: 1, duration: 0.32, clearProps: 'transform,opacity,visibility',
        })
        .fromTo(cardsIn(incoming), { x: direction * 8 }, {
          x: 0, duration: 0.245, stagger: 0.025, clearProps: 'transform',
        }, 0)
        .to('.announcement-ambient', { x: 0, duration: 0.32, clearProps: 'transform' }, 0);
    });
  };

  const outgoing = pageFor(currentTab.value);
  if (reducedMotion() || !outgoing) { await reveal(); return; }
  context?.add(() => {
    pageMotion = gsap.timeline({ defaults: { ease: 'power2.out' } });
    if (currentTab.value === tab) {
      // Reversing a pending page change settles from its current position.
      pageMotion.to(movingParts(outgoing), {
        x: 0, y: 0, scale: 1, rotation: 0, autoAlpha: 1, duration: 0.25,
        clearProps: 'transform,opacity,visibility,zIndex,willChange',
      }).to('.announcement-ambient', { x: 0, duration: 0.25, clearProps: 'transform' }, 0);
    } else {
      pageMotion.to(outgoing, {
        x: -direction * 20, autoAlpha: 0, duration: 0.16, ease: 'power2.in',
      }).to('.announcement-ambient', { x: direction * 6, duration: 0.16 }, 0)
        .call(() => { void reveal(); });
    }
  });
}

function dismiss() {
  if (!isVisible.value) return;
  ++tabRequest;
  timers.splice(0).forEach(clearTimeout);
  if (copyResetTimer) clearTimeout(copyResetTimer);
  progressMotion?.kill();
  isVisible.value = false;
}

function leave(element: Element, done: () => void) {
  stopPanelMotion();
  pageMotion?.kill();
  indicatorMotion?.kill();
  if (reducedMotion()) { done(); return; }
  const page = element.querySelector('.announcement-page.is-current');
  const cards = page ? cardsIn(page) : [];
  const offsets = stackOffsets(cards);
  context?.add(() => {
    panelMotion = gsap.timeline({ defaults: { ease: 'power2.in' }, onComplete: done });
    if (cards.length) panelMotion.to(cards, {
      y: index => offsets[index], x: index => index * 4, scale: index => 0.94 - index * 0.018,
      rotation: index => -2 + index * 1.4, duration: 0.2,
      stagger: { each: 0.035, from: 'end' },
    }, 0);
    panelMotion.to('.announcement-update-copy, .announcement-update-icon', { autoAlpha: 0, duration: 0.12 }, 0)
      .to('.announcement-header, .announcement-progress', { autoAlpha: 0, y: 8, duration: 0.15 }, 0.08)
      .to('.announcement-backdrop', { y: 16, scale: 0.96, autoAlpha: 0, duration: 0.23 }, 0.17)
      .to('.announcement-content-stage', { y: 26, autoAlpha: 0, duration: 0.17 }, 0.23)
      .to('.announcement-ambient', { y: 6, duration: 0.25 }, 0.15);
  });
}

function finishMotionForPreference(event: MediaQueryListEvent) {
  if (!event.matches) return;
  panelMotion?.progress(1);
  pageMotion?.progress(1);
  indicatorMotion?.progress(1);
}

async function copyInviteCode() {
  try {
    await navigator.clipboard.writeText(INVITE_CODE);
  } catch {
    const textArea = document.createElement('textarea');
    textArea.value = INVITE_CODE;
    textArea.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    textArea.remove();
  }
  if (disposed || !isVisible.value) return;
  copied.value = true;
  if (copyResetTimer) clearTimeout(copyResetTimer);
  copyResetTimer = setTimeout(() => { copied.value = false; copyResetTimer = null; }, 2000);
  await nextTick();
  if (disposed || !isVisible.value || reducedMotion() || !copyButton.value) return;
  context?.add(() => {
    gsap.fromTo(copyButton.value, { scale: 0.94 }, {
      scale: 1, duration: 0.3, ease: 'back.out(1.5)', overwrite: true, clearProps: 'transform',
    });
  });
}

function cleanupMotion() {
  stopPanelMotion();
  pageMotion?.kill();
  indicatorMotion?.kill();
  progressMotion?.kill();
  context?.revert();
  context = null;
  root = null;
}

onMounted(() => {
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  motionPreference.addEventListener('change', finishMotionForPreference);
});
onBeforeUnmount(() => {
  disposed = true;
  ++tabRequest;
  timers.splice(0).forEach(clearTimeout);
  if (copyResetTimer) clearTimeout(copyResetTimer);
  motionPreference?.removeEventListener('change', finishMotionForPreference);
  cleanupMotion();
});
</script>

<style scoped>
.announcement-panel {
  position: relative;
  isolation: isolate;
  max-height: calc(100dvh - 32px);
  overflow-x: hidden;
  overflow-y: auto;
}

.announcement-backdrop {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
  border-color: rgba(214, 231, 221, 0.8);
  box-shadow: 0 12px 36px rgba(23, 62, 47, 0.12), 0 1px 0 rgba(255, 255, 255, 0.9) inset;
}

.announcement-ambient {
  position: absolute;
  inset: -8px;
  background: radial-gradient(ellipse at 5% 5%, rgba(16, 185, 129, 0.16), transparent 55%),
    radial-gradient(ellipse at 95% 100%, rgba(167, 243, 208, 0.22), transparent 50%);
}

.announcement-rim-glint {
  position: absolute;
  inset: 0;
  opacity: 0;
  border-top: 2px solid rgba(255, 255, 255, 0.95);
  border-bottom: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: inherit;
  pointer-events: none;
}

.announcement-header, .announcement-progress { position: relative; z-index: 2; }
/* The backing already blurs the scene; nested filters add no useful depth. */
.announcement-panel .glass-control {
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  transition-property: background-color, border-color, color, box-shadow;
}
.announcement-panel .announcement-progress { transition: none; }
.announcement-tabs {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  padding: 3px;
  border-radius: 999px;
  background: rgba(222, 241, 232, 0.65);
}
.announcement-tabs button { position: relative; z-index: 1; }
.announcement-tab-indicator {
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: 3px;
  width: calc(50% - 3px);
  border-radius: 999px;
  background: #10b981;
  box-shadow: 0 2px 5px rgba(5, 150, 105, 0.18);
}
.announcement-content-stage {
  position: relative;
  z-index: 1;
  display: grid;
  min-width: 0;
  margin: -6px;
  padding: 6px;
  overflow: clip;
}
.announcement-page {
  position: relative;
  grid-area: 1 / 1;
  align-self: start;
  min-width: 0;
  visibility: hidden;
  pointer-events: none;
}
.announcement-page.is-current { visibility: visible; pointer-events: auto; }
.announcement-invite-button { min-width: 6.5rem; }
.announcement-invite-button[data-copied='true'] { background: #10b981; color: white; }
.announcement-invite-button[data-copied='true'] svg { color: white; }
.announcement-tabs button:active, .announcement-close-button:active { transform: scale(0.94); }

.announcement-panel :deep(*) {
  paint-order: normal;
}

.announcement-copy {
  color: rgb(15 23 42 / 0.9);
  text-shadow: none;
}

.announcement-list {
  position: relative;
  display: grid;
  grid-auto-rows: 1fr;
  gap: 0.5rem;
}

.announcement-update-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
  padding: 0.5rem 0.65rem;
  overflow: hidden;
  list-style: none;
  border: 1px solid rgba(99, 133, 115, 0.13);
  border-radius: 1rem;
  background:
    radial-gradient(circle at 16% 0%, rgba(255, 255, 255, 0.92), transparent 42%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(241, 248, 245, 0.96));
  box-shadow:
    0 2px 8px rgba(23, 62, 47, 0.035),
    0 1px 0 rgba(255, 255, 255, 0.85) inset;
}

.announcement-update-item-feature {
  border-color: rgba(16, 185, 129, 0.2);
  background:
    radial-gradient(circle at 16% 0%, rgba(255, 255, 255, 0.96), transparent 42%),
    linear-gradient(135deg, rgba(236, 253, 245, 0.98), rgba(255, 255, 255, 0.96));
}

.announcement-update-date {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  min-width: 2.55rem;
  padding: 0.25rem 0.42rem;
  color: white;
  font-size: 0.68rem;
  font-weight: 800;
  line-height: 1;
  text-align: center;
  border-radius: 999px;
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 2px 5px rgba(5, 150, 105, 0.13);
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
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.8) inset;
}

.announcement-update-icon-emerald {
  color: rgb(5, 150, 105);
  background: rgba(209, 250, 229, 0.64);
}

.announcement-update-icon-dark {
  color: white;
  background: #253a31;
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
  font-weight: 650;
  line-height: 1.5;
}

.announcement-update-kicker {
  color: rgb(4, 120, 87);
  font-weight: 800;
}

.announcement-update-highlight {
  overflow: hidden;
  color: transparent;
  font-weight: 750;
  white-space: normal;
  overflow-wrap: anywhere;
  background: linear-gradient(90deg, #047857, #059669, #0f766e);
  -webkit-background-clip: text;
  background-clip: text;
}

.announcement-close-button {
  min-width: 2.75rem;
  min-height: 2.75rem;
  color: rgb(31 41 55);
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(99, 133, 115, 0.2);
  box-shadow:
    0 1px 6px rgba(255, 255, 255, 0.82) inset,
    0 2px 7px rgba(23, 62, 47, 0.07);
}

.announcement-close-button:hover {
  color: rgb(3 7 18);
  background: rgba(255, 255, 255, 0.92);
  border-color: rgba(31, 41, 55, 0.42);
}

.announcement-panel button:focus-visible {
  outline: 2px solid #047857;
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .announcement-rim-glint { display: none; }
  .announcement-panel button { transition: none; }
}

.ios-badge,
.ios-badge :deep(*) {
  color: #fff;
  paint-order: normal;
  text-shadow: none;
}
</style>
