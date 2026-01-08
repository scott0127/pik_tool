<template>
  <div>
    <!-- Grid -->
    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      <DecorCard
        v-for="(item, index) in items"
        :key="item.id"
        :item-id="item.id"
        :category-id="item.categoryId"
        :variant-id="item.variantId"
        :pikmin-type="item.pikminType"
        :animation-delay="Math.min(index * 30, 300)"
        @toggle="$emit('toggle', $event)"
      />
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

defineProps<{
  items: DecorItem[];
}>();

defineEmits<{
  toggle: [itemId: string];
  'clear-filters': [];
}>();
</script>
