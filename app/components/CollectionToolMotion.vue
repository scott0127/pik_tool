<template>
  <span ref="root" class="collection-tool-motion" :class="`tool-${kind}`" aria-hidden="true">
    <template v-if="kind === 'radar'">
      <CollectionGoldSeedling class="goal-seedling" />
      <span class="goal-progress-card">
        <span v-for="index in 3" :key="index" class="goal-progress-row"><span class="goal-progress-fill" /></span>
        <span class="goal-progress-point" />
      </span>
    </template>
    <template v-else>
      <span class="journal-shadow" />
      <span class="journal-back" />
      <span class="journal-paper"><span /><span /><span /></span>
      <span class="journal-mark">＋</span>
      <span class="journal-cover"><span class="journal-cover-rule" /><span class="journal-seal">＋</span></span>
      <span class="journal-bookmark" />
    </template>
  </span>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';
import { ref } from 'vue';
import CollectionGoldSeedling from '~/components/CollectionGoldSeedling.vue';
import { useCollectionHintMotion } from '~/composables/useCollectionHintMotion';

const props = withDefaults(defineProps<{
  kind: 'radar' | 'journal';
  active?: boolean;
}>(), { active: true });
const root = ref<HTMLElement | null>(null);

useCollectionHintMotion(root, () => props.active, () => {
  const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } });
  if (props.kind === 'radar') {
    timeline
      .fromTo('.goal-progress-card', { y: 5, opacity: 0 }, { y: 0, opacity: 1, duration: .3 }, 0)
      .fromTo('.goal-progress-fill', { scaleX: .15 }, { scaleX: 1, stagger: .08, duration: .4, transformOrigin: 'left center' }, .08)
      .fromTo('.goal-progress-point', { scale: .5, opacity: .4 }, { scale: 1, opacity: 1, duration: .2 }, .48)
      .fromTo('.gold-seedling-glint', { xPercent: -160, opacity: 0 }, { xPercent: 360, opacity: .9, duration: .5, ease: 'power1.inOut' }, .35)
      .to('.gold-seedling-glint', { opacity: 0, duration: .15 }, .75);
  } else {
    timeline
      .fromTo('.journal-cover', { rotation: -7, scaleX: 1 }, { rotation: -17, scaleX: 0.78, duration: 0.32 }, 0)
      .fromTo('.journal-paper', { y: 7 }, { y: -5, duration: 0.35 }, 0.08)
      .fromTo('.journal-mark', { y: -15, scale: 0.6, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.28 }, 0.22)
      .to('.journal-mark', { y: 7, scale: 0.7, opacity: 0, duration: 0.2 }, 0.52)
      .to('.journal-paper', { y: 0, duration: 0.28 }, 0.54)
      .to('.journal-cover', { rotation: -7, scaleX: 1, duration: 0.3 }, 0.58)
      .fromTo('.journal-bookmark', { y: -5, opacity: 0.3 }, { y: 0, opacity: 1, duration: 0.24 }, 0.66);
  }
  return timeline;
});
</script>

<style scoped>
.collection-tool-motion { position: relative; display: block; flex: 0 0 auto; width: 76px; height: 76px; pointer-events: none; isolation: isolate; }
.collection-tool-motion span { position: absolute; display: block; }
.goal-seedling { position: absolute; width: 66px; height: 66px; left: 5px; top: 0; }
.goal-progress-card { right: 0; bottom: 2px; width: 42px; height: 29px; padding: 5px 7px; border-radius: 6px; border: 1px solid #c9e5d6; background: #fffef7; box-shadow: 0 3px 5px #17584416; }
.collection-tool-motion .goal-progress-row { position: relative; height: 3px; margin: 2px 0; border-radius: 3px; background: #e4eddf; }
.goal-progress-fill { inset: 0; right: 35%; border-radius: inherit; background: #10b981; transform-origin: left center; }
.goal-progress-row:nth-child(2) .goal-progress-fill { right: 8%; background: #cba448; }
.goal-progress-row:nth-child(3) .goal-progress-fill { right: 55%; }
.goal-progress-point { right: 2px; top: 13px; width: 5px; height: 5px; border: 1px solid #fffef7; border-radius: 50%; background: #ddb754; }
.journal-shadow { left: 14%; right: 9%; bottom: 8%; height: 13%; border-radius: 50%; background: radial-gradient(ellipse, #507e6522, transparent 70%); }
.journal-back { inset: 16% 15% 14% 17%; border-radius: 5px 8px 8px 5px; background: #277963; transform: rotate(5deg); }
.journal-paper { inset: 17% 17% 16% 22%; border-radius: 3px 5px 5px 3px; background: #fffef1; border: 1px solid #e6e6ce; transform: rotate(5deg); }
.journal-paper > span { left: 23%; right: 15%; height: 2px; border-radius: 2px; background: #bad3bc; }
.journal-paper > span:nth-child(1) { top: 24%; }
.journal-paper > span:nth-child(2) { top: 38%; }
.journal-paper > span:nth-child(3) { top: 52%; right: 28%; }
.journal-cover { inset: 18% 24% 12% 15%; border-radius: 4px 7px 7px 4px; background: linear-gradient(115deg, #3fc692, #10b981 62%, #08a876); transform: rotate(-7deg); transform-origin: 8% 70%; box-shadow: inset 0 1px 0 #ffffff70, 1px 2px 3px #155c4930; }
.journal-cover-rule { top: 0; bottom: 0; left: 13%; width: 1px; background: #087a6040; }
.journal-seal { left: 31%; top: 29%; width: 48%; height: 39%; display: grid !important; place-items: center; font-size: 19px; font-weight: 500; line-height: 1; border: 1px solid #ffffff90; color: #fff; border-radius: 50%; }
.journal-bookmark { width: 10%; height: 24%; bottom: 8%; right: 24%; background: #ffeab0; clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%); transform: rotate(-7deg); }
.journal-mark { right: 15%; top: 14%; width: 24%; height: 24%; display: grid !important; place-items: center; background: #d7a94b; border: 2px solid #fff2c7; color: white; border-radius: 50%; font-size: 13px; font-weight: 700; opacity: 0; z-index: 2; }
</style>
