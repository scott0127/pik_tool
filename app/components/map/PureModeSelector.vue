<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    :enter-from-class="isMobile ? 'opacity-0 translate-y-full' : 'opacity-0 -translate-x-full'"
    :enter-to-class="isMobile ? 'opacity-100 translate-y-0' : 'opacity-100 translate-x-0'"
    leave-active-class="transition duration-200 ease-in"
    :leave-from-class="isMobile ? 'opacity-100 translate-y-0' : 'opacity-100 translate-x-0'"
    :leave-to-class="isMobile ? 'opacity-0 translate-y-full' : 'opacity-0 -translate-x-full'"
  >
    <div
      v-if="internalShowPanel"
      ref="panelRoot"
      :class="[
        'pure-filter-sheet absolute overflow-hidden flex flex-col z-[1000]',
        isMobile
          ? 'pure-filter-sheet-mobile left-0 right-0 bottom-0'
          : 'pure-filter-sheet-desktop'
      ]"
    >
      <!-- 標題列 -->
      <div
        class="pure-filter-header relative px-4 py-3 md:px-5 md:py-4 flex items-center justify-between touch-none shrink-0"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <div v-if="isMobile" class="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300/60 rounded-full"></div>

        <div class="flex items-center gap-3 mt-1 md:mt-0">
          <div class="pure-filter-mark w-9 h-9 flex items-center justify-center">
            <Icon name="lucide:gem" class="w-[18px] h-[18px] text-white" />
          </div>
          <div>
            <h2 class="font-bold text-gray-800 text-[15px] tracking-tight">純種模式</h2>
            <p class="text-xs text-gray-400 hidden md:block">選擇要尋找的飾品類型</p>
          </div>
        </div>
        <button
          @click="showTutorial = true"
          class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
          title="使用說明"
        >
          <Icon name="lucide:help-circle" class="h-4 w-4" />
        </button>
        <button v-if="isMobile" type="button" class="pure-sheet-close" @click="internalShowPanel = false" aria-label="關閉純種篩選"><Icon name="lucide:x" class="w-4 h-4" /></button>
      </div>

      <!-- 統計 + 操作 -->
      <div class="px-4 pb-3 md:px-5 md:pb-4 shrink-0">
        <div class="flex gap-2 mb-3">
          <div class="flex-1 bg-emerald-50/80 rounded-xl px-3 py-2 border border-emerald-100/60">
            <div class="text-xs text-emerald-600/70 font-medium mb-0.5">已選擇</div>
            <div class="text-lg font-bold text-emerald-600 tabular-nums leading-tight">
              {{ selectedTypes.length }}
              <span class="text-xs font-normal text-emerald-400">種</span>
            </div>
          </div>
          <div class="flex-1 bg-gray-50/80 rounded-xl px-3 py-2 border border-gray-100/60">
            <div class="text-xs text-gray-500 font-medium mb-0.5">狀態</div>
            <div v-if="isLoading" class="flex items-center gap-1.5 text-emerald-600">
              <svg class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-xs font-medium">載入中</span>
            </div>
            <div v-else-if="cachedTypesCount > 0" class="flex items-center gap-1 text-emerald-600">
              <Icon name="lucide:database" class="w-3.5 h-3.5" />
              <span class="text-xs font-bold">{{ cachedTypesCount }} 種</span>
            </div>
            <div v-else class="text-xs text-gray-400 leading-tight mt-0.5">就緒</div>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            @click="selectPopular"
            class="pure-panel-action pure-panel-action-primary flex-1 px-3 py-2 text-xs font-semibold cursor-pointer"
          >
            熱門選擇
          </button>
          <button
            @click="clearAll"
            class="pure-panel-action pure-panel-action-secondary flex-1 px-3 py-2 text-xs font-semibold cursor-pointer"
          >
            清除全部
          </button>
        </div>
      </div>

      <button type="button" class="pure-community-link" @click="openCommunity"><span>{{ $t('map.community.open') }}</span><Icon name="lucide:arrow-up-right" class="h-4 w-4" /></button>
      <div class="pure-community-toggle"><label><input type="checkbox" v-model="communityEnabled" /><span>{{ $t('map.community.show_points') }}</span><small>{{ communityCount || 0 }}</small></label><p>{{ $t('map.community.layer_note') }}</p></div>
      <div class="h-px bg-gradient-to-r from-transparent via-gray-200/60 to-transparent mx-4 shrink-0"></div>

      <!-- 類型列表 -->
      <div ref="typeList" class="pure-type-list flex-1" @scroll.passive="rememberListPosition">
        <label v-for="(type, index) in allTypes" :key="type.id" :data-type-id="type.id"
          class="pure-filter-item" :class="{ 'is-selected': selectedTypes.includes(type.id) }">
          <input type="checkbox" :value="type.id" v-model="selectedTypes" @change="handleSelectionChange($event, type.id)" class="sr-only" />
          <MapTypeButtonEffect v-if="visibleObjectIds.has(type.id)" :id="type.id" :selected="selectedTypes.includes(type.id)"
            :revision="activeType === type.id ? typeRevision : 0" :animate="activeType === type.id" />
          <span class="pure-filter-number" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="pure-filter-name">{{ $t('decor_types.' + type.id) }}</span>
          <span v-if="isCached(type.id)" class="pure-filter-cached" title="已快取"><Icon name="lucide:database" class="w-3 h-3" /></span>
          <span class="pure-filter-check" aria-hidden="true"><Icon v-if="selectedTypes.includes(type.id)" name="lucide:check" class="w-3 h-3" /></span>
        </label>
      </div>

      <!-- 載入狀態 -->
      <div v-if="isLoading" class="p-3 bg-gradient-to-r from-emerald-500 to-emerald-500 text-white text-center shrink-0">
        <div class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span class="text-sm font-medium">載入純種格資料中...</span>
        </div>
      </div>
    </div>
  </Transition>

  <!-- 收起按鈕 -->
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <button
      v-if="!internalShowPanel && isMobile"
      @click="internalShowPanel = true"
      class="pure-filter-reopen absolute z-[1000] flex items-center gap-2 cursor-pointer"
    >
      <Icon name="lucide:gem" class="w-4 h-4" />
      <span class="text-sm font-semibold">純種篩選器</span>
    </button>
  </Transition>

  <!-- 教學 -->
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="showTutorial"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4"
      @click.self="dismissTutorial"
    >
      <div class="pure-tutorial-card p-6 max-w-sm w-full" role="dialog" aria-modal="true" aria-label="純種模式說明">
        <div class="text-center mb-5">
          <div class="pure-tutorial-mark w-14 h-14 mx-auto flex items-center justify-center mb-3">
            <Icon name="lucide:target" class="w-7 h-7 text-white" />
          </div>
          <h3 class="font-bold text-lg text-gray-800">純種模式說明</h3>
        </div>
        <div class="space-y-3 text-sm text-gray-600 mb-6">
          <div class="flex items-start gap-3">
            <span class="bg-emerald-500 text-white rounded-lg w-6 h-6 flex items-center justify-center shrink-0 text-xs font-bold">1</span>
            <p>先選想找的飾品類型（可<span class="font-bold text-emerald-600">複選</span>）</p>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-emerald-500 text-white rounded-lg w-6 h-6 flex items-center justify-center shrink-0 text-xs font-bold">2</span>
            <p>查看地圖推算的「單一飾品格」，<span class="font-bold text-emerald-600">網格不是探測範圍，可搭配雷達預測</span></p>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-emerald-500 text-white rounded-lg w-6 h-6 flex items-center justify-center shrink-0 text-xs font-bold">3</span>
            <p>到現場開啟遊戲探測器確認。地圖資料可能有落差，歡迎點網格回報。</p>
          </div>
        </div>
        <button
          @click="dismissTutorial"
          class="pure-tutorial-action w-full py-3 text-white font-bold transition-all cursor-pointer"
        >
          我知道了！
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';
import MapTypeButtonEffect from './TypeButtonEffect.vue';
import { decorRules } from '~/composables/useDecorRules';

const props = defineProps<{
  selectedTypes: string[];
  isLoading?: boolean;
  cachedTypes?: string[];
  showPanel?: boolean;
  showCommunity?: boolean;
  communityCount?: number;
}>();

const emit = defineEmits<{
  'update:selectedTypes': [types: string[]];
  'update:showPanel': [show: boolean];
  load: [types: string[]];
  'open-community': [];
  'update:showCommunity': [show: boolean];
}>();

const isMobile = ref(false);
const communityEnabled = computed({ get: () => props.showCommunity ?? true, set: value => emit('update:showCommunity', value) });
const internalShowPanel = computed({
  get: () => props.showPanel ?? true,
  set: (val) => emit('update:showPanel', val)
});
const showTutorial = ref(false);
const TUTORIAL_KEY = 'pure-mode-tutorial-seen-v5';

const selectedTypes = computed({
  get: () => props.selectedTypes,
  set: (val) => emit('update:selectedTypes', val)
});

const cachedTypesCount = computed(() => props.cachedTypes?.length || 0);
const isCached = (typeId: string) => props.cachedTypes?.includes(typeId) || false;
let tutorialTimer: ReturnType<typeof setTimeout> | null = null;
const panelRoot = ref<HTMLElement | null>(null);
const typeList = ref<HTMLElement | null>(null);
const activeType = ref<string | null>(null);
const typeRevision = ref(0);
const visibleObjectIds = ref(new Set<string>());
let objectObserver: IntersectionObserver | null = null;
let pressMotion: gsap.Context | null = null;
let listPosition = 0;
const rememberListPosition = (event: Event) => { listPosition = (event.target as HTMLElement).scrollTop; };

// Only visited rows mount their paper scene. Reopening seeks to the saved selection.
const observeObjects = () => {
  objectObserver?.disconnect();
  pressMotion?.revert();
  if (!typeList.value || !panelRoot.value || !internalShowPanel.value) return;
  const list = typeList.value;
  list.scrollTop = listPosition;
  pressMotion = gsap.context(() => {}, panelRoot.value);
  objectObserver = new IntersectionObserver(entries => {
    if (!internalShowPanel.value || !list.isConnected) return;
    const newlyVisible = entries.filter(entry => entry.isIntersecting);
    if (!newlyVisible.length) return;
    const ids = new Set(visibleObjectIds.value);
    for (const entry of newlyVisible) {
      const id = (entry.target as HTMLElement).dataset.typeId;
      if (id) ids.add(id);
      objectObserver?.unobserve(entry.target);
    }
    visibleObjectIds.value = ids;
  }, { root: list, rootMargin: '64px 0px' });
  list.querySelectorAll<HTMLElement>('.pure-filter-item').forEach(item => {
    if (!visibleObjectIds.value.has(item.dataset.typeId ?? '')) objectObserver?.observe(item);
  });
};

watch(internalShowPanel, async visible => {
  activeType.value = null;
  objectObserver?.disconnect();
  pressMotion?.revert();
  pressMotion = null;
  if (visible) {
    await nextTick();
    observeObjects();
  }
}, { flush: 'post' });

const updateIsMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  updateIsMobile();
  window.addEventListener('resize', updateIsMobile, { passive: true });
  observeObjects();
  if (!localStorage.getItem(TUTORIAL_KEY)) {
    tutorialTimer = setTimeout(() => { showTutorial.value = true; }, 500);
  }
});

onBeforeUnmount(() => {
  objectObserver?.disconnect();
  pressMotion?.revert();
  window.removeEventListener('resize', updateIsMobile);
  if (tutorialTimer) {
    clearTimeout(tutorialTimer);
    tutorialTimer = null;
  }
});

const dismissTutorial = () => {
  if (tutorialTimer) { clearTimeout(tutorialTimer); tutorialTimer = null; }
  showTutorial.value = false;
  localStorage.setItem(TUTORIAL_KEY, 'true');
};

const openCommunity = () => {
  if (tutorialTimer) { clearTimeout(tutorialTimer); tutorialTimer = null; }
  showTutorial.value = false;
  emit('open-community');
};

const loadUncachedTypes = (types: string[]) => {
  const typesToLoad = types.filter(type => !isCached(type));
  if (typesToLoad.length > 0) emit('load', typesToLoad);
};

const handleSelectionChange = (event: Event, id: string) => {
  activeType.value = id;
  typeRevision.value++;
  const input = event.target as HTMLInputElement;
  const nextTypes = input.checked ? [...new Set([...selectedTypes.value, id])] : selectedTypes.value.filter(type => type !== id);
  loadUncachedTypes(nextTypes);
  const label = input.closest('label');
  if (!label || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  pressMotion?.add(() => {
    gsap.killTweensOf(label);
    gsap.timeline({ defaults: { overwrite: 'auto' } })
      .to(label, { y: 3, scale: 0.975, duration: 0.08, ease: 'power2.out' })
      .to(label, { y: 0, scale: 1, duration: 0.26, ease: 'back.out(1.8)', clearProps: 'transform' });
  });
};

const selectPopular = () => {
  activeType.value = null;
  const popularTypes = ['restaurant', 'cafe', 'convenience', 'park', 'station'];
  selectedTypes.value = popularTypes;
  loadUncachedTypes(popularTypes);
};
const clearAll = () => { activeType.value = null; selectedTypes.value = []; };

const touchStartY = ref(0);
const touchCurrentY = ref(0);
const isPanelDragging = ref(false);

const handleTouchStart = (e: TouchEvent) => {
  if (!isMobile.value) return;
  const touch = e.touches[0];
  if (!touch) return;
  touchStartY.value = touch.clientY;
  isPanelDragging.value = true;
};
const handleTouchMove = (e: TouchEvent) => {
  if (!isPanelDragging.value) return;
  const touch = e.touches[0];
  if (!touch) return;
  touchCurrentY.value = touch.clientY;
};
const handleTouchEnd = () => {
  if (!isPanelDragging.value) return;
  if (touchCurrentY.value - touchStartY.value > 50 && touchCurrentY.value !== 0) {
    internalShowPanel.value = false;
  }
  isPanelDragging.value = false;
  touchStartY.value = 0;
  touchCurrentY.value = 0;
};

// Preserve the available Taiwan pure-grid data and its familiar order. These IDs
// are a verified subset of the 43 general categories, not a second icon catalog.
const pureTypeIds = [
  'restaurant', 'cafe', 'convenience', 'park', 'station', 'supermarket', 'burger',
  'bakery', 'sweetshop', 'pharmacy', 'post_office', 'library', 'stationery',
  'hotel', 'university', 'stadium', 'art_gallery', 'electronics', 'clothing',
  'hair_salon', 'laundry', 'cosmetics', 'hardware', 'waterside', 'bridge',
  'bus_stop', 'forest', 'mountain', 'beach', 'theme_park', 'airport', 'zoo',
  'movie_theater', 'ramen', 'italian',
];
const allTypes = pureTypeIds.map(id => decorRules.find(rule => rule.id === id)!);
</script>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(168, 85, 247, 0.2) transparent;
}
.overflow-y-auto::-webkit-scrollbar { width: 4px; }
.overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(168, 85, 247, 0.2);
  border-radius: 4px;
}
.decor-chip { -webkit-tap-highlight-color: transparent; }

@keyframes glow {
  0% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.5); }
  70% { box-shadow: 0 0 0 8px rgba(168, 85, 247, 0); }
  100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
}
.glow-effect { animation: glow 2s infinite; }

.pure-filter-sheet {
  border: 1px solid rgba(148, 163, 184, 0.26);
  background: rgba(255, 255, 255, 0.94);
  box-shadow:
    0 18px 46px rgba(15, 23, 42, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.pure-filter-sheet-desktop {
  top: 0.75rem;
  bottom: 0.75rem;
  left: 0.75rem;
  width: 20.5rem;
  border-radius: 1rem;
}

.pure-filter-sheet-mobile {
  max-height: min(64dvh, 35rem);
  padding-bottom: env(safe-area-inset-bottom);
  border-width: 1px 0 0;
  border-radius: 1.15rem 1.15rem 0 0;
}

.pure-filter-header {
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.pure-filter-mark {
  flex: 0 0 auto;
  border: 1px solid rgba(13, 148, 136, 0.22);
  border-radius: 0.68rem;
  background: rgb(15 118 110);
  color: white;
  box-shadow: 0 6px 14px rgba(15, 118, 110, 0.18);
}

.pure-panel-action {
  min-height: 2.35rem;
  border-radius: 0.66rem;
  transition:
    color 150ms ease,
    border-color 150ms ease,
    background 150ms ease,
    box-shadow 150ms ease,
    transform 120ms ease;
}

.pure-panel-action:active {
  transform: scale(0.98);
}

.pure-panel-action:focus-visible {
  outline: 2px solid rgba(20, 184, 166, 0.35);
  outline-offset: 2px;
}

.pure-panel-action-primary,
.pure-tutorial-action {
  border: 1px solid rgb(15 118 110);
  background: rgb(15 118 110);
  color: white;
  box-shadow: 0 5px 12px rgba(15, 118, 110, 0.16);
}

.pure-panel-action-primary:hover,
.pure-tutorial-action:hover {
  background: rgb(13 148 136);
}

.pure-panel-action-secondary {
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgb(248 250 252);
  color: rgb(71 85 105);
}

.pure-panel-action-secondary:hover {
  background: rgb(241 245 249);
  color: rgb(15 23 42);
}

.pure-filter-chip {
  min-width: 0;
  min-height: 2.8rem;
  border-radius: 0.72rem;
  background: rgba(255, 255, 255, 0.76);
  -webkit-tap-highlight-color: transparent;
}

.pure-filter-chip.is-selected {
  border-color: rgba(20, 184, 166, 0.34);
  background: rgb(240 253 250);
  box-shadow: 0 2px 7px rgba(15, 118, 110, 0.06);
}

.pure-filter-item {
  min-height: 2.55rem;
  border: 1px solid transparent;
  border-radius: 0.66rem;
}

.pure-filter-item.is-selected {
  border-color: rgba(20, 184, 166, 0.24);
  background: rgb(240 253 250);
  box-shadow: none;
}

.pure-filter-reopen {
  top: 4.7rem;
  left: 0.7rem;
  min-height: 2.55rem;
  padding-inline: 0.82rem;
  border: 1px solid rgba(13, 148, 136, 0.28);
  border-radius: 0.72rem;
  background: rgba(255, 255, 255, 0.94);
  color: rgb(15 118 110);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.pure-filter-reopen:hover,
.pure-filter-reopen:focus-visible {
  border-color: rgba(13, 148, 136, 0.46);
  background: rgb(240 253 250);
  outline: none;
}

.pure-tutorial-card {
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 1rem;
  background: rgb(255 255 255);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
}

.pure-tutorial-mark {
  border: 1px solid rgba(13, 148, 136, 0.22);
  border-radius: 0.82rem;
  background: rgb(15 118 110);
  color: white;
  box-shadow: 0 8px 18px rgba(15, 118, 110, 0.18);
}

.pure-tutorial-action {
  border-radius: 0.72rem;
}

@media (max-width: 767px) {
  .pure-filter-header {
    padding-top: 1.05rem;
    padding-bottom: 0.72rem;
  }

  .pure-filter-chip {
    min-height: 2.9rem;
    padding: 0.48rem 0.62rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .glow-effect {
    animation: none;
  }

  .pure-filter-chip,
  .pure-filter-item,
  .pure-panel-action {
    transition-duration: 0.01ms;
  }
}
</style>
<style scoped>
.pure-filter-sheet { background: #faf9f1; border-color: #d4d9c9; box-shadow: 0 3px 0 #c8cfbb, 0 18px 44px rgb(33 55 35 / 18%); }
.pure-filter-sheet-desktop { left: 1rem; top: 1rem; bottom: 1rem; width: 20rem; }
.pure-filter-sheet-mobile { max-height: 72%; border-radius: 1.5rem 1.5rem 0 0; }
.pure-filter-header { border-color: #dce1d2; }
.pure-filter-mark { background: var(--map-action); border-color: var(--map-action); }
.pure-filter-chip, .pure-filter-item { min-height: 48px; background: #f1f2e8; border-color: #e1e4d7; border-radius: 0.45rem; }
.pure-filter-chip.is-selected, .pure-filter-item.is-selected { background: #e8eedb; border-color: #bacaaa; box-shadow: none; }
.pure-filter-reopen { min-height: 44px; background: #fafaf3; border-color: #d6dccb; color: #344d3b; box-shadow: 0 3px 0 #c8d0ba, 0 12px 26px rgb(39 58 30 / 13%); }
.pure-filter-header button, .pure-sheet-close { min-width: 44px; min-height: 44px; display: grid; place-items: center; border-radius: 50%; color: #617553; }
.pure-sheet-close { background: #f0f2e6; }
.pure-filter-header button:focus-visible { outline: 2px solid #668257; outline-offset: 2px; }
@media (max-width: 767px) { .pure-filter-reopen { inset: auto 0.75rem 1.4rem; width: auto; height: 48px; justify-content: center; border-radius: 0.75rem; } }
</style>

<style scoped>
.pure-filter-sheet { color: #304f3a; z-index: 1005; }
.pure-filter-sheet [class*="text-emerald"] { color: #496d50; }
.pure-filter-sheet [class*="bg-emerald-50"], .pure-filter-sheet [class*="bg-gray-50"] { background: #f0f2e6; border-color: #d6dccb; }
.pure-filter-sheet [class*="bg-emerald-500"], .pure-tutorial-card [class*="bg-emerald-500"] { background: var(--map-action); }
.pure-filter-chip { min-height: 50px; }
.pure-filter-chip.is-selected, .pure-filter-item.is-selected { background: var(--map-accent); border-color: var(--map-accent); color: #fff; }
.pure-filter-sheet .is-selected span, .pure-filter-sheet .is-selected [class*="text-"] { color: #fff; }
.pure-filter-chip:has(input:focus-visible) { outline: 2px solid #07865f; outline-offset: 4px; }
.pure-tutorial-card { max-height: 80dvh; overflow-y: auto; color: #304f3a; }
.pure-tutorial-card [class*="text-emerald"] { color: #496d50; }
.pure-filter-sheet .bg-gradient-to-r { background: var(--map-accent); color: #fff; }
.pure-filter-header h2 { font-size: 18px; }
.pure-filter-header { padding-top: 20px; }
.pure-community-link { display: flex; align-items: center; justify-content: space-between; min-height: 44px; margin: 0 16px 8px; padding: 8px 12px; color: #fff; background: var(--map-accent); border: 1px solid var(--map-accent); border-radius: 8px; font-size: 14px; font-weight: 700; flex-shrink: 0; }
.pure-tutorial-card { background: #faf9f1; border-color: #d6dccb; }
.pure-tutorial-mark, .pure-tutorial-action { background: var(--map-action); border-color: var(--map-action); color: #fff; }
.pure-panel-action { min-height: 44px; }
.pure-panel-action-primary { background: var(--map-action); border-color: var(--map-action); color: #fff; }
.pure-panel-action-primary:hover { background: var(--map-action); }
.pure-type-list { display: grid; grid-template-columns: minmax(0, 1fr); align-content: start; gap: 32px; overflow-y: auto; min-height: 0; padding: 48px 1rem 1rem; overscroll-behavior: contain; scrollbar-width: thin; scrollbar-color: #b7c3a4 transparent; }
.pure-type-list .pure-filter-item { position: relative; display: flex; align-items: center; gap: 0.8rem; min-width: 0; min-height: 64px; padding: 0.65rem 1rem; background: #fffdf5; border: 1px solid #d8ddce; border-radius: 1rem; box-shadow: inset 0 1px 0 #fff, 0 3px 0 #d5dbcc, 0 7px 14px #304a3908; cursor: pointer; touch-action: pan-y; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; transition: border-color 160ms; }
.pure-type-list .pure-filter-item.is-selected { background: var(--map-accent, #10B981); border-color: #0ca778; color: #fff; box-shadow: inset 0 1px 0 #ffffff40, inset 0 -1px 0 #04785726, 0 3px 0 #07865f, 0 7px 14px #04785712; }
.pure-filter-number, .pure-filter-name, .pure-filter-cached, .pure-filter-check { position: relative; z-index: 1; }
.pure-filter-number { flex-shrink: 0; padding-right: 0.7rem; border-right: 1px solid #dce2d3; font-size: 11px; font-weight: 700; line-height: 1.4; color: #899b84; font-variant-numeric: tabular-nums; }
.pure-filter-name { flex: 1; min-width: 0; font-size: 0.95rem; font-weight: 700; line-height: 1.45; overflow-wrap: anywhere; }
.pure-filter-cached { flex-shrink: 0; color: #738966; }
.pure-filter-check { width: 24px; height: 24px; border: 1px solid #c5ceba; background: #f5f6ef; border-radius: 8px; flex-shrink: 0; display: grid; place-items: center; }
.pure-filter-item.is-selected .pure-filter-number, .pure-filter-item.is-selected .pure-filter-cached { color: #ffffffb3; }
.pure-filter-item.is-selected .pure-filter-number { border-color: #ffffff30; }
.pure-filter-sheet .pure-filter-item.is-selected .pure-filter-check { background: #fffdf5; border-color: #fffdf5; color: #07865f; box-shadow: 0 1px 2px #006c4826; }
.pure-filter-sheet .pure-filter-item.is-selected .pure-filter-check > * { color: inherit; }
.pure-type-list .pure-filter-item:has(input:focus-visible) { outline: 2px solid #07865f; outline-offset: 4px; }
@media (hover: hover) and (pointer: fine) { .pure-type-list .pure-filter-item:hover { border-color: #aab99f; } .pure-type-list .pure-filter-item.is-selected:hover { border-color: #07865f; } }
@media (max-width: 350px) { .pure-type-list { padding-inline: 0.85rem; } .pure-type-list .pure-filter-item { gap: 0.65rem; padding-inline: 0.85rem; } .pure-filter-name { font-size: 0.88rem; } }
@media (prefers-reduced-motion: reduce) { .pure-type-list .pure-filter-item { transition: none; } }
</style>
