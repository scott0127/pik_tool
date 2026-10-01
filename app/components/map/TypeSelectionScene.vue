<template>
  <div ref="root" class="type-scene" :class="[`scene-${scene.motion}`, `scene-${id}`, { 'is-included': selected }]">
    <div class="type-stage" aria-hidden="true">
      <span class="stage-shadow"></span>
      <span class="stage-back"><i></i><i></i></span>
      <span class="stage-surface"></span>
      <img class="stage-actor stage-actor-two" :src="scene.secondary" alt="" width="72" height="72" draggable="false" @error="imageFallback" />
      <img class="stage-actor stage-actor-one" :src="scene.primary" alt="" width="72" height="72" draggable="false" @error="imageFallback" />
      <span class="stage-front"></span>
      <span class="stage-tool"></span>
      <span v-for="n in 3" :key="n" class="stage-particle" :class="`particle-${n}`"></span>
    </div>
    <p class="scene-caption"><strong>{{ $t('decor_types.' + id) }}</strong><span>{{ $t(selected ? 'map.panel.type_added' : 'map.panel.type_removed') }}</span></p>
  </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';
import { getMapTypeScene } from '~/utils/mapTypeScenes';

const props = defineProps<{ id: string; selected: boolean; revision: number }>();
const root = ref<HTMLElement | null>(null);
const scene = computed(() => getMapTypeScene(props.id));
let context: gsap.Context | null = null;
let timeline: gsap.core.Timeline | null = null;
let preference: MediaQueryList | null = null;
let version = 0;
const imageFallback = (event: Event) => {
  const image = event.target as HTMLImageElement;
  if (!image.src.endsWith('/images/friends-comic/pikmin-red.png')) image.src = '/images/friends-comic/pikmin-red.png';
};
const stop = () => { timeline?.kill(); context?.revert(); timeline = null; context = null; };
const settle = () => {
  stop();
  if (!root.value) return;
  context = gsap.context(() => {
    gsap.set('.stage-actor', { opacity: props.selected ? 1 : 0 });
  }, root.value);
};

const play = async () => {
  const request = ++version;
  stop();
  await nextTick();
  if (!root.value || request !== version) return;
  if (preference?.matches) { settle(); return; }
  const images = Array.from(root.value.querySelectorAll<HTMLImageElement>('img'));
  // Start the actors once their flat artwork is ready, without delaying the checkbox.
  await Promise.allSettled(images.map(image => image.decode()));
  if (!root.value || request !== version) return;
  if (preference?.matches) { settle(); return; }
  context = gsap.context(() => {
    const actors = ['.stage-actor-one', '.stage-actor-two'];
    const kind = scene.value.motion;
    gsap.set('.stage-actor, .stage-particle', { opacity: 0 });
    timeline = gsap.timeline({ defaults: { ease: 'power2.out' } });
    const t = timeline;
    t.fromTo('.stage-shadow', { scaleX: 0.3, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.28 }, 0);
    t.fromTo('.stage-surface', { scaleX: 0, rotation: -6 }, { scaleX: 1, rotation: 0, duration: 0.3 }, 0);

    if (['ride', 'cross', 'fly'].includes(kind)) {
      // Two separate arrivals, followed by a ticket punch / runway sweep.
      actors.forEach((actor, index) => t.fromTo(actor,
        { x: -90 - index * 20, y: kind === 'fly' ? 18 : 0, rotation: kind === 'fly' ? -18 : 0, opacity: 1 },
        { x: 0, y: 0, rotation: 0, duration: 0.7, ease: 'power3.out' }, 0.16 + index * 0.15));
      t.fromTo('.stage-back', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.28 }, 0.08)
        .fromTo('.stage-tool', { scale: 1.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.15 }, 0.75);
    } else if (['book', 'mail', 'bag', 'wrap', 'mirror', 'fortune', 'frame', 'clap'].includes(kind)) {
      // Hinge / unfold the independent paper lid before the contents arrive.
      t.fromTo('.stage-back', { rotationX: -75, opacity: 0 }, { rotationX: 0, opacity: 1, duration: 0.34 }, 0.05);
      actors.forEach((actor, index) => t.fromTo(actor,
        { x: kind === 'mail' ? -32 : 0, y: -25, rotation: index ? 12 : -9, opacity: 0 },
        { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.4)' }, 0.25 + index * 0.12));
      t.fromTo('.stage-front', { y: 14, scaleY: 0 }, { y: 0, scaleY: 1, duration: 0.3 }, 0.4);
      if (kind === 'clap') t.to('.stage-back', { rotation: -23, duration: 0.22 }, 0.65).to('.stage-back', { rotation: 0, duration: 0.14, ease: 'power3.in' }, 0.9);
      if (kind === 'mail') t.to('.stage-back', { rotationX: 60, duration: 0.28 }, 0.85);
    } else if (['grow', 'climb', 'rain', 'snow', 'water'].includes(kind)) {
      t.fromTo('.stage-back', { y: 18, scaleY: 0.4, rotation: -14, opacity: 0 }, { y: 0, scaleY: 1, rotation: 0, opacity: 1, duration: 0.45 }, 0);
      actors.forEach((actor, index) => t.fromTo(actor,
        { y: 20, x: index ? 20 : -12, opacity: 0 },
        { y: 0, x: 0, opacity: 1, duration: 0.45 }, 0.2 + index * 0.13));
      t.fromTo('.stage-front', { scaleX: 0.4, rotation: 10, opacity: 0 }, { scaleX: 1, rotation: 0, opacity: 1, duration: 0.45 }, 0.45);
      if (kind === 'water') t.fromTo('.stage-particle', { scale: 0, opacity: 0.6 }, { scale: 2, opacity: 0, duration: 0.7, stagger: 0.13 }, 0.45);
      else if (kind === 'rain' || kind === 'snow') t.fromTo('.stage-particle', { y: -24, opacity: 0.9 }, { y: 20, x: kind === 'snow' ? 8 : 0, opacity: 0, duration: 0.65, stagger: 0.14 }, 0.3);
      else t.fromTo('.stage-particle', { y: 0, opacity: 0.6, rotation: -20 }, { y: -20, x: 12, rotation: 40, opacity: 0, duration: 0.7, stagger: 0.1 }, 0.55);
    } else {
      t.fromTo('.stage-back', { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.3 }, 0.06);
      actors.forEach((actor, index) => t.fromTo(actor,
        { y: kind === 'serve' ? 0 : -26, x: kind === 'serve' ? -45 : 0, rotation: index ? 10 : -10, opacity: 0 },
        { y: 0, x: 0, rotation: 0, opacity: 1, duration: 0.42, ease: 'back.out(1.5)' }, 0.17 + index * 0.14));
      t.fromTo('.stage-front', { y: 9, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, 0.35);
      if (kind === 'steam' || kind === 'bake') t.fromTo('.stage-particle', { y: 6, scaleY: 0.6, opacity: 0 }, { y: -17, scaleY: 1.2, opacity: 0.7, duration: 0.55, stagger: 0.12 }, 0.55).to('.stage-particle', { opacity: 0, duration: 0.3 }, 1.2);
      if (kind === 'snip') t.fromTo('.stage-tool', { rotation: -30 }, { rotation: 22, duration: 0.18, repeat: 1, yoyo: true }, 0.5);
      if (kind === 'wash') t.fromTo('.stage-tool', { rotation: 0 }, { rotation: 360, duration: 0.9 }, 0.25);
      if (kind === 'charge' || kind === 'write') t.fromTo('.stage-tool', { scaleX: 0 }, { scaleX: 1, duration: 0.65 }, 0.45);
      if (kind === 'fasten') t.fromTo('.stage-tool', { rotation: -90 }, { rotation: 0, duration: 0.45, ease: 'back.out(2)' }, 0.5);
      if (kind === 'bounce') t.to('.stage-actor-one', { y: -13, duration: 0.2, ease: 'power2.out' }, 0.55).to('.stage-actor-one', { y: 0, duration: 0.24, ease: 'bounce.out' });
      if (kind === 'stack') t.to('.stage-actor-two', { y: -8, duration: 0.18 }, 0.55).to('.stage-actor-two', { y: 0, duration: 0.22, ease: 'bounce.out' });
      if (kind === 'stamp' || kind === 'ticket' || kind === 'dispense') t.fromTo('.stage-tool', { scale: 1.6, y: -10, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.2, ease: 'power3.in' }, 0.6);
    }
    if (!props.selected) {
      t.addLabel('pack', Math.max(t.duration(), 0.8))
        .to('.stage-actor', { y: 18, x: kind === 'ride' || kind === 'fly' ? 60 : 0, opacity: 0, scale: 0.8, duration: 0.3, stagger: 0.07 }, 'pack')
        .to('.stage-front, .stage-back, .stage-tool', { scaleY: 0.6, opacity: 0.35, duration: 0.3 }, 'pack+=0.15');
    }
  }, root.value);
};
const preferenceChanged = () => { ++version; settle(); if (!preference?.matches) void play(); };
onMounted(() => {
  preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  preference.addEventListener('change', preferenceChanged);
  void play();
});
watch(() => props.revision, () => { void play(); });
onBeforeUnmount(() => { ++version; stop(); preference?.removeEventListener('change', preferenceChanged); });
</script>

<style scoped>
.type-scene { min-width: 0; width: 138px; }
.type-stage { position: relative; height: 66px; overflow: hidden; perspective: 500px; isolation: isolate; border-radius: 10px; background: #efefdf; box-shadow: inset 0 0 0 1px #dde2cf; }
.stage-shadow { position: absolute; width: 94px; height: 8px; bottom: 6px; left: 22px; background: #435e3f24; border-radius: 50%; filter: blur(2px); }
.stage-actor { position: absolute; opacity: 0; object-fit: contain; object-position: bottom; filter: drop-shadow(1px 2px 0 #fffcf0) drop-shadow(0 2px 1px #354f3930); }
.stage-actor-one { width: 58px; height: 57px; left: 20px; bottom: 8px; z-index: 3; }
.stage-actor-two { width: 46px; height: 47px; right: 10px; bottom: 11px; z-index: 2; }
.stage-back, .stage-front, .stage-surface, .stage-tool, .stage-particle { position: absolute; display: block; pointer-events: none; }
.stage-surface { width: 106px; height: 20px; left: 16px; bottom: 6px; border: 1px solid #c6b990; border-radius: 50%; background: #fff9e8; box-shadow: 0 3px 0 #d6cba6; }
.stage-back { width: 79px; height: 39px; left: 29px; bottom: 15px; background: #f5dfab; border: 1px solid #d7bb7f; border-radius: 5px; transform-origin: 50% 100%; }
.stage-front { width: 88px; height: 15px; bottom: 5px; left: 25px; z-index: 4; background: #ead2a0; border: 1px solid #cfb986; border-radius: 3px 3px 10px 10px; transform-origin: bottom; }
.stage-tool { width: 18px; height: 18px; right: 9px; bottom: 8px; border-radius: 50%; border: 2px solid #be9858; background: #fff0c9; z-index: 5; }
.stage-particle { width: 4px; height: 14px; top: 21px; left: 48px; border-radius: 70%; background: #faf8ec; opacity: 0; z-index: 5; }
.particle-2 { left: 70px; top: 17px; }.particle-3 { left: 92px; top: 22px; }
.scene-caption { display: flex; align-items: baseline; justify-content: space-between; gap: 4px; margin-top: 4px; font-size: 9px; line-height: 1.4; }
.scene-caption strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 62px; font-size: 10px; }.scene-caption span { color: #75816a; white-space: nowrap; }.is-included .scene-caption span { color: #047857; }
.scene-serve .stage-back, .scene-serve .stage-front, .scene-water .stage-tool, .scene-steam .stage-tool, .scene-bake .stage-tool { display: none; }
.scene-steam .stage-back { width: 70px; height: 36px; bottom: 9px; left: 34px; border-radius: 5px 5px 24px 24px; background: #ddede4; border-color: #98b6a4; }
.scene-steam .stage-front { height: 7px; width: 77px; left: 30px; background: #ccded0; border-color: #a3baa6; }
.scene-cafe .stage-back::after { content: ''; position: absolute; width: 14px; height: 19px; right: -12px; top: 6px; border: 4px solid #98b6a4; border-radius: 50%; }
.scene-bake .stage-back { border: 4px solid #bfa77c; background: #6b5542; border-radius: 7px; }.scene-bake .stage-front { background: #e7ce98; }
.scene-stack .stage-back { height: 7px; bottom: 10px; border-radius: 50%; }.scene-stack .stage-front { height: 5px; background: #dcc99d; }.scene-stack .stage-tool { display: none; }
.scene-sweetshop .type-stage { background: #f3e9e5; }.scene-sweetshop .stage-surface { border-color: #d7b8b1; }.scene-burger .stage-surface { background: #fff3d3; }
.scene-wrap .stage-back { background: repeating-linear-gradient(45deg,#f3e7d0 0 6px,#fbf6e7 6px 12px); transform-origin: left bottom; }.scene-wrap .stage-front { background: #f1e5cd; }
.scene-bag .stage-back { height: 42px; width: 72px; left: 33px; background: #ddc5a2; }.scene-bag .stage-back::before { content: ''; position: absolute; left: 23px; top: -10px; width: 24px; height: 17px; border: 3px solid #ac926b; border-radius: 10px; }.scene-bag .stage-front { height: 17px; background: #e2cdaa; }
.scene-mirror .stage-back { border: 5px solid #c9ac9f; border-radius: 50%; background: #f5f9ed; }.scene-mirror .stage-front { border-radius: 50%; background: #d9bcb1; }
.scene-charge .stage-back { width: 100px; height: 28px; left: 19px; background: #dce6cf; border: 2px solid #8d9e77; }.scene-charge .stage-tool { border: 0; width: 77px; height: 9px; bottom: 14px; right: 30px; border-radius: 2px; background: #10b981; transform-origin: left; }
.scene-fasten .stage-tool { background: #c0c9c7; border-color: #758980; width: 22px; height: 22px; }
.scene-book .stage-back, .scene-book .stage-front { background: #fff9e8; border: 2px solid #ae8461; border-radius: 3px 10px 5px 3px; }.scene-book .stage-back::after { content: ''; position: absolute; top: 0; bottom: 0; left: 50%; width: 1px; background: #d9c9ac; }
.scene-write .stage-front { background: #fff9e8; height: 22px; }.scene-write .stage-tool { width: 56px; height: 2px; border: 0; border-radius: 0; background: #758c73; right: 40px; bottom: 17px; transform-origin: left; }
.scene-dispense .stage-back { background: #d8e9e5; border-color: #a5c7be; }.scene-dispense .stage-tool::after { content: '+'; position: absolute; inset: -3px; text-align: center; font-size: 17px; color: #b97568; }
.scene-snip .stage-tool { width: 35px; height: 5px; background: #869993; border: 0; border-radius: 2px; right: 11px; bottom: 19px; }.scene-snip .stage-tool::after { content: ''; position: absolute; inset: 0; background: #bcc9c1; transform: rotate(-32deg); transform-origin: right; }
.scene-wash .stage-back { background: #e6eee6; border-color: #a9b9a5; }.scene-wash .stage-tool { width: 36px; height: 36px; right: 47px; bottom: 10px; border: 4px solid #aec8c0; border-left-color: #669c8e; background: #dcefeb; }.scene-wash .stage-front { display: none; }
.scene-mail .stage-back { background: #d7c9a5; clip-path: polygon(0 100%,0 45%,50% 0,100% 45%,100% 100%); }.scene-mail .stage-front { height: 24px; background: linear-gradient(26deg,#e5d8b9 49%,transparent 50%),linear-gradient(-26deg,#f1e6cc 49%,#efe2c0 50%); border-radius: 2px; }
.scene-stamp .stage-front { background: #fbf5dd; }.scene-stamp .stage-tool { border-style: dashed; }.scene-university .stage-tool { border-radius: 4px 4px 50% 50%; }
.scene-ride .stage-back, .scene-cross .stage-back { width: 101px; height: 15px; left: 19px; bottom: 12px; background: #ebe1c9; border: 0; border-top: 2px dashed #a79672; border-bottom: 2px dashed #a79672; }.scene-ride .stage-front, .scene-cross .stage-front { display: none; }.scene-bus_stop .stage-back { background: #697c71; border-color: #efeeda; }.scene-station .stage-tool { width: 12px; height: 12px; border: 2px dashed #b38e5a; }
.scene-fly .stage-back { background: #dddcc6; height: 12px; bottom: 12px; border: 0; border-top: 2px dashed #9fa88d; }.scene-fly .stage-front { height: 3px; border: 0; background: #fef9e4; }
.scene-cross .stage-back { height: 28px; border-radius: 40px 40px 0 0; border: 4px solid #b9bda8; background: #e4e8d8; }.scene-cross .stage-tool { display: none; }
.scene-grow .stage-back { width: 32px; height: 49px; left: 8px; border-radius: 80% 0 80% 0; background: #afc29a; border-color: #92ab7d; transform-origin: bottom right; }.scene-grow .stage-front { width: 42px; height: 24px; left: auto; right: 5px; border-radius: 0 80% 0 80%; background: #c5d5ae; border-color: #a4be90; transform-origin: bottom left; }.scene-grow .stage-tool { display: none; }.scene-grow .stage-particle { background: #d6b98a; width: 5px; height: 8px; }
.scene-water .type-stage { background: #e4eee6; }.scene-water .stage-back, .scene-water .stage-front { border: 1px solid #90bfb1; background: #c9e2d5; border-radius: 50%; width: 106px; height: 17px; bottom: 7px; left: 15px; }.scene-water .stage-front { width: 125px; left: 5px; bottom: 1px; opacity: 0.65; }.scene-water .stage-particle { border: 1px solid #73a99a; background: transparent; width: 25px; height: 6px; border-radius: 50%; top: auto; bottom: 8px; }.scene-beach .stage-surface { background: #f0deb9; }
.scene-climb .stage-back { clip-path: polygon(0 100%,40% 0,100% 100%); height: 48px; width: 69px; left: 5px; background: #b9c3a6; }.scene-climb .stage-front { clip-path: polygon(0 100%,70% 0,100% 100%); height: 33px; width: 64px; left: auto; right: 0; background: #cdd4b7; }.scene-climb .stage-tool { display: none; }
.scene-ticket .stage-back { background: #f4e5b6; border: 2px dashed #c4a45d; }.scene-ticket .stage-tool { background: #f0d99d; border-style: dashed; }
.scene-frame .stage-back { border: 6px solid #a48259; background: #e7edda; box-shadow: inset 0 0 0 2px #f9eccb; }.scene-frame .stage-front { display: none; }.scene-frame .stage-tool { width: 6px; height: 25px; border: 0; border-radius: 1px; background: #b39465; }
.scene-bounce .stage-back { border-radius: 4px; background: repeating-linear-gradient(0deg,transparent 0 7px,#c7ceb5 7px 8px),repeating-linear-gradient(90deg,#eef1e2 0 7px,#c7ceb5 7px 8px); }.scene-bounce .stage-tool { display: none; }
.scene-clap .stage-back { width: 87px; height: 12px; bottom: 40px; left: 25px; border: 0; border-radius: 2px; background: repeating-linear-gradient(-45deg,#eff0dd 0 8px,#556b5d 8px 16px); transform-origin: left bottom; }.scene-clap .stage-front { height: 27px; border: 0; border-radius: 2px; background: #52665b; }.scene-clap .stage-tool { display: none; }
.scene-fortune .stage-back { width: 22px; height: 44px; left: 16px; background: #f2e3ca; border-color: #bb9273; }.scene-fortune .stage-front { background: #eadabe; height: 19px; }
.scene-rain .stage-back, .scene-snow .stage-back { border-radius: 20px; background: #d4dfd5; border: 0; width: 74px; height: 22px; left: 36px; bottom: auto; top: 6px; }.scene-rain .stage-front, .scene-snow .stage-front { display: none; }.scene-rain .stage-particle { background: #85aaa1; width: 3px; height: 9px; transform: rotate(12deg); }.scene-snow .stage-particle { background: #fffef5; box-shadow: 0 0 0 1px #d2ddcf; width: 5px; height: 5px; border-radius: 50%; }.scene-rain .stage-tool, .scene-snow .stage-tool { display: none; }
@media (max-width: 350px) { .type-scene { width: 122px; }.stage-actor-one { left: 12px; }.stage-actor-two { right: 3px; }.scene-caption { font-size: 8px; }.scene-caption strong { font-size: 9px; max-width: 54px; } }
</style>
