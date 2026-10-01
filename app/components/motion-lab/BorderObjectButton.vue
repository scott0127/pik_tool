<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { gsap } from 'gsap';

const props = withDefaults(defineProps<{
  variant: 'orbit' | 'pocket';
  reducedMotion?: boolean;
  speed?: number;
}>(), { reducedMotion: false, speed: 1 });

const emit = defineEmits<{ change: [selected: boolean] }>();
const root = ref<HTMLElement | null>(null);
const selected = ref(false);
const systemReducedMotion = ref(false);
const reduceMotion = computed(() => props.reducedMotion || systemReducedMotion.value);
const motionSpeed = computed(() => Number.isFinite(props.speed) && props.speed > 0 ? props.speed : 1);
let context: gsap.Context | undefined;
let motion: gsap.core.Timeline | undefined;
let media: MediaQueryList | undefined;

/* Animation script:
 * Trigger: tap / Enter / Space toggles the button immediately; its raised face presses down.
 * Orbit: the empty border becomes a rail. A burger rolls in from the left, settles on the
 * right corner, and stays there as the selected object. Cancel rolls it back along that rail.
 * Pocket: a paper lip opens, a ticket rises from behind the bag's front layer, its folded
 * corner opens, and the lip closes around the ticket. Cancel folds and tucks it away.
 * Interruption: both directions share one paused timeline. Repeated taps play / reverse
 * from the current frame instead of adding new animations. Reduced motion seeks the result.
 * reset() clears selection and seeks the empty pose immediately; unmount reverts the context.
 */
function buildMotion() {
  if (!root.value) return;
  motion?.kill();
  context?.revert();

  context = gsap.context(() => {
    motion = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });

    if (props.variant === 'orbit') {
      // The carrier spans the usable rail; xPercent stays responsive without layout tweens.
      gsap.set('.burger-carrier', { x: -66, xPercent: 0, autoAlpha: 0 });
      gsap.set('.burger-object', { rotation: -320, y: -2, scale: 0.88 });
      gsap.set('.corner-seat', { scaleX: 0.58, autoAlpha: 0.35 });
      gsap.set('.rail-ink', { scaleX: 0, transformOrigin: 'left center' });

      motion.addLabel('arrive', 0)
        .to('.burger-carrier', { autoAlpha: 1, duration: 0.16 }, 'arrive')
        .to('.rail-ink', { scaleX: 1, duration: 0.8 }, 'arrive')
        .to('.burger-carrier', { x: 0, xPercent: 100, duration: 0.9 }, 'arrive')
        .to('.burger-object', { rotation: 8, y: -6, scale: 1, duration: 0.72 }, 'arrive')
        .to('.corner-seat', { scaleX: 1, autoAlpha: 1, duration: 0.25 }, 0.66)
        .addLabel('leave', 0.9)
        .to('.burger-object', { rotation: -4, y: 0, duration: 0.22, ease: 'power2.out' }, 'leave')
        .to('.rail-ink', { scaleX: 0, transformOrigin: 'right center', duration: 0.24 }, 'leave');
    } else {
      gsap.set('.paper-ticket', { y: 22, rotation: 7, rotationX: 12 });
      gsap.set('.ticket-fold', { rotationY: -150, transformOrigin: 'right top' });
      gsap.set('.pocket-front', { rotationX: 0, transformOrigin: 'center bottom' });
      gsap.set('.pocket-lip', { y: 0, scaleY: 1 });
      gsap.set('.ticket-back', { rotation: -6, x: 0 });

      motion.addLabel('open', 0)
        .to('.pocket-front', { rotationX: 18, duration: 0.22 }, 'open')
        .to('.pocket-lip', { y: 3, scaleY: 0.65, duration: 0.22 }, 'open')
        .addLabel('draw', 0.14)
        .to('.paper-ticket', { y: -43, rotation: -5, rotationX: 0, duration: 0.65, ease: 'power3.inOut' }, 'draw')
        .to('.ticket-back', { rotation: -12, x: -4, duration: 0.48 }, 'draw+=0.1')
        .to('.ticket-fold', { rotationY: 0, duration: 0.35, ease: 'power2.out' }, 'draw+=0.36')
        .addLabel('keep', 0.8)
        .to('.pocket-front', { rotationX: 0, duration: 0.22 }, 'keep')
        .to('.pocket-lip', { y: 0, scaleY: 1, duration: 0.22 }, 'keep');
    }

    motion.timeScale(motionSpeed.value).progress(selected.value ? 1 : 0).pause();
  }, root.value);
}

function applySelection() {
  if (!motion) return;
  motion.timeScale(motionSpeed.value);
  if (reduceMotion.value) motion.progress(selected.value ? 1 : 0).pause();
  else if (selected.value) motion.play();
  else motion.reverse();
}

function toggle() {
  selected.value = !selected.value;
  emit('change', selected.value);
  applySelection();
}

function reset() {
  const changed = selected.value;
  selected.value = false;
  motion?.progress(0).pause();
  if (changed) emit('change', false);
}

function updateSystemPreference() {
  systemReducedMotion.value = media?.matches ?? false;
}

watch(motionSpeed, (value) => motion?.timeScale(value));
watch(reduceMotion, () => motion?.progress(selected.value ? 1 : 0).pause());
watch(() => props.variant, async () => {
  await nextTick();
  if (root.value && context) buildMotion();
});

onMounted(() => {
  media = window.matchMedia('(prefers-reduced-motion: reduce)');
  updateSystemPreference();
  media.addEventListener('change', updateSystemPreference);
  buildMotion();
});

onUnmounted(() => {
  media?.removeEventListener('change', updateSystemPreference);
  motion?.kill();
  context?.revert();
});

defineExpose({ reset });
</script>

<template>
  <div
    ref="root"
    class="border-object"
    :class="[`border-object--${variant}`, { 'is-selected': selected }]"
    :data-reduced="reduceMotion"
  >
    <button
      type="button"
      class="object-button"
      :aria-pressed="selected"
      @click="toggle"
    >
      <span class="button-copy">
        <span class="button-index">{{ variant === 'orbit' ? 'BORDER / 01' : 'POST / 02' }}</span>
        <span class="button-title">{{ variant === 'orbit' ? '漢堡店' : '郵局' }}</span>
        <span class="button-caption">{{ variant === 'orbit' ? '在邊框留下一份美味' : '把這一站收進口袋' }}</span>
      </span>
      <span class="selection-mark" aria-hidden="true"><span></span></span>
      <span class="selection-label" aria-hidden="true">{{ selected ? '已選取' : '點擊選取' }}</span>
    </button>

    <div v-if="variant === 'orbit'" class="orbit-scene" aria-hidden="true">
      <span class="border-rail"><span class="rail-ink"></span></span>
      <span class="corner-seat"></span>
      <span class="burger-carrier">
        <img class="burger-object" src="/images/motion-lab/burger.png" alt="" draggable="false" />
      </span>
    </div>

    <div v-else class="pocket-stage" aria-hidden="true">
      <span class="pocket-back"></span>
      <span class="ticket-back"></span>
      <span class="paper-ticket">
        <span class="ticket-stripes"></span>
        <span class="ticket-stamp"><span class="stamp-sun"></span><span class="stamp-hill"></span></span>
        <span class="ticket-number">01</span>
        <span class="ticket-fold"></span>
      </span>
      <span class="pocket-front"><span class="pocket-stitch"></span><span class="pocket-seal">POST</span></span>
      <span class="pocket-lip"></span>
    </div>
  </div>
</template>

<style scoped>
.border-object {
  --ink: #214d3f;
  --theme: #10b981;
  position: relative;
  width: 100%;
  height: 180px;
  padding-top: 64px;
  color: var(--ink);
  font-family: inherit;
  isolation: isolate;
}

.object-button {
  position: relative;
  display: block;
  width: 100%;
  min-height: 104px;
  margin: 0;
  padding: 17px 22px;
  border: 1.5px solid #b4c5b8;
  background: #fffdf3;
  color: var(--ink);
  text-align: left;
  font: inherit;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 5px 0 #d5dfce, 0 10px 20px #264c3710;
  transition: background-color 180ms, color 180ms, border-color 180ms, transform 100ms, box-shadow 100ms;
}

.object-button:active {
  transform: translateY(3px) scale(0.988);
  box-shadow: 0 2px 0 #b8ceb9, 0 4px 10px #264c3710;
}

.object-button:focus-visible { outline: 3px solid #067a58; outline-offset: 5px; }
.is-selected .object-button { background: var(--theme); color: #fff; border-color: #0aa473; box-shadow: 0 5px 0 #0a9568, 0 10px 22px #10b9811c; }
.is-selected .object-button:active { box-shadow: 0 2px 0 #0a9568, 0 4px 10px #10b9811c; }
.button-copy { display: flex; flex-direction: column; gap: 3px; max-width: calc(100% - 70px); }
.button-index { font-size: 9px; font-weight: 650; letter-spacing: 0.13em; opacity: 0.6; line-height: 1.2; }
.button-title { font-size: 22px; font-weight: 750; line-height: 1.35; letter-spacing: 0.015em; }
.button-caption { margin-top: 3px; font-size: 11px; line-height: 1.45; opacity: 0.76; }
.selection-mark { position: absolute; right: 24px; bottom: 42px; width: 20px; height: 20px; border: 1.5px solid #b4c8b8; border-radius: 6px; background: #f0f4e9; }
.selection-mark span { position: absolute; left: 5px; top: 3px; width: 6px; height: 10px; border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg) scale(0); transform-origin: center; transition: transform 160ms; }
.is-selected .selection-mark { border-color: #ffffff75; background: #ffffff22; }
.is-selected .selection-mark span { transform: rotate(45deg) scale(1); }
.selection-label { position: absolute; right: 18px; bottom: 18px; font-size: 10px; line-height: 1.4; font-weight: 650; opacity: 0.7; }

/* Orbit: a narrow rail and a receiving paper corner, rather than a loading loop. */
.border-object--orbit .object-button { border-radius: 15px 15px 18px 18px; }
.border-object--orbit .object-button::after { content: ''; position: absolute; inset: 5px; border: 1px solid #d4dfcc; border-radius: 10px 10px 13px 13px; pointer-events: none; }
.border-object--orbit.is-selected .object-button::after { border-color: #ffffff26; }
.orbit-scene { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
.border-rail { position: absolute; left: 17px; right: 17px; top: 63px; height: 3px; border-radius: 3px; background: #e5ddbf; overflow: hidden; }
.rail-ink { display: block; height: 100%; border-radius: inherit; background: #799f77; transform: scaleX(0); }
.corner-seat { position: absolute; right: 17px; top: 59px; width: 59px; height: 12px; border: 1px solid #ccbc96; border-radius: 50%; background: #fff4d8; box-shadow: 0 3px 0 #bda77338; transform-origin: center; }
.burger-carrier { position: absolute; left: 18px; right: 76px; top: 12px; height: 56px; visibility: hidden; opacity: 0; }
.burger-object { display: block; width: 56px; height: 56px; object-fit: contain; filter: drop-shadow(0 3px 1px #604b2929); transform-origin: 50% 85%; user-select: none; }

/* Pocket: back, ticket, fold, front, and opening lip remain separate paper layers. */
.border-object--pocket .object-button { border-radius: 24px 11px 24px 11px; border-color: #c5c0ab; box-shadow: 0 5px 0 #ded5bd, 0 10px 20px #264c3710; }
.border-object--pocket .object-button::after { content: ''; position: absolute; left: 22px; right: 22px; bottom: 9px; border-bottom: 1px dashed #cabf9c80; pointer-events: none; }
.border-object--pocket.is-selected .object-button { border-color: #0aa473; box-shadow: 0 5px 0 #0a9568, 0 10px 22px #10b9811c; }
.border-object--pocket.is-selected .object-button::after { border-color: #ffffff30; }
.border-object--pocket .object-button:active { box-shadow: 0 2px 0 #c5bda8, 0 4px 10px #264c3710; }
.border-object--pocket.is-selected .object-button:active { box-shadow: 0 2px 0 #0a9568, 0 4px 10px #10b9811c; }
.pocket-stage { position: absolute; right: 13px; top: 10px; width: 94px; height: 118px; overflow: hidden; perspective: 420px; pointer-events: none; z-index: 2; }
.pocket-back { position: absolute; left: 7px; top: 48px; width: 74px; height: 65px; border: 1px solid #bca582; border-radius: 6px 6px 10px 10px; background: #d3ba91; transform: rotate(-5deg); box-shadow: 0 3px 5px #6e533923; }
.ticket-back { position: absolute; left: 15px; top: 52px; width: 55px; height: 66px; border: 1px solid #d4c9ac; border-radius: 3px; background: #e8e9d8; transform: rotate(-6deg); }
.paper-ticket { position: absolute; left: 22px; top: 61px; width: 53px; height: 76px; border: 1px solid #bda988; border-radius: 3px; background: #fffdf1; box-shadow: 0 2px 5px #553b2526; transform: translateY(22px) rotate(7deg); transform-origin: 50% 80%; }
.paper-ticket::before, .paper-ticket::after { content: ''; position: absolute; top: 0; bottom: 0; width: 3px; background: radial-gradient(circle, #decfae 1px, transparent 1.5px) center / 3px 6px; }
.paper-ticket::before { left: 2px; }.paper-ticket::after { right: 2px; }
.ticket-stripes { position: absolute; left: 8px; right: 8px; top: 7px; height: 3px; background: repeating-linear-gradient(110deg, #e0a797 0 4px, #fffdf1 4px 7px, #819ba6 7px 11px, #fffdf1 11px 14px); opacity: 0.75; }
.ticket-stamp { position: absolute; left: 10px; top: 17px; width: 31px; height: 29px; overflow: hidden; border: 2px solid #f7ebd6; outline: 1px solid #ccbea0; background: #c2d4c3; }
.stamp-sun { position: absolute; width: 9px; height: 9px; border-radius: 50%; top: 3px; right: 4px; background: #fff0b6; }
.stamp-hill { position: absolute; width: 32px; height: 19px; bottom: -9px; left: -5px; border-radius: 50% 50% 0 0; background: #537c68; transform: rotate(-15deg); }
.stamp-hill::after { content: ''; position: absolute; width: 22px; height: 17px; left: 14px; bottom: 0; border-radius: 50% 50% 0 0; background: #80a28c; transform: rotate(22deg); }
.ticket-number { position: absolute; left: 11px; bottom: 9px; color: #8e745a; font-size: 9px; font-weight: 700; letter-spacing: 0.12em; }
.ticket-fold { position: absolute; right: -1px; top: -1px; width: 17px; height: 17px; border-radius: 0 2px 0 2px; clip-path: polygon(0 0, 100% 0, 100% 100%); background: #ecdfc7; box-shadow: inset -1px 1px 0 #c0ac89; transform: rotateY(-150deg); backface-visibility: visible; }
.pocket-front { position: absolute; left: 8px; top: 62px; width: 75px; height: 56px; border: 1px solid #b9a078; border-radius: 3px 3px 11px 11px; background: linear-gradient(115deg, #f1ddbb, #e6c9a0); box-shadow: inset 0 -3px 0 #ddbe93, 0 3px 4px #5f412b18; transform-style: preserve-3d; }
.pocket-front::before { content: ''; position: absolute; inset: 1px; border-radius: inherit; border: 1px solid #fff2d578; }
.pocket-stitch { position: absolute; inset: 7px 6px 6px; border: 1px dashed #b7976c60; border-top: 0; border-radius: 0 0 5px 5px; }
.pocket-seal { position: absolute; left: 23px; top: 14px; width: 31px; height: 26px; display: grid; place-items: center; border: 1px solid #a67e617d; border-radius: 50%; color: #9a6d50; font-size: 7px; font-weight: 750; letter-spacing: 0.08em; transform: rotate(-9deg); }
.pocket-lip { position: absolute; left: 6px; top: 60px; width: 79px; height: 7px; border: 1px solid #bea37d; border-radius: 5px; background: #f4e3c5; box-shadow: 0 2px 0 #b89d7350; transform-origin: center bottom; }

[data-reduced='true'] .object-button, [data-reduced='true'] .selection-mark span { transition: none; }

@media (max-width: 360px) {
  .object-button { padding-left: 18px; }
  .button-title { font-size: 21px; }
  .button-caption { font-size: 10px; }
  .button-copy { max-width: calc(100% - 62px); }
  .selection-mark { right: 20px; }
  .selection-label { right: 14px; }
}

@media (prefers-reduced-motion: reduce) {
  .object-button, .selection-mark span { transition: none; }
}
</style>
