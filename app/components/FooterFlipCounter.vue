<template>
  <span ref="root" class="flip-counter" role="img" :aria-label="formattedValue" :style="{ '--digit-count': digitCount }">
    <span class="counter-rail" aria-hidden="true">
      <template v-for="(slot, index) in slots" :key="index">
        <span v-if="slot.next === ','" class="counter-comma">,</span>
        <span v-else class="counter-digit" :data-digit="index">
          <span class="digit-half digit-top"><span>{{ slot.flipping ? slot.next : slot.current }}</span></span>
          <span class="digit-half digit-bottom"><span>{{ slot.current }}</span></span>
          <span class="digit-half digit-top flap-top"><span>{{ slot.current }}</span><i class="flap-shade"></i></span>
          <span class="digit-half digit-bottom flap-bottom"><span>{{ slot.next }}</span><i class="flap-shade"></i></span>
          <span class="digit-fold-shadow"></span>
          <span class="digit-seam"></span>
          <span class="digit-hinge hinge-left"></span><span class="digit-hinge hinge-right"></span>
        </span>
      </template>
    </span>
  </span>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';

const props = defineProps<{ value: number | null }>();
const root = ref<HTMLElement | null>(null);
const formattedValue = computed(() => props.value !== null && Number.isFinite(props.value) && props.value >= 0
  ? Math.floor(props.value).toLocaleString('en-US')
  : '—');
type DigitSlot = { current: string; next: string; flipping: boolean };
const digitCount = computed(() => formattedValue.value.replaceAll(',', '').length);
const makeSlots = (value: string): DigitSlot[] => value.split('').map(char => ({ current: char, next: char, flipping: false }));
const slots = ref<DigitSlot[]>(makeSlots(formattedValue.value));
let animationContext: gsap.Context | undefined;
let timeline: gsap.core.Timeline | undefined;
let observer: IntersectionObserver | undefined;
let preference: MediaQueryList | undefined;
let cycleTimer: ReturnType<typeof window.setTimeout> | undefined;
let visible = false;
let mounted = false;
let revision = 0;

const canAnimate = () => mounted && visible && !document.hidden && !preference?.matches && formattedValue.value !== '—';
const clearMotion = () => {
  if (cycleTimer !== undefined) window.clearTimeout(cycleTimer);
  cycleTimer = undefined;
  timeline?.kill();
  timeline = undefined;
  // Each round releases its own context so the continuous loop retains no historical timelines.
  animationContext?.revert();
  animationContext = undefined;
};

const settle = () => {
  revision++;
  clearMotion();
  slots.value = makeSlots(formattedValue.value);
};

const queueCycle = () => {
  if (!canAnimate()) return;
  cycleTimer = window.setTimeout(() => {
    cycleTimer = undefined;
    void flipToValue(true);
  }, 1500);
};

// Repeated rounds fold the same real number. A real update replaces the loop and flips only changed digits.
const flipToValue = async (allDigits = false) => {
  const sequence = ++revision;
  const previous = slots.value.map(slot => slot.next).join('');
  clearMotion();
  const next = formattedValue.value;
  if (!canAnimate()) {
    slots.value = makeSlots(next);
    return;
  }
  const offset = next.length - previous.length;
  slots.value = next.split('').map((char, index) => {
    const old = previous[index - offset] || '—';
    const flipping = char !== ',' && (allDigits || old !== char);
    return { current: old === ',' ? '—' : old, next: char, flipping };
  });
  await nextTick();
  if (sequence !== revision || !canAnimate() || !root.value) return;

  animationContext = gsap.context(() => {
    timeline = gsap.timeline({
      onComplete: () => {
        if (sequence !== revision) return;
        slots.value = makeSlots(next);
        timeline = undefined;
        animationContext?.revert();
        animationContext = undefined;
        queueCycle();
      },
    });
    let order = 0;
    slots.value.forEach((slot, index) => {
      if (!slot.flipping) return;
      const digit = root.value!.querySelector(`[data-digit="${index}"]`);
      if (!digit) return;
      const upper = digit.querySelector('.flap-top');
      const lower = digit.querySelector('.flap-bottom');
      const upperShade = upper!.querySelector('.flap-shade');
      const lowerShade = lower!.querySelector('.flap-shade');
      const shadow = digit.querySelector('.digit-fold-shadow');
      const start = order++ * .045;
      // Two half cards share the center hinge: the old upper leaf folds, then the new lower leaf lands.
      timeline!.set(upper, { rotationX: 0, autoAlpha: 1 }, start)
        .set(lower, { rotationX: 90, autoAlpha: 1 }, start)
        .set(lowerShade, { opacity: .22 }, start)
        .to(upper, { rotationX: -90, duration: .23, ease: 'power2.in' }, start)
        .to(upperShade, { opacity: .28, duration: .23, ease: 'power2.in' }, start)
        .to(shadow, { opacity: .6, scaleY: 1, duration: .2, ease: 'power1.in' }, start + .06)
        .set(upper, { autoAlpha: 0 }, start + .23)
        .to(lower, { rotationX: -4, duration: .25, ease: 'power2.out' }, start + .23)
        .to(lowerShade, { opacity: 0, duration: .25, ease: 'power2.out' }, start + .23)
        .to(shadow, { opacity: 0, scaleY: .4, duration: .28, ease: 'power2.out' }, start + .24)
        .to(lower, { rotationX: 0, duration: .12, ease: 'power1.inOut' }, start + .48);
    });
    if (!order) {
      slots.value = makeSlots(next);
      timeline.kill();
      timeline = undefined;
      queueCycle();
    }
  }, root.value);
};

const resumeOrSettle = () => {
  if (canAnimate()) void flipToValue(true);
  else settle();
};

watch(formattedValue, () => { void flipToValue(); });
onMounted(() => {
  mounted = true;
  preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  preference.addEventListener('change', resumeOrSettle);
  document.addEventListener('visibilitychange', resumeOrSettle);
  // Native intersection observes ancestor v-show changes too; hidden startup cannot consume the first reveal.
  observer = new IntersectionObserver(entries => {
    const nextVisible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .35);
    if (nextVisible === visible) return;
    visible = nextVisible;
    resumeOrSettle();
  }, { threshold: .35, rootMargin: '0px 0px -24px 0px' });
  observer.observe(root.value!);
});
onBeforeUnmount(() => {
  mounted = false;
  settle();
  observer?.disconnect();
  preference?.removeEventListener('change', resumeOrSettle);
  document.removeEventListener('visibilitychange', resumeOrSettle);
});
</script>

<style scoped>
.flip-counter { display: flex; width: 100%; max-width: 360px; container-type: inline-size; vertical-align: middle; }
.counter-rail { --digit-width: 22px; --digit-height: clamp(32px, calc(var(--digit-width) * 1.4), 48px); display: flex; align-items: center; gap: 3px; padding: 8px 8px 10px; max-width: 100%; border: 1px solid #dbe8db; border-radius: 13px; background: #f7f8ee; box-shadow: inset 0 1px 0 #fff, 0 2px 0 #dce7d9; }
@supports (width: 1cqw) { .counter-rail { --digit-width: clamp(16px, calc((100cqw - 60px) / var(--digit-count)), 34px); } }
.counter-digit { position: relative; width: var(--digit-width); height: var(--digit-height); flex: 0 0 var(--digit-width); perspective: 230px; isolation: isolate; border-radius: 6px; box-shadow: 0 2px 0 #078565, 0 3px 4px #115b4020; color: #fff; font-size: calc(var(--digit-width) * .97); font-weight: 750; font-family: inherit; font-variant-numeric: tabular-nums; line-height: 1; }
.digit-half { position: absolute; left: 0; right: 0; height: 50%; overflow: hidden; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.digit-half > span { position: absolute; left: 0; width: 100%; height: var(--digit-height); display: flex; align-items: center; justify-content: center; }
.digit-top { top: 0; border-radius: 6px 6px 0 0; background: #10b981; box-shadow: inset 0 1px 0 #ffffff46; transform-origin: center bottom; }
.digit-top > span { top: 0; }
.digit-bottom { bottom: 0; border-radius: 0 0 6px 6px; background: #0faf7b; box-shadow: inset 0 -1px 0 #07986c; transform-origin: center top; }
.digit-bottom > span { bottom: 0; }
.flap-top { z-index: 3; opacity: 0; visibility: hidden; }
.flap-bottom { z-index: 4; transform: rotateX(90deg); opacity: 0; visibility: hidden; }
.flap-shade { position: absolute; inset: 0; display: block; background: #005b3c; opacity: 0; pointer-events: none; }
.digit-fold-shadow { position: absolute; left: 1px; right: 1px; top: 50%; height: 11px; z-index: 5; background: linear-gradient(#00492e99, #00492e00); opacity: 0; transform: scaleY(.4); transform-origin: center top; pointer-events: none; }
.digit-seam { position: absolute; left: 1px; right: 1px; top: calc(50% - .5px); height: 1px; background: #078f6666; box-shadow: 0 1px 0 #ffffff25; z-index: 5; pointer-events: none; }
.digit-hinge { position: absolute; top: calc(50% - 1.5px); width: 1.5px; height: 3px; border-radius: .5px; background: #087554; box-shadow: 0 .5px 0 #b5ead5; z-index: 6; pointer-events: none; }
.hinge-left { left: -1px; }.hinge-right { right: -1px; }
.counter-comma { align-self: flex-end; width: 5px; margin-bottom: 2px; color: #6b8675; font-size: calc(var(--digit-width) * .9); font-weight: 700; line-height: 1.1; font-family: inherit; }
@media (prefers-reduced-motion: reduce) { .flap-top, .flap-bottom { display: none; } }
</style>
