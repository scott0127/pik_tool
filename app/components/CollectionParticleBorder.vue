<template>
  <span ref="root" class="collection-particle-border" :class="{ 'is-inactive': !active, 'on-dark': onDark }" aria-hidden="true">
    <span class="particle-rim" />
    <span class="particle-field">
      <span v-for="(particle, index) in particles" :key="index" class="hint-particle" :style="{ left: `${particle.x}%`, bottom: `${particle.y}px`, width: `${particle.size}px`, height: `${particle.size}px` }" />
      <span class="hint-comet" />
    </span>
    <span class="particle-destination" />
  </span>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';
import { ref } from 'vue';
import { useCollectionHintMotion } from '~/composables/useCollectionHintMotion';

const props = withDefaults(defineProps<{ active?: boolean; onDark?: boolean }>(), { active: true, onDark: false });
const root = ref<HTMLElement | null>(null);
const particles = [
  { x: 10, y: 7, size: 2 }, { x: 22, y: 13, size: 2 }, { x: 34, y: 5, size: 3 },
  { x: 45, y: 10, size: 2 }, { x: 57, y: 4, size: 2 }, { x: 65, y: 16, size: 3 },
  { x: 73, y: 8, size: 2 }, { x: 81, y: 14, size: 2 }, { x: 87, y: 5, size: 3 },
  { x: 95, y: 16, size: 2 },
];

useCollectionHintMotion(root, () => props.active, () => {
  return gsap.timeline({ defaults: { ease: 'power2.out' } })
    .fromTo('.particle-rim', { opacity: 0.35 }, { opacity: 0.9, duration: 0.25 }, 0)
    .fromTo('.hint-particle', { y: 4, x: -5, opacity: 0, scale: 0.6 }, { y: -3, x: 2, opacity: 0.95, scale: 1, duration: 0.3, stagger: 0.035 }, 0.05)
    .fromTo('.hint-comet', { xPercent: -130, opacity: 0 }, { xPercent: 360, opacity: 0.8, duration: 0.75, ease: 'power1.inOut' }, 0.12)
    .to('.hint-comet', { opacity: 0, duration: 0.2 }, 0.72)
    .fromTo('.particle-destination', { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 0.5, duration: 0.3 }, 0.6)
    .to('.hint-particle', { y: -5, opacity: 0.25, duration: 0.35, stagger: 0.015 }, 0.72)
    .to('.particle-rim', { opacity: 0.45, duration: 0.35 }, 0.82)
    .to('.particle-destination', { opacity: 0.12, duration: 0.3 }, 0.9);
});
</script>

<style scoped>
.collection-particle-border { position: absolute; inset: 0; overflow: hidden; border-radius: inherit; pointer-events: none; isolation: isolate; }
.collection-particle-border > span, .particle-field > span { position: absolute; display: block; }
.particle-rim { inset: 0; border-radius: inherit; border: 1px solid #10b98166; opacity: 0.45; box-shadow: inset 0 -1px 0 #10b98144; }
.particle-field { inset: 0; overflow: hidden; border-radius: inherit; }
.hint-particle { background: #36cf9b; border-radius: 50%; opacity: 0.25; box-shadow: 0 0 3px #46d9aa88; }
.hint-comet { bottom: 0; left: 0; height: 2px; width: 24%; background: linear-gradient(90deg, transparent, #53e4b7 75%, #edfff7); border-radius: 50%; opacity: 0; box-shadow: 0 0 4px #10b98155; }
.particle-destination { right: 5px; bottom: 4px; width: 45px; height: 45px; border-radius: 50%; border: 1px solid #10b98160; opacity: 0.12; background: radial-gradient(circle, #10b98118, transparent 72%); }
.is-inactive { opacity: 0; }
.on-dark .particle-rim { border-color: #d5ffed70; box-shadow: inset 0 1px 0 #ffffff42, inset 0 -1px 0 #b9ffdc70; }
.on-dark .hint-particle { background: #eefff9; box-shadow: 0 0 4px #d3ffee; }
.on-dark .hint-comet { height: 100%; width: 25%; background: linear-gradient(90deg, transparent, #c0ffe029 60%, #eafff662, transparent); border-radius: 0; box-shadow: none; }
.on-dark .particle-destination { right: 8px; bottom: 7px; width: 30px; height: 30px; background: #d9ffef; border-color: #effffb; }
@media (prefers-reduced-motion: reduce) { .hint-particle { opacity: 0.18; } .hint-comet, .particle-destination { display: none; } }
</style>
