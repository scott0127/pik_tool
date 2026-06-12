<template>
  <div ref="gridRoot">
    <!-- Grouped by Variant -->
    <div 
      v-for="(group, groupIndex) in groupedItems" 
      :key="group.key"
      class="mb-6 decor-grid-group"
      :data-group-key="group.key"
      :data-group-index="groupIndex"
    >
      <!-- Pikmin Row for this Variant -->
        <div
          v-if="isGroupVisible(group.key)"
          class="decor-grid-row overflow-visible"
        >
          <DecorCard
            v-for="(item, index) in group.items"
            :key="item.id"
          :item-id="item.id"
          :category-id="item.categoryId"
          :variant-id="item.variantId"
          :pikmin-type="item.pikminType"
          :animation-delay="Math.min(groupIndex * 86 + index * 52, 680)"
            class="decor-grid-card w-full sm:w-[calc(12.5%-0.72rem)] sm:min-w-[100px] sm:max-w-[138px]"
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
        class="card text-center py-16 mt-4"
      >
        <div class="inline-block mb-4">
          <div class="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Icon name="lucide:search-x" class="w-9 h-9 text-gray-300" />
          </div>
        </div>
        <p class="text-xl font-bold text-gray-700 mb-2">{{ $t('components.decor_grid.empty_title') }}</p>
        <p class="text-gray-500 mb-6">{{ $t('components.decor_grid.empty_desc') }}</p>
        <button 
          @click="$emit('clear-filters')"
          class="btn-secondary"
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
const gridRoot = ref<HTMLElement | null>(null);
const visibleGroupKeys = ref<Set<string>>(new Set());
const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);
let visibilityObserver: IntersectionObserver | null = null;
let preloadFrame: number | null = null;
const preloadedImageUrls = new Set<string>();

// Group items by categoryId + variantId
const groupedItems = computed(() => {
  const groups = new Map<string, { 
    key: string; 
    variantName: string;
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
        isRare: item.variantId.toLowerCase().includes('rare'),
        items: [] 
      });
    }
    groups.get(key)!.items.push(item);
  });
  
  return Array.from(groups.values());
});

const isGroupVisible = (key: string) => visibleGroupKeys.value.has(key);

const preloadGroupImages = (groupKeys: string[]) => {
  if (typeof window === 'undefined') return;

  groupKeys.forEach((key) => {
    const group = groupedItems.value.find(itemGroup => itemGroup.key === key);
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
  const index = groupedItems.value.findIndex(group => group.key === key);
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
  const gap = 12;
  
  if (isMobileLayout) {
    // Mobile is always 3 columns grid
    const availableWidth = Math.min(viewportWidth.value - 24, 544);
    const cardWidth = (availableWidth - gap * 2) / 3;
    const rows = Math.ceil(itemCount / 3);
    const cardHeight = cardWidth + 58;
    const rowGap = 16; // 1rem in CSS
    return `${Math.ceil(rows * cardHeight + Math.max(0, rows - 1) * rowGap)}px`;
  } else {
    // Desktop flex layout
    const availableWidth = Math.min(Math.max(viewportWidth.value - 32, 320), 1280);
    const cardWidth = Math.min(Math.max((availableWidth - gap * 7) / 8, 100), 140);
    const cardsPerRow = Math.max(1, Math.floor((availableWidth + gap) / (cardWidth + gap)));
    const rows = Math.max(1, Math.ceil(itemCount / Math.min(cardsPerRow, 8)));
    return `${Math.ceil(rows * (cardWidth + 58) + Math.max(0, rows - 1) * gap)}px`;
  }
};

const syncObservedGroups = async () => {
  await nextTick();
  const root = gridRoot.value;
  if (!root) return;

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

  // Pre-warm the first few groups when mounting to prevent visible placeholders in viewport
  const next = new Set(visibleGroupKeys.value);
  groupedItems.value.slice(0, viewportWidth.value < 640 ? 4 : 3).forEach(group => {
    next.add(group.key);
  });
  visibleGroupKeys.value = next;
  scheduleImagePreload([...next]);

  root.querySelectorAll<HTMLElement>('[data-group-key]').forEach((el) => {
    visibilityObserver?.observe(el);
  });
};

const updateViewportWidth = () => {
  viewportWidth.value = window.innerWidth;
};

onMounted(() => {
  updateViewportWidth();
  window.addEventListener('resize', updateViewportWidth, { passive: true });
  syncObservedGroups();
});

watch(() => groupedItems.value.map(group => group.key).join('|'), () => {
  const validKeys = new Set(groupedItems.value.map(group => group.key));
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
  content-visibility: auto;
  contain-intrinsic-size: auto 198px;
  overflow: visible;
}

.decor-grid-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  justify-items: center;
  gap: 1rem 0.85rem;
  width: min(100%, 34rem);
  margin-inline: auto;
  padding-inline: 0.35rem;
}

.decor-grid-card {
  min-width: 0;
  max-width: 10.25rem;
}

.decor-grid-placeholder {
  border: 1px solid rgba(255, 255, 255, 0.46);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.12)),
    rgba(255, 255, 255, 0.08);
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
}
</style>
