<template>
  <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
    <DecorCard
      v-for="item in items"
      :key="item.id"
      :item-id="item.id"
      :category-id="item.categoryId"
      :variant-id="item.variantId"
      :pikmin-type="item.pikminType"
      @toggle="$emit('toggle', $event)"
    />
    
    <!-- Empty State -->
    <div 
      v-if="items.length === 0" 
      class="col-span-full py-12 text-center text-gray-500"
    >
      <p class="text-4xl mb-2">🔍</p>
      <p class="text-lg font-medium">找不到符合條件的飾品</p>
      <p class="text-sm">請嘗試調整篩選條件</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DecorItem } from '~/types/decor';

defineProps<{
  items: DecorItem[];
}>();

defineEmits<{
  toggle: [itemId: string];
}>();
</script>
