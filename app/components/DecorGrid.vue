<template>
  <div ref="gridRoot">
    <!-- Grouped by Variant -->
    <div 
      v-for="(group, groupIndex) in groupedItems" 
      :key="group.key"
      class="mb-6 decor-grid-group"
      :data-group-key="group.key"
    >
      <!-- Pikmin Row for this Variant -->
      <div
        v-if="isGroupVisible(group.key)"
        class="flex flex-wrap gap-3"
      >
        <DecorCard
          v-for="(item, index) in group.items"
          :key="item.id"
          :item-id="item.id"
          :category-id="item.categoryId"
          :variant-id="item.variantId"
          :pikmin-type="item.pikminType"
          :animation-delay="Math.min((groupIndex * 8 + index) * 30, 300)"
          class="w-[calc(12.5%-0.656rem)] min-w-[100px] max-w-[140px]"
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

const { getVariant } = useDecorData();
const gridRoot = ref<HTMLElement | null>(null);
const visibleGroupKeys = ref<Set<string>>(new Set());
const viewportWidth = ref(1024);
let visibilityObserver: IntersectionObserver | null = null;

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

const setGroupVisibility = (key: string, isVisible: boolean) => {
  const next = new Set(visibleGroupKeys.value);
  if (isVisible) {
    next.add(key);
  } else {
    next.delete(key);
  }
  visibleGroupKeys.value = next;
};

const getGroupPlaceholderHeight = (itemCount: number) => {
  const availableWidth = Math.min(Math.max(viewportWidth.value - 32, 320), 1280);
  const gap = 12;
  const cardWidth = Math.min(Math.max((availableWidth - gap * 7) / 8, 100), 140);
  const cardsPerRow = Math.max(1, Math.floor((availableWidth + gap) / (cardWidth + gap)));
  const rows = Math.max(1, Math.ceil(itemCount / Math.min(cardsPerRow, 8)));
  return `${Math.ceil(rows * (cardWidth + 58) + Math.max(0, rows - 1) * gap)}px`;
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
      rootMargin: '900px 0px',
      threshold: 0,
    });
  }

  visibilityObserver.disconnect();
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
  syncObservedGroups();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateViewportWidth);
  visibilityObserver?.disconnect();
  visibilityObserver = null;
});
</script>

<style scoped>
.decor-grid-group {
  content-visibility: auto;
  contain-intrinsic-size: auto 198px;
}

.decor-grid-placeholder {
  border: 1px solid rgba(255, 255, 255, 0.46);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.12)),
    rgba(255, 255, 255, 0.08);
}
</style>
