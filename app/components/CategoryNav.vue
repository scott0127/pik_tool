<template>
  <div class="overflow-x-auto scrollbar-hide -mx-4 px-4">
    <div class="flex gap-2 pb-2">
      <!-- All Categories -->
      <button
        @click="$emit('select', null)"
        class="category-tag"
        :class="[selected === null ? 'category-tag-active' : 'category-tag-inactive']"
      >
        <span class="mr-1">📋</span>
        全部
      </button>

      <!-- Category Type Filters -->
      <button
        v-for="type in DECOR_CATEGORY_TYPES"
        :key="type.id"
        @click="$emit('select', type.id)"
        class="category-tag"
        :class="[selected === type.id ? 'category-tag-active' : 'category-tag-inactive']"
      >
        <span class="mr-1">{{ type.icon }}</span>
        {{ type.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DECOR_CATEGORY_TYPES, type DecorCategoryType } from '~/types/decor';

defineProps<{
  selected: DecorCategoryType | null;
}>();

defineEmits<{
  select: [type: DecorCategoryType | null];
}>();
</script>
