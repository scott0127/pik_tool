<template>
  <div>
    <!-- Grouped by Variant -->
    <div 
      v-for="(group, groupIndex) in groupedItems" 
      :key="group.key"
      class="mb-6"
    >
      <!-- Pikmin Row for this Variant -->
      <div class="flex flex-wrap gap-3">
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
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mx-auto">
            🔍
          </div>
        </div>
        <p class="text-xl font-bold text-gray-700 mb-2">找不到符合條件的飾品</p>
        <p class="text-gray-500 mb-6">請嘗試調整篩選條件或搜尋關鍵字</p>
        <button 
          @click="$emit('clear-filters')"
          class="btn-secondary"
        >
          清除所有篩選
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
</script>
