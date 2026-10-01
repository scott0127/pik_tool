<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { gsap } from 'gsap';

const props = withDefaults(defineProps<{
  variant: 'book' | 'garden';
  reducedMotion?: boolean;
  speed?: number;
}>(), { reducedMotion: false, speed: 1 });

const emit = defineEmits<{ change: [selected: boolean] }>();
const root = ref<HTMLElement | null>(null);
const selected = ref(false);
const systemReduced = ref(false);
const reduce = computed(() => props.reducedMotion || systemReduced.value);
const title = computed(() => props.variant === 'book' ? '書店' : '花店');
let context: gsap.Context | undefined;
let timeline: gsap.core.Timeline | undefined;
let pressTimeline: gsap.core.Timeline | undefined;
let preference: MediaQueryList | undefined;

function syncMotion() {
  if (!timeline) return;
  const motionSpeed = Number.isFinite(props.speed) ? Math.min(3, Math.max(0.2, props.speed)) : 1;
  timeline.timeScale(motionSpeed);
  pressTimeline?.timeScale(motionSpeed);
  if (reduce.value) {
    pressTimeline?.pause(0);
    timeline.progress(selected.value ? 1 : 0).pause();
  }
  else if (selected.value) timeline.play();
  else timeline.reverse();
}

function toggle() {
  selected.value = !selected.value;
  emit('change', selected.value);
  if (!reduce.value) pressTimeline?.restart();
  syncMotion();
}

function reset() {
  selected.value = false;
  emit('change', false);
  pressTimeline?.pause(0);
  timeline?.pause(0);
}

function buildMotion() {
  context?.revert();
  if (!root.value) return;
  context = gsap.context(() => {
    const surface = root.value!.querySelector('.fold-garden-button');
    pressTimeline = gsap.timeline({ paused: true })
      .to(surface, { scale: 0.978, y: 2, duration: 0.09, ease: 'power2.out' })
      .to(surface, { scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.9)' });

    timeline = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
    if (props.variant === 'book') {
      gsap.set('.book-cover', { rotationY: 0 });
      gsap.set('.book-page', { rotationY: 82, opacity: 0 });
      gsap.set('.book-ribbon', { scaleY: 0, opacity: 0 });
      timeline
        .to('.book-object', { y: -3, rotation: -5, duration: 0.3 }, 0)
        .to('.book-cover', { rotationY: -148, duration: 0.62, ease: 'power3.inOut' }, 0.05)
        .to('.book-page', { rotationY: 0, opacity: 1, duration: 0.48, stagger: 0.09 }, 0.25)
        .to('.book-ribbon', { scaleY: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.5)' }, 0.75);
    } else {
      gsap.set('.garden-seed', { y: -42, opacity: 0, rotation: -35 });
      gsap.set('.garden-stem', { scaleY: 0 });
      gsap.set('.garden-leaf-left', { scale: 0, rotation: -50 });
      gsap.set('.garden-leaf-right', { scale: 0, rotation: 48 });
      gsap.set('.garden-bloom', { scale: 0.25, opacity: 0 });
      gsap.set('.garden-petal-shape', { scaleY: 0.15, scaleX: 0.35, opacity: 0 });
      gsap.set('.garden-pollen', { scale: 0 });
      timeline
        .to('.garden-seed', { opacity: 1, duration: 0.08 }, 0)
        .to('.garden-seed', { y: 0, rotation: 25, duration: 0.32, ease: 'power2.in' }, 0.02)
        .to('.garden-seed', { opacity: 0, duration: 0.1 }, 0.29)
        .to('.garden-stem', { scaleY: 1, duration: 0.48, ease: 'power2.out' }, 0.3)
        .to('.garden-leaf-left', { scale: 1, rotation: 0, duration: 0.33 }, 0.5)
        .to('.garden-leaf-right', { scale: 1, rotation: 0, duration: 0.33 }, 0.64)
        .to('.garden-bloom', { scale: 1, opacity: 1, duration: 0.42, ease: 'back.out(1.3)' }, 0.72)
        .to('.garden-petal-shape', { scaleY: 1, scaleX: 1, opacity: 1, duration: 0.35, stagger: 0.045 }, 0.82)
        .to('.garden-pollen', { scale: 1, duration: 0.26, ease: 'back.out(1.6)' }, 1.14);
    }
  }, root.value);
  syncMotion();
}

function updatePreference(event: MediaQueryListEvent) {
  systemReduced.value = event.matches;
}

onMounted(() => {
  preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  systemReduced.value = preference.matches;
  preference.addEventListener('change', updatePreference);
  buildMotion();
});

watch(() => props.variant, buildMotion, { flush: 'post' });
watch([reduce, () => props.speed], syncMotion);

onBeforeUnmount(() => {
  preference?.removeEventListener('change', updatePreference);
  context?.revert();
});

defineExpose({ reset });
</script>

<template>
  <div ref="root" class="fold-garden-demo" :class="[`is-${variant}`, { 'is-selected': selected }]">
    <button
      type="button"
      class="fold-garden-button"
      :aria-pressed="selected"
      :aria-label="`${title}，${selected ? '已選取，點擊取消' : '點擊選取'}`"
      @click="toggle"
    >
      <span class="fold-garden-copy">
        <span class="fold-garden-overline">{{ variant === 'book' ? 'PAPER & STORIES' : 'A LITTLE GARDEN' }}</span>
        <span class="fold-garden-title">{{ title }}</span>
        <span class="fold-garden-hint">{{ selected ? '已選取 · 再點一下收回' : variant === 'book' ? '為下一段故事留個位置' : '把一朵花種在旅途中' }}</span>
      </span>
      <span class="fold-garden-status" aria-hidden="true"><span /></span>

      <span v-if="variant === 'book'" class="book-object" aria-hidden="true">
        <span class="book-back" />
        <span v-for="page in 3" :key="page" class="book-page" :class="`book-page-${page}`"><span /><span /><span /></span>
        <span class="book-ribbon" />
        <span class="book-cover"><span class="book-cover-frame" /><span class="book-cover-title" /><span class="book-cover-rule" /></span>
        <span class="book-spine" />
      </span>

      <span v-else class="garden-object" aria-hidden="true">
        <span class="garden-seed" />
        <span class="garden-stem" />
        <span class="garden-leaf garden-leaf-left" />
        <span class="garden-leaf garden-leaf-right" />
        <span class="garden-bloom">
          <span v-for="petal in 8" :key="petal" class="garden-petal" :style="{ '--angle': `${(petal - 1) * 45}deg` }"><span class="garden-petal-shape" /></span>
          <span class="garden-pollen" />
        </span>
        <span class="garden-soil" />
        <span class="garden-pot" />
        <span class="garden-pot-rim" />
      </span>
    </button>
  </div>
</template>

<style scoped>
.fold-garden-demo { height: 180px; min-width: 0; position: relative; padding: 60px 4px 14px; }
.fold-garden-button { --ink: #214f43; position: relative; display: flex; align-items: center; width: 100%; min-height: 106px; padding: 18px 19px; border: 1px solid #d8dfcc; border-radius: 18px; background: #fffdf5; color: var(--ink); box-shadow: 0 5px 0 #d7decb, 0 12px 22px rgb(34 74 53 / 6%); font-family: inherit; text-align: left; cursor: pointer; -webkit-tap-highlight-color: transparent; touch-action: manipulation; isolation: isolate; }
.is-selected .fold-garden-button { --ink: #fff; background: #10b981; border-color: #10b981; box-shadow: 0 5px 0 #158765, 0 12px 22px rgb(16 185 129 / 12%); }
.fold-garden-button:focus-visible { outline: 3px solid #e0bc66; outline-offset: 5px; }
.fold-garden-copy { display: grid; gap: 5px; width: calc(100% - 68px); position: relative; z-index: 2; }
.fold-garden-overline { font-size: 9px; font-weight: 700; letter-spacing: .12em; opacity: .65; }
.fold-garden-title { font-size: 22px; font-weight: 750; line-height: 1.15; letter-spacing: .03em; }
.fold-garden-hint { font-size: 11px; line-height: 1.45; opacity: .76; }
.fold-garden-status { position: absolute; right: 18px; bottom: 18px; display: grid; place-items: center; width: 21px; height: 21px; border: 1px solid #bbcebd; border-radius: 50%; }
.is-selected .fold-garden-status { border-color: rgb(255 255 255 / 70%); }
.fold-garden-status > span { width: 6px; height: 6px; border-radius: 50%; background: #b8c9b5; }
.is-selected .fold-garden-status > span { width: 9px; height: 5px; border-left: 2px solid white; border-bottom: 2px solid white; border-radius: 0; background: none; transform: translateY(-1px) rotate(-45deg); }

/* Covers, paper stacks and ribbon each have a separate hinge. */
.book-object { position: absolute; width: 57px; height: 74px; right: 28px; top: -38px; perspective: 350px; transform: rotate(-2deg); pointer-events: none; z-index: 3; filter: drop-shadow(1px 5px 3px rgb(24 58 40 / 18%)); }
.book-back { position: absolute; inset: 0 -3px -2px 0; border-radius: 2px 6px 6px 2px; background: #e0c792; border: 1px solid #b59461; transform: rotate(1deg); }
.book-cover { position: absolute; inset: 0; z-index: 5; border-radius: 2px 5px 5px 2px; background: linear-gradient(90deg, #234f40, #356b56 14%, #356b56 94%, #224e3e); border: 1px solid #244c3b; transform-origin: 3px 50%; box-shadow: inset 2px 0 0 rgb(255 255 255 / 12%), 1px 1px 1px rgb(54 38 11 / 20%); }
.book-cover-frame { position: absolute; inset: 8px 7px 9px 10px; border: 1px solid #d4b97b; border-radius: 2px; opacity: .85; }
.book-cover-title { position: absolute; height: 3px; width: 22px; top: 27px; left: 20px; border-radius: 2px; background: #eddbac; box-shadow: 0 6px 0 rgb(237 219 172 / 55%); }
.book-cover-rule { position: absolute; height: 1px; width: 11px; bottom: 20px; left: 26px; background: #d7be82; }
.book-spine { position: absolute; z-index: 6; left: 0; top: 1px; bottom: 0; width: 4px; background: #234838; border-radius: 2px; box-shadow: 2px 0 1px rgb(34 41 28 / 12%); }
.book-page { position: absolute; inset: 3px 1px 3px 5px; display: grid; align-content: start; gap: 5px; padding: 13px 7px; border-radius: 0 3px 3px 0; background: #fffbea; border: 1px solid #dfd4b8; opacity: 0; transform-origin: 0 50%; box-shadow: 1px 2px 0 #dbcda9; }
.book-page-1 { z-index: 1; transform: rotate(7deg); }
.book-page-2 { z-index: 2; transform: rotate(3deg); }
.book-page-3 { z-index: 3; transform: rotate(-3deg); }
.book-page > span { height: 1px; background: #c4bc9b; opacity: .65; }
.book-page > span:nth-child(3) { width: 67%; }
.book-ribbon { position: absolute; z-index: 4; width: 8px; height: 33px; right: 11px; bottom: -15px; background: #d79164; clip-path: polygon(0 0,100% 0,100% 100%,50% 86%,0 100%); transform-origin: 50% 0; transform: scaleY(0); opacity: 0; }

/* A seed, growing stem, unfurling leaves and eight independent petals. */
.is-garden .fold-garden-button { border-radius: 25px 25px 14px 14px; }
.garden-object { position: absolute; width: 91px; height: 100px; right: 13px; top: -62px; pointer-events: none; z-index: 3; }
.garden-seed { position: absolute; width: 6px; height: 9px; left: 44px; top: 66px; border-radius: 70% 35% 65% 35%; background: #8c6638; opacity: 0; z-index: 1; }
.garden-stem { position: absolute; width: 4px; height: 44px; left: 43px; bottom: 26px; border-radius: 4px; background: linear-gradient(90deg,#436942,#71a664); transform-origin: 50% 100%; transform: scaleY(0); z-index: 1; }
.garden-leaf { position: absolute; bottom: 42px; width: 26px; height: 12px; background: linear-gradient(150deg, #a1b872, #618449); border-radius: 2% 95% 6% 95%; border-bottom: 1px solid #668848; transform: scale(0); z-index: 2; }
.garden-leaf::after { content: ''; position: absolute; width: 22px; height: 1px; left: 2px; top: 6px; background: #4e743e; opacity: .65; transform: rotate(22deg); }
.garden-leaf-left { left: 19px; transform-origin: 100% 85%; }
.garden-leaf-right { left: 46px; bottom: 51px; border-radius: 95% 2% 95% 6%; transform-origin: 0 85%; }
.garden-leaf-right::after { transform: rotate(-22deg); }
.garden-bloom { position: absolute; width: 64px; height: 64px; top: 0; left: 13px; transform-origin: 50% 76%; opacity: 0; }
.garden-petal { position: absolute; width: 18px; height: 31px; left: 23px; top: 3px; transform-origin: 50% 29px; transform: rotate(var(--angle)); }
.garden-petal-shape { position: absolute; inset: 0; border: 1px solid #e1b5a4; border-radius: 70% 70% 40% 40%; background: linear-gradient(90deg,#f7d0c2,#ffebe3 48%,#ecc0af); transform-origin: 50% 100%; box-shadow: inset 0 -4px 5px rgb(169 101 69 / 9%); opacity: 0; }
.garden-petal:nth-child(even) { top: 5px; height: 29px; }
.garden-pollen { position: absolute; left: 22px; top: 23px; width: 20px; height: 20px; border: 2px solid #e9bf6b; border-radius: 50%; background: radial-gradient(circle at 35% 35%,#e9b554 1px,transparent 1.4px) 0 0/4px 4px,#f7d68a; box-shadow: 0 1px 2px rgb(136 80 42 / 16%); transform: scale(0); }
.garden-soil { position: absolute; bottom: 24px; left: 26px; width: 38px; height: 8px; border-radius: 50%; background: #806043; border: 2px solid #b37e62; z-index: 3; }
.garden-pot { position: absolute; bottom: 0; left: 27px; width: 36px; height: 29px; clip-path: polygon(0 0,100% 0,85% 94%,74% 100%,25% 100%,15% 94%); background: linear-gradient(90deg,#b87655,#d99875 32%,#daa17e 61%,#ba7958); z-index: 3; }
.garden-pot::after { content: ''; position: absolute; top: 7px; left: 6px; bottom: 5px; width: 3px; border-radius: 3px; background: rgb(255 230 204 / 35%); }
.garden-pot-rim { position: absolute; bottom: 23px; left: 24px; width: 42px; height: 7px; border: 1px solid #ab7154; border-radius: 3px; background: linear-gradient(#e5ad87,#c78a67); z-index: 4; box-shadow: 0 3px 3px rgb(107 71 41 / 12%); }
@media (max-width: 350px) { .fold-garden-button { padding-inline: 15px; } .fold-garden-hint { font-size: 10px; } .book-object { right: 23px; } .garden-object { right: 7px; } }
</style>
