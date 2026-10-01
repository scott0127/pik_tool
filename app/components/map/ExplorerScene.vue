<template>
  <div ref="scene" class="explorer-scene" :aria-hidden="!open">
    <div class="explorer-desk">
      <div class="explorer-ground" aria-hidden="true"></div>
      <img class="explorer-character" src="/images/friends-comic/pikmin-red.png" alt="" draggable="false" />
      <img class="explorer-bag-closed" src="/images/map-field/satchel-closed.webp" alt="" draggable="false" />
      <img class="explorer-bag-open" src="/images/map-field/satchel-open.webp" alt="" draggable="false" />
      <div class="explorer-map" aria-hidden="true">
        <span class="explorer-map-fold explorer-map-left"></span>
        <span class="explorer-map-fold explorer-map-middle"></span>
        <span class="explorer-map-fold explorer-map-right"></span>
      </div>
      <img class="explorer-compass" src="/images/map-field/compass.webp" alt="" draggable="false" />
      <span class="explorer-count">{{ $t('map.stats.selected') }} {{ selectedCount }} {{ $t('map.cell_info.types_unit') }}</span>
      <p class="explorer-caption">{{ $t('map.panel.explorer_hint', { count: foundCount }) }}</p>
      <button class="explorer-close" type="button" :disabled="!open" @click="$emit('close')">{{ $t('map.panel.guide_close') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';

const props = defineProps<{ open: boolean; selectedCount: number; foundCount: number }>();
defineEmits<{ (event: 'close'): void }>();
const scene = ref<HTMLElement | null>(null);
let media: gsap.MatchMedia | null = null;
let motion: gsap.Context | null = null;
let opening: gsap.core.Timeline | null = null;
let feedback: gsap.core.Timeline | null = null;
let reduce = false;

onMounted(() => {
  media = gsap.matchMedia();
  media.add({ reduce: '(prefers-reduced-motion: reduce)', animate: '(prefers-reduced-motion: no-preference)' }, context => {
    reduce = !!context.conditions?.reduce;
    motion = gsap.context(() => {
      opening = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } })
        .fromTo(scene.value, { height: 0, opacity: 0 }, { height: 164, opacity: 1, duration: 0.32 }, 0)
        .fromTo('.explorer-bag-closed', { opacity: 1 }, { opacity: 0, duration: 0.16 }, 0.2)
        .fromTo('.explorer-bag-open', { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.2 }, 0.2)
        .fromTo('.explorer-character', { x: 54, y: 17, rotation: 12 }, { x: 0, y: 0, rotation: -4, duration: 0.55, ease: 'back.out(1.4)' }, 0.28)
        .fromTo('.explorer-map', { x: 83, y: -3, scale: 0.16, opacity: 0, rotation: 12 }, { x: 0, y: 0, scale: 1, opacity: 1, rotation: -7, duration: 0.52 }, 0.4)
        .fromTo('.explorer-map-left', { rotationY: 88 }, { rotationY: 0, duration: 0.42, ease: 'power3.out' }, 0.72)
        .fromTo('.explorer-map-right', { rotationY: -88 }, { rotationY: 0, duration: 0.42, ease: 'power3.out' }, 0.82)
        .fromTo('.explorer-compass', { x: 15, y: -15, opacity: 0, scale: 0.35, rotation: -150 }, { x: 0, y: 0, opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.5)' }, 0.62)
        .fromTo('.explorer-count, .explorer-caption', { y: 5, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, stagger: 0.08 }, 1.02);
      if (props.open) opening.progress(1);
    }, scene.value!);
    return () => { feedback?.kill(); opening = null; motion?.revert(); motion = null; };
  });
});

watch(() => props.open, open => {
  feedback?.kill();
  if (reduce) opening?.progress(open ? 1 : 0).pause();
  else if (open) opening?.play();
  else opening?.reverse();
});

watch(() => props.selectedCount, (count, previous) => {
  if (!props.open || reduce || !opening || opening.progress() < 1) return;
  feedback?.kill();
  motion?.add(() => {
    feedback = gsap.timeline()
      .to('.explorer-compass', { rotation: count > previous ? 55 : -55, y: -5, duration: 0.22, ease: 'power2.out' })
      .to('.explorer-compass', { rotation: 0, y: 0, duration: 0.55, ease: 'back.out(2)' })
      .fromTo('.explorer-count', { scale: 0.87 }, { scale: 1, duration: 0.45, ease: 'back.out(2)' }, 0)
      .to('.explorer-character', { rotation: 8, y: -5, duration: 0.2 }, 0)
      .to('.explorer-character', { rotation: -4, y: 0, duration: 0.4, ease: 'power2.out' }, 0.2);
  });
});

onUnmounted(() => { media?.revert(); });
</script>

<style scoped>
.explorer-scene { height: 0; opacity: 0; overflow: hidden; flex-shrink: 0; }
.explorer-desk { position: relative; height: 152px; margin: 10px 16px 2px; border: 1px solid #cbd4bc; border-radius: 10px; background: #fcf7e7 url('/images/map-field/woodland-camp.webp') center bottom / cover; overflow: hidden; isolation: isolate; }
.explorer-desk::before { content: ''; position: absolute; inset: 0; background: #fffbea9c; pointer-events: none; }
.explorer-desk img { position: absolute; object-fit: contain; pointer-events: none; user-select: none; }
.explorer-ground { position: absolute; width: 185px; height: 24px; top: 103px; right: 13px; border-radius: 50%; background: #b4c7a1; opacity: 0.3; filter: blur(8px); }
.explorer-bag-closed, .explorer-bag-open { width: 98px; height: 98px; right: 22px; top: 24px; z-index: 2; }
.explorer-bag-open { opacity: 0; }
.explorer-character { width: 29px; height: 61px; right: 111px; top: 39px; z-index: 1; }
.explorer-map { position: absolute; left: 14px; top: 45px; width: 146px; height: 84px; display: flex; z-index: 3; perspective: 450px; transform-origin: 80% 50%; filter: drop-shadow(0 5px 2px #6a825e25); }
.explorer-map-fold { width: calc(100% / 3); height: 100%; background-image: url('/images/map-field/fold-map.webp'); background-size: 300% 100%; backface-visibility: hidden; }
.explorer-map-left { background-position: 0 0; transform-origin: right center; }
.explorer-map-middle { background-position: 50% 0; }
.explorer-map-right { background-position: 100% 0; transform-origin: left center; }
.explorer-compass { width: 44px; height: 44px; right: 14px; top: 86px; z-index: 4; }
.explorer-count { position: absolute; left: 12px; top: 10px; padding: 5px 9px; background: var(--map-accent); color: #fff; border-radius: 6px; font-size: 11px; font-weight: 700; z-index: 5; }
.explorer-caption { position: absolute; bottom: 7px; left: 13px; color: #304e3d; font-size: 10px; margin: 0; z-index: 5; background: #fffbead9; padding: 2px 5px; border-radius: 3px; }
.explorer-close { position: absolute; top: 0; right: 0; padding: 0 11px; min-height: 44px; color: #476344; font-size: 11px; font-weight: 700; z-index: 5; }
.explorer-close:focus-visible { outline: 2px solid var(--map-accent); outline-offset: -3px; }
@media (max-width: 350px) { .explorer-map { width: 128px; height: 74px; } .explorer-bag-closed, .explorer-bag-open { right: 10px; } .explorer-character { right: 92px; } }
</style>
