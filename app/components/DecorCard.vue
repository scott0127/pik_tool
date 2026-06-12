<template>
  <div
    @click="handleClick"
    class="relative group cursor-pointer pop-in"
    :class="{
      'decor-unlocked-now': isUnlocking,
      'decor-removing': isRemoving,
      'decor-rare-unlock': isUnlocking && isRareVariant,
    }"
    :style="{ animationDelay: `${animationDelay}ms` }"
  >
    <div
      class="decor-card-shell relative bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300 z-10 border"
      :class="borderShadowClass"
    >
      <!-- Image Container -->
      <div
        class="decor-image-stage relative aspect-square p-3 overflow-hidden"
        :class="bgGradientClass"
      >
        <!-- Background pattern -->
        <div class="absolute inset-0" :class="patternOpacityClass">
          <div
            class="absolute inset-0"
            :style="patternStyle"
          ></div>
        </div>

        <!-- Unlock-only effects -->
        <div v-if="isUnlocking" class="unlock-ring pointer-events-none" />
        <div v-if="isUnlocking && isRareVariant" class="rare-sweep pointer-events-none" />
        <div v-if="isUnlocking" class="unlock-particles pointer-events-none" aria-hidden="true">
          <span
            v-for="particle in unlockParticles"
            :key="particle.id"
            class="unlock-particle"
            :class="isRareVariant ? 'unlock-particle-gold' : 'unlock-particle-emerald'"
            :style="{
              '--particle-x': particle.x,
              '--particle-y': particle.y,
              '--particle-delay': particle.delay,
            }"
          />
        </div>

        <!-- Image -->
        <img
          v-if="imageUrl && !hasError"
          :src="imageUrl"
          :alt="`${locale === 'en' ? variant?.nameEn : variant?.name} ${t('pikmin_types.' + pikminType)}`"
          class="decor-image relative w-full h-full object-contain transform group-hover:scale-110 transition-all duration-300"
          :class="isCollected ? 'opacity-100 saturate-[1.02]' : 'opacity-[0.45] grayscale-[70%] saturate-[0.3]'"
          loading="lazy"
          referrerpolicy="no-referrer"
          @error="handleImageError"
        >
        <div
          v-else
          class="w-full h-full flex items-center justify-center text-5xl"
        >
          <Icon :name="category?.icon || 'line-md:question-circle'" class="text-4xl" />
        </div>

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="lock-release-transition"
          leave-from-class="opacity-100 scale-100 rotate-0"
          leave-to-class="opacity-0 scale-0 rotate-12"
        >
          <div
            v-if="!isCollected"
            class="absolute inset-0 bg-slate-400/18 sm:backdrop-blur-[1px] pointer-events-none flex items-center justify-center"
          >
            <!-- Lock Icon (SVG) -->
            <div class="w-9 h-9 rounded-full bg-slate-500/28 sm:backdrop-blur-sm flex items-center justify-center ring-1 ring-white/30">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5 text-slate-500/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
          </div>
        </Transition>

        <!-- Pikmin Type Badge -->
        <div
          class="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shadow-lg ring-1 ring-white/70 transform group-hover:scale-110 transition-transform"
          :class="[pikminBadgeClass, !isCollected && 'opacity-50 saturate-50']"
        >
          {{ pikminTypeShort }}
        </div>

        <!-- Rare Sparkle -->
        <div
          v-if="variant?.isRare"
          class="rare-sparkle absolute top-2 left-2 text-yellow-400 sparkle"
        >
          <Icon name="lucide:sparkles" class="w-5 h-5 drop-shadow-sm" />
        </div>

        <!-- Collected Checkmark -->
        <Transition
          enter-active-class="checkmark-pop-transition"
          enter-from-class="scale-0 rotate-180 opacity-0"
          enter-to-class="scale-100 rotate-0 opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="scale-100 rotate-0 opacity-100"
          leave-to-class="scale-0 rotate-180 opacity-0"
        >
          <div
            v-if="isCollected"
            class="absolute bottom-2 right-2 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/80"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </Transition>

        <!-- Hover overlay -->
        <div
          class="absolute inset-0 transition-colors duration-300 rounded-lg pointer-events-none"
          :class="isCollected ? 'bg-emerald-500/0 group-hover:bg-emerald-500/8' : 'bg-slate-900/0 group-hover:bg-slate-900/6'"
        ></div>
      </div>

      <!-- Info Section -->
      <div
        class="p-3 text-center border-t sm:backdrop-blur-sm"
        :class="isCollected
          ? 'bg-white/93 border-white/70'
          : 'bg-slate-50/90 border-slate-200/50'"
      >
        <p
          class="text-sm font-extrabold truncate"
          :class="isCollected ? 'text-slate-900' : 'text-slate-400'"
          :title="locale === 'en' ? variant?.nameEn : variant?.name"
        >
          {{ (locale === 'en' ? variant?.nameEn : variant?.name) || 'Unknown' }}
        </p>
        <p
          class="text-xs truncate mt-0.5 font-semibold"
          :class="isCollected ? 'text-slate-700' : 'text-slate-400'"
          :title="locale === 'en' ? variant?.name : variant?.nameEn"
        >
          {{ (locale === 'en' ? variant?.name : variant?.nameEn) || '' }}
        </p>
      </div>
    </div>

    <!-- Click ripple effect -->
    <Transition
      enter-active-class="transition duration-500"
      enter-from-class="scale-0 opacity-100"
      enter-to-class="scale-150 opacity-0"
      leave-active-class="transition duration-0"
    >
      <div
        v-if="showRipple"
        class="absolute inset-0 rounded-2xl pointer-events-none"
        :class="isRemoving ? 'bg-slate-400/24' : 'bg-emerald-400/30'"
      ></div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { PikminType } from '~/types/decor';
import { PIKMIN_TYPE_COLORS } from '~/types/decor';

const props = withDefaults(defineProps<{
  itemId: string;
  categoryId: string;
  variantId: string;
  pikminType: PikminType;
  animationDelay?: number;
}>(), {
  animationDelay: 0
});

const emit = defineEmits<{
  toggle: [itemId: string];
}>();

const { isCollected: checkCollected, toggleCollected } = useCollection();
const { getVariant, getCategory, getImageUrl } = useDecorData();
const toast = useToast();
const { t, locale } = useI18n();

const variant = computed(() => getVariant(props.categoryId, props.variantId));
const category = computed(() => getCategory(props.categoryId));
const isCollected = computed(() => checkCollected(props.itemId));
const imageUrl = computed(() => getImageUrl(props.categoryId, props.variantId, props.pikminType));
const isRareVariant = computed(() => props.variantId.toLowerCase().includes('rare'));

const borderShadowClass = computed(() => {
  if (isRareVariant.value) {
    return isCollected.value
      ? 'border-yellow-300/90 shadow-[0_14px_34px_rgba(146,64,14,0.28)] rare-golden-glow'
      : 'border-slate-300/50 shadow-[0_6px_16px_rgba(15,23,42,0.1)]';
  } else {
    return isCollected.value
      ? 'border-emerald-300/90 shadow-[0_12px_30px_rgba(5,150,105,0.24)]'
      : 'border-slate-300/50 shadow-[0_6px_16px_rgba(15,23,42,0.1)]';
  }
});

const bgGradientClass = computed(() => {
  if (isRareVariant.value) {
    return isCollected.value
      ? 'bg-gradient-to-br from-amber-50/92 via-yellow-50/86 to-orange-50/84'
      : 'bg-gradient-to-br from-slate-100/88 via-gray-50/82 to-slate-50/78';
  } else {
    return isCollected.value
      ? 'bg-gradient-to-br from-white/92 via-emerald-50/84 to-teal-50/80'
      : 'bg-gradient-to-br from-slate-100/88 via-gray-50/82 to-slate-50/78';
  }
});

const patternOpacityClass = computed(() => {
  if (isRareVariant.value) {
    return isCollected.value ? 'opacity-10' : 'opacity-[0.04]';
  } else {
    return isCollected.value ? 'opacity-5' : 'opacity-[0.03]';
  }
});

const patternStyle = computed(() => {
  if (isCollected.value) {
    return isRareVariant.value
      ? 'background-image: radial-gradient(circle, #fbbf24 1px, transparent 1px); background-size: 16px 16px;'
      : 'background-image: radial-gradient(circle, #00b92f 1px, transparent 1px); background-size: 20px 20px;';
  } else {
    return 'background-image: radial-gradient(circle, #94a3b8 1px, transparent 1px); background-size: 20px 20px;';
  }
});
const hasError = ref(false);
const showRipple = ref(false);
const isUnlocking = ref(false);
const isRemoving = ref(false);
let feedbackTimer: ReturnType<typeof setTimeout> | null = null;
let unlockTimer: ReturnType<typeof setTimeout> | null = null;
let removingTimer: ReturnType<typeof setTimeout> | null = null;

const unlockParticles = [
  { id: 1, x: '-2.35rem', y: '-1.55rem', delay: '0ms' },
  { id: 2, x: '-1.15rem', y: '-2.55rem', delay: '40ms' },
  { id: 3, x: '1.25rem', y: '-2.4rem', delay: '70ms' },
  { id: 4, x: '2.35rem', y: '-0.95rem', delay: '20ms' },
  { id: 5, x: '-2rem', y: '1.3rem', delay: '95ms' },
  { id: 6, x: '2rem', y: '1.45rem', delay: '115ms' },
  { id: 7, x: '0.15rem', y: '-3rem', delay: '130ms' },
  { id: 8, x: '0.3rem', y: '2.55rem', delay: '150ms' },
];

const pikminTypeShort = computed(() => {
  return t(`pikmin_types_short.${props.pikminType}`);
});

const pikminBadgeClass = computed(() => {
  const baseClass = PIKMIN_TYPE_COLORS[props.pikminType];
  const textClass = props.pikminType === 'white' || props.pikminType === 'yellow' ? 'text-gray-800' : 'text-white';
  return `${baseClass} ${textClass}`;
});

const clearFeedbackTimers = () => {
  if (feedbackTimer) clearTimeout(feedbackTimer);
  if (unlockTimer) clearTimeout(unlockTimer);
  if (removingTimer) clearTimeout(removingTimer);
};

const triggerUnlockMoment = () => {
  isRemoving.value = false;
  isUnlocking.value = false;
  requestAnimationFrame(() => {
    isUnlocking.value = true;
    unlockTimer = setTimeout(() => {
      isUnlocking.value = false;
    }, 920);
  });
};

const triggerRemoveMoment = () => {
  isUnlocking.value = false;
  isRemoving.value = true;
  removingTimer = setTimeout(() => {
    isRemoving.value = false;
  }, 360);
};

const handleClick = () => {
  clearFeedbackTimers();

  showRipple.value = true;
  feedbackTimer = setTimeout(() => {
    showRipple.value = false;
  }, 500);

  const wasCollected = isCollected.value;
  const isNowCollected = toggleCollected(props.itemId);

  if (!wasCollected && isNowCollected) {
    triggerUnlockMoment();
    toast.success(t('components.toast.saved'), 1200);
  } else {
    triggerRemoveMoment();
    toast.info(t('components.toast.removed'), 1200);
  }

  emit('toggle', props.itemId);
};

const handleImageError = () => {
  hasError.value = true;
};

onBeforeUnmount(() => {
  clearFeedbackTimers();
});
</script>

<style scoped>
.decor-card-shell {
  /* Removed persistent will-change to save GPU memory on mobile devices */
}

@media (max-width: 640px) {
  .decor-card-shell {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
}

.pop-in {
  animation: decor-stream-in 520ms cubic-bezier(0.19, 1, 0.22, 1) both;
}

.decor-image-stage {
  isolation: isolate;
}

.decor-unlocked-now .decor-card-shell {
  animation: decor-unlock-pop 720ms cubic-bezier(0.2, 0.92, 0.28, 1.18);
}

.decor-unlocked-now .decor-image {
  animation: decor-unlock-reveal 680ms ease-out;
}

.decor-removing .decor-card-shell {
  animation: decor-remove-press 320ms ease-out;
}

.unlock-ring {
  position: absolute;
  inset: 50% auto auto 50%;
  z-index: 2;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  border: 2px solid rgb(16 185 129 / 0.44);
  background: radial-gradient(circle, rgb(236 253 245 / 0.55), rgb(16 185 129 / 0.14) 50%, transparent 72%);
  box-shadow:
    0 0 18px rgb(16 185 129 / 0.28),
    0 0 42px rgb(45 212 191 / 0.22);
  transform: translate(-50%, -50%) scale(0.24);
  animation: decor-unlock-ring 680ms ease-out forwards;
}

.decor-rare-unlock .unlock-ring {
  border-color: rgb(251 191 36 / 0.58);
  background: radial-gradient(circle, rgb(255 251 235 / 0.68), rgb(251 191 36 / 0.2) 52%, transparent 74%);
  box-shadow:
    0 0 20px rgb(251 191 36 / 0.38),
    0 0 48px rgb(245 158 11 / 0.26);
}

.rare-sweep {
  position: absolute;
  inset: -20% -70%;
  z-index: 3;
  background: linear-gradient(110deg, transparent 36%, rgb(255 255 255 / 0.2) 44%, rgb(253 230 138 / 0.62) 50%, rgb(255 255 255 / 0.24) 56%, transparent 66%);
  transform: translateX(-52%) rotate(8deg);
  animation: decor-rare-sweep 760ms ease-out forwards;
  mix-blend-mode: screen;
}

.unlock-particles {
  position: absolute;
  inset: 0;
  z-index: 4;
}

.unlock-particle {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 999px;
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.2);
  animation: decor-unlock-particle 720ms cubic-bezier(0.16, 0.84, 0.44, 1) forwards;
  animation-delay: var(--particle-delay);
}

.unlock-particle::after {
  position: absolute;
  inset: -0.12rem;
  content: '';
  border-radius: 999px;
  background: inherit;
  filter: blur(5px);
  opacity: 0.58;
}

.unlock-particle-emerald {
  background: radial-gradient(circle, #ffffff 0 22%, #6ee7b7 34%, #10b981 68%, transparent 70%);
  box-shadow: 0 0 12px rgb(16 185 129 / 0.38);
}

.unlock-particle-gold {
  background: radial-gradient(circle, #ffffff 0 20%, #fde68a 36%, #f59e0b 68%, transparent 70%);
  box-shadow: 0 0 14px rgb(245 158 11 / 0.44);
}

.checkmark-pop-transition {
  animation: checkmark-unlock-pop 420ms cubic-bezier(0.18, 0.92, 0.26, 1.22);
}

.lock-release-transition {
  transition: opacity 220ms ease, transform 280ms cubic-bezier(0.2, 0.88, 0.28, 1.18), backdrop-filter 220ms ease;
}

.decor-rare-unlock .rare-sparkle {
  animation: rare-sparkle-unlock 850ms ease-out;
}

@keyframes decor-unlock-pop {
  0% {
    transform: scale(0.98);
  }
  32% {
    transform: scale(1.045) translateY(-2px);
  }
  62% {
    transform: scale(0.992) translateY(0);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes decor-stream-in {
  from {
    opacity: 0;
    transform: translate3d(0, 14px, 0) scale(0.96);
  }

  58% {
    opacity: 1;
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .pop-in {
    animation: none;
  }
}

@keyframes decor-remove-press {
  0% {
    transform: scale(1);
  }
  42% {
    transform: scale(0.975);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes decor-unlock-reveal {
  0% {
    filter: grayscale(0.7) saturate(0.45) brightness(0.96);
    transform: scale(0.96);
  }
  44% {
    filter: grayscale(0) saturate(1.22) brightness(1.1);
    transform: scale(1.08);
  }
  100% {
    filter: grayscale(0) saturate(1.02) brightness(1);
    transform: scale(1);
  }
}

@keyframes decor-unlock-ring {
  0% {
    opacity: 0.92;
    transform: translate(-50%, -50%) scale(0.18);
  }
  72% {
    opacity: 0.34;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(5.2);
  }
}

@keyframes decor-unlock-particle {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.2);
  }
  24% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--particle-x)), calc(-50% + var(--particle-y))) scale(1.08);
  }
}

@keyframes decor-rare-sweep {
  0% {
    opacity: 0;
    transform: translateX(-58%) rotate(8deg);
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateX(58%) rotate(8deg);
  }
}

@keyframes checkmark-unlock-pop {
  0% {
    opacity: 0;
    transform: scale(0) rotate(180deg);
  }
  58% {
    opacity: 1;
    transform: scale(1.18) rotate(-8deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes rare-sparkle-unlock {
  0%, 100% {
    transform: scale(1) rotate(0deg);
    filter: drop-shadow(0 0 0 rgb(251 191 36 / 0));
  }
  42% {
    transform: scale(1.28) rotate(14deg);
    filter: drop-shadow(0 0 12px rgb(251 191 36 / 0.72));
  }
}

@media (prefers-reduced-motion: reduce) {
  .decor-unlocked-now .decor-card-shell,
  .decor-unlocked-now .decor-image,
  .decor-removing .decor-card-shell,
  .rare-sweep,
  .unlock-ring,
  .unlock-particle,
  .decor-rare-unlock .rare-sparkle,
  .checkmark-pop-transition {
    animation: none;
  }
}
</style>
