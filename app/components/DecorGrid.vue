<template>
  <div ref="gridRoot" :class="{ 'is-single-specimen-grid': isSingleSpecimenGrid }">
    <!-- Grouped by Variant -->
    <div 
      v-for="(group, groupIndex) in groupedItems" 
      :key="group.key"
      class="decor-grid-group"
      :style="{ '--decor-group-height': `calc(${getGroupPlaceholderHeight(group.items.length)} + ${group.items.length > 1 && (groupedItems.length > 1 || group.isRare) ? 32 : 0}px)` }"
      :data-group-key="group.key"
      :data-group-index="groupIndex"
    >
      <div v-if="group.items.length > 1 && (groupedItems.length > 1 || group.isRare)" class="decor-series-heading">
        <span>{{ locale === 'en' ? group.variantNameEn : group.variantName }}</span>
        <small>{{ group.isRare ? (locale === 'en' ? 'Rare series' : '稀有系列') : String(groupIndex + 1).padStart(2, '0') }}</small>
      </div>
      <!-- Pikmin Row for this Variant -->
        <div
          v-if="isGroupVisible(group.key)"
          class="decor-grid-row overflow-visible"
        >
          <DecorCard
            v-for="item in group.items"
            :key="item.id"
          :item-id="item.id"
          :category-id="item.categoryId"
          :variant-id="item.variantId"
          :pikmin-type="item.pikminType"
            class="decor-grid-card"
            @toggle="$emit('toggle', $event)"
          />
        </div>
      <div
        v-else
        class="decor-grid-placeholder rounded-2xl"
        :style="{ minHeight: getGroupPlaceholderHeight(group.items.length) }"
      ></div>
    </div>
    
    <!-- Empty State -->
    <Transition
      enter-active-class="transition duration-300"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
    >
      <div 
        v-if="items.length === 0" 
        class="decor-grid-empty"
      >
        <span class="decor-empty-index" aria-hidden="true">00</span>
        <p class="decor-empty-title">{{ $t('components.decor_grid.empty_title') }}</p>
        <p class="decor-empty-description">{{ $t('components.decor_grid.empty_desc') }}</p>
        <button 
          @click="$emit('clear-filters')"
          class="decor-empty-reset"
        >
          {{ $t('components.decor_grid.clear_filters') }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { DecorItem } from '~/types/decor';

const props = defineProps<{
  items: DecorItem[];
}>();

defineEmits<{
  toggle: [itemId: string];
  'clear-filters': [];
}>();

const { getVariant, getImageUrl } = useDecorData();
const { locale } = useI18n();
const gridRoot = ref<HTMLElement | null>(null);
const visibleGroupKeys = ref<Set<string>>(new Set());
// Keep the first client render identical to SSR; measure the phone after mounting.
const viewportWidth = ref(1024);
const gridWidth = ref(0);
let visibilityObserver: IntersectionObserver | null = null;
let preloadFrame: number | null = null;
const preloadedImageUrls = new Set<string>();

// Group items by categoryId + variantId
const groupedItems = computed(() => {
  const groups = new Map<string, { 
    key: string; 
    variantName: string;
    variantNameEn: string;
    isRare: boolean;
    items: DecorItem[] 
  }>();
  
  props.items.forEach(item => {
    const key = `${item.categoryId}_${item.variantId}`;
    if (!groups.has(key)) {
      const variant = getVariant(item.categoryId, item.variantId);
      groups.set(key, { 
        key, 
        variantName: variant?.name || item.variantId,
        variantNameEn: variant?.nameEn || variant?.name || item.variantId,
        isRare: Boolean(variant?.isRare) || item.variantId.toLowerCase().includes('rare'),
        items: [] 
      });
    }
    groups.get(key)!.items.push(item);
  });
  
  return Array.from(groups.values());
});

const groupedItemsByKey = computed(() => {
  return new Map(groupedItems.value.map(group => [group.key, group]));
});

// Filtering to one Pikmin color turns each series into a single specimen.
// Lay those series beside each other instead of retaining empty color slots.
const isSingleSpecimenGrid = computed(() => groupedItems.value.length > 0 && groupedItems.value.every(group => group.items.length === 1));

const groupIndexByKey = computed(() => {
  return new Map(groupedItems.value.map((group, index) => [group.key, index]));
});

const groupedItemKeys = computed(() => groupedItems.value.map(group => group.key));

const isGroupVisible = (key: string) => visibleGroupKeys.value.has(key);

const preloadGroupImages = (groupKeys: string[]) => {
  if (typeof window === 'undefined') return;

  groupKeys.forEach((key) => {
    const group = groupedItemsByKey.value.get(key);
    if (!group) return;

    group.items.forEach((item) => {
      const url = getImageUrl(item.categoryId, item.variantId, item.pikminType);
      if (!url || preloadedImageUrls.has(url)) return;

      preloadedImageUrls.add(url);
      const image = new Image();
      image.decoding = 'async';
      image.referrerPolicy = 'no-referrer';
      image.src = url;
    });
  });
};

const scheduleImagePreload = (groupKeys: string[]) => {
  if (preloadFrame) cancelAnimationFrame(preloadFrame);
  preloadFrame = requestAnimationFrame(() => {
    preloadFrame = null;
    preloadGroupImages(groupKeys);
  });
};

const warmNearbyGroups = (key: string) => {
  const index = groupIndexByKey.value.get(key) ?? -1;
  if (index < 0) return;

  const next = new Set(visibleGroupKeys.value);
  const keysToPreload: string[] = [];
  const preloadAhead = viewportWidth.value < 640 ? 5 : 3;
  const preloadBehind = 1;

  for (let i = Math.max(0, index - preloadBehind); i <= Math.min(groupedItems.value.length - 1, index + preloadAhead); i += 1) {
    const nextKey = groupedItems.value[i]?.key;
    if (!nextKey) continue;
    next.add(nextKey);
    keysToPreload.push(nextKey);
  }

  visibleGroupKeys.value = next;
  scheduleImagePreload(keysToPreload);
};

const setGroupVisibility = (key: string, isVisible: boolean) => {
  if (!isVisible) return;

  const next = new Set(visibleGroupKeys.value);
  next.add(key);
  visibleGroupKeys.value = next;
  warmNearbyGroups(key);
};

const getGroupPlaceholderHeight = (itemCount: number) => {
  const isMobileLayout = viewportWidth.value < 640;
  const gap = 10;
  
  if (isMobileLayout) {
    // Narrow phones use two readable columns; larger phones keep three.
    const columns = viewportWidth.value <= 360 ? 2 : 3;
    const availableWidth = Math.min(gridWidth.value || viewportWidth.value - 24, 544);
    const cardWidth = (availableWidth - 8 - gap * (columns - 1)) / columns;
    const rows = Math.ceil(itemCount / columns);
    const cardHeight = cardWidth + 86; // Image mount plus two-line name, translation, and stamp.
    if (isSingleSpecimenGrid.value) return `${Math.ceil(cardHeight)}px`;
    const rowGap = 14;
    return `${Math.ceil(rows * cardHeight + Math.max(0, rows - 1) * rowGap)}px`;
  } else {
    // Desktop flex layout
    const availableWidth = Math.max((gridWidth.value || viewportWidth.value - 32) - 16, 100);
    if (isSingleSpecimenGrid.value) return `${Math.ceil(Math.min(availableWidth, 138) + 86)}px`;
    const cardWidth = Math.min(Math.max((availableWidth - 12 * 7) / 8, 100), 138);
    const cardsPerRow = Math.max(1, Math.floor((availableWidth + 12) / (cardWidth + 12)));
    const rows = Math.max(1, Math.ceil(itemCount / cardsPerRow));
    return `${Math.ceil(rows * (cardWidth + 86) + Math.max(0, rows - 1) * 12)}px`;
  }
};

const syncObservedGroups = async () => {
  await nextTick();
  const root = gridRoot.value;
  if (!root) return;
  gridWidth.value = root.clientWidth;

  if (!('IntersectionObserver' in window)) {
    visibleGroupKeys.value = new Set(groupedItems.value.map(group => group.key));
    return;
  }

  if (!visibilityObserver) {
    visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const key = (entry.target as HTMLElement).dataset.groupKey;
        if (!key) return;
        setGroupVisibility(key, entry.isIntersecting);
      });
    }, {
      root: null,
      rootMargin: viewportWidth.value < 640 ? '800px 0px' : '1200px 0px',
      threshold: 0,
    });
  }

  visibilityObserver.disconnect();

  // The observer warms nearby groups. Pre-warming every DecorGrid here mounts
  // nearly the entire catalog because each category has its own grid instance.
  root.querySelectorAll<HTMLElement>('[data-group-key]').forEach((el) => {
    visibilityObserver?.observe(el);
  });
};

const updateViewportWidth = () => {
  viewportWidth.value = window.innerWidth;
  gridWidth.value = gridRoot.value?.clientWidth || 0;
};

onMounted(() => {
  updateViewportWidth();
  window.addEventListener('resize', updateViewportWidth, { passive: true });
  syncObservedGroups();
});

watch(groupedItemKeys, (keys) => {
  const validKeys = new Set(keys);
  visibleGroupKeys.value = new Set([...visibleGroupKeys.value].filter(key => validKeys.has(key)));
  preloadedImageUrls.clear();
  syncObservedGroups();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateViewportWidth);
  visibilityObserver?.disconnect();
  visibilityObserver = null;
  if (preloadFrame) cancelAnimationFrame(preloadFrame);
});
</script>

<style scoped>
.decor-grid-group {
  margin-bottom: 1.6rem;
  content-visibility: auto;
  contain-intrinsic-size: auto var(--decor-group-height, 248px);
  overflow: visible;
}

.decor-grid-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  justify-items: center;
  gap: 14px 10px;
  width: min(100%, 34rem);
  margin-inline: auto;
  padding-inline: 4px;
}

.decor-grid-card {
  min-width: 0;
  width: 100%;
  max-width: 10.25rem;
}

.is-single-specimen-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: start;
  gap: 14px 10px;
  width: min(100%, 34rem);
  margin-inline: auto;
  padding-inline: 4px;
}

.is-single-specimen-grid .decor-grid-group { margin-bottom: 0; min-width: 0; }
.is-single-specimen-grid .decor-grid-row { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0; width: 100%; padding-inline: 0; }
.is-single-specimen-grid .decor-grid-card { width: 100%; min-width: 0; max-width: none; }

.decor-series-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin: 0 4px 0.7rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e6d7;
  color: #577561;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.4;
}

.decor-series-heading small { flex: 0 0 auto; color: #8a987f; font-size: 0.65rem; }

.decor-grid-placeholder {
  border: 1px dashed #dde3d3;
  background: #f5f6ed;
}

.decor-grid-empty { padding: 2.5rem 1rem; text-align: center; border: 1px solid #dde4d5; border-radius: 1rem; background: #fffef7; }
.decor-empty-index { display: inline-block; padding: 0.55rem 0.7rem; margin-bottom: 0.8rem; border: 1px solid #dbe3d1; border-radius: 0.5rem; color: #92a38b; font-size: 1.15rem; font-variant-numeric: tabular-nums; }
.decor-empty-title { color: #294e43; font-size: 1rem; font-weight: 750; }
.decor-empty-description { margin-top: 0.4rem; color: #71816f; font-size: 0.8rem; line-height: 1.6; }
.decor-empty-reset { min-height: 44px; padding: 0.65rem 1.15rem; margin-top: 1.2rem; border-radius: 0.7rem; background: #10b981; color: #fff; font-size: 0.85rem; font-weight: 700; }
.decor-empty-reset:focus-visible { outline: 2px solid #047857; outline-offset: 3px; }

@media (max-width: 360px) {
  .decor-grid-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .is-single-specimen-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (min-width: 640px) {
  .decor-grid-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 0.75rem;
    width: 100%;
    max-width: none;
    padding-inline: 0.5rem;
  }

  .decor-grid-card { width: calc(12.5% - 10.5px); min-width: 100px; max-width: 138px; }
  .is-single-specimen-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 138px)); gap: 12px; width: 100%; padding-inline: 8px; }
}
</style>
