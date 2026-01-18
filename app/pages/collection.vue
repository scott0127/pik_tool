<template>
  <div class="space-y-6 pb-8">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
          <span class="text-4xl">📖</span>
          <span class="text-gradient">{{ $t('collection.title') }}</span>
        </h1>
        <p class="text-gray-500 mt-1">{{ $t('collection.subtitle') }}</p>
      </div>
      
      <!-- Quick stats -->
      <div class="flex items-center gap-4 bg-white/60 rounded-2xl px-4 py-2">
        <div class="text-right">
          <p class="text-xs text-gray-500">{{ $t('collection.stats.showing') }}</p>
          <p class="text-lg font-bold text-emerald-600">{{ filteredItems.length }} {{ $t('collection.stats.items') }}</p>
        </div>
        <div class="w-px h-8 bg-gray-200"></div>
        <div class="text-right">
          <p class="text-xs text-gray-500">{{ $t('collection.stats.collected') }}</p>
          <p class="text-lg font-bold text-emerald-600">{{ collectedCount }}</p>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="card space-y-5">
      <!-- Search -->
      <div>
        <label class="text-sm font-semibold text-gray-600 mb-2 block">{{ $t('collection.filters.search_label') }}</label>
        <SearchBar 
          v-model="searchQuery"
          :placeholder="$t('collection.filters.search_placeholder')"
        />
      </div>

      <!-- Category Type Filter -->
      <div>
        <label class="text-sm font-semibold text-gray-600 mb-2 block">{{ $t('collection.filters.category_type') }}</label>
        <CategoryNav 
          :selected="selectedCategoryType"
          @select="selectedCategoryType = $event"
        />
      </div>

      <!-- Pikmin Type Filter -->
      <div>
        <label class="text-sm font-semibold text-gray-600 mb-2 block">{{ $t('collection.filters.pikmin_type') }}</label>
        <PikminFilter 
          :selected="selectedPikminType"
          @select="selectedPikminType = $event"
        />
      </div>

      <!-- Collection Status Filter -->
      <div>
        <label class="text-sm font-semibold text-gray-600 mb-2 block">{{ $t('collection.filters.status') }}</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="filter in collectionFilters"
            :key="filter.value"
            @click="collectionFilter = filter.value"
            class="category-tag"
            :class="[collectionFilter === filter.value ? 'category-tag-active' : 'category-tag-inactive']"
          >
            <span>{{ filter.icon }}</span>
            <span>{{ filter.label }}</span>
          </button>
        </div>
      </div>

      <!-- Active Filters Summary & Clear -->
      <Transition
        enter-active-class="transition duration-200"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div 
          v-if="hasActiveFilters"
          class="flex items-center justify-between bg-emerald-50 rounded-xl p-3"
        >
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm text-emerald-700 font-medium">{{ $t('collection.filters.active_label') }}</span>
            <span v-if="searchQuery" class="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
              🔍 {{ searchQuery }}
              <button @click="searchQuery = ''" class="hover:text-emerald-900">×</button>
            </span>
            <span v-if="selectedCategoryType" class="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
              🎯 {{ getCategoryTypeName(selectedCategoryType) }}
              <button @click="selectedCategoryType = null" class="hover:text-emerald-900">×</button>
            </span>
            <span v-if="selectedPikminType" class="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
              🌈 {{ PIKMIN_TYPE_NAMES[selectedPikminType] }}
              <button @click="selectedPikminType = null" class="hover:text-emerald-900">×</button>
            </span>
            <span v-if="collectionFilter !== 'all'" class="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
              ✅ {{ collectionFilters.find(f => f.value === collectionFilter)?.label }}
              <button @click="collectionFilter = 'all'" class="hover:text-emerald-900">×</button>
            </span>
            <span v-if="isLimitedMode" class="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
              ⚠️ {{ $t('collection.filters.limited') }}
              <button @click="isLimitedMode = false" class="hover:text-amber-900">×</button>
            </span>
            <span v-if="selectedCategoryId" class="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
              📁 {{ getCategoryName(selectedCategoryId) }}
              <button @click="selectedCategoryId = null" class="hover:text-purple-900">×</button>
            </span>
          </div>
          <button 
            @click="clearAllFilters"
            class="text-sm text-emerald-600 hover:text-emerald-800 font-medium whitespace-nowrap"
          >
            {{ $t('collection.filters.clear') }}
          </button>
        </div>
      </Transition>
    </div>

    <!-- Results Section -->
    <div>
      <!-- Category Grouped View (when no filters) -->
      <template v-if="!hasActiveFilters">
        <!-- Regular Categories Section -->
        <div class="mb-12">
          <div class="flex items-center gap-3 mb-4 pb-3 border-b-2 border-emerald-200">
            <span class="text-3xl">📍</span>
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-emerald-700">{{ $t('collection.sections.regular.title') }}</h2>
              <p class="text-sm text-gray-600 mt-1">{{ $t('collection.sections.regular.desc') }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold text-emerald-600">{{ regularCategoriesCount }}{{ $t('collection.sections.count_suffix') }}</p>
            </div>
          </div>
          
          <!-- Info Box -->
          <div class="bg-emerald-50 border-l-4 border-emerald-500 p-4 mb-6 rounded-r-lg">
            <div class="flex items-start gap-3">
              <span class="text-xl">💡</span>
              <div>
                <p class="text-sm font-semibold text-emerald-800 mb-1">{{ $t('collection.info.regular.title') }}</p>
                <p class="text-xs text-emerald-700">{{ $t('collection.info.regular.desc') }}</p>
              </div>
            </div>
          </div>
          
          <div 
            v-for="def in regularCategories" 
            :key="def.category.id"
            class="mb-8"
          >
            <!-- Category Header -->
            <div class="flex items-center gap-3 mb-4 sticky top-[120px] z-10 bg-gradient-to-r from-emerald-50/95 to-teal-50/95 backdrop-blur-sm -mx-4 px-4 py-3 rounded-xl">
              <Icon :name="def.category.icon" class="text-2xl" />
              <div class="flex-1">
                <h2 class="text-lg font-bold text-gray-800">{{ locale === 'en' ? def.category.nameEn : def.category.name }}</h2>
                <p class="text-xs text-gray-500">{{ locale === 'en' ? def.category.name : def.category.nameEn }}</p>
              </div>
              <button
                @click="handleCollectAll(def.category.id, locale === 'en' ? def.category.nameEn : def.category.name)"
                class="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1 shadow-sm hover:shadow"
                :title="$t('collection.actions.collect_all_tooltip')"
              >
                <span>✨</span>
                <span>{{ $t('collection.actions.collect_all') }}</span>
              </button>
              <div class="text-right">
                <p class="text-sm font-bold text-emerald-600">{{ getCategoryProgress(def.category.id) }}</p>
                <p class="text-xs text-gray-400">{{ $t('collection.stats.collected') }}</p>
              </div>
            </div>
            
            <DecorGrid 
              :items="getItemsForCategory(def.category.id)" 
              @clear-filters="clearAllFilters"
            />
          </div>
        </div>

        <!-- Special Categories Section -->
        <div v-if="specialCategories.length > 0" id="special-categories-section">
          <div class="flex items-center gap-3 mb-4 pb-3 border-b-2 border-purple-200">
            <span class="text-3xl">⭐</span>
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-purple-700">{{ $t('collection.sections.special.title') }}</h2>
              <p class="text-sm text-gray-600 mt-1">{{ $t('collection.sections.special.desc') }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold text-purple-600">{{ specialCategoriesCount }}{{ $t('collection.sections.count_suffix') }}</p>
            </div>
          </div>
          
          <!-- Info Box -->
          <div class="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6 rounded-r-lg">
            <div class="flex items-start gap-3">
              <span class="text-xl">✨</span>
              <div>
                <p class="text-sm font-semibold text-purple-800 mb-1">{{ $t('collection.info.special.title') }}</p>
                <p class="text-xs text-purple-700">{{ $t('collection.info.special.desc') }}</p>
              </div>
            </div>
          </div>
          
          <div 
            v-for="def in specialCategories" 
            :key="def.category.id"
            class="mb-8"
          >
            <!-- Category Header -->
            <div class="flex items-center gap-3 mb-4 sticky top-[120px] z-10 bg-gradient-to-r from-purple-50/95 to-pink-50/95 backdrop-blur-sm -mx-4 px-4 py-3 rounded-xl">
              <Icon :name="def.category.icon" class="text-2xl" />
              <div class="flex-1">
                <h2 class="text-lg font-bold text-gray-800">{{ locale === 'en' ? def.category.nameEn : def.category.name }}</h2>
                <p class="text-xs text-gray-500">{{ locale === 'en' ? def.category.name : def.category.nameEn }}</p>
              </div>
              <button
                @click="handleCollectAll(def.category.id, locale === 'en' ? def.category.nameEn : def.category.name)"
                class="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1 shadow-sm hover:shadow"
                :title="$t('collection.actions.collect_all_tooltip')"
              >
                <span>✨</span>
                <span>{{ $t('collection.actions.collect_all') }}</span>
              </button>
              <div class="text-right">
                <p class="text-sm font-bold text-purple-600">{{ getCategoryProgress(def.category.id) }}</p>
                <p class="text-xs text-gray-400">{{ $t('collection.stats.collected') }}</p>
              </div>
            </div>
            
            <DecorGrid 
              :items="getItemsForCategory(def.category.id)" 
              @clear-filters="clearAllFilters"
            />
          </div>
        </div>
      </template>

      <!-- Flat Grid View (when filters active) -->
      <template v-else>
        <DecorGrid 
          :items="filteredItems" 
          @clear-filters="clearAllFilters"
        />
      </template>
    </div>


    <!-- Floating Navigation Buttons -->
    <Transition
      enter-active-class="transition duration-300"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div v-if="showScrollTop || !hasActiveFilters" class="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        <!-- Jump to Special Categories Button -->
        <button
          v-if="!hasActiveFilters && specialCategories.length > 0"
          @click="scrollToSpecialCategories"
          class="w-14 h-14 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group relative"
          :title="$t('collection.scroll.special')"
        >
          <span class="text-2xl">⭐</span>
          <!-- Tooltip -->
          <div class="absolute right-full mr-3 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {{ $t('collection.scroll.special') }}
          </div>
        </button>
        
        <!-- Scroll to Top Button -->
        <button
          v-if="showScrollTop"
          @click="scrollToTop"
          class="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-xl group relative"
          :title="$t('collection.scroll.top')"
        >
          ↑
          <!-- Tooltip -->
          <div class="absolute right-full mr-3 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {{ $t('collection.scroll.top') }}
          </div>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { DECOR_CATEGORY_TYPES, PIKMIN_TYPE_NAMES, type PikminType, type DecorCategoryType, type DecorItem } from '~/types/decor';

const route = useRoute();
const { t, locale } = useI18n();
const { isCollected, collectAllInCategory } = useCollection();
const { getAllDecorItems, getDecorDefinitions, getItemsByCategoryType, searchItems, getItemsByCategory } = useDecorData();

// Filter state
const searchQuery = ref('');
const selectedCategoryType = ref<DecorCategoryType | 'uncollected-regular' | 'anniversary' | null>(null);
const selectedPikminType = ref<PikminType | null>(null);
const collectionFilter = ref<'all' | 'collected' | 'uncollected'>('all');
const showScrollTop = ref(false);


const collectionFilters = computed(() => [
  { value: 'all' as const, label: t('collection.filters.status_all'), icon: '📋' },
  { value: 'collected' as const, label: t('collection.filters.status_collected'), icon: '✅' },
  { value: 'uncollected' as const, label: t('collection.filters.status_uncollected'), icon: '⬜' },
]);

// 取得限定類別 IDs
const limitedCategoryTypes: DecorCategoryType[] = ['regional', 'special'];

// 標記是否為「限定篩選」模式
const isLimitedMode = ref(false);

// 篩選特定類別 ID
const selectedCategoryId = ref<string | null>(null);

// Initialize from query params
onMounted(() => {
  // 處理 type 參數（取得方式）
  if (route.query.type) {
    selectedCategoryType.value = route.query.type as DecorCategoryType;
  }
  
  // 處理 search 參數
  if (route.query.search) {
    searchQuery.value = route.query.search as string;
  }
  
  // 處理 status 參數（蒐集狀態）
  if (route.query.status) {
    const status = route.query.status as string;
    if (status === 'collected' || status === 'uncollected') {
      collectionFilter.value = status;
    }
  }
  
  // 處理 limited 參數（限定飾品模式）
  if (route.query.limited === 'true') {
    isLimitedMode.value = true;
  }
  
  // 處理 category 參數（特定類別）
  if (route.query.category) {
    selectedCategoryId.value = route.query.category as string;
  }
  if (route.query.pikmin) {
    selectedPikminType.value = route.query.pikmin as PikminType;
  }
  
  // Scroll listener
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

const handleScroll = () => {
  showScrollTop.value = window.scrollY > 500;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Scroll to special categories section
const scrollToSpecialCategories = () => {
  const specialSection = document.getElementById('special-categories-section');
  if (specialSection) {
    const offset = 100; // 預留 header 高度
    const elementPosition = specialSection.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedCategoryType.value || selectedPikminType.value || collectionFilter.value !== 'all' || isLimitedMode.value || selectedCategoryId.value;
});

// Separate regular and special categories
const regularCategories = computed(() => {
  return getDecorDefinitions().filter(d => d.category.type === 'regular');
});

const specialCategories = computed(() => {
  return getDecorDefinitions().filter(d => d.category.type !== 'regular');
});

const regularCategoriesCount = computed(() => regularCategories.value.length);
const specialCategoriesCount = computed(() => specialCategories.value.length);

// Filtered items
const filteredItems = computed(() => {
  let items: DecorItem[] = getAllDecorItems();

  // Apply search filter
  if (searchQuery.value) {
    items = searchItems(searchQuery.value);
  }

  // Apply limited mode filter (地區限定 + 活動限定)
  if (isLimitedMode.value) {
    const limitedItems = limitedCategoryTypes.flatMap(type => getItemsByCategoryType(type));
    items = items.filter(item => limitedItems.some(li => li.id === item.id));
  }

  // Apply category type filter
  if (selectedCategoryType.value) {
    // 處理自定義篩選
    if (selectedCategoryType.value === 'uncollected-regular') {
      // 篩選一般分類中尚未收集的
      const regularItems = getItemsByCategoryType('regular');
      items = items.filter(item => 
        regularItems.some(ri => ri.id === item.id) && !isCollected(item.id)
      );
    } else if (selectedCategoryType.value === 'anniversary') {
      // 篩選週年紀念分類
      const anniversaryCategories = [
        'first-anniversary-snack',
        '3rd-anniversary-cupcake',
        '4th-anniversary-flower-box',
        '4th-anniversary-snack'
      ];
      items = items.filter(item => anniversaryCategories.includes(item.categoryId));
    } else {
      // 原有的類型篩選
      const categoryTypeItems = getItemsByCategoryType(selectedCategoryType.value as DecorCategoryType);
      items = items.filter(item => categoryTypeItems.some(ci => ci.id === item.id));
    }
  }

  // Apply specific category filter
  if (selectedCategoryId.value) {
    items = items.filter(item => item.categoryId === selectedCategoryId.value);
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

const collectedCount = computed(() => {
  return filteredItems.value.filter(item => isCollected(item.id)).length;
});

const getItemsForCategory = (categoryId: string): DecorItem[] => {
  return getItemsByCategory(categoryId);
};

const getCategoryProgress = (categoryId: string): string => {
  const items = getItemsByCategory(categoryId);
  const collected = items.filter(item => isCollected(item.id)).length;
  return `${collected}/${items.length}`;
};

const getCategoryTypeName = (typeId: string): string => {
  if (typeId === 'uncollected-regular') return t('collection.types.uncollected_regular');
  if (typeId === 'anniversary') return t('collection.types.anniversary');
  return t(`decor_types.${typeId}`);
};

const getCategoryName = (categoryId: string): string => {
  const definitions = getDecorDefinitions();
  const found = definitions.find(d => d.category.id === categoryId);
  if (!found) return categoryId;
  return locale.value === 'en' ? found.category.nameEn : found.category.name;
};

const clearAllFilters = () => {
  searchQuery.value = '';
  selectedCategoryType.value = null;
  selectedPikminType.value = null;
  collectionFilter.value = 'all';
  isLimitedMode.value = false;
  selectedCategoryId.value = null;
};

// Handle collect all button click with confirmation
const handleCollectAll = (categoryId: string, categoryName: string) => {
  const items = getItemsByCategory(categoryId);
  const uncollectedCount = items.filter(item => !isCollected(item.id)).length;
  
  if (uncollectedCount === 0) {
    alert(t('collection.alerts.collected_all', { category: categoryName }));
    return;
  }
  
  const confirmed = confirm(t('collection.alerts.confirm_collect_all', { category: categoryName, count: items.length, uncollected: uncollectedCount }));
  
  if (confirmed) {
    collectAllInCategory(categoryId);
  }
};
</script>
