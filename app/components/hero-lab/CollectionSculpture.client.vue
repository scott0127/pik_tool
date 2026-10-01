<script setup lang="ts">
import { gsap } from 'gsap';
import { createHeroLabScene, type HeroCase } from '~/utils/heroLabScene';

const props = defineProps<{ variant: HeroCase; percentage: number; collected: number; title: string; reduced: boolean }>();
const host = ref<HTMLElement>();
const surface = ref<HTMLElement>();
const canvas = ref<HTMLCanvasElement>();
const expanded = ref(false);
const lift = ref(0);
const failed = ref(false);
const ready = ref(false);
let scene: ReturnType<typeof createHeroLabScene> | undefined;
let context: gsap.Context | undefined;
let pointer: { x: number; y: number; last: number; dragged: boolean; vertical: boolean } | undefined;
let scrollPending = false;
let scrollFrame = 0;
const labels = ['一般飾品', '特殊飾品', '下一個發現'];
const active = ref(0);
const details = [
  { heading: '把每一次相遇，收進你的世界。', text: '已收藏的種類留下印記，空白的位置等待下一次發現。' },
  { heading: '留住那些，限時的相遇。', text: '活動飾品與旅途紀念，也有自己的收藏位置。' },
  { heading: '下一次出門，帶一點期待。', text: '從尚未收藏的種類開始，找到下一隻想帶回家的皮克敏。' },
];
function toggle() { expanded.value = !expanded.value; }
function select(index: number) {
  active.value = index;
  scene?.progress(props.percentage, ['collection', 'special', 'discover'][index]!);
  if (context && !props.reduced) context.add(() => {
    gsap.fromTo(host.value!.querySelector('.sculpture-story'), { opacity: .3, y: 8 },
      { opacity: 1, y: 0, duration: .4, overwrite: true });
  });
}
function down(event: PointerEvent) {
  if (event.button !== 0) return;
  pointer = { x: event.clientX, y: event.clientY, last: event.clientX, dragged: false, vertical: false };
}
function move(event: PointerEvent) {
  if (!pointer) return;
  const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
  if (!pointer.dragged && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 7) { pointer.vertical = true; return; }
  if (pointer.vertical || Math.abs(dx) < 7 && !pointer.dragged) return;
  if (!pointer.dragged) surface.value?.setPointerCapture(event.pointerId);
  pointer.dragged = true;
  scene?.rotate((event.clientX - pointer.last) * .006);
  host.value?.style.setProperty('--light-x', `${50 + Math.max(-24, Math.min(24, dx * .12))}%`);
  pointer.last = event.clientX;
}
function up() {
  if (pointer && !pointer.dragged && !pointer.vertical) toggle();
  pointer = undefined; scene?.release();
}
function cancel() { pointer = undefined; scene?.release(); }
function onScroll() {
  if (scrollPending || props.reduced) return;
  scrollPending = true;
  scrollFrame = requestAnimationFrame(() => {
    scrollPending = false;
    const rect = host.value?.getBoundingClientRect();
    scene?.scroll(Math.max(-1, Math.min(1, (rect?.top ?? 0) / window.innerHeight)));
  });
}
watch(expanded, value => {
  scene?.open(value);
  context?.add(() => {
    gsap.to(host.value!.querySelectorAll('.orbit-tag'), { opacity: value ? 1 : 0, y: value ? 0 : 12,
      duration: props.reduced ? 0 : .45, stagger: props.reduced ? 0 : .07, delay: value && !props.reduced ? .28 : 0,
      overwrite: true });
  });
});
watch(() => props.variant, value => { expanded.value = false; active.value = 0; scene?.setCase(value); });
watch(() => props.percentage, value => scene?.progress(value, 'collection'));
watch(() => props.reduced, value => { scene?.reduced(value); scene?.open(expanded.value); });
onMounted(async () => {
  await nextTick();
  if (!canvas.value || !host.value) return;
  context = gsap.context(() => { gsap.set('.orbit-tag', { opacity: 0, y: 12 }); }, host.value!);
  try {
    scene = createHeroLabScene(canvas.value!, value => { lift.value = value; });
    scene.setCase(props.variant); scene.progress(props.percentage, 'collection'); scene.reduced(props.reduced);
    ready.value = true;
  } catch (error) { console.error('Collection sculpture initialization:', error); failed.value = true; }
  window.addEventListener('scroll', onScroll, { passive: true });
});
onUnmounted(() => { scene?.dispose(); context?.revert(); cancelAnimationFrame(scrollFrame); window.removeEventListener('scroll', onScroll); });
</script>

<template>
  <section ref="host" class="sculpture" :class="[{ expanded, glass: variant === 'glass', gentle: reduced }]" :style="{ '--lift': lift }">
    <div class="ambient-wash" aria-hidden="true"></div>
    <header class="sculpture-heading"><span>YOUR COLLECTION</span><span class="edition">{{ variant === 'ribbon' ? '01 / RIBBON' : '02 / GLASS' }}</span></header>
    <h2>{{ variant === 'ribbon' ? '讓收藏，繞成一個世界。' : '把相遇，藏進一束光。' }}</h2>
    <div ref="surface" class="sculpture-surface" role="button" tabindex="0"
      :aria-label="expanded ? '收起收藏主視覺' : '展開收藏主視覺'" :aria-expanded="expanded"
      @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="cancel"
      @keydown.enter.prevent="toggle" @keydown.space.prevent="toggle">
      <div class="floor-light" aria-hidden="true"></div>
      <canvas ref="canvas" aria-hidden="true"></canvas>
      <div class="progress-core">
        <span class="core-caption">收藏進度</span><strong>{{ percentage }}<small>%</small></strong>
        <span class="core-count">{{ collected.toLocaleString() }} <i>/ 1,021</i></span>
      </div>
      <span class="orbit-tag tag-one" aria-hidden="true">每一次相遇</span>
      <span class="orbit-tag tag-two" aria-hidden="true">都留下光</span>
      <div v-if="failed" class="render-fallback">此裝置無法顯示立體預覽，收藏資訊仍可閱讀。</div>
      <span v-else-if="!ready" class="render-loading">光正在聚集…</span>
    </div>
    <div class="sculpture-controls"><p>{{ expanded ? '左右拖動，看看光的另一面' : '輕觸展開 · 左右拖動' }}</p>
      <button type="button" :aria-expanded="expanded" @click="toggle">{{ expanded ? '收起收藏' : '展開收藏' }}<span aria-hidden="true">{{ expanded ? '−' : '+' }}</span></button>
    </div>
    <nav class="collection-tabs" aria-label="收藏內容"><button v-for="(label, index) in labels" :key="label" type="button" :aria-pressed="active === index" :class="{ active: active === index }" @click="select(index)">{{ label }}</button></nav>
    <div class="sculpture-story" aria-live="polite"><h3>{{ details[active]!.heading }}</h3><p>{{ details[active]!.text }}</p></div>
    <div class="specimen-row" :class="{ 'specimen-open': expanded }" aria-hidden="true">
      <div v-for="(color, index) in ['red', 'yellow', 'blue']" :key="color" :style="{ '--order': index }"><img :src="`/images/friends-comic/pikmin-${color}.png`" alt="" /><span>{{ ['葉芽', '花開', '相遇'][index] }}</span></div>
    </div>
  </section>
</template>

<style scoped>
.sculpture{--light-x:50%;position:relative;isolation:isolate;padding:24px 22px 0;border:1px solid #fff;background:#fbfcf6;border-radius:30px;box-shadow:0 20px 70px #214f3b12;overflow:clip;color:#203e33}
.ambient-wash{position:absolute;z-index:-1;inset:-10%;background:radial-gradient(ellipse at var(--light-x) 38%,#b8ecd6 0%,#edf4dd 28%,transparent 65%);opacity:calc(.22 + var(--lift)*.55);transform:translateY(calc(var(--lift)*-12px));pointer-events:none}
.sculpture-heading{display:flex;justify-content:space-between;align-items:center;font-size:10px;letter-spacing:1.7px;font-weight:800;color:#779181}.edition{font-size:9px;letter-spacing:1px}.sculpture h2{font-size:22px;letter-spacing:-.6px;font-weight:800;margin:12px 0 0}.sculpture-surface{height:345px;position:relative;margin:0 -22px;touch-action:pan-y;cursor:grab;outline:none}.sculpture-surface:focus-visible{outline:2px solid #10b981;outline-offset:-6px}.sculpture-surface:active{cursor:grabbing}canvas{display:block;width:100%;height:100%;position:absolute;inset:0}
.floor-light{position:absolute;left:16%;right:16%;bottom:33px;height:38px;border-radius:50%;background:radial-gradient(ellipse,#c5e8d0b0,transparent 70%);filter:blur(10px);transform:scale(calc(1 + var(--lift)*.35));pointer-events:none}
.progress-core{position:absolute;top:50%;left:50%;transform:translate(-50%,calc(-50% - var(--lift)*5px));text-align:center;pointer-events:none;min-width:135px;z-index:2;text-shadow:0 1px 15px #fbfcf6}.core-caption{display:block;font-size:11px;letter-spacing:1px;font-weight:700;color:#547266}.progress-core strong{display:block;font-size:66px;line-height:1.18;letter-spacing:-4px;font-weight:800;font-variant-numeric:tabular-nums}.progress-core small{font-size:23px;letter-spacing:-1px;margin-left:3px}.core-count{font-size:13px;font-weight:800}.core-count i{font-style:normal;color:#7d968b;font-weight:600}
.orbit-tag{position:absolute;z-index:3;font-size:10px;font-weight:700;letter-spacing:.4px;background:#ffffffb5;border:1px solid #fff;padding:7px 10px;border-radius:20px;box-shadow:0 4px 15px #33503c0a;pointer-events:none}.tag-one{top:38px;left:25px}.tag-two{bottom:38px;right:25px}.glass .tag-one{top:48px}.glass .tag-two{bottom:28px}.render-fallback{position:absolute;bottom:20px;left:20px;right:20px;font-size:12px;text-align:center}.render-loading{position:absolute;bottom:20px;left:0;right:0;text-align:center;font-size:12px;color:#7d968b}
.sculpture-controls{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:-6px;padding-bottom:20px;position:relative;z-index:4}.sculpture-controls p{font-size:10px;color:#6d877a;line-height:1.7}.sculpture-controls button{height:44px;min-width:120px;background:#10b981;color:white;border-radius:24px;padding:0 16px;font-size:13px;font-weight:800;display:flex;align-items:center;gap:18px;box-shadow:0 3px 0 #058e67;transition:transform .2s}.sculpture-controls button:active{transform:translateY(2px)}.sculpture-controls button span{font-size:19px;font-weight:400}.collection-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:4px;border:1px solid #dee8dc;border-radius:15px;background:#edf2e7}.collection-tabs button{height:44px;border-radius:11px;color:#688373;font-size:12px;font-weight:800;transition:background .25s,color .25s}.collection-tabs button.active{background:#10b981;color:#fff;box-shadow:0 2px 5px #1d8f5820}.collection-tabs button:active{transform:scale(.97)}
.sculpture-story{padding:22px 0 14px;min-height:108px}.sculpture-story h3{font-size:15px;font-weight:800;margin-bottom:7px;letter-spacing:-.4px}.sculpture-story p{font-size:12px;line-height:1.8;color:#6f8476;max-width:330px}.specimen-row{display:flex;justify-content:center;gap:35px;border-top:1px solid #e3eadd;padding-top:12px;height:110px;overflow:hidden}.specimen-row>div{display:flex;flex-direction:column;align-items:center;transition:transform .7s cubic-bezier(.22,1,.36,1);transition-delay:calc(var(--order)*.07s);transform:translateY(17px)}.specimen-row.specimen-open>div{transform:translateY(0)}.specimen-row img{width:48px;height:64px;object-fit:contain;filter:drop-shadow(0 4px 4px #496e3720)}.specimen-row span{font-size:9px;color:#7a8e7c;letter-spacing:2px;margin-top:5px}button:focus-visible{outline:2px solid #07745c;outline-offset:3px}
@media(min-width:700px){.sculpture{padding:30px 36px 0}.sculpture h2{font-size:29px}.sculpture-surface{height:400px;margin:0 -36px}.core-caption{font-size:12px}.progress-core strong{font-size:74px}.sculpture-controls p{font-size:12px}.sculpture-story{min-height:95px}.sculpture-story p{max-width:none}.collection-tabs button{font-size:13px}}
@media(max-width:350px){.sculpture{padding:20px 15px 0}.sculpture h2{font-size:20px}.sculpture-surface{height:305px;margin:0 -15px}.progress-core strong{font-size:57px}.sculpture-controls p{font-size:9px}.sculpture-controls button{min-width:110px;padding:0 13px;gap:13px}}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}
.gentle *{transition:none!important}
</style>

