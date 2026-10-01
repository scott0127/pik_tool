<script setup lang="ts">
import { gsap } from 'gsap';

const props = withDefaults(defineProps<{ variant: 'courier' | 'cafe'; reducedMotion?: boolean; speed?: number }>(), { reducedMotion: false, speed: 1 });
const emit = defineEmits<{ change: [selected: boolean] }>();
const root = ref<HTMLElement | null>(null);
const selected = ref(false);
let context: gsap.Context | undefined;
let timeline: gsap.core.Timeline | undefined;
let press: gsap.core.Timeline | undefined;
let resize: ResizeObserver | undefined;
const title = computed(() => props.variant === 'courier' ? '漢堡店' : '咖啡廳');

// Delivery: the courier enters carrying an independent item, reaches out,
// places it on the border, then exits. Reverse brings the courier back to collect it.
function build() {
  if (!root.value) return;
  const progress = timeline?.progress() ?? (selected.value ? 1 : 0);
  context?.revert();
  const width = root.value.clientWidth;
  const drop = width - 78;
  context = gsap.context(() => {
    gsap.set('.service-object', { transformOrigin: '50% 85%', autoAlpha: 0 });
    gsap.set('.service-contact', { scaleX: 0, opacity: 0 });
    timeline = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
    if (props.variant === 'courier') {
      gsap.set('.courier', { x: -76, y: 17, autoAlpha: 0 });
      gsap.set('.service-object', { x: -20, y: 37, rotation: -8 });
      timeline.addLabel('arrive', 0)
        .set('.courier, .service-object', { autoAlpha: 1 }, 'arrive')
        .to('.courier', { x: drop - 30, duration: .72, ease: 'power1.inOut' }, 'arrive')
        .to('.service-object', { x: drop, rotation: 0, duration: .72, ease: 'power1.inOut' }, 'arrive')
        .to('.courier', { y: 13, rotation: -3, duration: .09, repeat: 7, yoyo: true, ease: 'sine.inOut' }, 'arrive')
        .addLabel('handoff', .72)
        .to('.courier', { rotation: 12, y: 19, duration: .16 }, 'handoff')
        .to('.service-object', { x: drop + 6, y: 48, rotation: 5, duration: .25 }, 'handoff+=.12')
        .to('.service-contact', { scaleX: 1, opacity: .3, duration: .2 }, 'handoff+=.2')
        .to('.service-object', { rotation: 0, duration: .16, ease: 'back.out(2)' }, 'handoff+=.37')
        .addLabel('leave', 1.23)
        .to('.courier', { rotation: 0, y: 17, duration: .12 }, 'leave')
        .to('.courier', { x: width + 10, duration: .6, ease: 'power1.in' }, 'leave')
        .to('.courier', { y: 13, rotation: 3, duration: .1, repeat: 5, yoyo: true, ease: 'sine.inOut' }, 'leave')
        .set('.courier', { autoAlpha: 0 }, 'leave+=.6');
    } else {
      gsap.set('.service-object', { x: drop + 6, y: 14, scale: .84, rotation: -12 });
      gsap.set('.cafe-tray', { x: 82, autoAlpha: 0 });
      gsap.set('.cafe-receipt', { y: 26, rotation: 12, autoAlpha: 0 });
      gsap.set('.cafe-steam i', { scaleY: 0, y: 7, opacity: 0, transformOrigin: 'bottom' });
      timeline.addLabel('serve', 0)
        .to('.cafe-tray', { x: 0, autoAlpha: 1, duration: .38 }, 'serve')
        .to('.cafe-receipt', { y: 0, rotation: -8, autoAlpha: 1, duration: .32, ease: 'back.out(1.5)' }, 'serve+=.14')
        .to('.service-object', { y: 49, scale: 1, rotation: 0, autoAlpha: 1, duration: .42, ease: 'back.out(1.4)' }, 'serve+=.25')
        .to('.service-contact', { scaleX: 1, opacity: .24, duration: .18 }, 'serve+=.58')
        .to('.cafe-steam i', { y: 0, scaleY: 1, opacity: .65, duration: .4, stagger: .11, ease: 'sine.out' }, 'serve+=.67');
    }
    timeline.timeScale(props.speed).progress(progress).pause();
    if (!props.reducedMotion && progress > 0 && progress < 1) selected.value ? timeline.play() : timeline.reverse();
  }, root.value);
}

function toggle() {
  selected.value = !selected.value;
  emit('change', selected.value);
  if (!timeline) return;
  if (props.reducedMotion) { timeline.progress(selected.value ? 1 : 0).pause(); return; }
  press?.kill();
  const button = root.value?.querySelector('.service-button');
  if (button) press = gsap.timeline().to(button, { scaleY: .94, y: 3, duration: .09, overwrite: 'auto' }).to(button, { scaleY: 1, y: 0, duration: .32, ease: 'back.out(2)' });
  selected.value ? timeline.play() : timeline.reverse();
}
function reset() {
  selected.value = false;
  timeline?.progress(0).pause();
  press?.kill();
  if (root.value) gsap.set(root.value.querySelector('.service-button'), { clearProps: 'transform' });
  emit('change', false);
}
defineExpose({ reset });
watch(() => props.speed, value => timeline?.timeScale(value));
watch(() => props.reducedMotion, value => { if (value) { press?.kill(); timeline?.progress(selected.value ? 1 : 0).pause(); if (root.value) gsap.set(root.value.querySelector('.service-button'), { clearProps: 'transform' }); } });
onMounted(() => {
  build();
  resize = new ResizeObserver(() => build());
  if (root.value) resize.observe(root.value);
});
onUnmounted(() => { resize?.disconnect(); press?.kill(); context?.revert(); });
</script>

<template>
  <div ref="root" class="service-stage" :class="{ 'is-cafe': variant === 'cafe', 'is-selected': selected }">
    <div class="service-rail" aria-hidden="true">
      <div v-if="variant === 'courier'" class="courier">
        <img src="/images/friends-comic/pikmin-red.png" alt="" draggable="false" />
      </div>
      <span class="service-contact" />
      <template v-if="variant === 'cafe'">
        <span class="cafe-tray" />
        <span class="cafe-receipt"><b>ORDER</b><i /><i /><i /></span>
        <span class="cafe-steam"><i /><i /><i /></span>
      </template>
      <img class="service-object" :src="`/images/motion-lab/${variant === 'courier' ? 'burger' : 'coffee'}.png`" alt="" draggable="false" />
    </div>
    <button type="button" class="service-button" :aria-label="`${title}，${selected ? '已選取，點擊取消' : '點擊選取'}`" :aria-pressed="selected" @click="toggle">
      <span class="service-number">{{ variant === 'courier' ? '05' : '02' }}</span>
      <span class="service-label"><strong>{{ title }}</strong><small>{{ variant === 'courier' ? 'a little delivery' : 'freshly served' }}</small></span>
      <span class="service-check" aria-hidden="true"><span v-if="selected">✓</span><span v-else>＋</span></span>
    </button>
    <span class="service-state" aria-hidden="true">{{ selected ? (variant === 'courier' ? '漢堡留下，這個種類已選取' : '咖啡上桌，這個種類已選取') : '點一下選取，再點一下收回' }}</span>
  </div>
</template>

<style scoped>
.service-stage{position:relative;width:100%;height:184px;padding-top:82px;color:#244c3e;isolation:isolate}
.service-rail{position:absolute;inset:0 0 auto;height:106px;overflow:hidden;pointer-events:none;z-index:3}
.service-button{position:relative;width:100%;height:78px;display:flex;align-items:center;gap:16px;padding:0 23px;border:1px solid #b9c9bb;border-radius:19px;background:#fffdf5;box-shadow:0 5px 0 #d1d8c5,0 9px 18px #39563a09;color:inherit;touch-action:manipulation;text-align:left}
.is-selected .service-button{background:#10b981;border-color:#10b981;color:white;box-shadow:0 5px 0 #078c64,0 12px 25px #10b98120}
.service-button:focus-visible{outline:3px solid #a6753b;outline-offset:6px}
.service-number{font-size:12px;font-weight:700;opacity:.6;font-variant-numeric:tabular-nums}
.service-label{display:grid;gap:3px}.service-label strong{font-size:21px;letter-spacing:.03em}.service-label small{font-size:10px;letter-spacing:.07em;opacity:.64}
.service-check{margin-left:auto;display:grid;place-items:center;width:26px;height:26px;border:1px solid currentColor;border-radius:9px;font-size:17px;line-height:1;opacity:.8}
.service-state{display:block;margin-top:15px;font-size:11px;letter-spacing:.025em;color:#6e8174;text-align:center}
.courier{position:absolute;left:0;top:0;width:63px;height:72px;visibility:hidden;transform-origin:50% 95%}.courier img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:bottom}.courier-idle,.courier-reach{opacity:0}
.service-object{position:absolute;left:0;top:0;width:62px;height:50px;object-fit:contain;visibility:hidden;filter:drop-shadow(0 2px 1px #684c2520)}
.service-contact{position:absolute;right:12px;top:95px;width:58px;height:4px;background:#2b5238;border-radius:50%;opacity:0}
.is-cafe .service-button{border-radius:12px 25px 12px 25px}.is-cafe .service-label small{text-transform:uppercase;font-size:9px;letter-spacing:.13em}
.cafe-tray{position:absolute;right:9px;top:95px;width:80px;height:7px;border:1px solid #bb8753;background:#dcc091;border-radius:2px 2px 7px 7px;box-shadow:0 3px 0 #aa7c50;visibility:hidden}
.cafe-receipt{position:absolute;right:70px;top:66px;width:29px;height:45px;background:#f5e7c9;border:1px solid #dfd3b8;border-radius:2px;box-shadow:1px 2px 2px #49362114;transform-origin:bottom;visibility:hidden;display:grid;justify-items:center;gap:4px;padding:6px 3px}.cafe-receipt b{font-size:5px;letter-spacing:.5px;color:#947151}.cafe-receipt i{width:13px;height:1px;background:#ccb89b}
.cafe-steam{position:absolute;right:29px;top:19px;display:flex;gap:8px;width:39px;height:28px}.cafe-steam i{width:3px;height:24px;border-radius:100% 0 100% 0;background:#bb9675;opacity:0}.cafe-steam i:nth-child(2){height:31px;margin-top:-6px}
@media(max-width:350px){.service-button{padding:0 16px;gap:12px}.service-label strong{font-size:20px}}
</style>
