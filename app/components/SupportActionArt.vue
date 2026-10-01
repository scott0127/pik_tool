<template>
  <span ref="root" class="support-art" :class="['art-' + kind, { 'art-compact': compact, 'art-hero': hero }]" aria-hidden="true">
    <span class="art-halo"></span>
    <span class="art-stage">
      <template v-if="kind === 'coffee'">
        <span class="coffee-saucer"></span>
        <span class="coffee-cup"><span class="coffee-handle"></span><span class="coffee-body"><span class="coffee-rim"><span class="coffee-liquid"></span></span><span class="coffee-glint"></span></span></span>
        <span v-for="i in 3" :key="i" class="coffee-steam" :class="'steam-' + i"></span>
        <span class="coffee-bean bean-one"></span><span class="coffee-bean bean-two"></span>
      </template>
      <template v-else-if="kind === 'star'">
        <span class="repo-back"></span><span class="repo-card"><span class="repo-dots"><i></i><i></i><i></i></span><Icon name="ph:github-logo-fill" class="repo-mark" /><span class="repo-line"></span></span>
        <span class="repo-star main-star"></span><span class="repo-star star-satellite satellite-one"></span><span class="repo-star star-satellite satellite-two"></span><span class="star-flash"></span>
      </template>
      <template v-else>
        <span class="chat-back"><i></i><i></i></span><span class="chat-front"><i></i><i></i><i></i></span>
      </template>
    </span>
  </span>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';
const props = defineProps<{ kind: 'coffee' | 'star' | 'feedback'; compact?: boolean; hero?: boolean; order?: number }>();
const root = ref<HTMLElement | null>(null);
let context: gsap.Context | undefined;
let motion: gsap.core.Timeline | undefined;
let media: MediaQueryList | undefined;
const targets = () => root.value?.querySelectorAll('.art-stage > span, .coffee-liquid') || [];
const settle = () => {
  motion?.kill();
  gsap.killTweensOf(targets());
  gsap.set(targets(), { clearProps: 'transform,opacity' });
};
const replay = () => {
  if (!context || media?.matches) return;
  settle();
  context.add(() => {
    motion = gsap.timeline({ defaults: { ease: 'power2.out', duration: .35 } });
    if (props.kind === 'coffee') {
      motion.fromTo('.coffee-saucer', { x: -5, scaleX: .85 }, { x: 0, scaleX: 1 }, 0)
        .to('.coffee-cup', { y: -5, rotation: -8, duration: .4, ease: 'back.out(1.5)' }, .08)
        .fromTo('.coffee-liquid', { scaleY: .4 }, { scaleY: 1, duration: .4 }, .16)
        .fromTo('.coffee-steam', { y: 4, opacity: 0, scaleY: .6 }, { y: -8, opacity: .85, scaleY: 1, stagger: .08, duration: .45 }, .18)
        .to('.coffee-steam', { y: -15, opacity: 0, stagger: .06, duration: .35 }, .62)
        .fromTo('.coffee-bean', { y: -4, rotation: -20 }, { y: 0, rotation: 0, stagger: .08, ease: 'back.out(1.7)' }, .38)
        .to('.coffee-cup', { y: 0, rotation: 0, ease: 'back.out(1.3)', duration: .38 }, .72);
    } else if (props.kind === 'star') {
      motion.fromTo('.repo-back', { x: 3, rotation: 0 }, { x: 0, rotation: -9 }, 0)
        .fromTo('.repo-card', { y: 3, rotation: 4 }, { y: 0, rotation: 0 }, .05)
        .fromTo('.main-star', { x: -10, y: 11, scale: .25, rotation: -50, opacity: 0 }, { x: 0, y: -5, scale: 1.12, rotation: 8, opacity: 1, ease: 'back.out(1.5)', duration: .55 }, .12)
        .fromTo('.satellite-one', { x: 9, y: 8, scale: .3, opacity: 0 }, { x: 0, y: -4, scale: 1, opacity: 1, duration: .35 }, .34)
        .fromTo('.satellite-two', { x: -6, y: 5, scale: .3, opacity: 0 }, { x: 0, y: -3, scale: 1, opacity: 1, duration: .4 }, .43)
        .to('.main-star', { y: 0, scale: 1, rotation: 0, duration: .32, ease: 'back.out(1.6)' }, .65)
        .to('.star-satellite', { y: -9, opacity: 0, stagger: .06, duration: .35 }, .8);
    } else {
      motion.fromTo('.chat-back', { x: 4, y: 4, rotation: 0 }, { x: 0, y: 0, rotation: -8 }, 0)
        .to('.chat-front', { y: -3, rotation: 5 }, .08)
        .to('.chat-front', { y: 0, rotation: 0 }, .5);
    }
  });
};
const press = () => {
  if (!context || media?.matches) return;
  motion?.kill();
  context.add(() => {
    const object = props.kind === 'coffee' ? '.coffee-cup' : props.kind === 'star' ? '.main-star' : '.chat-front';
    gsap.to(object, { scale: .9, y: 2, rotation: 0, duration: .12, overwrite: true });
    if (props.kind === 'star') gsap.fromTo('.star-flash', { opacity: .8, scale: .35 }, { opacity: 0, scale: 1.4, duration: .38 });
  });
};
const reset = () => {
  if (!context || media?.matches) { settle(); return; }
  motion?.kill();
  context.add(() => {
    const visible = props.kind === 'coffee' ? '.coffee-cup, .coffee-saucer, .coffee-bean, .coffee-liquid' : props.kind === 'star' ? '.repo-card, .main-star' : '.chat-front';
    gsap.to(visible, { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, duration: .28, overwrite: true, clearProps: 'transform,opacity' });
    if (props.kind !== 'feedback') gsap.to(props.kind === 'coffee' ? '.coffee-steam' : '.star-satellite, .star-flash', { opacity: 0, duration: .15, overwrite: true });
    // The back card retains its designed resting angle.
    if (props.kind !== 'coffee') gsap.to(props.kind === 'star' ? '.repo-back' : '.chat-back', { x: 0, y: 0, rotation: props.kind === 'star' ? -9 : -8, duration: .28, overwrite: true });
  });
};
const preferenceChanged = () => { if (media?.matches) settle(); };
onMounted(() => {
  media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', preferenceChanged);
  context = gsap.context(() => {}, root.value!);
  if (!media.matches && (!props.compact || props.hero)) context.add(() => {
    motion = gsap.timeline().call(replay, [], .15 + (props.order || 0) * .08);
  });
});
onBeforeUnmount(() => { media?.removeEventListener('change', preferenceChanged); motion?.kill(); context?.revert(); });
defineExpose({ replay, press, reset });
</script>

<style scoped>
.support-art { position: relative; display: inline-block; width: 56px; height: 56px; flex-shrink: 0; vertical-align: middle; }
.art-halo { position: absolute; inset: 0; border-radius: 50%; background: #ffffff70; border: 1px solid #fff9; box-shadow: inset 0 1px 0 #fff9; }
.art-stage { position: absolute; width: 56px; height: 56px; left: 50%; top: 50%; margin: -28px; }
.coffee-saucer { position: absolute; left: 9px; top: 40px; width: 39px; height: 11px; border-radius: 50%; background: #fff8e8; border: 1px solid #bf987b; box-shadow: 0 3px 0 #d3b597, 0 5px 5px #8c60492a; }
.coffee-cup { position: absolute; width: 32px; height: 31px; left: 14px; top: 15px; transform-origin: 50% 90%; }
.coffee-handle { position: absolute; right: -6px; top: 9px; width: 12px; height: 14px; border: 4px solid #fff5df; border-radius: 50%; box-shadow: 1px 1px 0 #ba9477; }
.coffee-body { position: absolute; inset: 2px 0 0; border-radius: 4px 5px 13px 13px; background: linear-gradient(100deg, #fffaf0 8%, #fce5c2 75%, #eccfac); border: 1px solid #bd977d; box-shadow: inset 0 -3px 0 #e4c59f; }
.coffee-rim { position: absolute; left: -1px; right: -1px; top: -4px; height: 13px; border: 3px solid #fff6e3; border-radius: 50%; background: #d9b08b; overflow: hidden; box-shadow: 0 -1px 0 #c0997c; }
.coffee-liquid { position: absolute; inset: 0; border-radius: 50%; background: linear-gradient(150deg, #ad7555, #674330); transform-origin: bottom; }
.coffee-liquid::after { content: ''; position: absolute; width: 10px; height: 3px; left: 6px; top: 1px; background: #e9b98e; border-radius: 50%; transform: rotate(-12deg); }
.coffee-glint { position: absolute; left: 5px; top: 10px; width: 3px; height: 9px; background: #fffdf4; border-radius: 5px; opacity: .9; }
.coffee-steam { position: absolute; width: 3px; height: 10px; top: 6px; border-radius: 70% 25% 50% 30%; background: #fffaf0; opacity: 0; }
.steam-1 { left: 22px; transform: rotate(-12deg); }.steam-2 { left: 28px; top: 3px; }.steam-3 { left: 34px; transform: rotate(10deg); }
.coffee-bean { position: absolute; width: 10px; height: 7px; background: #85513c; border-radius: 55%; box-shadow: inset 0 1px 0 #b57d57, 0 2px 2px #6b403324; }
.coffee-bean::after { content: ''; position: absolute; width: 7px; height: 1px; top: 3px; left: 2px; background: #563a2c; border-radius: 50%; transform: rotate(-15deg); }
.bean-one { left: 7px; top: 43px; transform: rotate(25deg); }.bean-two { left: 4px; top: 36px; transform: rotate(-35deg); }
.repo-back { position: absolute; left: 10px; top: 12px; width: 34px; height: 34px; border-radius: 7px; background: #b4c6e8; border: 1px solid #a1b6d9; transform: rotate(-9deg); }
.repo-card { position: absolute; left: 13px; top: 13px; width: 33px; height: 32px; border-radius: 7px; background: #f7f9ff; border: 1px solid #829bbf; box-shadow: 0 3px 0 #b6c7e0, 0 4px 6px #4b638622; }
.repo-dots { position: absolute; display: flex; gap: 2px; top: 5px; left: 5px; }.repo-dots i { width: 2px; height: 2px; border-radius: 50%; background: #9bb1cf; }
.repo-mark { position: absolute; left: 5px; top: 10px; width: 15px; height: 15px; color: #405676; }
.repo-line { position: absolute; left: 23px; top: 26px; width: 5px; height: 2px; background: #d3dceb; border-radius: 3px; }
.repo-star { position: absolute; background: linear-gradient(145deg, #fff5b0, #f1b957); clip-path: polygon(50% 0%, 63% 34%, 100% 38%, 73% 62%, 81% 100%, 50% 80%, 19% 100%, 27% 62%, 0% 38%, 37% 34%); }
.main-star { width: 26px; height: 26px; left: 29px; top: 5px; filter: drop-shadow(0 2px 0 #cc9b47); transform-origin: 50% 70%; }
.star-satellite { opacity: 0; width: 8px; height: 8px; background: #fff5c0; }.satellite-one { left: 5px; top: 7px; }.satellite-two { right: -1px; top: 32px; width: 6px; height: 6px; }
.star-flash { position: absolute; left: 23px; top: 0; width: 36px; height: 36px; border: 1px solid #fff5bb; border-radius: 50%; opacity: 0; pointer-events: none; }
.chat-back { position: absolute; left: 8px; top: 12px; width: 31px; height: 25px; border-radius: 9px 9px 9px 3px; border: 1px solid #b59dcb; background: #cebadd; transform: rotate(-8deg); display: flex; gap: 3px; align-items: center; justify-content: center; }
.chat-back i { width: 9px; height: 2px; background: #f7efff; border-radius: 2px; }
.chat-front { position: absolute; left: 18px; top: 22px; width: 31px; height: 24px; border-radius: 8px 8px 3px 8px; background: #fff6ff; border: 1px solid #a98ebf; box-shadow: 0 3px 0 #c7b0da; display: flex; align-items: center; justify-content: center; gap: 3px; }
.chat-front i { width: 3px; height: 3px; border-radius: 50%; background: #aa84bd; }
.art-compact { width: 28px; height: 28px; }.art-compact .art-stage { transform: scale(.5); }
.art-hero { width: 96px; height: 96px; margin: 0 auto 12px; display: block; }.art-hero .art-stage { transform: scale(1.55); }.art-hero .art-halo { background: #ffffff58; }
</style>
