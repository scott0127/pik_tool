<template>
  <Transition :css="false" appear @enter="enterSheet" @leave="leaveSheet" @enter-cancelled="cancelSheet" @leave-cancelled="cancelSheet">
    <section v-if="showPanel" class="map-filter-sheet" :class="[isMobile ? 'map-filter-sheet-mobile' : 'map-filter-sheet-desktop', { 'is-exploring': isExploring }]" :aria-label="$t('map.panel.title')" @keydown.esc.stop.prevent="emit('update:showPanel', false)">
      <span class="map-sheet-binding" aria-hidden="true"></span>
      <header class="map-filter-header" @touchstart.passive="handleTouchStart" @touchmove.passive="handleTouchMove" @touchend="handleTouchEnd" @touchcancel="resetDrag">
        <img class="map-camp-backdrop" src="/images/map-field/woodland-camp.webp" alt="" width="1200" height="400" draggable="false" />
        <span class="map-camp-foreground" aria-hidden="true"></span>
        <span v-if="isMobile" class="map-sheet-handle" aria-hidden="true"></span>
        <div class="map-camp-title"><p class="map-panel-eyebrow">{{ $t('map.panel.eyebrow') }}</p><h2>{{ $t('map.panel.title') }}</h2></div>
        <button type="button" class="map-field-guide" @click="isExploring = !isExploring" :aria-label="$t(isExploring ? 'map.panel.guide_close' : 'map.panel.guide_label')" :aria-expanded="isExploring" @touchstart.stop @touchmove.stop @touchend.stop>
          <img class="map-guide-kit" src="/images/map-field/satchel-closed.webp" width="360" height="360" alt="" draggable="false" />
          <img class="map-guide-character" src="/images/friends-comic/pikmin-red.png" width="464" height="956" alt="" draggable="false" />
          <span>{{ $t(isExploring ? 'map.panel.guide_close' : 'map.panel.guide_label') }}</span>
        </button>
        <button class="map-filter-close" type="button" @click="emit('update:showPanel', false)" :aria-label="$t('map.panel.close')"><Icon name="lucide:x" class="w-4 h-4" /></button>
      </header>
      <MapExplorerScene :open="isExploring" :selected-count="selectedFilters.length" :found-count="fetchedPoints.length" @close="isExploring = false" />
      <div v-show="!isExploring" class="map-filter-summary">
        <div class="map-filter-stat"><span>{{ $t('map.stats.selected') }}</span><div><strong>{{ selectedFilters.length }}</strong><small>/ {{ decorRules.length }}</small></div></div>
        <div class="map-filter-stat map-filter-stat-found" aria-live="polite"><span>{{ $t('map.stats.found') }}</span><div><strong>{{ fetchedPoints.length }}</strong><small>{{ $t('map.stats.places') }}</small></div></div>
      </div>
      <p v-if="selectedFilters.length > 10" class="map-filter-warning"><span aria-hidden="true">!</span>{{ $t('map.stats.warning') }}</p>
      <div class="map-filter-list-heading">
        <span>{{ $t('map.cell_info.decor_types') }}</span>
        <div><button type="button" class="map-panel-action" @click="selectAll">{{ $t('map.stats.select_all') }}</button><button type="button" class="map-panel-action" @click="clearAll">{{ $t('map.stats.clear') }}</button></div>
      </div>
      <div class="map-filter-list" @scroll.passive="rememberListPosition">
        <label v-for="(rule, index) in decorRules" :key="rule.id" :data-rule-id="rule.id" class="map-filter-item" :class="{ 'is-selected': selectedFilters.includes(rule.id), 'is-previewing': activeType === rule.id }">
          <input type="checkbox" :value="rule.id" v-model="internalSelectedFilters" class="sr-only" @change="animateSelection($event, rule.id)" />
          <MapTypeButtonEffect v-if="visibleObjectIds.has(rule.id)" :id="rule.id" :selected="selectedFilters.includes(rule.id)" :revision="activeType === rule.id ? typeRevision : 0" :animate="activeType === rule.id" />
          <span class="map-filter-number" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="map-filter-name">{{ $t('decor_types.' + rule.id) }}</span>
          <span v-if="getCountForRule(rule.id)" class="map-filter-count">{{ getCountForRule(rule.id) }}</span>
          <span class="map-filter-check" aria-hidden="true"><span class="map-check-echo"></span><Icon v-if="selectedFilters.includes(rule.id)" name="lucide:check" class="w-3 h-3" /></span>
        </label>
      </div>
      <footer class="map-filter-footer">
        <p v-if="error" class="map-filter-error" role="alert">{{ error }}</p>
        <p v-if="isLoading" class="map-filter-loading" role="status">{{ $t('map.loading') }}</p>
        <button type="button" class="map-panel-done" @click="emit('update:showPanel', false)"><span>{{ $t('map.panel.browse') }}</span><Icon name="lucide:arrow-up-right" class="w-4 h-4" /></button>
      </footer>
    </section>
  </Transition>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';
import MapTypeButtonEffect from './TypeButtonEffect.vue';
import type { DecorRule, POIPoint } from '~/types/map';
const props = defineProps<{
  showPanel: boolean; isLoading: boolean; error: string | null; selectedFilters: string[];
  decorRules: DecorRule[]; fetchedPoints: POIPoint[]; isMobile: boolean;
}>();
const emit = defineEmits<{
  (e: 'update:showPanel', value: boolean): void;
  (e: 'update:selectedFilters', value: string[]): void;
}>();
const internalSelectedFilters = computed({ get: () => props.selectedFilters, set: value => emit('update:selectedFilters', value) });
const activeType = ref<string | null>(null);
const typeRevision = ref(0);
const selectAll = () => { activeType.value = null; emit('update:selectedFilters', props.decorRules.map(rule => rule.id)); };
const clearAll = () => { activeType.value = null; emit('update:selectedFilters', []); };
const getCountForRule = (id: string) => props.fetchedPoints.filter(point => point.decorType === id).length;
const isExploring = ref(false);
watch(() => props.showPanel, visible => { if (!visible) { isExploring.value = false; activeType.value = null; } });
let motion: gsap.Context | null = null;
let sheet: HTMLElement | null = null;
const visibleObjectIds = ref(new Set<string>());
let objectObserver: IntersectionObserver | null = null;
let listPosition = 0;
const rememberListPosition = (event: Event) => { listPosition = (event.target as HTMLElement).scrollTop; };
const observeObjects = (element: Element) => {
  objectObserver?.disconnect();
  const list = element.querySelector<HTMLElement>('.map-filter-list');
  if (!list) return;
  list.scrollTop = listPosition;
  objectObserver = new IntersectionObserver(entries => {
    const newlyVisible = entries.filter(entry => entry.isIntersecting);
    if (!newlyVisible.length) return;
    const ids = new Set(visibleObjectIds.value);
    for (const entry of newlyVisible) {
      const id = (entry.target as HTMLElement).dataset.ruleId;
      if (id) ids.add(id);
      objectObserver?.unobserve(entry.target);
    }
    visibleObjectIds.value = ids;
  }, { root: list, rootMargin: '64px 0px' });
  list.querySelectorAll('.map-filter-item').forEach(item => objectObserver?.observe(item));
};
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// The collapsed filter bar is the visual origin of the field notebook.
let originRect: DOMRect | null = null;
let focusFromToggle = false;
let sheetTimeline: gsap.core.Timeline | null = null;
let pendingLeaveDone: (() => void) | null = null;
watch(() => props.showPanel, visible => {
  if (visible) {
    const toggle = document.querySelector<HTMLElement>('.map-page .map-filter-toggle');
    if (toggle) originRect = toggle.getBoundingClientRect();
    focusFromToggle = !!toggle && document.activeElement === toggle;
  }
}, { flush: 'sync' });
const sheetContents = (element: Element) => Array.from(element.querySelectorAll<HTMLElement>(
  '.map-filter-header, .map-filter-summary, .map-filter-warning, .map-filter-list-heading, .map-filter-item, .map-filter-footer',
));
const visibleCards = (element: Element) => {
  const list = element.querySelector('.map-filter-list')?.getBoundingClientRect();
  if (!list) return [];
  return Array.from(element.querySelectorAll<HTMLElement>('.map-filter-item')).filter(card => {
    const bounds = card.getBoundingClientRect();
    return bounds.bottom > list.top && bounds.top < list.bottom;
  });
};
const cancelSheet = (element: Element) => {
  sheetTimeline?.kill();
  gsap.killTweensOf([element, ...sheetContents(element)]);
  gsap.set([element, ...sheetContents(element)], { clearProps: 'transform,opacity,borderRadius,pointerEvents' });
};
const enterSheet = (element: Element, done: () => void) => {
  motion?.revert();
  sheet = element as HTMLElement;
  observeObjects(element);
  const focusOnOpen = focusFromToggle;
  const finish = () => {
    gsap.set([element, ...sheetContents(element)], { clearProps: 'transform,opacity,borderRadius' });
    if (focusOnOpen) sheet?.querySelector<HTMLButtonElement>('.map-filter-close')?.focus({ preventScroll: true });
    done();
  };
  motion = gsap.context(() => {
    if (reducedMotion()) { finish(); return; }
    const bounds = element.getBoundingClientRect();
    const origin = originRect;
    const sections = element.querySelectorAll('.map-filter-summary, .map-filter-warning, .map-filter-list-heading');
    const cards = visibleCards(element);
    gsap.set(sheetContents(element), { opacity: 0 });
    // Reveal only the viewport's cards; offscreen choices remain ready to scroll.
    gsap.set(element.querySelectorAll('.map-filter-item'), { opacity: 1 });
    sheetTimeline = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: finish })
      .addLabel('uncover', 0)
      .fromTo(element, {
        transformOrigin: '0 0',
        x: origin ? origin.left - bounds.left : (props.isMobile ? 0 : -18),
        y: origin ? origin.top - bounds.top : (props.isMobile ? 75 : 0),
        scaleX: origin ? origin.width / bounds.width : 0.96,
        scaleY: origin ? origin.height / bounds.height : 0.94,
        borderRadius: '12px', opacity: origin ? 1 : 0,
      }, { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1,
        borderRadius: props.isMobile ? '24px 24px 0 0' : '16px', duration: 0.46 }, 'uncover')
      .fromTo('.map-sheet-binding', { scaleX: 0 }, { scaleX: 1, duration: 0.45 }, 'uncover+=0.18')
      .addLabel('read', 0.22)
      .fromTo('.map-filter-header', { y: 12, rotationX: -22, opacity: 0 },
        { y: 0, rotationX: 0, opacity: 1, duration: 0.34 }, 'read')
      .fromTo('.map-camp-foreground', { y: 22 }, { y: 0, duration: 0.55 }, 'read')
      .fromTo('.map-guide-kit', { y: 25, rotation: 8, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.45 }, 'read+=0.08')
      .fromTo('.map-guide-character', { x: 18, y: 8, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.45 }, 'read+=0.2')
      .fromTo(sections, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.28, stagger: 0.045 }, 'read+=0.06')
      .fromTo(cards, {
        x: (index: number) => props.isMobile ? (index % 2 ? 12 : -12) : -10,
        y: 16, rotation: (index: number) => index % 2 ? 1.5 : -1.5, opacity: 0,
      }, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.3, stagger: 0.025 }, 'read+=0.12')
      .fromTo('.map-filter-footer', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.27 }, 'read+=0.21');
  }, element);
};
const leaveSheet = async (element: Element, done: () => void) => {
  objectObserver?.disconnect();
  cancelSheet(element);
  pendingLeaveDone = done;
  const page = element.closest('.map-page');
  const restoreFocus = element.contains(document.activeElement);
  const finish = () => {
    if (pendingLeaveDone === done) pendingLeaveDone = null;
    done();
    if (restoreFocus) nextTick(() => {
      if (document.activeElement === document.body || element.contains(document.activeElement)) {
        page?.querySelector<HTMLButtonElement>('.map-filter-toggle')?.focus({ preventScroll: true });
      }
    });
  };
  if (reducedMotion()) { finish(); return; }
  await nextTick();
  const toggle = page?.querySelector<HTMLElement>('.map-filter-toggle');
  const target = toggle?.getBoundingClientRect() ?? originRect;
  const bounds = element.getBoundingClientRect();
  motion?.add(() => {
    gsap.set(element, { pointerEvents: 'none' });
    sheetTimeline = gsap.timeline({ defaults: { ease: 'power2.in' }, onComplete: finish })
      .addLabel('pack', 0)
      .to(visibleCards(element), { y: 9, scale: 0.97, opacity: 0, duration: 0.15, stagger: { each: 0.012, from: 'end' } }, 'pack')
      .to(element.querySelectorAll('.map-filter-header, .map-filter-summary, .map-filter-warning, .map-filter-list-heading, .map-filter-footer, .explorer-scene'),
        { y: 6, opacity: 0, duration: 0.16 }, 'pack+=0.04')
      .to('.map-sheet-binding', { scaleX: 0, duration: 0.18 }, 'pack')
      .to('.map-guide-character', { x: 18, opacity: 0, duration: 0.16 }, 'pack')
      .to('.map-camp-foreground', { y: 18, duration: 0.2 }, 'pack')
      .addLabel('return', 0.12)
      .to(element, {
        transformOrigin: '0 0', x: target ? target.left - bounds.left : 0,
        y: target ? target.top - bounds.top : 60,
        scaleX: target ? target.width / bounds.width : 0.96,
        scaleY: target ? target.height / bounds.height : 0.92,
        borderRadius: '12px', opacity: 0, duration: 0.34,
      }, 'return');
  });
};
const animateSelection = async (event: Event, id: string) => {
  activeType.value = id;
  typeRevision.value++;
  const input = event.target as HTMLInputElement;
  const label = input.closest('label');
  if (!label || reducedMotion()) return;
  await nextTick();
  const stamp = label.querySelector('.map-filter-check');
  const echo = label.querySelector('.map-check-echo');
  gsap.killTweensOf([stamp, echo]);
  motion?.add(() => {
    gsap.killTweensOf(label);
    const timeline = gsap.timeline()
      .to(label, { y: 3, scale: 0.975, duration: 0.08, ease: 'power2.out' }, 0)
      .to(label, { y: 0, scale: 1, duration: 0.26, ease: 'back.out(1.8)', clearProps: 'transform' }, 0.08);
    if (input.checked) {
      timeline.fromTo(stamp, { scale: 1.65, rotation: -22, opacity: 0.5 }, { scale: 0.88, rotation: -5, opacity: 1, duration: 0.13, ease: 'power3.in' })
        .to(stamp, { scale: 1, rotation: 0, duration: 0.34, ease: 'elastic.out(1,0.45)', clearProps: 'transform,opacity' });
      timeline.fromTo(echo, { scale: 0.8, opacity: 0.6 }, { scale: 2.2, opacity: 0, duration: 0.42, ease: 'power2.out' }, 0.12);
    } else {
      timeline.fromTo(stamp, { rotation: 12, scale: 0.8 }, { rotation: 0, scale: 1, duration: 0.3, ease: 'back.out(1.6)', clearProps: 'transform' });
    }
  });
};
watch(() => props.selectedFilters.length, () => {
  if (!sheet?.isConnected || reducedMotion()) return;
  const number = sheet.querySelector('.map-filter-stat strong');
  motion?.add(() => gsap.fromTo(number, { y: -5, opacity: 0.5 }, { y: 0, opacity: 1, duration: 0.28, ease: 'power3.out', overwrite: true, clearProps: 'transform,opacity' }));
}, { flush: 'post' });
let touchStartY: number | null = null;
let dragDistance = 0;
const handleTouchStart = (event: TouchEvent) => {
  if (!props.isMobile) return;
  touchStartY = event.touches[0]?.clientY ?? null;
  dragDistance = 0;
};
const handleTouchMove = (event: TouchEvent) => {
  if (touchStartY === null || !sheet) return;
  dragDistance = Math.max(0, (event.touches[0]?.clientY ?? touchStartY) - touchStartY);
  if (!reducedMotion()) gsap.set(sheet, { y: dragDistance * 0.65 });
};
const resetDrag = () => {
  touchStartY = null; dragDistance = 0;
  if (sheet) motion?.add(() => gsap.to(sheet, { y: 0, duration: reducedMotion() ? 0 : 0.3, ease: 'power3.out', clearProps: 'transform' }));
};
const handleTouchEnd = () => {
  if (dragDistance > 65) { emit('update:showPanel', false); touchStartY = null; dragDistance = 0; }
  else resetDrag();
};
onUnmounted(() => {
  objectObserver?.disconnect(); sheetTimeline?.kill(); motion?.revert();
  // Switching map modes during the closing sequence must release Vue's leaving node.
  pendingLeaveDone?.(); pendingLeaveDone = null; sheet = null;
});
</script>

<style scoped>
.map-filter-sheet { position: absolute; z-index: 1005; display: flex; flex-direction: column; overflow: hidden; border: 1px solid #d4d9c9; color: #304a39; background: #faf9f1; box-shadow: 0 3px 0 #c8cfbb, 0 18px 44px rgb(33 55 35 / 18%); }
.map-filter-sheet-mobile { transition: height 320ms ease; inset: auto 0 0; height: min(82%, 38rem); border-radius: 1.5rem 1.5rem 0 0; padding-bottom: env(safe-area-inset-bottom); }
.map-filter-sheet-mobile.is-exploring { height: min(82%, 39rem); }
.map-filter-sheet-desktop { inset: 1rem auto 1rem 1rem; width: 20rem; border-radius: 1rem; }
.map-sheet-binding { position: absolute; top: 0; left: 20px; right: 20px; height: 3px; border-radius: 0 0 3px 3px; background: var(--map-accent); transform-origin: left center; pointer-events: none; }
.map-filter-header { isolation: isolate; perspective: 600px; position: relative; display: flex; justify-content: space-between; align-items: center; min-height: 130px; padding: 1.25rem 1rem 1rem; flex-shrink: 0; touch-action: none; border-bottom: 1px solid #c8d0b8; }
.map-camp-backdrop { position: absolute; z-index: -2; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center bottom; pointer-events: none; }
.map-camp-foreground { position: absolute; z-index: -1; inset: auto 0 0; height: 26px; background: url('/images/friends-comic/meadow.webp') center bottom / 100% auto no-repeat; pointer-events: none; transform-origin: bottom; }
.map-camp-title { align-self: flex-start; margin-top: 12px; }
.map-sheet-handle { position: absolute; top: 0.45rem; left: calc(50% - 1.1rem); width: 2.2rem; height: 3px; border-radius: 2px; background: #bbc5ac; }
.map-panel-eyebrow { font-size: 0.65rem; letter-spacing: 0.04em; color: #657357; margin-bottom: 0.45rem; }
.map-filter-header h2 { font-size: 1.2rem; font-weight: 750; letter-spacing: -0.03em; color: #214d3c; }
.map-filter-header > div { flex: 1; min-width: 0; }
.map-field-guide { position: relative; align-self: flex-end; width: 85px; height: 83px; flex-shrink: 0; margin-right: 0.3rem; border-radius: 12px; }
.map-field-guide img { position: absolute; object-fit: contain; }
.map-guide-character { width: 29px; height: 60px; bottom: 18px; left: 0; filter: drop-shadow(1px 1px 0 #fffbea); transform-origin: 50% 100%; }
.map-guide-kit { width: 68px; height: 68px; bottom: 13px; left: 20px; filter: drop-shadow(0 3px 2px #36573524); }
.map-field-guide > span { position: absolute; bottom: -3px; left: 50%; transform: translateX(-50%); padding: 2px 6px; border-radius: 4px; background: var(--map-accent); color: #fff; white-space: nowrap; font-size: 10px; font-weight: 700; }
.map-filter-close { position: relative; align-self: flex-start; width: 44px; height: 44px; margin-top: 6px; display: grid; place-items: center; border: 1px solid #d1d7c2; background: #fffdf0ed; border-radius: 50%; box-shadow: 0 2px 0 #c3caaa; }
.map-filter-summary { display: grid; grid-template-columns: 1fr 1fr; margin: 0 1rem 0.45rem; padding: 0.6rem 0; border-bottom: 1px solid #dce1d2; flex-shrink: 0; }
.map-filter-stat { display: flex; align-items: center; gap: 0.65rem; }
.map-filter-stat > span { font-size: 0.72rem; color: #617054; }
.map-filter-stat > div { display: flex; align-items: baseline; gap: 0.4rem; }
.map-filter-stat strong { display: inline-block; font-size: 1.5rem; line-height: 1.2; font-weight: 800; font-variant-numeric: tabular-nums; color: #078661; }
.map-filter-stat small { font-size: 0.7rem; color: #67745b; }
.map-filter-stat-found { padding-left: 1rem; border-left: 1px solid #dce1d2; }
.map-filter-warning { display: flex; align-items: flex-start; gap: 0.4rem; font-size: 0.7rem; line-height: 1.5; color: #846725; padding: 0 1rem 0.3rem; flex-shrink: 0; }
.map-filter-warning > span { display: grid; place-items: center; border: 1px solid #c6b67c; border-radius: 50%; width: 13px; height: 13px; flex-shrink: 0; font-size: 0.55rem; margin-top: 1px; }
.map-filter-list-heading { display: flex; justify-content: space-between; align-items: center; padding: 0 1rem; font-size: 0.75rem; font-weight: 650; flex-shrink: 0; }
.map-filter-list-heading > div { display: flex; align-items: center; gap: 0.25rem; color: #9aa48c; }
.map-panel-action { min-height: 44px; padding: 0 0.65rem; margin: 4px 0; background: var(--map-action); color: #fff; border-radius: 6px; }
.map-filter-list { display: grid; grid-template-columns: minmax(0, 1fr); align-content: start; row-gap: 32px; overflow-y: auto; min-height: 0; padding: 48px 1rem 1rem; overscroll-behavior: contain; scrollbar-width: thin; scrollbar-color: #b7c3a4 transparent; }
.map-filter-sheet-mobile .map-filter-list { row-gap: 16px; padding-top: 32px; }
/* Keep deliveries above the label and checkmark as the mobile rows move closer. */
.map-filter-sheet-mobile :deep(.category-scene) { top: -32px; transform: scale(.72); transform-origin: top right; }
.map-filter-item { position: relative; display: flex; align-items: center; gap: 0.8rem; min-width: 0; min-height: 64px; padding: 0.65rem 1rem; background: #fffdf5; border: 1px solid #d8ddce; border-radius: 1rem; box-shadow: inset 0 1px 0 #fff, 0 3px 0 #d5dbcc, 0 7px 14px #304a3908; cursor: pointer; touch-action: pan-y; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; transition: border-color 160ms; }
.map-filter-item.is-selected { border-color: #0ca778; background: var(--map-accent, #10B981); color: #fff; box-shadow: inset 0 1px 0 #ffffff40, inset 0 -1px 0 #04785726, 0 3px 0 #07865f, 0 7px 14px #04785712; }
.is-selected .map-filter-count { color: #ffffffb3; }
.map-filter-number { flex-shrink: 0; padding-right: 0.7rem; border-right: 1px solid #dce2d3; font-size: 11px; font-weight: 700; line-height: 1.4; color: #899b84; font-variant-numeric: tabular-nums; }.is-selected .map-filter-number { color: #ffffffb8; border-color: #ffffff30; }
.map-filter-number, .map-filter-name, .map-filter-count, .map-filter-check { position: relative; z-index: 1; }
.map-filter-name { flex: 1; min-width: 0; font-size: 0.95rem; font-weight: 700; line-height: 1.45; overflow-wrap: anywhere; }
.map-filter-count { font-size: 0.75rem; font-weight: 600; color: #738966; }
.map-filter-check { position: relative; width: 24px; height: 24px; border: 1px solid #c5ceba; background: #f5f6ef; border-radius: 8px; flex-shrink: 0; display: grid; place-items: center; }
.map-check-echo { position: absolute; inset: -2px; border: 1px solid #6f9252; border-radius: 50%; opacity: 0; pointer-events: none; }
.is-selected .map-filter-check { background: #fffdf5; border-color: #fffdf5; color: #07865f; box-shadow: 0 1px 2px #006c4826; }
@media (hover: hover) and (pointer: fine) { .map-filter-item:hover { border-color: #aab99f; } .map-filter-item.is-selected:hover { border-color: #07865f; } }
.map-filter-footer { padding: 0.6rem 1.15rem 0.9rem; border-top: 1px solid #dde2d1; flex-shrink: 0; background: #faf9f1; }
.map-panel-done { width: 100%; min-height: 44px; display: flex; justify-content: space-between; align-items: center; padding: 0.7rem 1rem; background: var(--map-action); border-radius: 0.5rem; color: #fff; font-size: 0.8rem; font-weight: 650; box-shadow: 0 3px 0 #b0bd9e; }
.map-filter-loading, .map-filter-error { padding-bottom: 0.5rem; font-size: 0.7rem; }
.map-filter-error { color: #a64838; }
.map-filter-item:has(input:focus-visible), button:focus-visible { outline: 2px solid #07865f; outline-offset: 4px; }
button:active { translate: 0 1px; }
@media (min-width: 768px) { .map-filter-list { grid-template-columns: 1fr; } .map-filter-item { gap: 0.85rem; } .map-filter-name { font-size: 0.86rem; } }
@media (max-width: 350px) { .map-filter-header { padding-inline: 0.85rem; min-height: 112px; } .map-filter-header h2 { font-size: 1.05rem; } .map-panel-eyebrow { font-size: 0.57rem; } .map-field-guide { width: 73px; } .map-filter-list { padding-inline: 0.85rem; } .map-filter-item { gap: 0.65rem; } .map-filter-stat { gap: 0.4rem; } .map-filter-stat-found { padding-left: 0.7rem; } }
@media (prefers-reduced-motion: reduce) { .map-filter-sheet-mobile { transition: none; } .map-filter-item { transition: none; } }
</style>
