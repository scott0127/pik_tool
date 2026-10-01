<template>
  <section ref="scene" class="comic-story" :aria-label="$t('friends.comic.label')">
    <div class="comic-stage">
      <div class="comic-landscape" aria-hidden="true">
        <img src="/images/friends-comic/clearing.webp" alt="" width="1536" height="1024" fetchpriority="high" />
      </div>
      <div class="comic-heading" :inert="turned ? true : undefined" :aria-hidden="turned || undefined">
        <slot />
      </div>

      <div class="comic-cast">
        <div v-for="(color, index) in colors" :key="color" class="comic-character" :class="`character-${color}`">
          <button type="button" :aria-label="$t(`friends.comic.wave_${color}`)" @click="greet(index, $event)">
            <img :src="`/images/friends-comic/pikmin-${color}.png`" alt="" :width="characterSizes[color][0]" :height="characterSizes[color][1]" />
          </button>
        </div>
      </div>
      <Transition name="comic-greeting">
        <p v-if="greeting !== null" class="comic-speech" role="status">{{ $t(`friends.comic.greeting_${colors[greeting]}`) }}</p>
      </Transition>

      <article class="comic-invitation" :inert="!turned ? true : undefined" :aria-hidden="!turned || undefined">
        <span class="comic-invitation-label">{{ $t('friends.comic.invitation') }}</span>
        <h2>{{ friend?.username || $t('friends.comic.card_title') }}</h2>
        <p>{{ friend?.message || $t('friends.comic.card_message') }}</p>
        <button v-if="friend" type="button" class="comic-code" @click="$emit('copy', friend.friend_code, $event)">
          <span>{{ formatDisplayCode(friend.friend_code) }}</span>
          <span>{{ copiedCode === friend.friend_code ? $t('friends.copied_short') : $t('friends.copy_btn') }}</span>
        </button>
      </article>

      <img class="comic-foreground" src="/images/friends-comic/meadow.webp" alt="" width="1536" height="1024" aria-hidden="true" />
      <footer class="comic-footer">
        <span class="comic-page-number" aria-hidden="true">{{ turned ? '02' : '01' }} / 02</span>
        <button type="button" class="comic-browse" @click="$emit('browse')">{{ $t('friends.comic.browse') }} <span aria-hidden="true">↓</span></button>
      </footer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

defineProps<{
  friend?: { username: string; friend_code: string; message?: string | null };
  copiedCode: string;
}>();
defineEmits<{
  browse: [];
  copy: [code: string, event: MouseEvent];
}>();
const { formatDisplayCode } = useFriendPostHelpers();
const scene = ref<HTMLElement | null>(null);
const colors = ['red', 'yellow', 'blue'] as const;
const characterSizes = { red: [464, 956], yellow: [428, 900], blue: [366, 964] } as const;
const turned = ref(false);
const greeting = ref<number | null>(null);
let media: gsap.MatchMedia | null = null;
let greetingTimer: ReturnType<typeof setTimeout> | null = null;
let greetingTween: gsap.core.Tween | null = null;

const greet = (index: number, event: Event) => {
  greeting.value = index;
  if (greetingTimer) clearTimeout(greetingTimer);
  greetingTimer = setTimeout(() => { greeting.value = null; }, 2200);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const image = (event.currentTarget as HTMLElement).querySelector('img');
  greetingTween?.revert();
  greetingTween = gsap.fromTo(image, { y: 0, rotation: 0 }, {
    y: -15, rotation: index % 2 ? -9 : 9, duration: 0.2,
    repeat: 3, yoyo: true, ease: 'power2.out',
  });
};

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger);
  media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    if (!scene.value) return;
    const context = gsap.context(() => {
      // CSS keeps the stage in place. Only artwork moves; the scroll stays native.
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: scene.value, start: 'top 112px', end: 'bottom bottom', scrub: 0.3,
          invalidateOnRefresh: true,
          onUpdate: self => { turned.value = self.progress > 0.42; },
          onRefresh: self => { turned.value = self.progress > 0.42; },
        },
      })
        .to('.comic-landscape', { scale: 1.22, yPercent: -6, xPercent: -2, duration: 1 }, 0)
        .to('.comic-foreground', { scale: 1.2, yPercent: 13, duration: 1 }, 0)
        .to('.comic-heading', { y: -65, opacity: 0, duration: 0.28 }, 0.03)
        .to('.character-red', { x: 24, y: -30, rotation: 5, duration: 0.45 }, 0)
        .to('.character-yellow', { y: -42, rotation: -6, duration: 0.45 }, 0.05)
        .to('.character-blue', { x: -24, y: -22, rotation: -4, duration: 0.45 }, 0.08)
        .fromTo('.comic-invitation', { y: 95, scale: 0.76, rotation: -12, rotationY: 18, autoAlpha: 0 },
          { y: 0, scale: 1, rotation: -3, rotationY: 0, autoAlpha: 1, duration: 0.36 }, 0.32);
      gsap.fromTo('.comic-character button', { y: 35, opacity: 0 }, {
        y: 0, opacity: 1, stagger: 0.1, duration: 0.7, ease: 'back.out(1.6)',
        clearProps: 'transform,opacity',
      });
    }, scene.value);
    return () => {
      context.revert();
      greetingTween?.revert();
      greetingTween = null;
      turned.value = false;
    };
  });
});

onUnmounted(() => {
  media?.revert();
  greetingTween?.revert();
  if (greetingTimer) clearTimeout(greetingTimer);
});
</script>

<style scoped>
.comic-story { --stage-height: min(40rem, calc(100svh - 8rem)); position: relative; height: calc(var(--stage-height) + 22rem); margin-bottom: 1.75rem; }
.comic-stage { position: sticky; top: 7rem; height: var(--stage-height); min-height: 28rem; overflow: hidden; isolation: isolate; perspective: 1000px; border: 2px solid #274638; border-radius: 1.1rem; background: #fff7e7; box-shadow: 0 5px 0 #c7d3bc, 0 15px 32px #28463217; }
.comic-landscape { position: absolute; width: 100%; height: 72%; left: 0; bottom: 0; transform-origin: 50% 75%; z-index: -1; mask-image: linear-gradient(to bottom, transparent, #000 18%); }
.comic-landscape img { width: 100%; height: 100%; object-fit: cover; object-position: center 65%; }
.comic-heading { position: relative; z-index: 3; }
.comic-cast { position: absolute; inset: 0; pointer-events: none; }
.comic-character { position: absolute; bottom: 6.75rem; width: clamp(4.5rem, 18vw, 7rem); height: clamp(8rem, 32vw, 11rem); transform-origin: 50% 90%; }
.character-red { left: 14%; transform: rotate(-8deg); }
.character-yellow { left: 41%; bottom: 7.25rem; transform: rotate(6deg); }
.character-blue { right: 11%; transform: rotate(5deg); }
.comic-character button { display: block; min-width: 44px; min-height: 44px; width: 100%; height: 100%; cursor: pointer; pointer-events: auto; -webkit-tap-highlight-color: transparent; }
.comic-character button:focus-visible { outline: 2px solid #245e48; outline-offset: 3px; border-radius: 1rem; }
.comic-character img { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(1px 0 0 #fff9e8) drop-shadow(-1px 0 0 #fff9e8) drop-shadow(0 2px 0 #fff9e8) drop-shadow(0 8px 4px #203c3c30); transform-origin: 50% 90%; }
.comic-foreground { position: absolute; z-index: 4; bottom: -2.5rem; left: -18%; width: 136%; max-width: none; height: 65%; object-fit: fill; pointer-events: none; transform-origin: bottom center; }
.comic-footer { position: absolute; z-index: 6; left: 1rem; right: 1rem; bottom: 1rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.comic-page-number { padding: 0.4rem 0.6rem; border-radius: 0.35rem; background: #fff7e7; color: #365140; font: 700 0.7rem ui-monospace, monospace; }
.comic-browse { display: inline-flex; justify-content: space-between; align-items: center; gap: 1.5rem; min-height: 44px; padding: 0.55rem 1rem; border: 1.5px solid #274638; border-radius: 2rem; background: #fff9ed; color: #274638; font-size: 0.85rem; font-weight: 800; box-shadow: 0 3px 0 #274638; }
.comic-browse:active { transform: translateY(2px); box-shadow: 0 1px 0 #274638; }
.comic-browse:focus-visible, .comic-code:focus-visible { outline: 3px solid #548e67; outline-offset: 3px; }
.comic-invitation { position: absolute; z-index: 5; top: 18%; left: 10%; width: 80%; max-width: 28rem; padding: 1.35rem; visibility: hidden; border: 2px solid #274638; border-radius: 0.3rem; background: #fffaf0; color: #274638; box-shadow: 4px 5px 0 #e0bc77, 0 16px 30px #29462e26; }
.comic-invitation-label { font-size: 0.68rem; font-weight: 800; color: #a06b34; }
.comic-invitation h2 { margin-top: 0.65rem; font-size: 1.6rem; font-weight: 900; overflow-wrap: anywhere; }
.comic-invitation p { margin: 0.7rem 0 1.1rem; font-size: 0.9rem; line-height: 1.7; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; }
.comic-code { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem; min-height: 44px; width: 100%; padding: 0.7rem; border-radius: 0.4rem; background: #275440; color: #fff8e4; font-weight: 800; }
.comic-code span:first-child { font-family: ui-monospace, monospace; font-size: 0.98rem; white-space: nowrap; }
.comic-code span:last-child { font-size: 0.75rem; }
.comic-speech { position: absolute; z-index: 7; bottom: 12rem; left: 50%; transform: translateX(-50%) rotate(-3deg); max-width: 85%; padding: 0.65rem 0.95rem; border: 1.5px solid #274638; border-radius: 1rem 1rem 1rem 0; background: #fff9ed; color: #274638; font-size: 0.85rem; font-weight: 800; white-space: nowrap; box-shadow: 2px 3px 0 #c0ceab; }
.comic-greeting-enter-active, .comic-greeting-leave-active { transition: opacity 160ms ease, translate 160ms ease; }
.comic-greeting-enter-from, .comic-greeting-leave-to { opacity: 0; translate: 0 6px; }
@media (min-width: 768px) {
  .comic-story { --stage-height: min(43rem, calc(100svh - 8rem)); }
  .comic-landscape { height: 100%; mask-image: linear-gradient(to bottom, transparent, #000 38%); }
  .comic-landscape img { object-position: center; }
  .comic-character { width: 7rem; height: 11rem; bottom: 6rem; }
  .character-red { left: 22%; }
  .character-yellow { left: 49%; }
  .character-blue { right: 15%; }
  .comic-invitation { left: 35%; top: 25%; width: 40%; }
  .comic-foreground { width: 112%; left: -6%; height: 100%; bottom: -4rem; }
}
@media (max-width: 360px) {
  .comic-invitation { left: 6%; width: 88%; padding: 1rem; }
  .comic-invitation h2 { font-size: 1.4rem; }
}
@media (prefers-reduced-motion: reduce) {
  .comic-story { height: auto; }
  .comic-stage { position: relative; top: auto; }
  .comic-greeting-enter-active, .comic-greeting-leave-active { transition: none; }
}
</style>
