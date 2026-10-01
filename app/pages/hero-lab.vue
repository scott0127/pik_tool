<script setup lang="ts">
import type { HeroCase } from '~/utils/heroLabScene';
definePageMeta({ standalone: true });
useHead({ title: '收藏的形狀｜Pikmin Bloom 互動試作', meta: [{ name: 'robots', content: 'noindex,nofollow' }] });
const variant = ref<HeroCase>('ribbon');
const demoProgress = ref(18);
const gentle = ref(false);
const systemReduced = ref(false);
const reduced = computed(() => gentle.value || systemReduced.value);
const collected = computed(() => Math.round(1021 * demoProgress.value / 100));
const variants = [{ id: 'ribbon', name: '收藏緞帶', caption: '柔順曲面 · 流動刻度' }, { id: 'glass', name: '浮光玻璃', caption: '分層開合 · 透光反射' }] as const;
let media: MediaQueryList | undefined;
function preference(event: MediaQueryListEvent | MediaQueryList) { systemReduced.value = event.matches; }
function choose(value: HeroCase) { variant.value = value; try { localStorage.setItem('hero-lab-variant', value); } catch {} }
onMounted(() => {
  media = window.matchMedia('(prefers-reduced-motion: reduce)'); preference(media); media.addEventListener('change', preference);
  try { const saved = localStorage.getItem('hero-lab-variant'); if (saved === 'glass' || saved === 'ribbon') variant.value = saved; } catch {}
});
onUnmounted(() => media?.removeEventListener('change', preference));
</script>

<template>
  <div class="hero-lab-page">
    <header class="study-header"><NuxtLink to="/" class="study-brand"><img src="/images/brand/seedling.png" alt="" /><span>Pikmin Bloom<small>飾品圖鑑與地圖</small></span></NuxtLink><span class="study-label">互動試作</span></header>
    <main class="study-main">
      <section class="study-intro"><p>COLLECTION / OBJECT STUDIES</p><h1>收藏，也有自己的形狀。</h1><span>從一個平面，走進一個小世界。</span></section>
      <nav class="case-switch" aria-label="選擇主視覺案例"><button v-for="item in variants" :key="item.id" type="button" :aria-pressed="variant === item.id" :class="{ active: variant === item.id }" @click="choose(item.id)"><strong>{{ item.name }}</strong><span>{{ item.caption }}</span></button></nav>
      <div class="study-preview"><ClientOnly><HeroLabCollectionSculpture :variant="variant" :percentage="demoProgress" :collected="collected" title="收藏" :reduced="reduced" /><template #fallback><div class="preview-placeholder">正在準備收藏主視覺…</div></template></ClientOnly></div>
      <section class="study-tools" aria-label="示範設定"><div class="progress-setting"><span>看看不同收藏進度</span><div><button v-for="value in [0,18,72,100]" :key="value" type="button" :aria-pressed="demoProgress === value" :class="{ selected: demoProgress === value }" @click="demoProgress = value">{{ value }}%</button></div></div><label class="gentle-setting"><input v-model="gentle" type="checkbox" :disabled="systemReduced" />減少動態</label><p>這裡使用示範收藏數字，你可以自由試玩。</p></section>
    </main>
    <footer class="study-footer"><span>一個物件，一段相遇。</span><NuxtLink to="/">回首頁 ↗</NuxtLink></footer>
  </div>
</template>

<style scoped>
.hero-lab-page{position:relative;z-index:30;min-height:100dvh;background:#f1f4eb;color:#203e33;font-family:'Nunito','Noto Sans TC',sans-serif;padding-bottom:env(safe-area-inset-bottom)}.study-header{height:84px;padding:0 22px;border-top:4px solid #10b981;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e0e8dc;background:#f8fbf6}.study-brand{display:flex;align-items:center;gap:9px;color:#069b71;font-size:17px;font-weight:800}.study-brand img{width:35px;height:35px;object-fit:contain}.study-brand small{display:block;font-size:10px;letter-spacing:.7px;line-height:1.5}.study-label{font-size:10px;color:#718778;border:1px solid #d4e2d2;padding:6px 10px;border-radius:16px;letter-spacing:1px}.study-main{max-width:660px;margin:0 auto;padding:29px 18px 0}.study-intro>p{font-size:9px;letter-spacing:2px;color:#829382;font-weight:800}.study-intro h1{font-size:26px;letter-spacing:-1px;line-height:1.3;margin:12px 0 8px;font-weight:800}.study-intro>span{font-size:12px;color:#7a8c7b}.case-switch{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:23px 0 14px}.case-switch button{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;min-height:64px;padding:12px 16px;border:1px solid #dce4d4;border-radius:16px;background:#f8faf3;color:#6a8371;text-align:left;transition:background .25s,color .25s,transform .2s}.case-switch button.active{background:#10b981;border-color:#10b981;color:white;box-shadow:0 4px 0 #069f75}.case-switch button strong{font-size:14px;font-weight:800}.case-switch button span{font-size:9px;letter-spacing:.5px;margin-top:4px;opacity:.8}.case-switch button:active{transform:translateY(2px)}button:focus-visible{outline:2px solid #087158;outline-offset:3px}.study-preview{margin-top:21px}.preview-placeholder{height:660px;border-radius:30px;background:#fbfcf6;display:flex;align-items:center;justify-content:center;color:#7d968b;font-size:14px}.study-tools{padding:23px 7px 10px}.progress-setting>span{font-size:12px;font-weight:800}.progress-setting>div{display:flex;gap:7px;margin-top:12px}.progress-setting button{height:44px;flex:1;border-radius:13px;border:1px solid #d9e4d2;background:#f9fbf5;font-size:13px;font-weight:800;color:#6c8773}.progress-setting button.selected{color:white;background:#10b981;border-color:#10b981}.gentle-setting{display:flex;gap:9px;align-items:center;font-size:12px;color:#6d8472;min-height:44px;margin-top:9px}.gentle-setting input{accent-color:#10b981;width:17px;height:17px}.study-tools>p{font-size:10px;color:#8c9b87}.study-footer{max-width:660px;margin:25px auto 0;padding:20px 25px 30px;border-top:1px solid #dee6d7;display:flex;justify-content:space-between;font-size:11px;color:#889986}.study-footer a{color:#069b71;font-weight:800}
@media(min-width:700px){.study-header{padding:0 40px}.study-main{padding-top:44px}.study-intro h1{font-size:36px}.study-intro>span{font-size:14px}.case-switch{margin-top:30px}.case-switch button{min-height:76px}.case-switch button strong{font-size:17px}.case-switch button span{font-size:11px}}
@media(max-width:350px){.study-main{padding:24px 12px 0}.study-intro h1{font-size:23px}.study-header{padding:0 14px}.study-brand{font-size:15px}.case-switch button{padding:12px}}
</style>
