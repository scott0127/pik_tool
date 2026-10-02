<template>
  <button ref="trigger" type="button" class="collection-guide-button" :aria-label="copy.openLabel" @click.stop="openGuide">
    <span class="collection-guide-question" aria-hidden="true">?</span>
    <span>{{ copy.play }}</span>
  </button>

  <Teleport to="body">
    <dialog v-if="isMounted" ref="dialog" class="collection-guide-dialog" :aria-labelledby="titleId" @cancel.prevent="closeGuide()" @click.self="closeGuide()">
      <div class="guide-scrim" aria-hidden="true" @click="closeGuide()" />
      <div class="guide-bookmark-echo" :style="echoStyle" aria-hidden="true"><span>?</span></div>
      <section ref="sheet" class="guide-sheet" :class="{ 'is-closing': isClosing }">
        <div class="guide-sheet-handle" aria-hidden="true" />
        <header class="guide-header">
          <div>
            <p class="guide-kicker">FIELD GUIDE <span>/ {{ topic === 'radar' ? '01' : '02' }}</span></p>
            <h2 :id="titleId">{{ copy.title }}</h2>
          </div>
          <button type="button" class="guide-close" :aria-label="copy.close" autofocus @click="closeGuide()"><Icon name="lucide:x" aria-hidden="true" /></button>
        </header>

        <div class="guide-body">
          <div ref="scene" class="guide-scene" :data-topic="topic" :data-step="step" aria-hidden="true">
            <span class="guide-sample">{{ copy.sample }}</span>
            <div class="guide-scene-halo" />
            <div class="guide-paper guide-paper-back" />
            <div class="guide-paper guide-paper-mid" />

            <template v-if="topic === 'radar'">
              <CollectionGoldSeedling class="guide-gold-seedling" />
              <div class="guide-goal-track">
                <span class="guide-goal-fill" />
                <i /><i /><i />
              </div>
              <div class="guide-demo-card">
                <span class="guide-card-icon"><Icon :name="step === 2 ? 'lucide:flag' : 'lucide:sparkles'" /></span>
                <span class="guide-card-copy"><small>{{ active.demoLabel }}</small><strong>{{ active.demoValue }}</strong></span>
                <span v-if="step !== 1" class="guide-card-check"><Icon name="lucide:check" /></span>
              </div>
              <div class="guide-demo-tag"><span class="guide-tag-dot" />{{ active.demoTag }}</div>
            </template>
            <template v-else>
              <div class="guide-notebook">
                <div class="guide-notebook-page"><i /><i /><i /><i /></div>
                <div class="guide-notebook-cover"><Icon name="lucide:sprout" /><span>FIELD NOTES</span></div>
                <div class="guide-notebook-binding" /><div class="guide-notebook-ribbon" />
              </div>
              <div class="guide-demo-card">
                <span class="guide-card-icon"><Icon :name="step === 0 ? 'lucide:palette' : step === 1 ? 'lucide:plus' : 'lucide:trending-up'" /></span>
                <span class="guide-card-copy"><small>{{ active.demoLabel }}</small><strong>{{ active.demoValue }}</strong></span>
                <span v-if="step === 0" class="guide-color-samples"><i /><i /><i /></span>
                <span v-else class="guide-card-check"><Icon name="lucide:check" /></span>
              </div>
              <div class="guide-demo-tag"><span class="guide-tag-dot" />{{ active.demoTag }}</div>
            </template>
            <div class="guide-scene-spark spark-one" /><div class="guide-scene-spark spark-two" /><div class="guide-scene-spark spark-three" />
          </div>

          <div ref="words" class="guide-words" aria-live="polite" aria-atomic="true">
            <span class="guide-step-number">0{{ step + 1 }} <span>/ 03</span></span>
            <h3>{{ active.title }}</h3>
            <p>{{ active.description }}</p>
          </div>
          <p class="guide-sample-note"><Icon name="lucide:info" aria-hidden="true" />{{ copy.sampleNote }}</p>
        </div>

        <footer class="guide-footer">
          <div class="guide-pagination" :aria-label="copy.progress">
            <span v-for="index in 3" :key="index" :class="{ 'is-active': index - 1 === step }" />
          </div>
          <button v-if="step > 0" type="button" class="guide-back" @click="changeStep(step - 1)">{{ copy.back }}</button>
          <button type="button" class="guide-next" @click="step === 2 ? closeGuide(true) : changeStep(step + 1)">
            {{ step === 2 ? copy.start : copy.next }}<Icon :name="step === 2 ? 'lucide:arrow-up-right' : 'lucide:arrow-right'" aria-hidden="true" />
          </button>
        </footer>
      </section>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';
import CollectionGoldSeedling from '~/components/CollectionGoldSeedling.vue';

const props = defineProps<{ topic: 'radar' | 'inventory' }>();
const emit = defineEmits<{ open: []; start: [] }>();
const { locale } = useI18n();
const trigger = ref<HTMLButtonElement | null>(null);
const dialog = ref<HTMLDialogElement | null>(null);
const sheet = ref<HTMLElement | null>(null);
const scene = ref<HTMLElement | null>(null);
const words = ref<HTMLElement | null>(null);
const titleId = `collection-guide-${useId()}`;
const isMounted = ref(false);
const isClosing = ref(false);
const step = ref(0);
const echoStyle = ref<Record<string, string>>({});
let context: gsap.Context | undefined;
let panelMotion: gsap.core.Timeline | undefined;
let pageMotion: gsap.core.Timeline | undefined;
let sceneMotion: gsap.core.Timeline | undefined;
let preference: MediaQueryList | undefined;
let savedOverflow: string | undefined;
let savedPadding: string | undefined;
let version = 0;
let disposed = false;

const copy = computed(() => {
  const radar = props.topic === 'radar';
  return locale.value === 'en' ? {
    play: 'Guide', title: radar ? 'Your next guaranteed Gold Seedling' : 'A little record, a clear next step',
    openLabel: radar ? 'How to use Gold Seedling Progress' : 'How to use inventory and point records',
    close: 'Close guide', sample: 'DEMO', sampleNote: 'An example only. Your records stay unchanged.',
    progress: `Step ${step.value + 1} of 3`, back: 'Back', next: 'Next', start: radar ? 'View progress' : 'Start recording',
  } : {
    play: '玩法', title: radar ? '哪個種類最接近保底？' : '記一筆，下一步更清楚',
    openLabel: radar ? '金盆栽保底進度玩法教學' : '庫存與積分紀錄玩法教學',
    close: '關閉教學', sample: '範例', sampleNote: '這裡只是示範，不會更動你的紀錄。',
    progress: `第 ${step.value + 1} 步，共 3 步`, back: '上一步', next: '下一步', start: radar ? '查看保底進度' : '開始記錄',
  };
});

const steps = computed(() => {
  if (locale.value === 'en') return props.topic === 'radar' ? [
    { title: 'Compare progress across types', description: 'See which decor types are closest to a guaranteed Gold Seedling, then choose which one to work on first.', demoLabel: 'A target close to its reward', demoValue: 'Restaurant', demoTag: 'Compare Gold Seedling progress' },
    { title: 'Separate points from potential', description: 'Current points reflect your records. Seedlings and Pikmin still growing show what you can work toward next.', demoLabel: 'Current points', demoValue: '640 pt', demoTag: 'In reserve · still growing' },
    { title: 'See what remains to reach the reward', description: 'Check points left to a guaranteed Gold Seedling, then open that type to record progress. If scoring is still locked, complete its regular decor first.', demoLabel: 'Your next step', demoValue: 'Fill missing colors', demoTag: 'Open the type to record' },
  ] : [
    { title: 'Choose the series and color', description: 'Open records inside a series, then pick the Pikmin color you want to update.', demoLabel: 'Restaurant', demoValue: 'Choose a color', demoTag: 'Each color has its own record' },
    { title: 'Record what just happened', description: 'Use + and − to update seedlings, decor or releases. Pick the matching row; changes save automatically.', demoLabel: 'Got a decor', demoValue: '+ 1 record', demoTag: 'Saved to your field notes' },
    { title: 'Watch your progress take shape', description: 'You record your game progress here. Supported rare series also track points; complete regular decor first, then compare targets in Gold Seedling Progress.', demoLabel: 'Growth recorded', demoValue: 'Progress updated', demoTag: 'Rare points for supported series' },
  ];
  return props.topic === 'radar' ? [
    { title: '一次比較各種類的保底進度', description: '快速看出所有種類中，哪些最接近拿到保底金盆栽，再決定先衝哪一種。', demoLabel: '接近保底的目標', demoValue: '餐廳系列', demoTag: '比較金盆栽保底進度' },
    { title: '分清積分與手上的潛力', description: '目前積分來自你的紀錄；小盆栽與尚在培養的皮克敏，則是接下來能繼續累積的潛力。', demoLabel: '目前積分', demoValue: '640 pt', demoTag: '待培養庫存 · 還在成長中' },
    { title: '看還差多少，再決定先衝哪種', description: '查看距離保底金盆栽還差多少積分，再前往對應種類記錄。尚未解鎖計分的種類，先補齊一般款。', demoLabel: '下一步', demoValue: '補齊缺少的顏色', demoTag: '前往種類，繼續記錄' },
  ] : [
    { title: '選好系列，再選顏色', description: '在系列裡打開積分紀錄，選擇這次要更新的皮克敏顏色；每種顏色都能分開記。', demoLabel: '餐廳系列', demoValue: '選擇顏色', demoTag: '每種顏色，各有一份紀錄' },
    { title: '記下剛剛發生的事', description: '用 ＋／− 更新小盆栽、拿裝飾或放生的數量。選對項目後，變更會自動儲存。', demoLabel: '拿到裝飾', demoValue: '＋1 筆紀錄', demoTag: '已記入你的成長手帳' },
    { title: '讓成長進度看得見', description: '這裡由你手動記下遊戲進度。支援稀有的系列也會計算積分；先集齊一般款，再到「金盆栽保底進度」比較各種類。', demoLabel: '成長已記下', demoValue: '進度已更新', demoTag: '稀有積分依系列與計分規則累計' },
  ];
});
const active = computed(() => steps.value[step.value]!);
const reduced = () => preference?.matches ?? true;

function lockScroll() {
  if (savedOverflow !== undefined) return;
  savedOverflow = document.documentElement.style.overflow;
  savedPadding = document.body.style.paddingRight;
  const gutter = window.innerWidth - document.documentElement.clientWidth;
  const padding = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
  if (gutter > 0) document.body.style.paddingRight = `${padding + gutter}px`;
  document.documentElement.style.overflow = 'hidden';
}

function unlockScroll() {
  if (savedOverflow === undefined) return;
  document.documentElement.style.overflow = savedOverflow;
  document.body.style.paddingRight = savedPadding ?? '';
  savedOverflow = undefined;
  savedPadding = undefined;
}

function playScene() {
  sceneMotion?.kill();
  if (reduced() || !scene.value) return;
  context?.add(() => {
    sceneMotion = gsap.timeline({ defaults: { ease: 'power3.out' } })
      .fromTo('.guide-paper-back', { y: 13, rotation: -1 }, { y: 0, rotation: -7, duration: .5 }, 0)
      .fromTo('.guide-paper-mid', { y: 8, rotation: 0 }, { y: 0, rotation: 5, duration: .45 }, .04)
      .fromTo('.guide-demo-card', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .45 }, .16)
      .fromTo('.guide-demo-tag', { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: .3 }, .38)
      .fromTo('.guide-scene-spark', { scale: .4, opacity: 0 }, { scale: 1, opacity: .75, stagger: .06, duration: .25 }, .2);
    if (props.topic === 'radar') {
      sceneMotion.fromTo('.guide-gold-seedling', { y: 8, opacity: .65 }, { y: 0, opacity: 1, duration: .55 }, .02)
        .fromTo('.guide-goal-fill', { scaleX: 0 }, { scaleX: .72, duration: .7, ease: 'power2.inOut' }, .1)
        .fromTo('.gold-seedling-glint', { opacity: 0, xPercent: -160 }, { opacity: .75, xPercent: 360, duration: .5, ease: 'power1.inOut' }, .3)
        .to('.gold-seedling-glint', { opacity: 0, duration: .15 }, .75);
    } else {
      sceneMotion.fromTo('.guide-notebook-cover', { rotation: 0, x: 0 }, { rotation: -12, x: -12, duration: .48 }, .05)
        .fromTo('.guide-notebook-page', { x: 0 }, { x: 12, duration: .45 }, .14)
        .fromTo('.guide-notebook-ribbon', { y: -15 }, { y: 0, duration: .35 }, .28);
    }
  });
}

async function openGuide() {
  if (isMounted.value || disposed) return;
  const request = ++version;
  const rect = trigger.value?.getBoundingClientRect();
  echoStyle.value = rect ? { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` } : {};
  step.value = 0;
  isClosing.value = false;
  isMounted.value = true;
  emit('open');
  await nextTick();
  if (disposed || request !== version || !dialog.value) return;
  lockScroll();
  dialog.value.showModal();
  context = gsap.context(() => {}, dialog.value);
  if (reduced()) return;
  context.add(() => {
    panelMotion = gsap.timeline({ defaults: { ease: 'power3.out' } })
      .fromTo('.guide-scrim', { opacity: 0 }, { opacity: 1, duration: .28 }, 0)
      .fromTo('.guide-bookmark-echo', { opacity: 1, y: 0, scale: .94 }, { opacity: 0, y: -18, scale: 1.06, duration: .3 }, 0)
      .fromTo(sheet.value, { y: 72, opacity: 0 }, { y: 0, opacity: 1, duration: .42, clearProps: 'transform,opacity' }, .1)
      .fromTo(words.value, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .32, clearProps: 'transform,opacity' }, .22);
  });
  playScene();
}

async function changeStep(next: number) {
  if (isClosing.value || next < 0 || next > 2 || next === step.value) return;
  const direction = next > step.value ? 1 : -1;
  const request = ++version;
  panelMotion?.kill();
  pageMotion?.kill();
  sceneMotion?.kill();
  gsap.set(sheet.value, { clearProps: 'transform,opacity' });
  context?.add(() => {
    gsap.set('.guide-scrim', { opacity: 1 });
    gsap.set('.guide-bookmark-echo', { opacity: 0 });
  });
  if (reduced()) { step.value = next; return; }
  context?.add(() => {
    pageMotion = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: async () => {
      if (request !== version || disposed || isClosing.value) return;
      step.value = next;
      await nextTick();
      if (request !== version || disposed || isClosing.value) return;
      if (reduced()) {
        gsap.set([scene.value, words.value], { clearProps: 'transform,opacity' });
        return;
      }
      context?.add(() => {
        pageMotion = gsap.timeline({ defaults: { ease: 'power3.out' } })
          .fromTo(scene.value, { x: 18 * direction, opacity: 0 }, { x: 0, opacity: 1, duration: .32, clearProps: 'transform,opacity' }, 0)
          .fromTo(words.value, { x: 28 * direction, opacity: 0 }, { x: 0, opacity: 1, duration: .3, clearProps: 'transform,opacity' }, .04);
      });
      playScene();
    } })
      .to(words.value, { x: -24 * direction, opacity: 0, duration: .14 }, 0)
      .to(scene.value, { x: -12 * direction, opacity: 0, duration: .18 }, 0);
  });
}

function finishClose(start: boolean) {
  dialog.value?.close();
  context?.revert();
  context = undefined;
  unlockScroll();
  isMounted.value = false;
  isClosing.value = false;
  trigger.value?.focus({ preventScroll: true });
  if (start) emit('start');
}

function closeGuide(start = false) {
  if (!isMounted.value || isClosing.value) return;
  ++version;
  isClosing.value = true;
  panelMotion?.kill(); pageMotion?.kill(); sceneMotion?.kill();
  if (reduced()) { finishClose(start); return; }
  context?.add(() => {
    panelMotion = gsap.timeline({ defaults: { ease: 'power2.in' }, onComplete: () => finishClose(start) })
      .to('.guide-demo-card, .guide-demo-tag', { y: 12, opacity: 0, duration: .17, stagger: .025 }, 0)
      .to('.guide-paper-back, .guide-paper-mid', { rotation: 0, y: 12, duration: .2 }, 0)
      .to(sheet.value, { y: 64, opacity: 0, duration: .26 }, .08)
      .to('.guide-scrim', { opacity: 0, duration: .2 }, .12);
  });
}

function preferenceChanged() {
  if (!preference?.matches || !isMounted.value) return;
  panelMotion?.progress(1);
  pageMotion?.progress(1);
  sceneMotion?.progress(1);
}

onMounted(() => {
  preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  preference.addEventListener('change', preferenceChanged);
});
onBeforeUnmount(() => {
  disposed = true;
  ++version;
  panelMotion?.kill(); pageMotion?.kill(); sceneMotion?.kill();
  context?.revert();
  dialog.value?.close();
  unlockScroll();
  preference?.removeEventListener('change', preferenceChanged);
});
</script>

<style scoped>
.collection-guide-button{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:76px;min-height:44px;padding:8px 11px;border:1px solid #a7d9c1;border-radius:15px;background:#edf9f1;color:#08795a;font-size:12px;font-weight:800;white-space:nowrap;box-shadow:0 2px 0 #d5e9dd;cursor:pointer;touch-action:manipulation}
.collection-guide-question{display:grid;place-items:center;width:21px;height:21px;border-radius:50%;color:#fff;background:#10b981;font-family:Arial,sans-serif;font-size:14px;box-shadow:inset 0 1px 1px #ffffff50}
.collection-guide-button:focus-visible,.guide-sheet button:focus-visible{outline:3px solid #10b981;outline-offset:4px}.collection-guide-button:active{box-shadow:none}
.collection-guide-dialog{position:fixed;inset:0;width:100%;height:100%;height:100dvh;max-width:none;max-height:none;margin:0;padding:16px 12px 0;border:0;background:transparent;color:#173f34;overflow:hidden;overscroll-behavior:contain;isolation:isolate}
.collection-guide-dialog[open]{display:grid;align-items:end;justify-items:center}.collection-guide-dialog::backdrop{background:transparent}
.guide-scrim{position:absolute;inset:0;background:#123c32a3}.guide-sheet{position:relative;display:flex;flex-direction:column;width:100%;max-width:460px;height:min(576px,calc(100dvh - 24px));max-height:calc(100dvh - 24px);border:1px solid #ffffffd6;border-bottom:0;border-radius:28px 28px 0 0;background:#fffcf4;box-shadow:0 28px 80px #06281e40;overflow:hidden;isolation:isolate}.guide-sheet.is-closing{pointer-events:none}
.guide-sheet-handle{width:32px;height:4px;margin:9px auto 0;border-radius:9px;background:#c9d7cb;flex-shrink:0}.guide-header{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:17px 22px 15px;flex-shrink:0}.guide-kicker{margin:0 0 7px;color:#598172;font-size:9px;font-weight:800;letter-spacing:.2em}.guide-kicker span{color:#a9b7a6}.guide-header h2{margin:0;font-size:20px;line-height:1.4;font-weight:850;letter-spacing:-.025em}.guide-close{display:grid;place-items:center;flex-shrink:0;width:44px;height:44px;border:1px solid #dce6d8;border-radius:50%;background:#fffdf7;color:#315a48;cursor:pointer}.guide-close .iconify{width:21px;height:21px}
.guide-body{flex:1;padding:0 22px;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;min-height:0}.guide-scene{position:relative;height:178px;border:1px solid #dae8d5;border-radius:20px;overflow:hidden;background:radial-gradient(ellipse at 70% 20%,#ffffed 0%,#edf6dd 43%,#deede0 100%);isolation:isolate}.guide-scene::after{content:'';position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(#31664312 .7px,transparent .7px);background-size:7px 7px;opacity:.5}.guide-sample{position:absolute;z-index:6;left:13px;top:12px;font-size:9px;font-weight:800;letter-spacing:.12em;color:#66856c;background:#ffffffa3;border:1px solid #ffffffb3;border-radius:20px;padding:3px 7px}.guide-scene-halo{position:absolute;width:220px;height:220px;left:55%;top:-60px;border:1px solid #ffffffb5;border-radius:50%;box-shadow:0 0 0 22px #ffffff30,0 0 0 44px #ffffff24}.guide-paper{position:absolute;left:36%;top:52px;width:55%;height:80px;border:1px solid #c5d9bd;border-radius:12px;background:#f4f9e7;box-shadow:0 3px 0 #bfd2b332;transform-origin:50% 80%}.guide-paper-back{transform:rotate(-7deg);background:#b8dcb2}.guide-paper-mid{transform:rotate(5deg);background:#dfedcc}.guide-demo-card{position:absolute;z-index:4;left:30%;right:5%;top:58px;display:flex;align-items:center;gap:9px;min-height:73px;padding:13px;border:1px solid #ffffff;border-radius:13px;background:#fffef5;box-shadow:0 6px 16px #42624520,0 2px 0 #b4ccad55}.guide-card-icon{display:grid;place-items:center;flex-shrink:0;width:29px;height:32px;border-radius:9px;background:#e5f6e9;color:#14976d}.guide-card-icon .iconify{width:17px;height:17px}.guide-card-copy{display:flex;flex-direction:column;gap:4px;min-width:0}.guide-card-copy small{color:#799077;font-size:9px;line-height:1.4}.guide-card-copy strong{font-size:15px;line-height:1.3;color:#254f37;font-weight:850}.guide-card-check{display:grid;place-items:center;width:19px;height:19px;margin-left:auto;flex-shrink:0;border-radius:50%;background:#10b981;color:white}.guide-card-check .iconify{width:12px;height:12px}.guide-demo-tag{position:absolute;z-index:5;right:9%;top:140px;display:flex;align-items:center;gap:5px;color:#366645;font-size:9px;font-weight:700}.guide-tag-dot{width:5px;height:5px;border-radius:50%;background:#10b981;box-shadow:0 0 0 3px #10b98118}
.guide-gold-seedling{position:absolute;z-index:3;left:5%;top:36px;width:96px;height:110px}.guide-scene[data-topic="radar"] .guide-scene-halo{left:-8px;top:10px;width:170px;height:160px;border:0;box-shadow:none;background:radial-gradient(ellipse,#fff5c9a3,transparent 68%)}.guide-goal-track{position:absolute;z-index:1;left:25%;right:10%;top:39px;height:4px;border-radius:4px;background:#ccdcc1}.guide-goal-fill{position:absolute;inset:0;border-radius:inherit;background:linear-gradient(90deg,#10b981,#d4ad4b);transform:scaleX(.72);transform-origin:left center}.guide-goal-track i{position:absolute;top:-2px;width:8px;height:8px;border:2px solid #f7f8e8;border-radius:50%;background:#a5bd96}.guide-goal-track i:nth-of-type(1){left:0;background:#10b981}.guide-goal-track i:nth-of-type(2){left:50%;background:#10b981}.guide-goal-track i:nth-of-type(3){right:0;background:#d4ad4b}
.guide-notebook{position:absolute;left:8%;top:38px;width:87px;height:116px;transform:rotate(-8deg)}.guide-notebook-page{position:absolute;inset:4px 2px 4px 12px;border:1px solid #d5d8bc;border-radius:5px 9px 9px 5px;background:#fffdf0;transform:translateX(12px);padding:24px 10px}.guide-notebook-page i{display:block;height:1px;margin-bottom:13px;background:#dae5cf}.guide-notebook-cover{position:absolute;inset:0 7px 0 0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;border:1px solid #277849;border-radius:6px 10px 10px 6px;background:linear-gradient(110deg,#3c8460,#245d42);box-shadow:2px 4px 5px #295d3b2b;transform-origin:left center;transform:translateX(-12px) rotate(-12deg);color:#e4edbd}.guide-notebook-cover .iconify{width:29px;height:29px}.guide-notebook-cover span{font-size:6px;letter-spacing:.12em}.guide-notebook-binding{position:absolute;left:3px;top:5px;bottom:5px;width:3px;border-left:1px solid #cce2b149}.guide-notebook-ribbon{position:absolute;left:36px;bottom:-8px;width:11px;height:25px;background:#e4ba65;clip-path:polygon(0 0,100% 0,100% 100%,50% 80%,0 100%)}.guide-color-samples{display:flex;align-items:center;gap:3px;margin-left:auto}.guide-color-samples i{width:7px;height:15px;border:1px solid #ffffffb3;border-radius:7px;background:#ec7766}.guide-color-samples i:nth-child(2){background:#e6c85e}.guide-color-samples i:nth-child(3){background:#739ce5}
.guide-scene-spark{position:absolute;width:3px;height:3px;border-radius:50%;background:#fff;box-shadow:0 0 5px 2px #ffffffa3}.spark-one{left:26%;top:25px}.spark-two{right:15%;top:31px}.spark-three{left:18%;bottom:15px}.guide-words{min-height:150px;padding-top:22px}.guide-step-number{display:block;margin-bottom:8px;font-size:12px;font-weight:800;color:#059669;letter-spacing:.06em}.guide-step-number span{color:#afbca8;font-size:10px}.guide-words h3{margin:0 0 8px;font-size:22px;line-height:1.4;font-weight:850;letter-spacing:-.025em}.guide-words p{margin:0;color:#637461;font-size:13px;line-height:1.85}.guide-sample-note{display:flex;align-items:flex-start;gap:5px;margin:9px 0 17px;font-size:10px;line-height:1.6;color:#87937c}.guide-sample-note .iconify{width:12px;height:12px;flex-shrink:0;margin-top:2px}.guide-footer{display:flex;align-items:center;gap:10px;flex-shrink:0;padding:16px 22px max(18px,env(safe-area-inset-bottom));border-top:1px solid #e4e8d8;background:#fafaf0}.guide-pagination{display:flex;align-items:center;gap:5px;flex:1}.guide-pagination span{width:5px;height:5px;border-radius:5px;background:#cad7bf}.guide-pagination span.is-active{width:17px;background:#10b981}.guide-back{min-height:44px;padding:8px;color:#728168;background:transparent;border:0;font-size:12px;cursor:pointer}.guide-next{display:flex;align-items:center;justify-content:center;gap:13px;min-height:46px;padding:10px 17px;border:0;border-radius:14px;background:#10b981;color:white;font-weight:800;font-size:13px;box-shadow:0 3px 0 #08976b;cursor:pointer}.guide-next .iconify{width:17px;height:17px}
.guide-bookmark-echo{position:fixed;z-index:5;display:grid;place-items:center;border-radius:14px;background:#10b981;color:white;font-weight:800;pointer-events:none;opacity:0}.guide-bookmark-echo::before,.guide-bookmark-echo::after{content:'';position:absolute;inset:3px;border-radius:12px;background:#d3eed7;z-index:-1;transform:rotate(-9deg) translateY(-5px)}.guide-bookmark-echo::after{transform:rotate(7deg) translateY(-9px);background:#f4f5df;z-index:-2}
@media(min-width:640px){.collection-guide-dialog{align-items:center!important;padding:24px}.guide-sheet{max-height:calc(100dvh - 48px);border-bottom:1px solid #ffffffd6;border-radius:28px}.guide-sheet-handle{display:none}.guide-header{padding-top:24px}.guide-scene{height:190px}.guide-words{min-height:150px}}
@media(max-width:359px){.guide-header{padding:14px 16px 12px}.guide-header h2{font-size:18px}.guide-body{padding:0 16px}.guide-scene{height:158px}.guide-demo-card{left:27%;right:4%;gap:6px;padding:10px;top:49px}.guide-paper{top:43px}.guide-gold-seedling{left:4%;top:32px;width:84px;height:97px}.guide-goal-track{top:33px}.guide-notebook{top:27px}.guide-demo-tag{top:131px;font-size:8px;right:6%}.guide-card-copy strong{font-size:13px}.guide-card-icon{width:25px}.guide-words{padding-top:17px;min-height:160px}.guide-words h3{font-size:20px}.guide-footer{padding-left:16px;padding-right:16px;gap:5px}.guide-next{padding:10px 13px;gap:8px}}
@media(prefers-reduced-motion:reduce){.guide-bookmark-echo{display:none}}
</style>
