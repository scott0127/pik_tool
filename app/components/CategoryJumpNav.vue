<template>
  <div class="collection-index-nav">
    <ClientOnly>
      <Teleport to="body">
        <div v-show="isDrawerVisible" ref="drawerRoot" class="category-index-overlay" :inert="!isExpanded" @keydown="handleDrawerKeydown">
          <button type="button" class="category-index-backdrop" :aria-label="labels.close" tabindex="-1" @click="closeDrawer()" />
          <div class="category-index-paper-back" aria-hidden="true" />
          <section ref="drawerPanel" class="category-drawer" role="dialog" aria-modal="true" aria-labelledby="collection-index-title" tabindex="-1">
            <header class="category-drawer-header">
              <div class="category-drawer-title">
                <h2 id="collection-index-title">{{ labels.title }}</h2>
                <p>{{ labels.description }}</p>
              </div>
              <button type="button" class="category-index-close" :aria-label="labels.close" @click="closeDrawer()"><span aria-hidden="true">×</span></button>
            </header>
            <div class="category-drawer-tabs">
              <button type="button" class="category-index-tab" :class="{ 'is-active': selectedIndexSection === 'regular' }" :aria-pressed="selectedIndexSection === 'regular'" @click="selectIndexSection('regular')">{{ labels.regular }} <small>{{ regularCategoriesList.length }}</small></button>
              <button v-if="specialCategoriesList.length" type="button" class="category-index-tab" :class="{ 'is-active': selectedIndexSection === 'special' }" :aria-pressed="selectedIndexSection === 'special'" @click="selectIndexSection('special')">{{ labels.special }} <small>{{ specialCategoriesList.length }}</small></button>
            </div>
            <div class="category-drawer-content custom-scrollbar">
              <section v-for="section in indexSections" v-show="selectedIndexSection === section.id" :key="section.id" class="category-index-section" :data-index-section="section.id" :aria-label="section.label">
                <div class="category-index-list">
                  <button v-for="cat in section.categories" :key="cat.id" type="button" class="category-jump-item" :class="{ 'is-complete': cat.progress === 100 }" :aria-label="cat.name + ' · ' + cat.progressText + ' · ' + cat.progress + '%'" :title="cat.name + ' · ' + cat.progressText + ' (' + cat.progress + '%)'" @click="scrollToCategoryAndClose(cat.id)">
                    <span class="category-jump-icon" aria-hidden="true">
                      <svg class="category-jump-ring" viewBox="0 0 40 40">
                        <circle class="category-jump-ring-track" cx="20" cy="20" r="17" />
                        <circle class="category-jump-ring-fill" cx="20" cy="20" r="17" pathLength="100" :stroke-dasharray="`${Math.min(100, Math.max(0, cat.progress))} 100`" />
                      </svg>
                      <Icon :name="cat.icon" class="category-jump-symbol" />
                    </span>
                    <span class="category-jump-name">{{ cat.name }}</span>
                  </button>
                </div>
              </section>
            </div>
            <footer class="category-index-footer">
              <span>{{ labels.footer }}</span>
              <span class="category-index-footer-count">{{ selectedIndexSection === 'regular' ? regularCategoriesList.length : specialCategoriesList.length }} {{ labels.categories }}</span>
            </footer>
          </section>
        </div>
      </Teleport>
    </ClientOnly>
    <nav v-if="!hasActiveFilters" class="category-dock" :class="{ 'is-drawer-open': isExpanded }" :aria-label="labels.navigation" :inert="isExpanded">
      <button v-for="item in dockItems" :key="item.index" type="button" class="category-dock-link" :class="{ 'is-active': dockActiveIndex === item.index, 'is-primary': item.index === 1 }" :aria-current="dockActiveIndex === item.index && item.index !== 1 ? 'location' : undefined" :aria-expanded="item.index === 1 ? isExpanded : undefined" :aria-haspopup="item.index === 1 ? 'dialog' : undefined" @click="activateDockItem(item.index, $event)">
        <span class="category-dock-mark" aria-hidden="true">{{ item.mark }}</span><span>{{ item.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';
import { useParallax } from '~/composables/useParallax';

interface CategoryJumpItem {
  id: string;
  name: string;
  icon: string;
  progress: number;
  progressText: string;
  isSpecial: boolean;
}
const props = defineProps<{
  categories: CategoryJumpItem[];
  showScrollTop: boolean;
  hasSpecial: boolean;
  hasActiveFilters: boolean;
}>();
const { locale, t } = useI18n();
const { isAmbientPaused } = useParallax();
const isExpanded = ref(false);
const isDrawerVisible = ref(false);
const drawerRoot = ref<HTMLElement | null>(null);
const drawerPanel = ref<HTMLElement | null>(null);
const activeSection = ref<'top' | 'special' | 'bottom'>('top');
const selectedIndexSection = ref<'regular' | 'special'>('regular');
let drawerContext: gsap.Context | undefined;
let sectionContext: gsap.Context | undefined;
let sectionVersion = 0;
let drawerTimeline: gsap.core.Timeline | undefined;
let reducedMotionQuery: MediaQueryList | undefined;
let previousFocus: HTMLElement | null = null;
let previousOverflow: string | undefined;
let returnFocusOnClose = true;
let mounted = false;
const scrollTimers = new Set<number>();

const labels = computed(() => locale.value === 'en' ? {
  title: 'Collection index', description: 'Tap an icon to jump to its collection.', close: 'Close collection index',
  regular: 'Everyday decor', special: 'Special decor', footer: 'Ring = collection progress',
  categories: 'chapters', navigation: 'Collection navigation', index: 'Index',
} : {
  title: '收藏目錄', description: '點選圖示，直接前往該種類', close: '關閉收藏目錄',
  regular: '一般飾品', special: '特殊飾品', footer: '圖示圓環 · 收藏進度',
  categories: '個分類', navigation: '圖鑑章節導覽', index: '目錄',
});
const regularCategoriesList = computed(() => props.categories.filter(c => !c.isSpecial));
const specialCategoriesList = computed(() => props.categories.filter(c => c.isSpecial));
const indexSections = computed(() => [
  { id: 'regular', number: '01', label: labels.value.regular, categories: regularCategoriesList.value },
  { id: 'special', number: '02', label: labels.value.special, categories: specialCategoriesList.value },
].filter(section => section.categories.length > 0));
const dockItems = computed(() => [
  { index: 0, label: t('collection.scroll.top'), mark: '↑', show: true },
  { index: 1, label: labels.value.index, mark: '≡', show: true },
  { index: 2, label: t('collection.scroll.special'), mark: '02', show: props.hasSpecial },
  { index: 3, label: t('collection.scroll.bottom'), mark: '↓', show: true },
].filter(item => item.show));
const dockActiveIndex = computed(() => isExpanded.value ? 1 : activeSection.value === 'special' ? 2 : activeSection.value === 'bottom' ? 3 : 0);
const prefersReducedMotion = () => reducedMotionQuery?.matches ?? false;

// Motion script: the index button retracts, two paper layers slide out, then
// chapter tabs and visible entries settle into reading position. Closing reverses
// the same timeline; repeated gestures change direction without restarting.
const prepareDrawerMotion = () => {
  const root = drawerRoot.value;
  if (!root || drawerTimeline) return;
  const panel = root.querySelector('.category-drawer');
  const back = root.querySelector('.category-index-paper-back');
  const backdrop = root.querySelector('.category-index-backdrop');
  const header = root.querySelector('.category-drawer-header');
  const tabs = root.querySelectorAll('.category-index-tab');
  const entries = [...root.querySelectorAll('.category-jump-item')].slice(0, 8);
  if (!panel || !back || !backdrop || !header) return;
  drawerContext = gsap.context(() => {
    drawerTimeline = gsap.timeline({
      paused: true, defaults: { ease: 'power3.out' },
      onComplete: () => { if (isExpanded.value) drawerPanel.value?.focus({ preventScroll: true }); },
      onReverseComplete: finishClose,
    });
    drawerTimeline.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.24 }, 0)
      .fromTo(back, { xPercent: 108, rotation: 3 }, { xPercent: 0, rotation: -1.4, duration: 0.4 }, 0)
      .fromTo(panel, { xPercent: 108 }, { xPercent: 0, duration: 0.44 }, 0.04)
      .fromTo(header, { x: 16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.2 }, 0.18)
      .fromTo(tabs, { y: -12, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.045, duration: 0.22 }, 0.22)
      .fromTo(entries, { x: 20, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.024, duration: 0.22 }, 0.27);
  }, root);
};
const restoreBodyScroll = () => {
  if (previousOverflow === undefined) return;
  document.body.style.overflow = previousOverflow;
  previousOverflow = undefined;
};
const finishClose = () => {
  if (isExpanded.value) return;
  isDrawerVisible.value = false;
  restoreBodyScroll();
  if (returnFocusOnClose && previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
  previousFocus = null;
};
const openDrawer = (event?: MouseEvent) => {
  previousFocus = event?.currentTarget instanceof HTMLElement ? event.currentTarget : document.activeElement as HTMLElement;
  returnFocusOnClose = true;
  isExpanded.value = true;
};
const closeDrawer = (returnFocus = true) => {
  returnFocusOnClose = returnFocus;
  isExpanded.value = false;
};
watch(isExpanded, async (expanded) => {
  isAmbientPaused.value = expanded;
  if (!mounted) return;
  if (expanded) {
    if (previousOverflow === undefined) previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    isDrawerVisible.value = true;
    await nextTick();
    if (!mounted || !isExpanded.value) return;
    prepareDrawerMotion();
    drawerPanel.value?.focus({ preventScroll: true });
    if (prefersReducedMotion()) {
      drawerTimeline?.progress(1).pause();
      drawerPanel.value?.focus({ preventScroll: true });
    } else drawerTimeline?.timeScale(1).play();
  } else {
    ++sectionVersion;
    sectionContext?.revert(); sectionContext = undefined;
    restoreBodyScroll();
    if (!drawerTimeline || prefersReducedMotion() || drawerTimeline.progress() === 0) {
      drawerTimeline?.progress(0).pause();
      finishClose();
    } else drawerTimeline.timeScale(1.35).reverse();
  }
}, { flush: 'post' });
const selectIndexSection = async (sectionId: 'regular' | 'special') => {
  if (selectedIndexSection.value === sectionId) return;
  const version = ++sectionVersion;
  sectionContext?.revert(); sectionContext = undefined;
  selectedIndexSection.value = sectionId;
  await nextTick();
  if (!mounted || version !== sectionVersion || !isExpanded.value) return;
  const content = drawerPanel.value?.querySelector<HTMLElement>('.category-drawer-content');
  const section = content?.querySelector<HTMLElement>('[data-index-section="' + sectionId + '"]');
  if (!content || !section) return;
  content.scrollTop = 0;
  if (!prefersReducedMotion()) sectionContext = gsap.context(() => {
    gsap.fromTo(section, { y: 5, opacity: .75 }, { y: 0, opacity: 1, duration: .18, clearProps: 'transform,opacity', ease: 'power2.out' });
  }, section);
};
watch(() => props.hasActiveFilters, (filtered) => {
  if (filtered && isExpanded.value) closeDrawer();
});
const handleDrawerKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') { event.preventDefault(); closeDrawer(); return; }
  if (event.key !== 'Tab') return;
  const buttons = [...(drawerPanel.value?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? [])].filter(button => button.getClientRects().length > 0);
  if (!buttons?.length) return;
  const first = buttons[0]!;
  const last = buttons[buttons.length - 1]!;
  if (event.shiftKey && (document.activeElement === first || document.activeElement === drawerPanel.value)) {
    event.preventDefault(); last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault(); first.focus();
  }
};
const queueScroll = (action: () => void, delay: number) => {
  const timer = window.setTimeout(() => { scrollTimers.delete(timer); action(); }, delay);
  scrollTimers.add(timer);
};
const cancelQueuedScroll = () => {
  for (const timer of scrollTimers) window.clearTimeout(timer);
  scrollTimers.clear();
};
const scrollToTop = () => {
  cancelQueuedScroll();
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
};
const scrollToCategory = (categoryId: string, offset: number, behavior: ScrollBehavior) => {
  const el = document.getElementById('cat-' + categoryId);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior });
  return true;
};
const scrollToCategoryStable = (categoryId: string, offset = 130) => {
  cancelQueuedScroll();
  // Nearby cards mount after the first jump; preserve the existing correction
  // checkpoints so the selected chapter remains beneath the Header.
  [0, 160, 420, 760].forEach((delay, index) => {
    queueScroll(() => scrollToCategory(categoryId, offset, index === 0 && !prefersReducedMotion() ? 'smooth' : 'auto'), delay);
  });
};
const scrollToSpecialFirst = () => {
  const firstCategory = specialCategoriesList.value[0];
  if (firstCategory) scrollToCategoryStable(firstCategory.id, 100);
};
const scrollToSpecialLast = () => {
  const lastCategory = specialCategoriesList.value[specialCategoriesList.value.length - 1];
  if (lastCategory) scrollToCategoryStable(lastCategory.id, 100);
  else {
    cancelQueuedScroll();
    window.scrollTo({ top: document.body.scrollHeight, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }
};
const scrollToCategoryAndClose = (categoryId: string) => {
  closeDrawer(false);
  cancelQueuedScroll();
  queueScroll(() => scrollToCategoryStable(categoryId, 130), 150);
};
const activateDockItem = (index: number, event: MouseEvent) => {
  if (index === 0) scrollToTop();
  else if (index === 1) openDrawer(event);
  else if (index === 2) scrollToSpecialFirst();
  else scrollToSpecialLast();
};
// Retain the original section thresholds and scroll tracking.
const handleScroll = () => {
  const scrollY = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollY < 300) { activeSection.value = 'top'; return; }
  if (maxScroll > 0 && scrollY >= maxScroll - 200) { activeSection.value = 'bottom'; return; }
  const firstCategory = specialCategoriesList.value[0];
  if (firstCategory) {
    const el = document.getElementById('cat-' + firstCategory.id);
    if (el) activeSection.value = el.getBoundingClientRect().top <= window.innerHeight / 2 ? 'special' : 'top';
  }
};
const handleReducedMotionChange = () => {
  if (!prefersReducedMotion() || !drawerTimeline) return;
  ++sectionVersion; sectionContext?.revert(); sectionContext = undefined;
  drawerTimeline.progress(isExpanded.value ? 1 : 0).pause();
  if (!isExpanded.value) finishClose();
};
onMounted(() => {
  mounted = true;
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
});
onBeforeUnmount(() => {
  mounted = false;
  window.removeEventListener('scroll', handleScroll);
  reducedMotionQuery?.removeEventListener('change', handleReducedMotionChange);
  drawerTimeline?.kill();
  drawerContext?.revert();
  ++sectionVersion; sectionContext?.revert();
  cancelQueuedScroll();
  restoreBodyScroll();
  isAmbientPaused.value = false;
});
</script>

<style scoped>
.category-index-overlay { position: fixed; inset: 0; z-index: 110; overflow: hidden; color: #254c40; isolation: isolate; }
.category-index-backdrop { position: absolute; inset: 0; width: 100%; background: rgb(21 48 39 / 0.35); border: 0; }
.category-index-paper-back, .category-drawer { position: absolute; inset: 0 0 0 auto; width: min(100%, 420px); height: 100%; height: 100dvh; background: #fdfbf3; border-left: 1px solid #d1dbc8; border-radius: 24px 0 0 24px; box-shadow: -16px 0 50px rgb(31 56 43 / 0.16); }
.category-index-paper-back { right: 9px; background: #dbe7d2; transform-origin: right center; }
.category-drawer { display: flex; flex-direction: column; overflow: hidden; }
.category-drawer::before { content: ''; position: absolute; top: 0; bottom: 0; left: 10px; width: 1px; background: rgb(135 161 135 / 0.18); pointer-events: none; }
.category-drawer-header { display: flex; align-items: center; justify-content: space-between; padding: calc(10px + env(safe-area-inset-top, 0px)) 16px 8px; gap: 12px; flex: 0 0 auto; }
.category-drawer-title { min-width: 0; }
.category-drawer-header h2 { margin: 0 0 3px; font-size: 20px; font-weight: 800; line-height: 1.2; letter-spacing: -0.025em; }
.category-drawer-header p { margin: 0; font-size: 11px; line-height: 1.4; color: #718678; }
.category-index-close { display: grid; place-items: center; width: 44px; height: 44px; flex: 0 0 44px; border: 1px solid #dbe3d5; border-radius: 50%; background: #f0f3e9; color: #496d5c; font-size: 26px; line-height: 1; }
.category-drawer-tabs { display: flex; gap: 6px; padding: 0 16px 8px; border-bottom: 1px solid #e0e6d8; flex: 0 0 auto; }
.category-index-tab { display: inline-flex; align-items: center; gap: 12px; min-height: 44px; padding: 9px 12px; border-radius: 7px 7px 2px 2px; background: #e9eee1; color: #607862; font-size: 12px; font-weight: 750; box-shadow: 0 3px 0 #d4dec9; }
.category-index-tab.is-active { background: #10b981; color: white; box-shadow: 0 3px 0 #079869; }
.category-index-tab small { font-size: 10px; opacity: 0.85; font-variant-numeric: tabular-nums; }
.category-drawer-content { flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 4px 16px; }
.category-index-list { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 2px 6px; }
.category-jump-item { display: grid; grid-template-rows: 32px 22px; justify-items: center; align-content: start; gap: 2px; width: 100%; min-width: 0; min-height: 56px; padding: 0; border-radius: 7px; background: transparent; color: #345344; transition: background-color 150ms ease, transform 150ms ease; }
.category-jump-icon { position: relative; display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: #fffef8; }
.category-jump-ring { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); overflow: visible; }
.category-jump-ring circle { fill: none; stroke-width: 2.4; }
.category-jump-ring-track { stroke: #dce5d8; }
.category-jump-ring-fill { stroke: #10b981; stroke-linecap: butt; transition: stroke-dasharray 250ms ease; }
.category-jump-symbol { width: 15px; height: 15px; color: #4f6f5f; }
.category-jump-name { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; max-width: 100%; font-size: 10.5px; font-weight: 600; line-height: 11px; text-align: center; overflow-wrap: anywhere; }
.category-jump-item.is-complete .category-jump-ring-fill { stroke: #bc9343; }
.category-jump-item.is-complete .category-jump-icon { background: #fcf4df; }
.category-jump-item:active { transform: scale(.95); }
.category-index-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 16px calc(6px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid #dfe5d6; color: #829379; font-size: 10px; line-height: 14px; flex: 0 0 auto; }
.category-index-footer-count { flex: 0 0 auto; font-variant-numeric: tabular-nums; }
.category-dock { position: fixed; bottom: calc(15px + env(safe-area-inset-bottom, 0px)); left: 50%; width: min(calc(100% - 28px), 360px); display: flex; gap: 4px; padding: 5px; border: 1px solid #d7e1d0; border-radius: 18px; background: #fcfaf2; box-shadow: 0 4px 0 #d6e1ce, 0 10px 25px rgb(43 77 49 / 0.14); transform: translateX(-50%); z-index: 40; transition: transform 230ms ease, opacity 170ms ease; }
.category-dock.is-drawer-open { opacity: 0; transform: translate(-50%, 20px); pointer-events: none; }
.category-dock-link { flex: 1 1 0; min-width: 0; min-height: 50px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; border-radius: 12px; color: #607a66; font-size: 12px; font-weight: 700; line-height: 1.2; transition: background-color 150ms ease, color 150ms ease; }
.category-dock-mark { font-size: 15px; line-height: 1; font-variant-numeric: tabular-nums; }
.category-dock-link.is-active, .category-dock-link.is-primary { background: #10b981; color: white; box-shadow: 0 2px 0 #079b6b; }
.category-dock-link:active, .category-index-close:active, .category-jump-item:active { background: #e4f3e8; color: #087e5c; }
.category-dock-link.is-primary:active, .category-dock-link.is-active:active { background: #079b6b; color: white; }
.category-dock-link:focus-visible, .category-index-close:focus-visible, .category-jump-item:focus-visible, .category-index-tab:focus-visible { outline: 3px solid #10b981; outline-offset: 3px; }
.category-drawer:focus { outline: none; }
.custom-scrollbar { scrollbar-width: thin; scrollbar-color: #c2d1b5 transparent; }
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #c2d1b5; border-radius: 8px; }
@media (hover: hover) { .category-jump-item:hover { background: #eef4e9; } .category-index-close:hover { background: #e3ecda; } .category-dock-link:not(.is-primary):not(.is-active):hover { background: #eef4e9; } }
@media (min-width: 640px) { .category-dock { left: auto; right: 20px; top: 50%; bottom: auto; width: 86px; flex-direction: column; transform: translateY(-50%); border-radius: 17px; gap: 5px; } .category-dock-link { min-height: 54px; } .category-dock.is-drawer-open { transform: translate(20px, -50%); } }
@media (min-width: 640px) { .category-index-paper-back, .category-drawer { width: min(92vw, 720px); }.category-drawer-header { padding: 20px 24px 12px; }.category-drawer-tabs { padding-inline: 24px; }.category-drawer-content { padding: 12px 24px; }.category-index-list { grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 8px; }.category-jump-item { grid-template-rows: 40px 28px; gap: 4px; min-height: 72px; }.category-jump-icon { width: 40px; height: 40px; }.category-jump-symbol { width: 19px; height: 19px; }.category-jump-name { font-size: 11px; line-height: 14px; }.category-index-footer { padding-inline: 24px; } }
@media (max-width: 639px) and (min-height: 760px) { [data-index-section="regular"] .category-jump-item { grid-template-rows: 40px 22px; min-height: 64px; }[data-index-section="regular"] .category-jump-icon { width: 40px; height: 40px; }[data-index-section="regular"] .category-jump-symbol { width: 19px; height: 19px; } }
@media (max-width: 359px) { .category-drawer-header, .category-drawer-tabs, .category-drawer-content, .category-index-footer { padding-inline: 10px; }.category-index-list { column-gap: 3px; } }
@media (prefers-reduced-motion: reduce) { .category-dock, .category-dock-link, .category-index-close, .category-jump-item, .category-jump-ring-fill { transition: none; } }
</style>
