<template>
  <div
    ref="cardRoot"
    role="button"
    tabindex="0"
    :aria-pressed="isCollected"
    :aria-label="cardLabel"
    @keydown.enter.prevent="handleClick"
    @keydown.space.prevent="handleClick"
    @click="handleClick"
    class="decor-card"
    :class="{ 'is-collected': isCollected, 'is-rare': isRareVariant }"
  >
    <div class="decor-card-shell">
      <div class="decor-image-stage">

        <img
          v-if="imageUrl && !hasError"
          :src="imageUrl"
          :alt="`${variantName} ${t('pikmin_types.' + pikminType)}`"
          class="decor-image"
          loading="lazy"
          decoding="async"
          referrerpolicy="no-referrer"
          @error="handleImageError"
        >
        <div v-else class="decor-image decor-image-fallback">
          <Icon :name="category?.icon || 'line-md:question-circle'" />
        </div>

        <span class="decor-type-badge" :title="t('pikmin_types.' + pikminType)"><span class="decor-color-dot" :class="pikminBadgeClass" aria-hidden="true" />{{ t('pikmin_types.' + pikminType) }}</span>
        <span v-if="isRareVariant" class="decor-rare-label">{{ copy.rare }}</span>
      </div>

      <div class="decor-card-info">
        <p class="decor-card-name" :title="variantName">{{ variantName }}</p>
        <p class="decor-card-translation" :title="variantOtherName">{{ variantOtherName }}</p>
        <div class="decor-card-status" aria-hidden="true">
          <span class="decor-uncollected-label">{{ copy.collect }}</span>
          <span class="decor-collected-stamp">
            <span class="decor-stamp-check" />
            {{ copy.collected }}
          </span>
        </div>
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
const isRareVariant = computed(() => Boolean(variant.value?.isRare) || props.variantId.toLowerCase().includes('rare'));
const variantName = computed(() => (locale.value === 'en' ? variant.value?.nameEn : variant.value?.name) || 'Unknown');
const variantOtherName = computed(() => (locale.value === 'en' ? variant.value?.name : variant.value?.nameEn) || '');
const copy = computed(() => locale.value === 'en'
  ? { rare: 'Rare', collect: 'Not collected', collected: 'Collected', remove: 'Remove from collection' }
  : { rare: '稀有', collect: '未收藏', collected: '已收藏', remove: '取消收藏' });
const cardLabel = computed(() => `${variantName.value} ${t('pikmin_types.' + props.pikminType)} · ${isCollected.value ? copy.value.remove : copy.value.collect}`);
const pikminTypeShort = computed(() => t(`pikmin_types_short.${props.pikminType}`));
const pikminBadgeClass = computed(() => {
  const textClass = props.pikminType === 'white' || props.pikminType === 'yellow' ? 'text-gray-800' : 'text-white';
  return `${PIKMIN_TYPE_COLORS[props.pikminType]} ${textClass}`;
});

const hasError = ref(false);
const cardRoot = ref<HTMLElement | null>(null);
let feedbackContext: gsap.Context | undefined;
let feedbackVersion = 0;
let disposed = false;
let motionPreference: MediaQueryList | undefined;

// Reverting the gesture reveals the current CSS state and releases its DOM references.
const clearFeedback = () => {
  feedbackContext?.revert();
  feedbackContext = undefined;
};

const handleClick = async () => {
  const version = ++feedbackVersion;
  clearFeedback();
  const collected = toggleCollected(props.itemId);
  if (collected) toast.success(t('components.toast.saved'), 1200);
  else toast.info(t('components.toast.removed'), 1200);
  emit('toggle', props.itemId);

  await nextTick();
  const root = cardRoot.value;
  if (disposed || version !== feedbackVersion || collected !== isCollected.value || !root || !collectionMotionEnabled()) return;

  feedbackContext = gsap.context(() => {
    const shell = root.querySelector<HTMLElement>('.decor-card-shell');
    const image = root.querySelector<HTMLElement>('.decor-image');
    const pocket = root.querySelector<HTMLElement>('.decor-pocket');
    const stamp = root.querySelector<HTMLElement>('.decor-collected-stamp');
    const label = root.querySelector<HTMLElement>('.decor-uncollected-label');
    if (!shell || !stamp) return;

    const timeline = gsap.timeline({ defaults: { ease: motion.ease } });
    timeline.fromTo(shell, { y: 1, scale: 0.98 }, {
      y: 0, scale: 1, duration: motion.settle, clearProps: 'transform',
    }, 0);

    if (collected) {
      // The specimen settles behind the pocket before the ownership stamp lands.
      if (image) timeline.to(image, { y: 5, scale: 0.96, duration: motion.press }, 0)
        .to(image, { y: 0, scale: 1, duration: motion.settle, clearProps: 'transform' }, motion.press);
      if (pocket) timeline.fromTo(pocket, { y: 2 }, {
        y: 0, duration: motion.enter, clearProps: 'transform',
      }, motion.press);
      timeline.fromTo(stamp, { y: -12, rotation: -16, scale: 1.55, opacity: 0 }, {
        y: 0, rotation: 0, scale: 1, opacity: 1,
        duration: motion.enter, ease: motion.spring, clearProps: 'transform,opacity',
      }, motion.press);
    } else {
      // Lift the old stamp away, then expose the invitation underneath it.
      if (label) timeline.fromTo(label, { opacity: 0 }, {
        opacity: 1, duration: motion.enter, clearProps: 'opacity',
      }, motion.press);
      timeline.fromTo(stamp, { y: 0, rotation: -3, scale: 1, opacity: 1 }, {
        y: -9, rotation: -10, scale: 1.08, opacity: 0,
        duration: motion.exit, clearProps: 'transform,opacity',
      }, 0);
      if (image) timeline.fromTo(image, { y: 3 }, {
        y: 0, duration: motion.enter, clearProps: 'transform',
      }, motion.press);
    }
  }, root);
};

const handleImageError = () => { hasError.value = true; };
const handleMotionPreference = () => {
  if (motionPreference?.matches) {
    feedbackVersion += 1;
    clearFeedback();
  }
};

watch(imageUrl, () => { hasError.value = false; });
// Bulk collection and cloud updates should also settle any gesture already running.
watch(isCollected, clearFeedback, { flush: 'sync' });
onMounted(() => {
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  motionPreference.addEventListener('change', handleMotionPreference);
});
onBeforeUnmount(() => {
  disposed = true;
  feedbackVersion += 1;
  clearFeedback();
  motionPreference?.removeEventListener('change', handleMotionPreference);
});
</script>

<style scoped>
.decor-card { position: relative; width: 100%; min-width: 0; cursor: pointer; touch-action: manipulation; border-radius: .65rem; -webkit-tap-highlight-color: transparent; }
.decor-card:focus-visible { outline: 3px solid #10b981; outline-offset: 3px; }
.decor-card-shell { position: relative; padding: .4rem; border: 1px solid #e4e5da; border-radius: .65rem; background: #fbfaf4; transition: border-color .18s, background .18s; overflow: hidden; }
.is-collected .decor-card-shell { border-color: #b9ddcd; background: #fffdf7; }.is-rare .decor-card-shell { border-top-color: #d8bd83; }.decor-card:active .decor-card-shell { border-color: #10b981; }
.decor-image-stage { position: relative; aspect-ratio: 1 / 1.08; padding-bottom: 1.2rem; }
.decor-image { position: absolute; top: 3%; left: 5%; width: 90%; height: calc(94% - 1.2rem); object-fit: contain; opacity: .78; transition: opacity .18s; }.is-collected .decor-image { opacity: 1; }.decor-image-fallback { display: grid; place-items: center; color: #819680; font-size: 1.75rem; }
.decor-type-badge { position: absolute; bottom: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: center; gap: .25rem; color: #526e5e; font-size: .7rem; font-weight: 650; line-height: 1.5; white-space: nowrap; }
.decor-color-dot { display: block; width: .5rem; height: .5rem; flex-shrink: 0; border: 1px solid #24463d18; border-radius: 50%; }
.decor-rare-label { position: absolute; top: 1px; left: 1px; padding: 1px 4px; border: 1px solid #e4d4a7; border-radius: .2rem; background: #fff6dc; color: #997038; font-size: .6rem; font-weight: 650; }
.decor-card-info { padding: .35rem .05rem .1rem; text-align: center; }
.decor-card-name { display: -webkit-box; min-height: 2.7em; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; color: #264b3c; font-size: .75rem; font-weight: 650; line-height: 1.35; overflow-wrap: anywhere; }
.decor-card-translation { display: none; }
.decor-card-status { position: relative; display: grid; place-items: center; height: 26px; margin-top: .3rem; }
.decor-uncollected-label { color: #8a9484; font-size: .68rem; }.is-collected .decor-uncollected-label { opacity: 0; }
.decor-collected-stamp { position: absolute; display: inline-flex; align-items: center; justify-content: center; gap: .25rem; max-width: 100%; padding: .3rem .45rem; border-radius: 99px; background: #10b981; color: #fff; font-size: .67rem; font-weight: 650; line-height: 1; opacity: 0; white-space: nowrap; pointer-events: none; }.is-collected .decor-collected-stamp { opacity: 1; }
.decor-stamp-check { display: block; width: 8px; height: 5px; margin-top: -2px; border-bottom: 1.5px solid currentColor; border-left: 1.5px solid currentColor; transform: rotate(-45deg); }
@media(min-width:640px) { .decor-card-translation { display: block; margin-top: .15rem; min-height: 1.35em; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; color: #8c9785; font-size: .6rem; }.decor-card-shell { padding: .5rem; }.decor-card-name { font-size: .78rem; } }
@media(prefers-reduced-motion:reduce) { .decor-card * { transition: none!important; } }
</style>
