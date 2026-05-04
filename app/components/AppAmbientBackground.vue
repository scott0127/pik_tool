<template>
  <template v-if="!isMapRoute">
    <div
      class="ambient-background fixed inset-0 pointer-events-none overflow-hidden"
      :class="{
        'is-immersive': isImmersive,
        'is-gradient-mode': backgroundMode === 'gradient',
        'is-image-mode': backgroundMode === 'image',
      }"
      :style="{ '--immersive-progress': immersiveProgress }"
      aria-hidden="true"
    >
      <div class="ambient-base absolute inset-0" />
      <ClientOnly>
        <ThreeSporeBackdrop
          v-if="shouldRenderThree"
          class="ambient-three absolute inset-0"
        />
      </ClientOnly>

      <div class="ambient-cute absolute inset-0">
        <div class="ambient-hill ambient-hill-a" />
        <div class="ambient-hill ambient-hill-b" />
        <svg
          class="ambient-sprouts absolute inset-0 h-full w-full"
          viewBox="0 0 1440 1000"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="sprout-stem" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#00b92f" stop-opacity="0.26" />
              <stop offset="100%" stop-color="#008523" stop-opacity="0.06" />
            </linearGradient>
            <radialGradient id="sprout-leaf" cx="35%" cy="28%" r="70%">
              <stop offset="0%" stop-color="#edfff2" stop-opacity="0.72" />
              <stop offset="64%" stop-color="#73ff96" stop-opacity="0.22" />
              <stop offset="100%" stop-color="#00b92f" stop-opacity="0.04" />
            </radialGradient>
          </defs>
          <g class="sprout-lines" fill="none" stroke="url(#sprout-stem)" stroke-linecap="round">
            <path d="M176 1010 C188 820 204 650 252 482" />
            <path d="M1078 1040 C1064 802 1098 602 1194 398" />
            <path d="M682 1032 C724 842 800 690 934 548" />
          </g>
          <g class="sprout-leaves">
            <path d="M230 474 C152 420 134 330 252 360 C336 382 320 458 230 474Z" fill="url(#sprout-leaf)" />
            <path d="M280 454 C370 402 430 438 390 512 C348 586 274 536 280 454Z" fill="url(#sprout-leaf)" />
            <path d="M1164 390 C1084 330 1110 254 1214 286 C1286 308 1258 388 1164 390Z" fill="url(#sprout-leaf)" />
            <path d="M1198 390 C1288 326 1360 374 1316 454 C1272 534 1190 486 1198 390Z" fill="url(#sprout-leaf)" />
            <path d="M914 542 C832 496 840 422 940 446 C1014 466 1000 538 914 542Z" fill="url(#sprout-leaf)" />
          </g>
        </svg>
      </div>

      <div class="ambient-light absolute inset-0" />
      <div class="ambient-spores">
        <span
          v-for="spore in spores"
          :key="spore.id"
          class="ambient-spore"
          :style="{
            left: spore.left,
            top: spore.top,
            animationDelay: spore.delay,
            animationDuration: spore.duration,
          }"
        />
      </div>
    </div>

    <div class="ambient-mode-control fixed right-7 top-[9.9rem] z-40">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-2 scale-95"
        enter-to-class="opacity-100 translate-x-0 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-x-0 scale-100"
        leave-to-class="opacity-0 translate-x-2 scale-95"
      >
        <div
          v-if="showBackgroundModeTip"
          class="ambient-mode-tooltip"
          role="status"
        >
          <div class="ambient-mode-tooltip-glow" />
          <div class="relative z-10 flex items-start gap-3">
            <span class="ambient-mode-tooltip-icon">
              <Icon name="lucide:palette" class="h-4 w-4" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="ambient-mode-tooltip-title">背景樣式</p>
              <p class="ambient-mode-tooltip-text">
                點這裡可在漸層動畫與背景圖片之間切換。
              </p>
            </div>
            <button
              class="ambient-mode-tooltip-close"
              type="button"
              aria-label="關閉背景樣式提示"
              @click="dismissBackgroundModeTip"
            >
              <Icon name="lucide:x" class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </Transition>

      <button
        class="ambient-mode-toggle"
        type="button"
        :aria-label="backgroundMode === 'gradient' ? '切換成背景圖片模式' : '切換成漸層背景模式'"
        :title="backgroundMode === 'gradient' ? '切換成背景圖片模式' : '切換成漸層背景模式'"
        @click="toggleBackgroundMode"
      >
        <Icon
          :name="backgroundMode === 'gradient' ? 'lucide:palette' : 'lucide:image'"
          class="h-4 w-4"
        />
      </button>
    </div>

    <div
      ref="sliderRef"
      class="ambient-slider fixed right-7 top-[12.8rem] z-40"
      :class="{ 'is-dragging': isDragging, 'is-immersive': isImmersive }"
      role="switch"
      tabindex="0"
      :aria-checked="isImmersive"
      aria-label="切換沉浸式背景"
      :style="{ '--slider-progress': immersiveProgress }"
      @pointerdown="startSlide"
      @keydown.up.prevent="commitImmersive(false)"
      @keydown.down.prevent="commitImmersive(true)"
      @keydown.enter.prevent="commitImmersive(!isImmersive)"
      @keydown.space.prevent="commitImmersive(!isImmersive)"
    >
      <span class="ambient-slider-fill" />
      <span class="ambient-slider-secret-glow" />
      <span class="ambient-slider-thumb">
        <Icon
          :name="isImmersive ? 'lucide:sparkles' : 'lucide:leaf'"
          class="h-4 w-4"
        />
      </span>
    </div>
  </template>
</template>

<script setup lang="ts">
type BackgroundMode = "gradient" | "image";

const route = useRoute();
const { t } = useI18n();

const STORAGE_KEY = "pikmin-immersive-background";
const BACKGROUND_MODE_KEY = "pikmin-background-mode";
const BACKGROUND_MODE_TIP_DISMISSED_KEY = "pikmin-background-mode-tip-dismissed";
const TIP_SHOWN_KEY = "pikmin-bg-tip-shown";
const isImmersive = ref(false);
const immersiveProgress = ref(0);
const backgroundMode = ref<BackgroundMode>("gradient");
const showBackgroundModeTip = ref(false);
const isDragging = ref(false);
const sliderRef = ref<HTMLElement | null>(null);
const isMapRoute = computed(() => route.path === "/map");
const shouldRenderThree = computed(() => isImmersive.value || immersiveProgress.value > 0.04);

const spores = [
  { id: 1, left: "9%", top: "18%", delay: "0s", duration: "13s" },
  { id: 2, left: "24%", top: "74%", delay: "-6s", duration: "17s" },
  { id: 3, left: "48%", top: "30%", delay: "-3s", duration: "14s" },
  { id: 4, left: "67%", top: "82%", delay: "-9s", duration: "18s" },
  { id: 5, left: "84%", top: "15%", delay: "-4s", duration: "15s" },
  { id: 6, left: "92%", top: "58%", delay: "-11s", duration: "19s" },
];

const setProgressFromClientY = (clientY: number) => {
  const rect = sliderRef.value?.getBoundingClientRect();
  if (!rect) return;

  const nextProgress = (clientY - rect.top) / rect.height;
  immersiveProgress.value = Math.min(1, Math.max(0, nextProgress));
};

const commitImmersive = (enabled: boolean) => {
  isImmersive.value = enabled;
  immersiveProgress.value = enabled ? 1 : 0;
  localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
};

const setBackgroundMode = (mode: BackgroundMode) => {
  backgroundMode.value = mode;
  localStorage.setItem(BACKGROUND_MODE_KEY, mode);
};

const toggleBackgroundMode = () => {
  setBackgroundMode(backgroundMode.value === "gradient" ? "image" : "gradient");
};

const dismissBackgroundModeTip = () => {
  showBackgroundModeTip.value = false;
  localStorage.setItem(BACKGROUND_MODE_TIP_DISMISSED_KEY, "true");
};

const onSlideMove = (event: PointerEvent) => {
  if (!isDragging.value) return;
  setProgressFromClientY(event.clientY);
};

const finishSlide = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  commitImmersive(immersiveProgress.value >= 0.5);
  window.removeEventListener("pointermove", onSlideMove);
  window.removeEventListener("pointerup", finishSlide);
  window.removeEventListener("pointercancel", finishSlide);
};

const startSlide = (event: PointerEvent) => {
  isDragging.value = true;
  setProgressFromClientY(event.clientY);
  sliderRef.value?.setPointerCapture?.(event.pointerId);
  window.addEventListener("pointermove", onSlideMove);
  window.addEventListener("pointerup", finishSlide);
  window.addEventListener("pointercancel", finishSlide);
};

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  const enabled = saved === "true";
  isImmersive.value = enabled;
  immersiveProgress.value = enabled ? 1 : 0;

  const savedBackgroundMode = localStorage.getItem(BACKGROUND_MODE_KEY);
  backgroundMode.value = savedBackgroundMode === "image" ? "image" : "gradient";
  showBackgroundModeTip.value = localStorage.getItem(BACKGROUND_MODE_TIP_DISMISSED_KEY) !== "true";

  const tipShown = localStorage.getItem(TIP_SHOWN_KEY);
  if (!tipShown) {
    setTimeout(() => {
      const toast = useToast();
      toast.info(t('components.ambient_tip'), 3500);
      localStorage.setItem(TIP_SHOWN_KEY, "true");
    }, 1500);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("pointermove", onSlideMove);
  window.removeEventListener("pointerup", finishSlide);
  window.removeEventListener("pointercancel", finishSlide);
});
</script>

<style scoped>
.ambient-background {
  z-index: 0;
  background: #f8fff4;
}

.ambient-base {
  background:
    radial-gradient(circle at 18% 10%, rgb(255 255 255 / 0.96), transparent 24%),
    radial-gradient(circle at 82% 18%, rgb(186 230 253 / 0.2), transparent 28%),
    radial-gradient(circle at 24% 90%, rgb(187 247 208 / 0.32), transparent 32%),
    linear-gradient(160deg, #fffef7 0%, #f1fbe8 44%, #ecfbf5 100%);
}

.ambient-background.is-immersive .ambient-base {
  background:
    radial-gradient(circle at 50% 0%, rgb(255 255 255 / 0.42), transparent 30%),
    linear-gradient(160deg, #082f25 0%, #0f513c 46%, #082f49 100%);
}

.ambient-three {
  opacity: calc(0.58 * var(--immersive-progress));
  mix-blend-mode: screen;
}

.ambient-cute {
  overflow: hidden;
  opacity: calc(1 - var(--immersive-progress));
  transition: opacity 260ms ease, filter 260ms ease;
}

.ambient-background.is-gradient-mode .ambient-cute {
  background: transparent;
  filter: none;
}

.ambient-background.is-image-mode .ambient-cute {
  background-image: url("/img/ambient-glass-sprouts.png");
  background-position: center top;
  background-size: cover;
  filter: saturate(0.96) contrast(0.98);
}

.ambient-cute::before,
.ambient-cute::after {
  position: absolute;
  inset: 0;
  content: "";
  pointer-events: none;
  display: none;
}

.ambient-hill {
  position: absolute;
  display: block;
  border-radius: 999px 999px 0 0;
  filter: blur(0.2px);
}

.ambient-background.is-image-mode .ambient-hill {
  display: none;
}

.ambient-hill-a {
  left: -18%;
  bottom: -14%;
  width: 72%;
  height: 34%;
  background: linear-gradient(180deg, rgb(187 247 208 / 0.5), rgb(16 185 129 / 0.08));
}

.ambient-hill-b {
  right: -20%;
  bottom: -10%;
  width: 78%;
  height: 28%;
  background: linear-gradient(180deg, rgb(153 246 228 / 0.42), rgb(14 165 233 / 0.07));
}

.ambient-sprouts {
  display: block;
  opacity: 0.76;
  filter: drop-shadow(0 18px 28px rgb(6 78 59 / 0.05));
}

.ambient-background.is-image-mode .ambient-sprouts {
  display: none;
}

.sprout-lines path {
  stroke-width: 3;
}

.ambient-light {
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.14), rgb(255 255 255 / 0.03) 46%, rgb(255 255 255 / 0.18)),
    radial-gradient(ellipse at 50% -10%, rgb(255 255 255 / 0.36), transparent 44%),
    radial-gradient(ellipse at 50% 112%, rgb(6 95 70 / 0.04), transparent 44%);
}

@media (min-width: 768px) {
  .ambient-background {
    background: #e9f9f3;
  }

  .ambient-base {
    background:
      radial-gradient(circle at 18% 14%, rgb(255 255 255 / 0.5), transparent 24%),
      radial-gradient(circle at 86% 8%, rgb(186 230 253 / 0.24), transparent 30%),
      linear-gradient(160deg, #e8fbf4 0%, #e7f8f7 48%, #effbf1 100%);
  }

  .ambient-cute {
    opacity: calc(0.98 * (1 - var(--immersive-progress)));
  }

  .ambient-background.is-image-mode .ambient-cute {
    background-image: none;
    filter: none;
  }

  .ambient-background.is-image-mode .ambient-cute::before {
    display: block;
    background-image: url("/img/pc_background_extended.png");
    background-position: center center;
    background-repeat: no-repeat;
    background-size: cover;
    filter: saturate(1.03) brightness(1.03) contrast(0.98);
  }

  .ambient-light {
    background: transparent;
    mix-blend-mode: normal;
  }

  .ambient-spore {
    width: 0.28rem;
    height: 0.28rem;
    background: rgb(255 255 255 / 0.64);
    box-shadow:
      0 0 10px rgb(255 255 255 / 0.46),
      0 0 24px rgb(125 211 252 / 0.22);
  }
}

.ambient-background.is-immersive .ambient-light {
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.2), rgb(240 253 244 / 0.52) 36%, rgb(240 253 244 / 0.76)),
    radial-gradient(circle at 50% 0%, rgb(255 255 255 / 0.48), transparent 26%);
}

.ambient-background:not(.is-immersive) .ambient-light {
  opacity: calc(1 - (var(--immersive-progress) * 0.32));
}

.ambient-spores {
  position: absolute;
  inset: 0;
}

.ambient-spore {
  position: absolute;
  width: 0.36rem;
  height: 0.36rem;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.86);
  box-shadow:
    0 0 12px rgb(255 255 255 / 0.58),
    0 0 26px rgb(52 211 153 / 0.24);
  animation: ambient-spore-drift linear infinite;
}

@keyframes ambient-spore-drift {
  0% {
    opacity: 0;
    transform: translate3d(0, 1.5rem, 0) scale(0.8);
  }

  18%,
  72% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translate3d(1.4rem, -5rem, 0) scale(1.3);
  }
}

@media (max-width: 640px) {
  .ambient-mode-control,
  .ambient-slider {
    right: 1.25rem;
  }

  .ambient-mode-control {
    top: 10.3rem;
  }

  .ambient-slider {
    top: 13.2rem;
  }

  .ambient-mode-tooltip {
    right: 0;
    top: -0.85rem;
    width: min(18rem, calc(100vw - 6.5rem));
    transform: translateY(-100%);
  }

  .ambient-mode-tooltip::after {
    right: 0.8rem;
    top: auto;
    bottom: -0.42rem;
    transform: rotate(45deg);
  }

  .ambient-hill-a {
    left: -42%;
    width: 110%;
  }

  .ambient-hill-b {
    right: -48%;
    width: 120%;
  }
}

.ambient-mode-control {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
}

.ambient-mode-tooltip {
  position: absolute;
  right: calc(100% + 0.8rem);
  top: 50%;
  width: 18.5rem;
  color: rgb(6 78 59);
  border: 1px solid rgb(255 255 255 / 0.62);
  border-radius: 1.25rem;
  background:
    linear-gradient(135deg, rgb(255 255 255 / 0.82), rgb(236 253 245 / 0.72)),
    radial-gradient(circle at 18% 0%, rgb(255 255 255 / 0.88), transparent 44%);
  box-shadow:
    0 18px 42px rgb(6 78 59 / 0.14),
    0 1px 14px rgb(255 255 255 / 0.58) inset;
  padding: 0.85rem;
  transform: translateY(-50%);
  backdrop-filter: blur(18px) saturate(1.25);
}

.ambient-mode-tooltip::after {
  position: absolute;
  right: -0.38rem;
  top: 50%;
  width: 0.75rem;
  height: 0.75rem;
  content: "";
  border-top: 1px solid rgb(255 255 255 / 0.62);
  border-right: 1px solid rgb(255 255 255 / 0.62);
  background: rgb(236 253 245 / 0.86);
  transform: translateY(-50%) rotate(45deg);
}

.ambient-mode-tooltip-glow {
  position: absolute;
  inset: -0.9rem;
  border-radius: 1.75rem;
  background: radial-gradient(circle at 80% 50%, rgb(52 211 153 / 0.24), transparent 56%);
  filter: blur(10px);
  opacity: 0.82;
}

.ambient-mode-tooltip-icon {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  place-items: center;
  color: rgb(4 120 87);
  border-radius: 0.9rem;
  background: linear-gradient(135deg, rgb(209 250 229 / 0.86), rgb(153 246 228 / 0.58));
  box-shadow: 0 8px 18px rgb(16 185 129 / 0.14);
}

.ambient-mode-tooltip-title {
  margin: 0;
  font-size: 0.86rem;
  font-weight: 900;
  letter-spacing: 0.02em;
  color: rgb(6 95 70);
}

.ambient-mode-tooltip-text {
  margin-top: 0.18rem;
  font-size: 0.76rem;
  font-weight: 700;
  line-height: 1.55;
  color: rgb(15 118 110 / 0.86);
}

.ambient-mode-tooltip-close {
  display: grid;
  width: 1.65rem;
  height: 1.65rem;
  flex: 0 0 auto;
  place-items: center;
  color: rgb(15 118 110 / 0.72);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.52);
  transition: background 160ms ease, color 160ms ease, transform 160ms ease;
}

.ambient-mode-tooltip-close:hover,
.ambient-mode-tooltip-close:focus-visible {
  color: rgb(6 95 70);
  background: rgb(209 250 229 / 0.82);
  transform: scale(1.04);
}

.ambient-mode-tooltip-close:focus-visible {
  outline: 3px solid rgb(16 185 129 / 0.24);
  outline-offset: 2px;
}

.ambient-mode-toggle {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  color: rgb(4 120 87);
  border-radius: 999px;
  background:
    radial-gradient(circle at 30% 18%, rgb(255 255 255 / 0.9), rgb(255 255 255 / 0.36) 56%, rgb(209 250 229 / 0.18)),
    linear-gradient(135deg, rgb(255 255 255 / 0.3), rgb(255 255 255 / 0.08));
  box-shadow:
    0 5px 12px rgb(6 78 59 / 0.06),
    0 0 16px rgb(52 211 153 / 0.12),
    0 1px 8px rgb(255 255 255 / 0.54) inset;
  opacity: 0.58;
  transition: opacity 180ms ease, transform 180ms ease;
}

.ambient-mode-toggle:hover,
.ambient-mode-toggle:focus-visible,
.ambient-mode-toggle:active {
  opacity: 1;
  transform: translateY(-1px);
}

.ambient-mode-toggle:focus-visible {
  outline: 3px solid rgb(16 185 129 / 0.28);
  outline-offset: 3px;
}

.ambient-slider {
  width: 2.25rem;
  height: 6.4rem;
  cursor: grab;
  touch-action: none;
  user-select: none;
  border-radius: 999px;
  background:
    radial-gradient(circle at 50% calc(16% + 68% * var(--slider-progress)), rgb(255 255 255 / 0.26), rgb(255 255 255 / 0.04) 34%, transparent 66%);
  box-shadow:
    0 10px 24px rgb(6 78 59 / 0.02),
    0 1px 10px rgb(255 255 255 / 0.08) inset;
  opacity: 0.48;
  transition: opacity 180ms ease, transform 180ms ease;
}

.ambient-slider:hover,
.ambient-slider:focus-visible,
.ambient-slider:active {
  opacity: 1;
  transform: translateY(-1px);
}

.ambient-slider:active {
  cursor: grabbing;
}

.ambient-slider:focus-visible {
  outline: 3px solid rgb(16 185 129 / 0.28);
  outline-offset: 3px;
}

.ambient-slider-fill {
  position: absolute;
  left: 50%;
  top: 0.72rem;
  width: 0.2rem;
  height: calc((100% - 1.44rem) * var(--slider-progress));
  transform: translateX(-50%);
  border-radius: 999px;
  background:
    linear-gradient(180deg, rgb(52 211 153 / 0.16), rgb(45 212 191 / 0.32)),
    radial-gradient(circle at 50% 100%, rgb(255 255 255 / 0.62), transparent 42%);
  box-shadow:
    0 0 12px rgb(45 212 191 / 0.22),
    0 1px 7px rgb(255 255 255 / 0.48) inset;
}

.ambient-slider::before {
  position: absolute;
  left: 50%;
  top: 0.68rem;
  width: 0.12rem;
  height: calc(100% - 1.36rem);
  content: "";
  border-radius: 999px;
  background: linear-gradient(180deg, rgb(16 185 129 / 0.04), rgb(4 120 87 / 0.18), rgb(16 185 129 / 0.04));
  transform: translateX(-50%);
}

.ambient-slider-secret-glow {
  position: absolute;
  inset: -0.55rem;
  border-radius: 999px;
  background: radial-gradient(circle at 50% calc(22% + 46% * var(--slider-progress)), rgb(255 255 255 / 0.2), transparent 46%);
  opacity: calc(0.28 + var(--slider-progress) * 0.42);
  filter: blur(8px);
}

.ambient-slider-thumb {
  position: absolute;
  left: 50%;
  top: 0.22rem;
  display: grid;
  width: 1.78rem;
  height: 1.78rem;
  place-items: center;
  color: rgb(4 120 87);
  border-radius: 999px;
  background:
    radial-gradient(circle at 30% 18%, rgb(255 255 255 / 0.9), rgb(255 255 255 / 0.36) 56%, rgb(209 250 229 / 0.18)),
    linear-gradient(135deg, rgb(255 255 255 / 0.3), rgb(255 255 255 / 0.08));
  box-shadow:
    0 5px 12px rgb(6 78 59 / 0.08),
    0 0 16px rgb(52 211 153 / 0.14),
    0 1px 8px rgb(255 255 255 / 0.54) inset;
  transform: translateX(-50%) translateY(calc((6.4rem - 2.22rem) * var(--slider-progress)));
  z-index: 2;
  animation: ambient-slider-invite 3.8s ease-in-out infinite;
}

.ambient-slider::after {
  position: absolute;
  left: 50%;
  top: 0.66rem;
  width: 0.34rem;
  height: 0.34rem;
  content: "";
  border-radius: 999px;
  background: rgb(255 255 255 / 0.76);
  box-shadow: 0 0 12px rgb(52 211 153 / 0.34);
  transform: translateX(-50%);
  animation: ambient-slider-trace 3.8s ease-in-out infinite;
}

.ambient-slider.is-dragging .ambient-slider-thumb,
.ambient-slider.is-dragging::after,
.ambient-slider.is-immersive .ambient-slider-thumb,
.ambient-slider.is-immersive::after {
  animation: none;
}

@keyframes ambient-slider-invite {
  0%,
  68%,
  100% {
    transform: translateX(-50%) translateY(calc((6.4rem - 2.22rem) * var(--slider-progress))) scale(1);
  }

  78% {
    transform: translateX(-50%) translateY(calc((6.4rem - 2.22rem) * var(--slider-progress) + 0.5rem)) scale(1.04);
  }

  88% {
    transform: translateX(-50%) translateY(calc((6.4rem - 2.22rem) * var(--slider-progress))) scale(1);
  }
}

@keyframes ambient-slider-trace {
  0%,
  62%,
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(0) scale(0.8);
  }

  74% {
    opacity: 0.7;
  }

  92% {
    opacity: 0;
    transform: translateX(-50%) translateY(3.6rem) scale(1.05);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ambient-spore,
  .ambient-slider-thumb,
  .ambient-slider::after {
    animation: none;
  }
}
</style>
