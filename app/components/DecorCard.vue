<template>
  <div
    ref="cardRoot"
    role="button"
    tabindex="0"
    :aria-pressed="isCollected"
    @keydown.enter.prevent="handleClick"
    @keydown.space.prevent="handleClick"
    @click="handleClick"
    class="decor-card relative group cursor-pointer"
  >
    <div
      class="decor-card-shell relative bg-white/80 rounded-2xl overflow-hidden z-10 border"
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

        <div v-if="showRareSweep" class="rare-sweep pointer-events-none" aria-hidden="true" />

        <!-- Image -->
        <img
          v-if="imageUrl && !hasError"
          :src="imageUrl"
          :alt="`${locale === 'en' ? variant?.nameEn : variant?.name} ${t('pikmin_types.' + pikminType)}`"
          class="decor-image relative w-full h-full object-contain"
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
          leave-active-class="transition-opacity duration-150"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="!isCollected"
            class="absolute inset-0 bg-slate-400/18 pointer-events-none flex items-center justify-center"
          >
            <!-- Lock Icon (SVG) -->
            <div class="w-9 h-9 rounded-full bg-slate-500/28 flex items-center justify-center ring-1 ring-white/30">
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
          class="rare-sparkle absolute top-2 left-2 text-yellow-400"
        >
          <Icon name="lucide:sparkles" class="w-5 h-5 drop-shadow-sm" />
        </div>

        <!-- Collected Checkmark -->
          <div
            v-if="isCollected"
            class="decor-checkmark absolute bottom-2 right-2 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/80"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>

        <!-- Hover overlay -->
        <div
          class="absolute inset-0 transition-colors duration-300 rounded-lg pointer-events-none"
          :class="isCollected ? 'bg-emerald-500/0 group-hover:bg-emerald-500/8' : 'bg-slate-900/0 group-hover:bg-slate-900/6'"
        ></div>
      </div>

      <!-- Info Section -->
      <div
        class="p-3 text-center border-t"
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

  </div>
</template>

<script setup lang="ts">
import type { PikminType } from '~/types/decor';
import { PIKMIN_TYPE_COLORS } from '~/types/decor';
import { gsap } from 'gsap';
import { collectionMotion as motion, collectionMotionEnabled } from '~/utils/collectionMotion';

const props = defineProps<{
  itemId: string;
  categoryId: string;
  variantId: string;
  pikminType: PikminType;
}>();

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
const cardRoot = ref<HTMLElement | null>(null);
const showRareSweep = ref(false);
let feedback: gsap.core.Timeline | undefined;
let feedbackVersion = 0;
let disposed = false;

const pikminTypeShort = computed(() => {
  return t(`pikmin_types_short.${props.pikminType}`);
});

const pikminBadgeClass = computed(() => {
  const baseClass = PIKMIN_TYPE_COLORS[props.pikminType];
  const textClass = props.pikminType === 'white' || props.pikminType === 'yellow' ? 'text-gray-800' : 'text-white';
  return `${baseClass} ${textClass}`;
});

const handleClick = async () => {
  const version = ++feedbackVersion;
  // Finish the previous gesture before replaying; repeated clicks never stack effects.
  feedback?.progress(1).kill();
  const collected = toggleCollected(props.itemId);
  showRareSweep.value = collected && isRareVariant.value && collectionMotionEnabled();
  if (collected) toast.success(t('components.toast.saved'), 1200);
  else toast.info(t('components.toast.removed'), 1200);
  emit('toggle', props.itemId);

  await nextTick();
  const root = cardRoot.value;
  if (disposed || version !== feedbackVersion || !root || !collectionMotionEnabled()) return;
  const shell = root.querySelector<HTMLElement>('.decor-card-shell');
  const image = root.querySelector<HTMLElement>('.decor-image');
  const checkmark = root.querySelector<HTMLElement>('.decor-checkmark');
  const sweep = root.querySelector<HTMLElement>('.rare-sweep');
  if (!shell) return;

  feedback = gsap.timeline({
    defaults: { ease: motion.ease },
    onComplete: () => { showRareSweep.value = false; },
  });
  feedback.fromTo(shell, { scale: 0.97 }, {
    scale: 1, duration: collected ? motion.settle : motion.exit,
    ease: collected ? motion.spring : motion.ease, clearProps: 'transform',
  }, 0);
  if (collected && image) {
    feedback.to(image, { y: -6, duration: motion.press }, 0)
      .to(image, { y: 0, duration: motion.enter, clearProps: 'transform' }, motion.press);
  }
  if (collected && checkmark) {
    feedback.fromTo(checkmark, { scale: 0.6, opacity: 0 }, {
      scale: 1, opacity: 1, duration: motion.enter, ease: motion.spring, clearProps: 'transform,opacity',
    }, motion.press);
  }
  if (collected && sweep) {
    feedback.fromTo(sweep, { xPercent: -100, opacity: 0 }, {
      xPercent: 100, opacity: 0.7, duration: motion.settle,
    }, 0).to(sweep, { opacity: 0, duration: motion.press }, motion.settle);
  }
};

const handleImageError = () => {
  hasError.value = true;
};

onBeforeUnmount(() => {
  disposed = true;
  feedbackVersion += 1;
  feedback?.kill();
});
</script>

<style scoped>
.decor-card {
  border-radius: 1rem;
}

.decor-card:focus-visible {
  outline: 3px solid #047857;
  outline-offset: 4px;
}

.decor-card-shell {
  transition: border-color var(--collection-motion-fast, 0.18s), background-color var(--collection-motion-fast, 0.18s);
}

.decor-image-stage { isolation: isolate; }
.decor-image { transition: opacity var(--collection-motion-fast, 0.18s); }

/* A single transform-only accent for rare finds; no persistent particles or blur animation. */
.rare-sweep {
  position: absolute;
  inset: 0;
  z-index: 3;
  background: linear-gradient(110deg, transparent 25%, rgb(253 230 138 / 0.7) 50%, transparent 75%);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .decor-card *, .decor-card-shell, .decor-image { transition: none !important; animation: none !important; }
}
</style>
