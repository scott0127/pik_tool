<template>
  <div ref="surface" class="home-flow-background" aria-hidden="true">
    <span class="flow-ribbon flow-ribbon-north"></span>
    <span class="flow-ribbon flow-ribbon-south"></span>
    <span class="flow-ribbon flow-ribbon-light"></span>
    <span class="flow-reading-light"></span>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { gsap } from 'gsap';

const surface = ref<HTMLElement | null>(null);
let media: ReturnType<typeof gsap.matchMedia> | undefined;
let movement: gsap.core.Tween[] = [];

const syncVisibility = () => {
  movement.forEach(tween => tween.paused(document.hidden));
};

onMounted(() => {
  if (!surface.value) return;
  media = gsap.matchMedia();
  media.add({
    all: '(min-width: 0px)',
    reduced: '(prefers-reduced-motion: reduce)',
    mobile: '(max-width: 767px)',
  }, (context) => {
    if (context.conditions?.reduced) return;
    const small = context.conditions?.mobile;
    const defaults = {
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      paused: document.hidden,
    };

    // Independent long arcs move only the composited surfaces, not their gradients.
    movement = [
      gsap.to('.flow-ribbon-north', {
        ...defaults,
        xPercent: small ? 3 : 5,
        yPercent: small ? 3 : 6,
        rotation: small ? -14 : -12,
        scale: 1.035,
        opacity: 0.68,
        duration: 19,
      }),
      gsap.to('.flow-ribbon-south', {
        ...defaults,
        xPercent: small ? -3 : -6,
        yPercent: small ? -2 : -4,
        rotation: small ? -24 : -27,
        scale: 1.045,
        opacity: 0.78,
        duration: 23,
      }),
      gsap.to('.flow-ribbon-light', {
        ...defaults,
        xPercent: small ? -2 : -4,
        yPercent: small ? 3 : 5,
        rotation: small ? 18 : 20,
        opacity: 0.5,
        duration: 16,
      }),
    ];

    return () => { movement = []; };
  }, surface.value);
  document.addEventListener('visibilitychange', syncVisibility);
});

onUnmounted(() => {
  document.removeEventListener('visibilitychange', syncVisibility);
  media?.revert();
  movement = [];
});
</script>

<style scoped>
.home-flow-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 76% 2%, #fffff7 0%, #fafcf000 54%),
    radial-gradient(ellipse at 6% 72%, #cfe9d6 0%, #dff2e200 59%),
    linear-gradient(150deg, #edf6e9 0%, #f3f7ed 42%, #d8efe1 100%);
}

.flow-ribbon {
  position: absolute;
  display: block;
  transform-origin: 50% 50%;
  will-change: transform, opacity;
}

.flow-ribbon-north {
  top: -12%;
  left: -18%;
  width: 136%;
  height: 92%;
  opacity: 0.88;
  transform: rotate(-17deg);
  background: radial-gradient(ellipse 78% 115% at 50% -15%,
    transparent 48%, #fafff900 52%, #fcfffbb3 54%,
    #d6efde99 56%, #9cd8ba70 61%, #d3eed940 68%, transparent 75%);
}

.flow-ribbon-south {
  right: -20%;
  bottom: -29%;
  width: 142%;
  height: 96%;
  opacity: 0.56;
  transform: rotate(-21deg);
  background: radial-gradient(ellipse 86% 90% at 52% 102%,
    transparent 47%, #ecfff000 54%, #fbfffbd9 57%,
    #b9e5cf9e 60%, #8ecfaf70 65%, #d4ecd340 72%, transparent 81%);
}

.flow-ribbon-light {
  top: 3%;
  right: -18%;
  width: 116%;
  height: 96%;
  opacity: 0.82;
  transform: rotate(15deg);
  background: radial-gradient(ellipse 80% 104% at 102% 46%,
    transparent 53%, #fdfff600 58%, #fffef7c2 61%,
    #f7ffed6b 64%, transparent 73%);
}

/* A still veil keeps text contrast even as the light passes behind it. */
.flow-reading-light {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 48% 34%, #fafff638 0%, #fafff600 70%);
}

@media (max-width: 767px) {
  .flow-ribbon-north { height: 80%; top: -3%; }
  .flow-ribbon-south { height: 83%; bottom: -13%; }
  .flow-ribbon-light { width: 126%; right: -28%; }
}

@media (prefers-reduced-motion: reduce) {
  .flow-ribbon { will-change: auto; }
}
</style>
