<template>
  <div class="space-y-6">
    <!-- Page Title -->
    <div>
      <h1 class="text-2xl font-bold text-gray-800">📖 飾品圖鑑</h1>
      <p class="text-gray-600">點擊飾品來標記蒐集狀態</p>
    </div>

    <!-- Filters Section -->
    <div class="card space-y-4">
      <!-- Search -->
      <SearchBar 
        v-model="searchQuery"
        placeholder="搜尋飾品名稱..."
      />

      <!-- Category Type Filter -->
      <div>
        <p class="text-sm text-gray-600 mb-2">飾品分類</p>
        <CategoryNav 
          :selected="selectedCategoryType"
          @select="selectedCategoryType = $event"
        />
      </div>

      <!-- Pikmin Type Filter -->
      <div>
        <p class="text-sm text-gray-600 mb-2">皮克敏類型</p>
        <PikminFilter 
          :selected="selectedPikminType"
          @select="selectedPikminType = $event"
        />
      </div>

      <!-- Collection Status Filter -->
      <div class="flex flex-wrap gap-2">
        <button
          @click="collectionFilter = 'all'"
          class="category-tag"
          :class="[collectionFilter === 'all' ? 'category-tag-active' : 'category-tag-inactive']"
        >
          全部
        </button>
        <button
          @click="collectionFilter = 'collected'"
          class="category-tag"
          :class="[collectionFilter === 'collected' ? 'category-tag-active' : 'category-tag-inactive']"
        >
          ✅ 已蒐集
        </button>
        <button
          @click="collectionFilter = 'uncollected'"
          class="category-tag"
          :class="[collectionFilter === 'uncollected' ? 'category-tag-active' : 'category-tag-inactive']"
        >
          ⬜ 未蒐集
        </button>
      </div>

      <!-- Current Filter Stats -->
      <div class="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-3">
        <span class="text-gray-600">符合條件的飾品</span>
        <span class="font-medium text-primary-600">{{ filteredItems.length }} 件</span>
      </div>
    </div>

    <!-- Category Sections -->
    <div v-if="!searchQuery && !selectedPikminType && !selectedCategoryType && collectionFilter === 'all'">
      <!-- Show grouped by category when no filters -->
      <div 
        v-for="def in getDecorDefinitions()" 
        :key="def.category.id"
        class="space-y-4"
      >
        <div class="flex items-center gap-2 mt-6 mb-3">
          <span class="text-xl">{{ def.category.icon }}</span>
          <h2 class="text-lg font-bold text-gray-800">{{ def.category.name }}</h2>
          <span class="text-sm text-gray-500">({{ def.category.nameEn }})</span>
          <span class="ml-auto text-sm text-gray-500">
            {{ getCategoryProgress(def.category.id) }}
          </span>
        </div>
        <DecorGrid :items="getItemsForCategory(def.category.id)" />
      </div>
    </div>
    <div v-else>
      <!-- Show flat grid when filters are applied -->
      <DecorGrid :items="filteredItems" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PikminType, DecorCategoryType, DecorItem } from '~/types/decor';

const route = useRoute();

const { isCollected } = useCollection();
const { getAllDecorItems, getDecorDefinitions, getItemsByCategoryType, getItemsByPikminType, searchItems, getItemsByCategory } = useDecorData();

// Filter state
const searchQuery = ref('');
const selectedCategoryType = ref<DecorCategoryType | null>(null);
const selectedPikminType = ref<PikminType | null>(null);
const collectionFilter = ref<'all' | 'collected' | 'uncollected'>('all');

// Initialize from query params
onMounted(() => {
  if (route.query.type) {
    selectedCategoryType.value = route.query.type as DecorCategoryType;
  }
});

// Filtered items
const filteredItems = computed(() => {
  let items: DecorItem[] = getAllDecorItems();

  // Apply search filter
  if (searchQuery.value) {
    items = searchItems(searchQuery.value);
  }

  // Apply category type filter
  if (selectedCategoryType.value) {
    const categoryTypeItems = getItemsByCategoryType(selectedCategoryType.value);
    items = items.filter(item => categoryTypeItems.some(ci => ci.id === item.id));
  }

  // Apply Pikmin type filter
  if (selectedPikminType.value) {
    items = items.filter(item => item.pikminType === selectedPikminType.value);
  }

  // Apply collection status filter
  if (collectionFilter.value === 'collected') {
    items = items.filter(item => isCollected(item.id));
  } else if (collectionFilter.value === 'uncollected') {
    items = items.filter(item => !isCollected(item.id));
  }

  return items;
});

const getItemsForCategory = (categoryId: string): DecorItem[] => {
  return getItemsByCategory(categoryId);
};

const getCategoryProgress = (categoryId: string): string => {
  const items = getItemsByCategory(categoryId);
  const collected = items.filter(item => isCollected(item.id)).length;
  return `${collected}/${items.length}`;
};
</script>
