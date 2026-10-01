<script setup lang="ts">
import CourierServiceButton from '~/components/motion-lab/CourierServiceButton.vue';
import BorderObjectButton from '~/components/motion-lab/BorderObjectButton.vue';
import FoldGardenButton from '~/components/motion-lab/FoldGardenButton.vue';

definePageMeta({ standalone: true });
useHead({ title: '小物件互動試驗室', meta: [{ name: 'robots', content: 'noindex,nofollow' }] });
const active = ref(0);
const compare = ref(false);
const speed = ref(1);
const gentle = ref(false);
const systemReduced = ref(false);
const reducedMotion = computed(() => gentle.value || systemReduced.value);
const selected = ref<Record<number, boolean>>({});
const examples = [
  { key: 'courier', name: '吉祥物送餐', tag: '你的提案', family: 'service', title: '小信差，幫你保留這一份。', description: '吉祥物帶來漢堡，放上按鈕邊框，再空手離開。取消時回來取走，漢堡留著就代表已選取。', sequence: ['帶來', '放下', '留下', '取回'], suitable: '有代表性的小物件：漢堡、壽司、麵包、郵件' },
  { key: 'cafe', name: '咖啡上桌', tag: '道具編舞', family: 'service', title: '托盤先到，咖啡剛剛好。', description: '托盤滑入，點單紙伸出，咖啡落到杯墊上，最後冒出熱氣。取消會依序退場。', sequence: ['推盤', '落杯', '熱氣', '撤桌'], suitable: '餐廳、咖啡廳、甜點等需要多件道具的種類' },
  { key: 'orbit', name: '邊框滑入', tag: '輕巧直接', family: 'border', title: '沿著邊框，找到自己的位置。', description: '小物件沿著上邊框移動，抵達角落後穩穩留下。取消沿原路收回，動作短而清楚。', sequence: ['滑入', '轉角', '停靠', '收回'], suitable: '把種類道具留在邊框，適合大量類型並列' },
  { key: 'pocket', name: '票券紙袋', tag: '紙片深度', family: 'border', title: '從紙袋裡，抽出這張收藏。', description: '票券從前後兩層紙袋中露出，抽起後停在邊框；取消縮回袋中，紙袋收好。', sequence: ['開袋', '抽取', '保留', '入袋'], suitable: '車站、電影院、美術館、郵局、主題活動' },
  { key: 'book', name: '小書開合', tag: '物件個性', family: 'fold', title: '一本小書，也有自己的節奏。', description: '封面掀開，書頁依序展開，書籤留下。取消收回書頁再合上封面，選取是一段開合。', sequence: ['掀封', '展頁', '書籤', '合書'], suitable: '書店、圖書館，以及能打開的容器與物件' },
  { key: 'garden', name: '花朵生長', tag: '有機動作', family: 'fold', title: '在邊框上，種一個小小的記號。', description: '花盆先安定，莖葉與花朵依序出現。選取後花留在角落；取消時收回，回到起始盆。', sequence: ['萌芽', '長葉', '開花', '收回'], suitable: '花店、公園、森林、海邊等自然類型' },
] as const;
const demos = new Map<number, { reset: () => void }>();
function remember(index: number, instance: unknown) { if (instance) demos.set(index, instance as { reset: () => void }); else demos.delete(index); }
function reset() { demos.forEach(demo => demo.reset()); }
let motionQuery: MediaQueryList | undefined;
function updatePreference(event: MediaQueryListEvent | MediaQueryList) { systemReduced.value = event.matches; }
onMounted(() => { motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)'); updatePreference(motionQuery); motionQuery.addEventListener('change', updatePreference); });
onUnmounted(() => { motionQuery?.removeEventListener('change', updatePreference); });
</script>

<template>
  <div class="motion-lab">
    <header class="lab-header">
      <NuxtLink to="/map" class="back-link">← 回地圖</NuxtLink>
      <span class="lab-edition">MOTION STUDIES / 01</span>
    </header>
    <div class="lab-content">
      <section class="lab-intro">
        <p class="eyebrow">六種可觸控的物件互動</p>
        <h1>讓小物件，<br class="mobile-break" /><em>住進按鈕的邊框。</em></h1>
        <p class="intro-copy">點一下選取，再點一下收回。<br />先感受動作，再挑你喜歡的方向。</p>
      </section>

      <nav class="example-nav" aria-label="選擇動畫範本">
        <button v-for="(example, index) in examples" :key="example.key" type="button" :aria-pressed="active === index" :class="{ active: active === index }" @click="active = index; compare = false">
          <span>{{ String(index + 1).padStart(2, '0') }}</span>{{ example.name }}
        </button>
      </nav>

      <div class="lab-toolbar">
        <div class="speed-controls" aria-label="播放速度">
          <button type="button" :class="{ active: speed === 1 }" :aria-pressed="speed === 1" @click="speed = 1">標準</button>
          <button type="button" :class="{ active: speed === .55 }" :aria-pressed="speed === .55" @click="speed = .55">慢動作</button>
        </div>
        <button type="button" class="compare-control" :aria-pressed="compare" @click="compare = !compare">{{ compare ? '單款體驗' : '全部並排' }}</button>
      </div>

      <section class="preview-grid" :class="{ comparing: compare }" aria-label="可操作的動畫範本">
        <article v-for="(example, index) in examples" v-show="compare || active === index" :key="example.key" class="preview-sheet" :class="`sheet-${example.key}`">
          <header class="sheet-header"><span class="sample-id">{{ String(index + 1).padStart(2, '0') }} / {{ example.name }}</span><span class="sample-tag">{{ example.tag }}</span></header>
          <div class="demo-surface">
            <CourierServiceButton v-if="example.family === 'service'" :ref="el => remember(index, el)" :variant="example.key as 'courier' | 'cafe'" :speed="speed" :reduced-motion="reducedMotion" @change="selected[index] = $event" />
            <BorderObjectButton v-else-if="example.family === 'border'" :ref="el => remember(index, el)" :variant="example.key as 'orbit' | 'pocket'" :speed="speed" :reduced-motion="reducedMotion" @change="selected[index] = $event" />
            <FoldGardenButton v-else :ref="el => remember(index, el)" :variant="example.key as 'book' | 'garden'" :speed="speed" :reduced-motion="reducedMotion" @change="selected[index] = $event" />
          </div>
          <div class="sample-details">
            <h2>{{ example.title }}</h2>
            <p>{{ example.description }}</p>
            <div class="story-beats"><span v-for="(beat, step) in example.sequence" :key="beat"><small>{{ step + 1 }}</small>{{ beat }}</span></div>
            <p class="sample-suitable"><span>適合</span>{{ example.suitable }}</p>
          </div>
        </article>
      </section>

      <footer class="lab-footer">
        <button type="button" class="reset-control" @click="reset">重新開始</button>
        <label class="gentle-control"><input v-model="gentle" type="checkbox" :disabled="systemReduced" />減少動態</label>
        <p>{{ systemReduced ? '已依照你的裝置設定減少動態。' : '選取即時生效，快速點按會從目前動作接續。' }}</p>
      </footer>

      <section class="reference-note">
        <span class="eyebrow">研究後的判斷</span>
        <h2>每個物件有個性，整套介面有一致的手感。</h2>
        <p>參考 Annmary 的不同物件玩法、Booplet 的分層觸感，以及 Shelby 的插畫編舞。這裡把它們轉成手機按鈕：文字不移動，小物件留下代表選取，反向動作代表取消。</p>
        <div class="reference-links"><a href="https://annmarysajii.github.io/my-portfolio/" target="_blank" rel="noopener noreferrer">Annmary ↗</a><a href="https://booplet.com/" target="_blank" rel="noopener noreferrer">Booplet ↗</a><a href="https://shelbykho.com/" target="_blank" rel="noopener noreferrer">Shelby ↗</a><a href="https://feralui.dev/deskfolio" target="_blank" rel="noopener noreferrer">DeskFolio ↗</a></div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.motion-lab{min-height:100dvh;background:#f5f2e8;color:#264637;font-family:'Noto Sans TC',sans-serif;isolation:isolate;padding-bottom:max(28px,env(safe-area-inset-bottom));border-top:5px solid #10b981}
.lab-header{max-width:1120px;margin:auto;display:flex;align-items:center;justify-content:space-between;padding:19px 24px;border-bottom:1px solid #d8ddce}
.back-link{font-size:12px;font-weight:700;color:#42684f;text-decoration:none;padding:9px 0}.lab-edition{font-size:9px;letter-spacing:.14em;color:#7b8877}
.lab-content{max-width:1120px;margin:auto;padding:0 24px}.lab-intro{padding:30px 0 24px}.eyebrow{font-size:10px;font-weight:700;letter-spacing:.15em;color:#74866c;margin:0 0 11px}
h1{font-size:clamp(28px,5vw,48px);font-weight:800;line-height:1.5;letter-spacing:-.045em;margin:0}h1 em{font-style:normal;color:#109f74}.mobile-break{display:none}.intro-copy{font-size:13px;line-height:1.85;color:#71816f;margin:12px 0 0}
.example-nav{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.example-nav button{min-height:48px;display:flex;gap:8px;align-items:center;justify-content:center;font-size:12px;font-weight:700;background:#fffdf6;color:#46624e;border:1px solid #d3dac8;border-radius:11px;box-shadow:0 3px 0 #e1e4d4;touch-action:manipulation;padding:8px}.example-nav span{font-size:9px;font-weight:500;opacity:.65}.example-nav button.active{background:#10b981;color:white;border-color:#10b981;box-shadow:0 3px 0 #079568}
button:focus-visible,a:focus-visible,input:focus-visible{outline:3px solid #aa7a42;outline-offset:4px}
.lab-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 0 15px}.speed-controls{display:flex;border:1px solid #d2dbc9;padding:3px;border-radius:9px;background:#eceee3}.speed-controls button{font-size:11px;font-weight:600;min-height:36px;padding:0 13px;color:#74846c;border-radius:6px}.speed-controls .active{background:#fffdf6;color:#37583f;box-shadow:0 1px 3px #345a2520}.compare-control{min-height:44px;font-size:11px;font-weight:700;color:#507347;text-decoration:underline;text-underline-offset:4px}
.preview-grid{display:grid;grid-template-columns:1fr;gap:24px}.preview-sheet{background:#fffdf5;border:1px solid #cfd9c7;border-radius:22px;box-shadow:0 7px 0 #dfe5d2,0 17px 26px #2f4b2310;overflow:hidden}.sheet-header{padding:18px 20px;display:flex;justify-content:space-between;align-items:center;gap:10px}.sample-id{font-size:11px;font-weight:700;letter-spacing:.05em}.sample-tag{font-size:9px;color:#79916d;background:#edf1e4;padding:5px 9px;border:1px solid #dfe5d1;border-radius:20px;white-space:nowrap}
.demo-surface{background:#eef0df;background-image:radial-gradient(#83996b22 .6px,transparent .6px);background-size:7px 7px;padding:8px clamp(20px,7vw,64px) 24px;border-top:1px solid #e8ebdc;border-bottom:1px solid #e2e6d7}.sheet-cafe .demo-surface{background-color:#f3e8d7}.sheet-pocket .demo-surface{background-color:#e9eee7}.sheet-book .demo-surface{background-color:#efeadc}.sheet-garden .demo-surface{background-color:#e9efdf}
.sample-details{padding:21px 22px 22px}.sample-details h2{font-size:18px;font-weight:800;line-height:1.6;letter-spacing:-.015em;margin:0 0 7px}.sample-details>p{font-size:12px;line-height:1.9;color:#72826e;margin:0}.story-beats{display:flex;justify-content:space-between;gap:10px;padding:18px 0 16px}.story-beats>span{display:flex;align-items:center;gap:5px;font-size:10px;font-weight:700;color:#55724f;white-space:nowrap}.story-beats small{font-size:8px;display:grid;place-items:center;background:#eef0e3;border:1px solid #dfe6d2;border-radius:50%;width:17px;height:17px;color:#8b9b80}.sample-details .sample-suitable{padding-top:13px;border-top:1px solid #e2e7d8;font-size:10px;line-height:1.8}.sample-suitable span{margin-right:9px;color:#a18359;font-weight:700}
.lab-footer{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding:23px 0 26px}.reset-control{color:#48724b;border:1px solid #bdcbb5;background:#fffdf5;border-radius:10px;font-size:12px;padding:0 15px;min-height:44px;font-weight:700}.gentle-control{display:flex;align-items:center;gap:8px;min-height:44px;font-size:11px;font-weight:600;color:#75826b}.gentle-control input{accent-color:#10b981;width:17px;height:17px}.lab-footer p{width:100%;font-size:10px;color:#88917e;margin:0;line-height:1.75}
.reference-note{padding:26px 0 10px;border-top:1px solid #d4dccb;max-width:700px}.reference-note h2{font-size:16px;font-weight:700;line-height:1.65;margin:0 0 9px}.reference-note p{font-size:11px;line-height:1.9;color:#85907a;margin:0}.reference-links{display:flex;flex-wrap:wrap;gap:20px;padding:16px 0}.reference-links a{font-size:11px;color:#6f8562;text-decoration:underline;text-underline-offset:4px;padding:7px 0}
@media(min-width:760px){.example-nav{grid-template-columns:repeat(6,minmax(0,1fr))}.comparing{grid-template-columns:repeat(2,minmax(0,1fr))}.preview-grid:not(.comparing){max-width:720px;margin:auto}.lab-toolbar,.lab-footer{max-width:720px;margin:auto}.lab-intro{padding-top:40px}.reference-note{margin:auto}.demo-surface{padding-left:48px;padding-right:48px}}
@media(max-width:480px){.lab-header,.lab-content{padding-left:18px;padding-right:18px}.lab-intro{padding:24px 0 21px}.mobile-break{display:block}h1{font-size:29px;line-height:1.45}.example-nav{gap:8px}.example-nav button{font-size:11px;gap:5px;padding:7px 4px;min-height:45px}.lab-edition{font-size:8px}.sheet-header{padding:15px 17px}.demo-surface{padding:3px 20px 22px}.sample-details{padding:19px 18px}.sample-details h2{font-size:16px}.sample-details>p{font-size:11px}.story-beats{gap:5px}.story-beats>span{font-size:9px;gap:4px}}
@media(max-width:350px){h1{font-size:26px}.lab-header,.lab-content{padding-left:14px;padding-right:14px}.example-nav span{display:none}.demo-surface{padding-left:16px;padding-right:16px}.sample-tag{font-size:8px}.sheet-header{padding-left:15px;padding-right:15px}.story-beats small{width:14px;height:14px}}
</style>
