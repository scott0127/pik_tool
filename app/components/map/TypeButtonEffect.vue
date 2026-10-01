<script setup lang="ts">
import { gsap } from 'gsap';
import { getMapTypeObject } from '~/utils/mapTypeObjects';
const props = defineProps<{ id: string; selected: boolean; revision: number; animate: boolean }>();
const scene = computed(() => getMapTypeObject(props.id));
const root = ref<HTMLElement | null>(null);
let context: gsap.Context | undefined;
let timeline: gsap.core.Timeline | undefined;
let preference: MediaQueryList | undefined;
let resize: ResizeObserver | undefined;
let previousWidth = 0;
const weather = computed(() => ['rain', 'snow'].includes(scene.value.motif ?? ''));
const water = computed(() => scene.value.motif === 'water');
const mountain = computed(() => scene.value.motif === 'mountain');
const detail = computed(() => ['sparkle', 'power', 'wash'].includes(scene.value.motif ?? ''));

// Tap places this category's object on the border and leaves it there.
// Cancel reverses the same sequence; the Pikmin returns to collect its delivery.
// Initial selections, bulk changes and reduced motion seek directly to the result.
function sync(animate = props.animate) {
  if (!timeline) return;
  if (!animate || preference?.matches) timeline.progress(props.selected ? 1 : 0).pause();
  else props.selected ? timeline.play() : timeline.reverse();
}
function build() {
  if (!root.value?.clientWidth) return;
  const width = root.value.clientWidth;
  const oldProgress = timeline?.progress();
  const running = timeline?.isActive();
  previousWidth = width;
  context?.revert();
  const drop = width - 82;
  context = gsap.context(() => {
    const kind = scene.value.family;
    if (kind !== 'book' && kind !== 'pocket') gsap.set('.category-cargo', { autoAlpha: 0, x: drop, y: 21, transformOrigin: '50% 90%' });
    gsap.set('.category-seat', { scaleX: 0, opacity: 0 });
    timeline = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
    if (kind === 'courier') {
      gsap.set('.category-courier', { x: -54, y: 1, autoAlpha: 0, transformOrigin: '50% 100%' });
      gsap.set('.category-cargo', { x: -17, y: 13, rotation: -7 });
      timeline.addLabel('arrive', 0)
        .set('.category-courier, .category-cargo', { autoAlpha: 1 }, 'arrive')
        .to('.category-courier', { x: drop - 20, duration: .66, ease: 'power1.inOut' }, 'arrive')
        .to('.category-cargo', { x: drop, rotation: 0, duration: .66, ease: 'power1.inOut' }, 'arrive')
        .to('.category-courier', { y: -2, rotation: -3, duration: .0825, repeat: 7, yoyo: true, ease: 'sine.inOut' }, 'arrive')
        .addLabel('handoff', .66)
        .to('.category-courier', { rotation: 12, y: 3, duration: .16 }, 'handoff')
        .to('.category-cargo', { x: drop + 5, y: 27, rotation: 5, duration: .23 }, 'handoff+=.1')
        .to('.category-seat', { scaleX: 1, opacity: .22, duration: .18 }, 'handoff+=.17')
        .to('.category-cargo', { rotation: 0, duration: .14, ease: 'back.out(2)' }, 'handoff+=.33')
        .addLabel('leave', 1.13)
        .to('.category-courier', { rotation: 0, y: 1, duration: .12 }, 'leave')
        .to('.category-courier', { x: width + 8, duration: .46, ease: 'power1.in' }, 'leave')
        .to('.category-courier', { y: -2, rotation: 3, duration: .076, repeat: 5, yoyo: true }, 'leave')
        .set('.category-courier', { autoAlpha: 0 }, 'leave+=.46');
    } else if (kind === 'cafe') {
      gsap.set('.category-cargo', { y: -6, scale: .82, rotation: -10 });
      gsap.set('.category-tray', { x: 70, autoAlpha: 0 });
      gsap.set('.category-receipt', { y: 22, rotation: 9, autoAlpha: 0 });
      gsap.set('.category-steam i', { scaleY: 0, y: 5, opacity: 0, transformOrigin: 'bottom' });
      timeline.addLabel('serve', 0)
        .to('.category-tray', { x: 0, autoAlpha: 1, duration: .3 }, 'serve')
        .to('.category-receipt', { y: 0, rotation: -8, autoAlpha: 1, duration: .27 }, 'serve+=.1')
        .to('.category-cargo', { y: 27, scale: 1, rotation: 0, autoAlpha: 1, duration: .37, ease: 'back.out(1.4)' }, 'serve+=.2')
        .to('.category-seat', { scaleX: 1, opacity: .2, duration: .15 }, 'serve+=.48')
        .to('.category-steam i', { scaleY: 1, y: 0, opacity: .5, duration: .3, stagger: .075 }, 'serve+=.58');
    } else if (kind === 'orbit') {
      const flight = scene.value.motif === 'flight';
      const rolling = !['ride', 'flight', 'cross'].includes(scene.value.motif ?? '');
      gsap.set('.category-cargo', { x: -58, y: flight ? -10 : 25, rotation: rolling ? -160 : -8, scale: .85 });
      gsap.set('.category-rail-ink', { scaleX: 0, transformOrigin: 'left' });
      timeline.addLabel('travel', 0)
        .to('.category-cargo', { autoAlpha: 1, duration: .12 }, 'travel')
        .to('.category-rail-ink', { scaleX: 1, duration: .6 }, 'travel')
        .to('.category-cargo', { x: drop + 5, y: 22, rotation: 5, scale: 1, duration: .75 }, 'travel')
        .to('.category-seat', { scaleX: 1, opacity: .2, duration: .2 }, 'travel+=.55')
        .to('.category-cargo', { y: 27, rotation: 0, duration: .18 }, 'travel+=.75')
        .to('.category-rail-ink', { scaleX: 0, transformOrigin: 'right', duration: .2 }, 'travel+=.75');
      if (scene.value.motif === 'play') timeline.to('.category-cargo', { y: 16, duration: .13, ease: 'power2.out' }, .75).to('.category-cargo', { y: 27, duration: .2, ease: 'bounce.out' });
      if (scene.value.motif === 'charm' || scene.value.motif === 'snip') timeline.to('.category-cargo', { rotation: -12, duration: .12 }, .76).to('.category-cargo', { rotation: 7, duration: .12 }).to('.category-cargo', { rotation: 0, duration: .15 });
      if (detail.value) {
        gsap.set('.category-detail i', { scale: 0, opacity: 0 });
        timeline.to('.category-detail i', { scale: 1, opacity: .85, duration: .22, stagger: .065, ease: 'back.out(1.6)' }, .72);
      }
    } else if (kind === 'pocket') {
      gsap.set('.category-pocket', { autoAlpha: 0, y: 8 });
      gsap.set('.category-ticket', { y: 26, rotation: 7, rotationX: 12 });
      gsap.set('.category-ticket-fold', { rotationY: -150, transformOrigin: 'right top' });
      gsap.set('.category-pocket-front', { rotationX: 0, transformOrigin: 'center bottom' });
      timeline.addLabel('open', 0)
        .to('.category-pocket', { autoAlpha: 1, y: 0, duration: .18 }, 'open')
        .to('.category-pocket-front', { rotationX: 18, duration: .2 }, 'open')
        .addLabel('draw', .12)
        .to('.category-ticket', { y: -12, rotation: -5, rotationX: 0, duration: .52 }, 'draw')
        .to('.category-ticket-fold', { rotationY: 0, duration: .28 }, 'draw+=.25')
        .to('.category-pocket-front', { rotationX: 0, duration: .2 }, 'draw+=.52');
    } else if (kind === 'book') {
      gsap.set('.category-book', { autoAlpha: 0, y: 8, rotation: -2 });
      gsap.set('.category-book-cover', { rotationY: 0 });
      gsap.set('.category-book-page', { rotationY: 82, opacity: 0 });
      gsap.set('.category-ribbon', { scaleY: 0, opacity: 0, transformOrigin: 'top' });
      timeline.addLabel('unfold', 0)
        .to('.category-book', { autoAlpha: 1, y: 0, rotation: -5, duration: .24 }, 'unfold')
        .to('.category-book-cover', { rotationY: -145, duration: .5, ease: 'power3.inOut' }, 'unfold+=.08')
        .to('.category-book-page', { rotationY: 0, opacity: 1, duration: .4, stagger: .07 }, 'unfold+=.24')
        .to('.category-ribbon', { scaleY: 1, opacity: 1, duration: .24, ease: 'back.out(1.5)' }, 'unfold+=.66');
    } else {
      gsap.set('.category-cargo', { y: 35, scale: .15, transformOrigin: '50% 100%' });
      if (water.value || scene.value.motif === 'rain') gsap.set('.category-ripple', { scale: .15, opacity: 0 });
      if (weather.value) gsap.set('.category-weather i', { y: -15, opacity: 0 });
      else if (mountain.value) gsap.set('.category-mist', { x: -9, opacity: 0 });
      else if (!water.value) {
        gsap.set('.category-leaf', { scale: 0, transformOrigin: 'bottom' });
        gsap.set('.category-seed', { y: -23, autoAlpha: 0 });
        timeline.to('.category-seed', { y: 0, autoAlpha: 1, duration: .22, ease: 'power2.in' }, 0).to('.category-seed', { autoAlpha: 0, duration: .1 }, .2);
      }
      timeline.addLabel('grow', 0)
        .to('.category-cargo', { y: 27, scale: 1, autoAlpha: 1, duration: .65, ease: 'back.out(1.3)' }, 'grow+=.12')
        .to('.category-seat', { scaleX: 1, opacity: .15, duration: .2 }, 'grow+=.55');
      if (water.value) timeline.to('.category-ripple', { scale: 1, opacity: .65, duration: .5, stagger: .12 }, 'grow');
      else if (weather.value) {
        timeline.to('.category-weather i', { y: 22, opacity: .8, duration: .6, stagger: .1 }, 'grow+=.3');
        if (scene.value.motif === 'rain') timeline.to('.category-ripple', { scale: 1, opacity: .5, duration: .4, stagger: .08 }, 'grow+=.65');
      }
      else if (mountain.value) timeline.to('.category-mist', { x: 7, opacity: .8, duration: .65, stagger: .08 }, 'grow+=.25');
      else timeline.to('.category-leaf', { scale: 1, rotation: 0, duration: .38, stagger: .11 }, 'grow+=.3');
    }
    timeline.progress(oldProgress ?? (props.selected ? 1 : 0)).pause();
    if (running) sync();
  }, root.value);
}
function preferenceChanged() { sync(false); }
watch([() => props.selected, () => props.revision], () => sync(), { flush: 'post' });
onMounted(() => {
  preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  preference.addEventListener('change', preferenceChanged);
  build();
  resize = new ResizeObserver(() => { if (root.value && root.value.clientWidth !== previousWidth) build(); });
  if (root.value) resize.observe(root.value);
});
onBeforeUnmount(() => { resize?.disconnect(); preference?.removeEventListener('change', preferenceChanged); context?.revert(); });
</script>

<template>
  <span ref="root" class="category-scene" :class="[`scene-${scene.family}`, `motif-${scene.motif}`]" :style="{ '--object-accent': scene.accent }" aria-hidden="true">
    <span class="category-seat" />
    <span v-if="scene.family === 'courier'" class="category-courier">
      <img src="/images/friends-comic/pikmin-red.png" alt="" draggable="false" />
    </span>
    <template v-if="scene.family === 'cafe'">
      <span class="category-tray" /><span class="category-receipt"><i /><i /><i /></span>
      <span class="category-steam"><i /><i /><i /></span>
    </template>
    <span v-if="scene.family === 'orbit'" class="category-rail"><span class="category-rail-ink" /></span>
    <span v-if="detail" class="category-detail"><i /><i /><i /></span>
    <span v-if="scene.family === 'pocket'" class="category-pocket">
      <span class="category-pocket-back" />
      <span class="category-ticket"><img :src="scene.image" alt="" draggable="false" /><span class="category-ticket-fold" /></span>
      <span class="category-pocket-front"><span /></span><span class="category-pocket-lip" />
    </span>
    <span v-else-if="scene.family === 'book'" class="category-book">
      <span class="category-book-back" />
      <span v-for="page in 3" :key="page" class="category-book-page"><img v-if="page === 3" :src="scene.image" alt="" draggable="false" /><i /><i /></span>
      <span class="category-ribbon" /><span class="category-book-cover"><span /></span><span class="category-book-spine" />
    </span>
    <template v-else>
      <template v-if="scene.family === 'garden'">
        <template v-if="water || scene.motif === 'rain'"><span v-for="r in 2" :key="r" class="category-ripple" :class="`ripple-${r}`" /></template>
        <span v-if="weather" class="category-weather"><i v-for="d in 3" :key="d" /></span>
        <template v-else-if="mountain"><span class="category-mist mist-back" /><span class="category-mist mist-front" /></template>
        <template v-else-if="!water"><span class="category-seed" /><span class="category-leaf leaf-left" /><span class="category-leaf leaf-right" /></template>
      </template>
      <img class="category-cargo" :src="scene.image" alt="" decoding="async" draggable="false" />
    </template>
  </span>
</template>

<style scoped>
.category-scene{position:absolute;left:0;right:0;top:-48px;height:74px;z-index:3;overflow:hidden;pointer-events:none;perspective:350px;isolation:isolate}
.category-cargo{position:absolute;left:0;top:0;width:54px;height:44px;object-fit:contain;object-position:center bottom;visibility:hidden;filter:drop-shadow(0 2px 1px #47371b20)}
.category-seat{position:absolute;right:24px;top:69px;width:48px;height:3px;border-radius:50%;background:#385541;opacity:0}
.category-courier{position:absolute;left:0;top:0;width:44px;height:68px;visibility:hidden}
.category-courier img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center bottom}
.category-tray{position:absolute;right:20px;top:68px;width:68px;height:5px;border:1px solid #bb8753;background:#dcc091;border-radius:2px 2px 5px 5px;box-shadow:0 2px 0 #aa7c50;visibility:hidden}
.category-receipt{position:absolute;right:74px;top:42px;width:20px;height:30px;background:#f7eddb;border:1px solid #dfd3b8;border-radius:2px;box-shadow:1px 2px 2px #49362114;visibility:hidden;display:grid;align-content:start;gap:4px;padding:7px 4px}.category-receipt i{height:1px;background:#ccb89b}
.category-steam{position:absolute;right:35px;top:5px;display:flex;gap:5px;width:27px;height:18px}.category-steam i{width:2px;height:18px;border-radius:100% 0 100% 0;background:#b89b7e;opacity:0}.category-steam i:nth-child(2){height:23px;margin-top:-4px}
.category-rail{position:absolute;left:14px;right:30px;top:69px;height:1px}.category-rail-ink{display:block;height:1px;background:#bbad88;opacity:.65}
.category-pocket{position:absolute;right:21px;top:20px;width:58px;height:54px;perspective:250px;visibility:hidden}
.category-pocket-back{position:absolute;inset:12px 3px 0;border-radius:4px;background:#c6a078;border:1px solid #b79771}
.category-ticket{position:absolute;left:8px;top:7px;width:40px;height:43px;padding:4px;border:1px solid #dac8a6;background:#fff9e8;border-radius:2px;box-shadow:0 2px 2px #49362122;transform-origin:bottom}
.category-ticket img{width:100%;height:31px;object-fit:contain}.category-ticket-fold{position:absolute;right:-1px;top:-1px;width:11px;height:11px;background:#ecdabc;clip-path:polygon(0 0,100% 0,100% 100%)}
.category-pocket-front{position:absolute;inset:25px 1px 0;border:1px solid #b99970;border-radius:2px 2px 7px 7px;background:linear-gradient(110deg,#f2dfbf,#e2c399);box-shadow:inset 0 -2px 0 #dbba8c}
.category-pocket-front>span{position:absolute;inset:5px;border:1px dashed #b7966b66;border-top:0;border-radius:0 0 4px 4px}
.category-pocket-lip{position:absolute;left:0;right:0;top:24px;height:4px;border:1px solid #bea37d;border-radius:3px;background:#f4e3c5}
.category-book{position:absolute;right:29px;top:18px;width:37px;height:50px;perspective:260px;visibility:hidden;filter:drop-shadow(1px 3px 2px #183a4028)}
.category-book-back{position:absolute;inset:0 -2px -1px 0;background:#e0c792;border:1px solid #b59461;border-radius:1px 4px 4px 1px}
.category-book-cover{position:absolute;inset:0;z-index:5;border:1px solid #294c3b;border-radius:1px 4px 4px 1px;background:linear-gradient(90deg,#234f40,#4e7964 15%,#356b56 95%,#224e3e);transform-origin:2px 50%;box-shadow:inset 1px 0 0 #ffffff22}
.category-book-cover>span{position:absolute;inset:6px 5px 6px 7px;border:1px solid #d4b97b;border-radius:1px}.category-book-cover>span::after{content:'';position:absolute;left:4px;right:4px;top:12px;height:2px;background:#e2cca0;box-shadow:0 4px 0 #e2cca077}
.category-book-spine{position:absolute;z-index:6;left:0;top:1px;bottom:0;width:3px;border-radius:1px;background:#234838}
.category-book-page{position:absolute;inset:2px 1px 2px 3px;display:grid;align-content:start;gap:3px;padding:4px;border:1px solid #dfd4b8;border-radius:0 2px 2px 0;background:#fffbea;opacity:0;transform-origin:left;box-shadow:1px 1px 0 #dbcda9}.category-book-page:nth-of-type(2){z-index:1}.category-book-page:nth-of-type(3){z-index:2}.category-book-page:nth-of-type(4){z-index:3}.category-book-page img{height:27px;width:100%;object-fit:contain}.category-book-page i{height:1px;background:#c4bc9b}
.category-ribbon{position:absolute;z-index:4;right:6px;bottom:-7px;width:5px;height:21px;background:#d79164;clip-path:polygon(0 0,100% 0,100% 100%,50% 86%,0 100%)}
.category-seed{position:absolute;right:49px;top:62px;width:5px;height:7px;border-radius:70% 35% 65% 35%;background:#95754c;visibility:hidden}
.category-leaf{position:absolute;right:58px;top:53px;width:21px;height:9px;border-radius:2% 95% 6% 95%;background:linear-gradient(150deg,#b1c17c,#688951);border-bottom:1px solid #668848;transform:scale(0) rotate(-25deg)}.leaf-right{right:18px;top:50px;border-radius:95% 2% 95% 6%;transform:scale(0) rotate(25deg)}
.category-ripple{position:absolute;right:14px;top:62px;width:72px;height:10px;border:1px solid #72a5a6;border-radius:50%;opacity:0}.ripple-2{right:20px;top:65px;width:59px;height:6px}
.category-weather{position:absolute;right:34px;top:21px;display:flex;gap:9px;height:35px}.category-weather i{width:2px;height:6px;border-radius:100% 0 100% 0;background:#83a5b0;opacity:0}.motif-snow .category-weather i{width:4px;height:4px;border-radius:50%;background:#c0d0d6}
.category-mist{position:absolute;right:22px;top:49px;width:58px;height:9px;border-radius:50%;background:#fff9e8;opacity:0}.mist-back{right:37px;top:34px;width:32px;height:6px}
.category-detail{position:absolute;right:21px;top:23px;display:flex;gap:5px}.category-detail i{width:5px;height:5px;transform:scale(0);opacity:0;background:var(--object-accent);clip-path:polygon(50% 0,65% 35%,100% 50%,65% 65%,50% 100%,35% 65%,0 50%,35% 35%)}.category-detail i:nth-child(2){margin-top:-8px}.motif-power .category-detail i{clip-path:none;border-radius:50%;width:3px;height:3px;background:#d9df8c;box-shadow:0 0 4px #ffeb9680}.motif-wash .category-detail i{clip-path:none;border:1px solid #91b7c3;border-radius:50%;background:#f7fdff80;width:7px;height:7px}
</style>
