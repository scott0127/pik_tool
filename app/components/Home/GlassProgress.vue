<script setup lang="ts">
import { gsap } from 'gsap';
import type { createHomeGlass } from '~/utils/homeGlass';
const props = defineProps<{ percentage: number; collected: number; collectedLabel: string }>();
const host = ref<HTMLElement>();
const canvas = ref<HTMLCanvasElement>();
const lifted = ref(false);
const ready = ref(false);
const reduce = ref(false);
const ringProgress = computed(() => Math.max(0, Math.min(100, props.percentage)));
watch(ringProgress, value => scene?.progress(value));
let scene: ReturnType<typeof createHomeGlass> | undefined;
let media: MediaQueryList | undefined;
let tween: gsap.core.Tween | undefined;
let observer: IntersectionObserver | undefined;
let alive = true;
let loading = false;
function preference() {
  reduce.value = media?.matches ?? false;
  scene?.reduce(reduce.value);
  if (reduce.value) {
    tween?.kill();
    if (scene) { scene.pose.lift = lifted.value ? 1 : 0; scene.render(); }
  }
}
function toggle() {
  lifted.value = !lifted.value;
  tween?.kill();
  if (scene) tween = gsap.to(scene.pose, {
    lift: lifted.value ? 1 : 0,
    duration: reduce.value ? 0 : .95,
    ease: 'power2.inOut',
    // The lens has no idle loop; only interaction updates request a frame.
    onUpdate: () => scene?.render(),
  });
}
onMounted(() => {
  media = matchMedia('(prefers-reduced-motion: reduce)'); preference(); media.addEventListener('change', preference);
  observer = new IntersectionObserver(async entries => {
    if (!entries.some(entry => entry.isIntersecting) || loading || scene) return;
    loading = true;
    try {
      const { createHomeGlass } = await import('~/utils/homeGlass');
      if (!alive || !canvas.value) return;
      scene = createHomeGlass(canvas.value, value => { ready.value = value; });
      scene.pose.lift = lifted.value ? 1 : 0;
      scene.progress(ringProgress.value);
      scene.reduce(reduce.value);
      scene.render();
      ready.value = true;
      observer?.disconnect();
    } catch (error) { console.warn('Glass progress unavailable; keeping static progress.', error); }
  }, { rootMargin: '180px' });
  if (host.value) observer.observe(host.value);
});
onUnmounted(() => { alive = false; observer?.disconnect(); media?.removeEventListener('change', preference); tween?.kill(); scene?.dispose(); });
</script>

<template>
  <div ref="host" class="glass-progress" :class="{ 'is-lifted': lifted, 'is-ready': ready, 'is-reduced': reduce }">
    <button class="glass-object" type="button" :aria-pressed="lifted" :aria-label="`收藏進度 ${ringProgress}%，${lifted ? '放回' : '浮起'}透明圓環`" @click="toggle">
      <span class="glass-fallback" aria-hidden="true"></span>
      <canvas ref="canvas" class="glass-canvas" aria-hidden="true"></canvas>
      <span class="glass-progress-fallback" :style="{ background: `conic-gradient(#10b981 ${ringProgress}%, #ffffff50 0)` }" aria-hidden="true"></span>
      <span class="glass-data">
        <span class="glass-core">
          <Icon name="lucide:sprout" class="glass-sprout" aria-hidden="true" />
          <strong>{{ ringProgress }}<small>%</small></strong>
        </span>
        <span class="glass-collected"><b>{{ collected.toLocaleString() }}</b><span>{{ collectedLabel }}</span></span>
      </span>
    </button>
    <button class="glass-hint" type="button" :aria-pressed="lifted" @click="toggle"><span class="hint-dot" aria-hidden="true"></span>{{ lifted ? '輕點放回' : '輕點，讓透鏡浮起' }}<Icon :name="lifted ? 'lucide:arrow-down' : 'lucide:arrow-up-right'" /></button>
  </div>
</template>

<style scoped>
.glass-progress {
  width: min(100%, 24rem);
  position: relative;
  margin-inline: auto;
  text-align: center;
  container-type: inline-size;
}
.glass-object {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  touch-action: pan-y;
  -webkit-tap-highlight-color: transparent;
  isolation: isolate;
}
.glass-object::after {
  content: '';
  position: absolute;
  inset: 67% 6% -7%;
  z-index: -1;
  border-radius: 50%;
  background: radial-gradient(ellipse, #387a6929, transparent 68%);
  opacity: .6;
  transition: transform .95s, opacity .95s;
}
.glass-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity .3s;
  pointer-events: none;
}
.is-ready .glass-canvas { opacity: 1; }
.glass-fallback {
  position: absolute;
  inset: 3%;
  border-radius: 50%;
  border: 1px solid #ffffffc9;
  background: radial-gradient(ellipse at 72% 18%, #f2e6a745, transparent 28%),
    radial-gradient(ellipse at 18% 70%, #10b98159, transparent 45%),
    linear-gradient(135deg, #fafff833, #ccefd42b);
  box-shadow: inset 2px 3px 8px #ffffffb3, inset -2px -3px 9px #59a58b33;
}
.glass-fallback::after {
  content: '';
  position: absolute;
  inset: 11%;
  border: 1px solid #ffffff80;
  border-radius: 50%;
}
.is-ready .glass-fallback { display: none; }
.glass-progress-fallback {
  position: absolute;
  inset: 14%;
  border-radius: 50%;
  mask-image: radial-gradient(circle, transparent 68%, black 69%);
  pointer-events: none;
}
.is-ready .glass-progress-fallback { display: none; }
.glass-data {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transition: transform .95s cubic-bezier(.65, 0, .35, 1);
}
.glass-core {
  position: absolute;
  left: 26%;
  top: 25%;
  width: 48%;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f7fff9f5;
  border: 1px solid #ffffffa6;
  color: #1f2937;
}
.glass-sprout {
  width: 26%;
  height: 26%;
  margin-bottom: 9%;
  color: #10b981;
}
.glass-core strong {
  font-family: inherit;
  font-size: clamp(30px, 13cqi, 50px);
  line-height: 1;
  font-weight: 800;
  letter-spacing: -1.5px;
  font-variant-numeric: tabular-nums;
}
.glass-core small { font-size: .64em; letter-spacing: -1px; }
.glass-collected {
  position: absolute;
  left: 50%;
  top: 78%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  padding: 6px 13px;
  border: 1px solid #9debd3;
  border-radius: 999px;
  background: #dcfff2d9;
  color: #007e59;
  font-size: clamp(10px, 3.6cqi, 14px);
  font-weight: 700;
  white-space: nowrap;
}
.glass-collected b { font-weight: 800; font-variant-numeric: tabular-nums; }
.glass-hint {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 44px;
  padding: 8px 15px;
  border: 1px solid #ffffffe0;
  background: #f2fff6b3;
  color: #397560;
  border-radius: 30px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}
.glass-hint .iconify { font-size: 14px; }
.hint-dot { width: 4px; height: 4px; border-radius: 50%; background: #10b981; }
.is-lifted .glass-data { transform: translateY(-3%); }
.is-lifted .glass-object::after { transform: translateY(12px) scale(1.05); opacity: 1; }
button:focus-visible { outline: 2px solid #059669; outline-offset: 4px; border-radius: 30px; }
.glass-object:focus-visible { border-radius: 50%; }
.is-reduced *, .is-reduced .glass-object::after { transition: none !important; }
@media (prefers-reduced-motion: reduce) {
  .glass-progress *, .glass-object::after { transition: none !important; }
}
</style>
