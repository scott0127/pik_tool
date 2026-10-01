<template>
  <section ref="cover" class="album-cover" :aria-label="title">
    <div class="album-copy">
      <p class="album-eyebrow">{{ copy.eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p class="album-subtitle">{{ locale.startsWith('en') ? 'Keep every little encounter.' : '把每一次相遇，收進日常' }}</p>
      <div class="album-progress" :aria-label="`${copy.collected} ${collected} / ${total}`">
        <p><strong>{{ formattedCollected }}</strong><span>/ {{ formattedTotal }}</span></p>
        <small>{{ copy.collected }}</small>
        <div class="album-progress-track" aria-hidden="true"><span :style="{ transform: `scaleX(${progress / 100})` }" /></div>
      </div>
      <button type="button" class="album-browse" @click="browse">{{ copy.browse }}<span aria-hidden="true">↓</span></button>
    </div>
    <button type="button" class="album-art" :aria-label="copy.browse" @click="browse">
      <span class="album-fan" aria-hidden="true">
        <span v-for="(color, index) in colors" :key="color" class="specimen-paper" :class="`specimen-${color}`">
          <span class="specimen-lift">
            <span class="specimen-tape" />
            <span class="specimen-window"><img :src="`/images/friends-comic/pikmin-${color}.png`" alt="" :width="sizes[color][0]" :height="sizes[color][1]" /></span>
            <span class="specimen-caption"><span class="specimen-dot" :class="`dot-${color}`" /><span>{{ String(index + 1).padStart(2, '0') }}</span></span>
          </span>
        </span>
      </span>
    </button>
  </section>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const props = defineProps<{
  title: string;
  subtitle: string;
  total: number;
  collected: number;
}>();
const emit = defineEmits<{ browse: [] }>();
const { locale } = useI18n();
const copy = computed(() => locale.value.startsWith('en') ? {
  eyebrow: 'COLLECTION / 01', collected: 'collected', browse: 'Open the album', postcard: 'A little discovery, every day.', seal: 'BLOOM',
} : {
  eyebrow: 'COLLECTION / 01', collected: '已收藏', browse: '翻開圖鑑', postcard: '記下每一天的小發現', seal: '收藏手帖',
});
const formatter = computed(() => new Intl.NumberFormat(locale.value.startsWith('en') ? 'en-US' : 'zh-TW'));
const formattedCollected = computed(() => formatter.value.format(props.collected));
const formattedTotal = computed(() => formatter.value.format(props.total));
const progress = computed(() => props.total > 0 ? Math.min(100, Math.max(0, props.collected / props.total * 100)) : 0);
const cover = ref<HTMLElement | null>(null);
const colors = ['red', 'yellow', 'blue'] as const;
const sizes = { red: [464, 956], yellow: [428, 900], blue: [366, 964] } as const;
let media: gsap.MatchMedia | null = null;
let responseContext: gsap.Context | null = null;
let responding = false;

const clearResponse = () => {
  responseContext?.revert();
  responseContext = null;
  responding = false;
};

const browse = () => {
  if (responding) return;
  emit('browse');
  if (!cover.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  clearResponse();
  responding = true;
  responseContext = gsap.context(() => {
    const papers = gsap.utils.toArray<HTMLElement>('.specimen-lift');
    const timeline = gsap.timeline({ onComplete: () => { responding = false; } });
    timeline.to(papers, {
      y: (index: number) => index === 1 ? -24 : -12,
      x: (index: number) => (index - 1) * 10,
      rotation: (index: number) => (index - 1) * 5,
      duration: 0.24, stagger: 0.045, ease: 'power2.out',
    }).to(papers, {
      y: 0, x: 0, rotation: 0, duration: 0.34, stagger: 0.035, ease: 'power2.inOut',
    }, '+=0.04');
  }, cover.value);
};

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger);
  media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    if (!cover.value) return;
    const context = gsap.context(() => {
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: cover.value,
          start: 'clamp(top 20%)', end: 'bottom top', scrub: 0.3, invalidateOnRefresh: true,
        },
      })
                .to('.album-fan', { y: -10, rotation: -2, duration: 1 }, 0)
        .to('.specimen-red', { x: -5, rotation: -7, duration: 1 }, 0)
        .to('.specimen-blue', { x: 5, rotation: 6, duration: 1 }, 0);
    }, cover.value);
    return () => { context.revert(); clearResponse(); };
  });
});

onUnmounted(() => { media?.revert(); clearResponse(); });
</script>



<style scoped>
.album-cover { position: relative; isolation: isolate; min-height: 13rem; padding: 1.25rem; overflow: clip; color: #23483c; }
.album-copy { position: relative; z-index: 2; width: 53%; padding: 0; }
.album-eyebrow { color: #829085; font-size: .61rem; font-weight: 600; letter-spacing: .14em; }
h1 { margin-top: .55rem; color: #193e33; font-size: clamp(1.65rem,6.5vw,2rem); line-height: 1.2; font-weight: 850; letter-spacing: -.045em; }
.album-subtitle { margin-top: .6rem; max-width: 12rem; color: #6d8173; font-size: .7rem; line-height: 1.7; text-wrap: pretty; }
.album-progress { width: min(100%,10rem); margin-top: 1.05rem; }.album-progress p { display: flex; align-items: baseline; flex-wrap: wrap; gap: .25rem; font-variant-numeric: tabular-nums; }
.album-progress strong { color: #234c40; font-size: 1.55rem; font-weight: 800; line-height: 1; letter-spacing: -.04em; }.album-progress p > span { font-size: .8rem; color: #7b8d7f; }.album-progress > small { display: block; margin-top: .35rem; color: #078a61; font-size: .65rem; }
.album-progress-track { height: 3px; margin-top: .4rem; overflow: hidden; border-radius: 3px; background: #e1e7dc; }.album-progress-track span { display: block; width: 100%; height: 100%; transform-origin: left; background: #10b981; transition: transform .3s; }
.album-browse { display: inline-flex; align-items: center; gap: .8rem; min-height: 44px; margin-top: .55rem; padding: .3rem 0; color: #078a61; font-size: .72rem; font-weight: 700; }.album-browse span { font-size: 1rem; }
.album-art { position: absolute; z-index: 1; top: 1.4rem; right: 1.25rem; width: 42%; height: 11.5rem; padding: 0; border: 0; background: none; -webkit-tap-highlight-color: transparent; }
.album-fan { position: absolute; inset: 0; transform-origin: bottom center; }
.specimen-paper { position: absolute; top: .4rem; width: 38%; height: 9.8rem; transform-origin: 50% 90%; }.specimen-red { left: 0; z-index: 1; transform: rotate(-5deg); }.specimen-yellow { left: 30%; z-index: 3; top: .7rem; transform: rotate(2deg); }.specimen-blue { right: 0; z-index: 2; top: 1rem; transform: rotate(5deg); }
.specimen-lift { position: relative; display: flex; flex-direction: column; width: 100%; height: 100%; padding: .4rem .25rem .2rem; border: 1px solid #e7e5d9; border-radius: .16rem; background: #fffdf7; box-shadow: 0 2px 0 #e8e9df, 0 5px 9px #334b3312; transform-origin: bottom center; }
.specimen-tape { position: absolute; z-index: 2; top: -.2rem; left: 29%; width: 42%; height: .42rem; background: #f2c8b2c7; transform: rotate(-3deg); }.specimen-yellow .specimen-tape { background: #e8d9abc7; }.specimen-blue .specimen-tape { background: #b8d8dec7; }
.specimen-window { display: block; flex: 1; min-height: 0; }.specimen-window img { display: block; width: 100%; height: 100%; object-fit: contain; padding: .25rem .1rem; }
.specimen-caption { display: flex; align-items: center; justify-content: space-between; gap: .2rem; min-height: .8rem; padding: .15rem; color: #9ba491; font: 600 .55rem ui-monospace,monospace; }.specimen-dot { display: block; width: .3rem; height: .3rem; border-radius: 50%; }.dot-red { background: #df8373; }.dot-yellow { background: #d9bf62; }.dot-blue { background: #7cadc0; }
.album-browse:focus-visible,.album-art:focus-visible { outline: 3px solid #10b981; outline-offset: 3px; border-radius: .3rem; }
@media(max-width:360px) { .album-cover { padding: 1rem; }.album-copy { width: 54%; }.album-art { width: 40%; right: 1rem; }.album-eyebrow { font-size: .55rem; }.album-subtitle { font-size: .66rem; }.specimen-paper { height: 9.1rem; }.album-progress strong { font-size: 1.35rem; }.album-progress p>span { font-size: .7rem; } }
@media(min-width:640px) { .album-cover { min-height: 15rem; }.album-copy { padding: 1.1rem; width: 58%; }.album-eyebrow { font-size: .72rem; }h1 { font-size: 2.75rem; }.album-subtitle { max-width: 24rem; font-size: .9rem; }.album-progress { margin-top: 1.2rem; }.album-progress strong { font-size: 2rem; }.album-progress p>span { font-size: .95rem; }.album-art { width: 18rem; right: 2rem; top: 1.5rem; height: 13rem; }.specimen-paper { height: 12rem; width: 37%; }.album-browse { font-size: .8rem; }.specimen-lift { padding: .5rem .4rem .3rem; }.specimen-caption { font-size: .65rem; }.specimen-tape { height: .55rem; } }
@media(prefers-reduced-motion:reduce) { .album-progress-track span { transition: none; } }
</style>
