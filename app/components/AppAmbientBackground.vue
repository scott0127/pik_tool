<template>
  <template v-if="!isMapRoute">
    <div
      class="ambient-background fixed inset-0 pointer-events-none overflow-hidden"
      :class="{ 'is-immersive': isImmersive }"
      :style="{ '--immersive-progress': immersiveProgress }"
      aria-hidden="true"
    >
      <div 
        class="ambient-base absolute inset-[-100px]" 
        :style="{ transform: baseTransform }"
      />
      <ClientOnly>
        <ThreeSporeBackdrop
          v-if="shouldRenderThree"
          class="ambient-three absolute inset-0"
        />
      </ClientOnly>

      <div 
        class="ambient-cute absolute inset-[-100px]"
        :style="{ transform: imageTransform, filter: imageFilter }"
      >
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

      <!-- Foreground Bokeh Layer -->
      <div class="ambient-bokeh-layer absolute inset-0 overflow-hidden pointer-events-none">
        <div class="ambient-bokeh bokeh-1"></div>
        <div class="ambient-bokeh bokeh-2"></div>
        <div class="ambient-bokeh bokeh-3"></div>
        <div class="ambient-bokeh bokeh-4"></div>
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

    <div class="ambient-slider-wrap fixed right-7 top-[12.8rem] z-50">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-3 scale-95"
        enter-to-class="opacity-100 translate-x-0 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-x-0 scale-100"
        leave-to-class="opacity-0 translate-x-3 scale-95"
      >
        <div
          v-if="showSliderTip"
          class="ambient-slider-tooltip"
          role="status"
        >
          <div class="ambient-slider-tooltip-glow" />
          <div class="relative z-10 flex items-start gap-3">
            <span class="ambient-slider-tooltip-icon">
              <Icon name="lucide:leaf" class="h-4 w-4" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="ambient-slider-tooltip-title">背景切換</p>
              <p class="ambient-slider-tooltip-text">
                向下拖曳切換沉浸式漸層背景；向上回到背景圖片。
              </p>
            </div>
            <button
              class="ambient-slider-tooltip-close"
              type="button"
              aria-label="關閉背景切換提示"
              @click="dismissSliderTip"
            >
              <Icon name="lucide:x" class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </Transition>

      <div class="ambient-slider-glass" aria-hidden="true" />
      <div
        ref="sliderRef"
        class="ambient-slider"
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
    </div>
  </template>
</template>

<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const route = useRoute();
const { t } = useI18n();

const { bgXSpring, bgYSpring, isImmersive, immersiveProgress, scrollBgScale, scrollBgY, isMobile } = useParallax();

const STORAGE_KEY = "pikmin-immersive-background";
const SLIDER_TIP_DISMISSED_KEY = "pikmin-ambient-slider-tip-dismissed";
const TIP_SHOWN_KEY = "pikmin-bg-tip-shown";
const showSliderTip = ref(false);
const isDragging = ref(false);
const sliderRef = ref<HTMLElement | null>(null);

const isMapRoute = computed(() => route.path === "/map");
const shouldRenderThree = computed(() => isImmersive.value || immersiveProgress.value > 0.04);
const baseTransform = computed(() => {
  return `translate3d(${bgXSpring.value}px, ${bgYSpring.value}px, 0)`;
});
const imageTransform = computed(() => {
  if (isMobile.value) return "none";

  const tx = isMobile.value ? 0 : bgXSpring.value;
  const ty = isMobile.value ? 0 : (bgYSpring.value + scrollBgY.value);
  return `translate3d(${tx}px, ${ty}px, 0) scale(${scrollBgScale.value})`;
});

let mm: any = null;
let observer: MutationObserver | null = null;
let refreshTimeout: any = null;

const imageFilter = computed(() => {
  return "saturate(0.96) contrast(0.98)";
});

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

const dismissSliderTip = () => {
  showSliderTip.value = false;
  localStorage.setItem(SLIDER_TIP_DISMISSED_KEY, "true");
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
  showSliderTip.value = localStorage.getItem(SLIDER_TIP_DISMISSED_KEY) !== "true";

  const tipShown = localStorage.getItem(TIP_SHOWN_KEY);
  if (!tipShown) {
    setTimeout(() => {
      const toast = useToast();
      toast.info(t('components.ambient_tip'), 3500);
      localStorage.setItem(TIP_SHOWN_KEY, "true");
    }, 1500);
  }

  gsap.registerPlugin(ScrollTrigger);

  mm = gsap.matchMedia();

  // Mobile layout (< 768px): keep ambient background static for scroll performance.
  mm.add("(max-width: 767px)", () => {
    gsap.set(".ambient-bokeh", { clearProps: "transform,opacity,filter" });
  });

  // Desktop layout (>= 768px)
  mm.add("(min-width: 768px)", () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
      }
    });

    // 2. Interactive 3D glass bokeh particles fly past camera on desktop
    tl.fromTo(".bokeh-1", 
      { y: 200, scale: 0.8, opacity: 0.6, filter: "blur(6px)" },
      { y: -600, scale: 2.6, opacity: 0, filter: "blur(26px)", ease: "power1.out" },
      0
    );
    tl.fromTo(".bokeh-2", 
      { y: 250, scale: 0.6, opacity: 0.5, filter: "blur(5px)" },
      { y: -700, scale: 3.0, opacity: 0, filter: "blur(32px)", ease: "power1.out" },
      0
    );
    tl.fromTo(".bokeh-3", 
      { y: 300, scale: 0.9, opacity: 0.7, filter: "blur(8px)" },
      { y: -500, scale: 2.3, opacity: 0, filter: "blur(22px)", ease: "power1.out" },
      0
    );
    tl.fromTo(".bokeh-4", 
      { y: 150, scale: 0.7, opacity: 0.4, filter: "blur(6px)" },
      { y: -800, scale: 3.2, opacity: 0, filter: "blur(35px)", ease: "power1.out" },
      0
    );

    return () => {
      tl.kill();
    };
  });

  // Desktop only: refresh ScrollTriggers when dynamic content changes.
  if (window.matchMedia("(min-width: 768px)").matches) {
    observer = new MutationObserver(() => {
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("pointermove", onSlideMove);
  window.removeEventListener("pointerup", finishSlide);
  window.removeEventListener("pointercancel", finishSlide);
  if (mm) {
    mm.revert();
    mm = null;
  }
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  clearTimeout(refreshTimeout);
});
</script>

<style scoped>
.ambient-background {
  z-index: 0;
  background: #f8fff4;
}

.ambient-base {
  background:
    radial-gradient(circle at 18% 10%, rgb(255 255 255 / 0.18), transparent 24%),
    radial-gradient(circle at 82% 18%, rgb(186 230 253 / 0.08), transparent 28%),
    linear-gradient(160deg, #d6eee4 0%, #bad8cd 44%, #94b5ab 100%);
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
  background-image: url("/img/ambient-glass-sprouts.png?v=bg-20260611");
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  transform-origin: 50% 50%;
  filter: saturate(0.96) contrast(0.98);
  will-change: transform;
}

@media (max-width: 767px) {
  .ambient-background {
    inset: 0 !important;
    height: 100lvh;
    min-height: 100lvh;
    overflow: hidden;
  }

  .ambient-base {
    inset: 0 !important;
    height: 100lvh;
    min-height: 100lvh;
    transform: none !important;
  }

  .ambient-cute {
    inset: 0 !important;
    height: 100lvh;
    min-height: 100lvh;
    background-position: center center;
    background-size: cover;
    transform: none !important;
    will-change: auto;
  }

  .ambient-bokeh-layer,
  .ambient-spores {
    display: none;
  }
}

/* Foreground Bokeh Layer & Particles */
.ambient-bokeh-layer {
  z-index: 1;
  opacity: calc(1 - var(--immersive-progress));
  transition: opacity 0.3s ease;
  transform-style: preserve-3d;
  perspective: 1000px;
}

.ambient-bokeh {
  position: absolute;
  border-radius: 999px;
  mix-blend-mode: screen;
  pointer-events: none;
  will-change: transform, opacity, filter;
}

.bokeh-1 {
  width: 14rem;
  height: 14rem;
  left: 5%;
  bottom: -15rem;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(16, 185, 129, 0.05) 70%, transparent 100%);
}

.bokeh-2 {
  width: 11rem;
  height: 11rem;
  right: 8%;
  bottom: -20rem;
  background: radial-gradient(circle, rgba(34, 211, 238, 0.35) 0%, rgba(34, 211, 238, 0.05) 70%, transparent 100%);
}

.bokeh-3 {
  width: 18rem;
  height: 18rem;
  left: 35%;
  bottom: -25rem;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.02) 75%, transparent 100%);
}

.bokeh-4 {
  width: 9rem;
  height: 9rem;
  left: 20%;
  bottom: -12rem;
  background: radial-gradient(circle, rgba(0, 185, 47, 0.45) 0%, rgba(0, 185, 47, 0.05) 70%, transparent 100%);
}

.ambient-background.is-immersive .ambient-cute {
  background-image: none;
  filter: none;
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
  display: none;
  border-radius: 999px 999px 0 0;
  filter: blur(0.2px);
}

.ambient-background.is-immersive .ambient-hill {
  display: block;
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
  display: none;
  opacity: 0.76;
  filter: drop-shadow(0 18px 28px rgb(6 78 59 / 0.05));
}

.ambient-background.is-immersive .ambient-sprouts {
  display: block;
}

.sprout-lines path {
  stroke-width: 3;
}

.ambient-light {
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.1), rgb(255 255 255 / 0.03) 46%, rgb(255 255 255 / 0.12)),
    radial-gradient(ellipse at 50% -10%, rgb(255 255 255 / 0.18), transparent 44%);
}

@media (min-width: 768px) {
  .ambient-background {
    background: #e9f9f3;
  }

  .ambient-base {
    background:
      radial-gradient(circle at 18% 14%, rgb(255 255 255 / 0.14), transparent 24%),
      radial-gradient(circle at 86% 8%, rgb(186 230 253 / 0.1), transparent 30%),
      linear-gradient(160deg, #cfe8dc 0%, #adcbbf 48%, #8eafa4 100%);
  }

  .ambient-cute {
    opacity: calc(0.98 * (1 - var(--immersive-progress)));
    background-image: none;
    filter: none;
  }

  .ambient-cute::before {
    display: block;
    background-image: url("/img/pc_background_extended.png");
    background-position: center center;
    background-repeat: no-repeat;
    background-size: cover;
    filter: saturate(1.03) brightness(1.03) contrast(0.98);
  }

  .ambient-background.is-immersive .ambient-cute::before {
    display: none;
  }

  .ambient-background.is-immersive .ambient-cute {
    background: transparent;
    filter: none;
  }

  .ambient-background.is-immersive .ambient-light {
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

.ambient-slider-wrap {
  --ambient-slider-height: 5.45rem;
  --ambient-slider-thumb-travel: 3.5rem;
  --ambient-slider-trace-travel: 3.05rem;

  display: grid;
  width: 2.75rem;
  height: 6.35rem;
  place-items: center;
}

.ambient-slider-glass {
  position: absolute;
  inset: -0.38rem;
  border: 1px solid rgb(255 255 255 / 0.56);
  border-radius: 999px;
  background:
    radial-gradient(circle at 50% 14%, rgb(255 255 255 / 0.72), rgb(255 255 255 / 0.22) 42%, rgb(209 250 229 / 0.16)),
    linear-gradient(180deg, rgb(255 255 255 / 0.28), rgb(255 255 255 / 0.08));
  box-shadow:
    0 16px 34px rgb(6 78 59 / 0.12),
    0 1px 12px rgb(255 255 255 / 0.58) inset;
  backdrop-filter: blur(18px) saturate(1.22);
}

.ambient-slider-tooltip {
  position: absolute;
  right: calc(100% + 0.95rem);
  top: 50%;
  width: 19.25rem;
  color: rgb(6 78 59);
  border: 1px solid rgb(255 255 255 / 0.74);
  border-radius: 1.35rem;
  background:
    linear-gradient(135deg, rgb(255 255 255 / 0.92), rgb(236 253 245 / 0.82)),
    radial-gradient(circle at 18% 0%, rgb(255 255 255 / 0.96), transparent 44%);
  box-shadow:
    0 20px 48px rgb(6 78 59 / 0.18),
    0 1px 16px rgb(255 255 255 / 0.7) inset;
  padding: 0.9rem;
  transform: translateY(-50%);
  backdrop-filter: blur(20px) saturate(1.32);
}

.ambient-slider-tooltip::after {
  position: absolute;
  right: -0.38rem;
  top: 50%;
  width: 0.75rem;
  height: 0.75rem;
  content: "";
  border-top: 1px solid rgb(255 255 255 / 0.74);
  border-right: 1px solid rgb(255 255 255 / 0.74);
  background: rgb(236 253 245 / 0.92);
  transform: translateY(-50%) rotate(45deg);
}

.ambient-slider-tooltip-glow {
  position: absolute;
  inset: -0.9rem;
  border-radius: 1.9rem;
  background: radial-gradient(circle at 82% 50%, rgb(52 211 153 / 0.3), transparent 58%);
  filter: blur(10px);
  opacity: 0.9;
}

.ambient-slider-tooltip-icon {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  place-items: center;
  color: white;
  border-radius: 0.9rem;
  background: linear-gradient(135deg, #00c853, #008c3a);
  box-shadow: 0 8px 18px rgb(0 140 58 / 0.22);
}

.ambient-slider-tooltip-title {
  margin: 0;
  font-size: 0.86rem;
  font-weight: 900;
  letter-spacing: 0.02em;
  color: rgb(6 95 70);
}

.ambient-slider-tooltip-text {
  margin-top: 0.18rem;
  font-size: 0.76rem;
  font-weight: 700;
  line-height: 1.55;
  color: rgb(15 118 110 / 0.9);
}

.ambient-slider-tooltip-close {
  display: grid;
  width: 1.65rem;
  height: 1.65rem;
  flex: 0 0 auto;
  place-items: center;
  color: rgb(15 118 110 / 0.72);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.62);
  transition: background 160ms ease, color 160ms ease, transform 160ms ease;
}

.ambient-slider-tooltip-close:hover,
.ambient-slider-tooltip-close:focus-visible {
  color: rgb(6 95 70);
  background: rgb(209 250 229 / 0.88);
  transform: scale(1.04);
}

.ambient-slider-tooltip-close:focus-visible {
  outline: 3px solid rgb(16 185 129 / 0.24);
  outline-offset: 2px;
}

.ambient-slider {
  position: relative;
  width: 1.92rem;
  height: var(--ambient-slider-height);
  cursor: grab;
  touch-action: none;
  user-select: none;
  border-radius: 999px;
  background:
    radial-gradient(circle at 50% calc(16% + 68% * var(--slider-progress)), rgb(0 200 83 / 0.28), rgb(0 92 45 / 0.16) 36%, rgb(0 52 32 / 0.1) 68%, transparent 72%);
  box-shadow:
    0 12px 28px rgb(0 80 45 / 0.18),
    0 1px 10px rgb(255 255 255 / 0.14) inset;
  opacity: 0.96;
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
  outline: 3px solid rgb(0 200 83 / 0.32);
  outline-offset: 5px;
}

.ambient-slider-fill {
  position: absolute;
  left: 50%;
  top: 0.62rem;
  width: 0.2rem;
  height: calc((100% - 1.24rem) * var(--slider-progress));
  transform: translateX(-50%);
  border-radius: 999px;
  background:
    linear-gradient(180deg, rgb(0 200 83 / 0.74), rgb(0 150 64 / 0.86)),
    radial-gradient(circle at 50% 100%, rgb(255 255 255 / 0.7), transparent 42%);
  box-shadow:
    0 0 16px rgb(0 200 83 / 0.36),
    0 1px 7px rgb(255 255 255 / 0.44) inset;
}

.ambient-slider::before {
  position: absolute;
  left: 50%;
  top: 0.58rem;
  width: 0.12rem;
  height: calc(100% - 1.16rem);
  content: "";
  border-radius: 999px;
  background: linear-gradient(180deg, rgb(0 200 83 / 0.16), rgb(0 70 42 / 0.4), rgb(0 200 83 / 0.16));
  transform: translateX(-50%);
}

.ambient-slider-secret-glow {
  position: absolute;
  inset: -0.55rem;
  border-radius: 999px;
  background: radial-gradient(circle at 50% calc(22% + 46% * var(--slider-progress)), rgb(0 200 83 / 0.3), transparent 46%);
  opacity: calc(0.42 + var(--slider-progress) * 0.44);
  filter: blur(8px);
}

.ambient-slider-thumb {
  position: absolute;
  left: 50%;
  top: 0.2rem;
  z-index: 2;
  display: grid;
  width: 1.55rem;
  height: 1.55rem;
  place-items: center;
  color: white;
  border-radius: 999px;
  background:
    radial-gradient(circle at 30% 18%, rgb(255 255 255 / 0.34), transparent 34%),
    linear-gradient(135deg, #00c853 0%, #00a344 48%, #007a35 100%);
  box-shadow:
    0 7px 16px rgb(0 70 42 / 0.28),
    0 0 20px rgb(0 200 83 / 0.38),
    0 1px 8px rgb(255 255 255 / 0.36) inset;
  transform: translateX(-50%) translateY(calc(var(--ambient-slider-thumb-travel) * var(--slider-progress)));
  animation: ambient-slider-invite 3.8s ease-in-out infinite;
}

.ambient-slider::after {
  position: absolute;
  left: 50%;
  top: 0.56rem;
  width: 0.29rem;
  height: 0.29rem;
  content: "";
  border-radius: 999px;
  background: rgb(34 197 94 / 0.95);
  box-shadow: 0 0 14px rgb(0 200 83 / 0.52);
  transform: translateX(-50%);
  animation: ambient-slider-trace 3.8s ease-in-out infinite;
}

.ambient-slider.is-dragging .ambient-slider-thumb,
.ambient-slider.is-dragging::after,
.ambient-slider.is-immersive .ambient-slider-thumb,
.ambient-slider.is-immersive::after {
  animation: none;
}

@media (max-width: 640px) {
  .ambient-slider-wrap {
    right: 1rem;
    top: 12.2rem;
  }

  .ambient-slider-tooltip {
    right: calc(100% + 0.55rem);
    top: 0.2rem;
    width: min(10.75rem, calc(100vw - 6rem));
    padding: 0.58rem 0.62rem;
    border-radius: 1rem;
    transform: none;
  }

  .ambient-slider-tooltip::after {
    right: -0.34rem;
    top: 1.15rem;
    bottom: auto;
    width: 0.66rem;
    height: 0.66rem;
    transform: rotate(45deg);
  }

  .ambient-slider-tooltip .relative {
    gap: 0.45rem;
  }

  .ambient-slider-tooltip-icon {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 0.72rem;
  }

  .ambient-slider-tooltip-title {
    font-size: 0.74rem;
  }

  .ambient-slider-tooltip-text {
    margin-top: 0.08rem;
    font-size: 0.63rem;
    line-height: 1.35;
  }

  .ambient-slider-tooltip-close {
    width: 1.35rem;
    height: 1.35rem;
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

@keyframes ambient-slider-invite {
  0%,
  68%,
  100% {
    transform: translateX(-50%) translateY(calc(var(--ambient-slider-thumb-travel) * var(--slider-progress))) scale(1);
  }

  78% {
    transform: translateX(-50%) translateY(calc(var(--ambient-slider-thumb-travel) * var(--slider-progress) + 0.42rem)) scale(1.04);
  }

  88% {
    transform: translateX(-50%) translateY(calc(var(--ambient-slider-thumb-travel) * var(--slider-progress))) scale(1);
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
    opacity: 0.85;
  }

  92% {
    opacity: 0;
    transform: translateX(-50%) translateY(var(--ambient-slider-trace-travel)) scale(1.05);
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
