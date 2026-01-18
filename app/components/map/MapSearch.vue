<template>
  <div>
    <!-- 地點搜尋欄 -->
    <div 
      class="absolute top-3 md:top-4 left-16 right-48 md:right-auto md:w-80 transition-all duration-300 z-[1001]"
      :class="panelVisible ? 'md:left-[22rem]' : 'md:left-16'"
    >
      <div class="relative">
        <!-- 搜尋輸入框 -->
        <div class="bg-white rounded-xl shadow-lg border border-gray-200 flex items-center overflow-hidden h-10">
          <div class="pl-3 md:pl-4 text-gray-400">
            <svg v-if="!isSearching" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="animate-spin h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            @input="handleSearchInput"
            @focus="handleSearchFocus"
            @keydown="handleSearchKeydown"
            type="text"
            :placeholder="$t('map.search.placeholder')"
            class="flex-1 px-3 h-full text-sm md:text-base outline-none"
          />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="pr-3 md:pr-4 text-gray-400 hover:text-gray-600 transition-colors"
            :title="$t('map.search.clear')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- 搜尋結果下拉選單 -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div
            v-if="showSearchResults && (searchResults.length > 0 || searchError)"
            class="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-h-80 overflow-y-auto"
          >
            <!-- 錯誤訊息 -->
            <div v-if="searchError" class="p-3 text-sm text-red-600 flex items-center gap-2">
              <span>⚠️</span>
              <span>{{ searchError }}</span>
            </div>

            <!-- 搜尋結果列表 -->
            <div v-else>
              <button
                v-for="(result, index) in searchResults"
                :key="result.place_id"
                @click="selectSearchResult(result)"
                :class="[
                  'w-full text-left px-3 md:px-4 py-2 md:py-3 hover:bg-emerald-50 transition-colors border-b border-gray-100 last:border-b-0',
                  selectedResultIndex === index ? 'bg-emerald-50' : ''
                ]"
              >
                <div class="font-medium text-gray-800 text-sm md:text-base mb-1 line-clamp-1">
                  {{ getLocationName(result.display_name) }}
                </div>
                <div class="text-xs md:text-sm text-gray-500 line-clamp-1">
                  {{ result.display_name }}
                </div>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Top-Center: "Search This Area" Floating Pill -->
    <div class="absolute top-20 left-1/2 -translate-x-1/2 z-[1000]">
      <button
        v-if="!isLoading && canSearchArea && hasSelectedFilters && !isSingleMode"
        @click="$emit('search-area')"
        class="flex items-center h-10 gap-2 px-4 rounded-full shadow-xl bg-white text-emerald-600 font-bold border border-emerald-100 hover:scale-105 active:scale-95 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
        <span>{{ $t('map.search.search_area') }}</span>
      </button>

      <!-- Loading State Pill -->
      <div
        v-else-if="isLoading"
        class="flex items-center h-10 gap-2 px-4 rounded-full shadow-xl bg-white text-emerald-600 font-bold border border-emerald-100"
      >
         <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span>{{ $t('map.search.loading') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGeocoding } from '~/composables/useGeocoding';
import type { GeocodingResult } from '~/types/map';

const props = defineProps<{
  panelVisible: boolean;
  isLoading: boolean;
  canSearchArea: boolean; // zoom >= limit
  hasSelectedFilters: boolean;
  isSingleMode: boolean;
}>();

const emit = defineEmits<{
  (e: 'search-area'): void;
  (e: 'fly-to', lat: number, lon: number): void;
}>();

const { searchLocation, isSearching, searchError } = useGeocoding();

const searchQuery = ref('');
const searchResults = ref<GeocodingResult[]>([]);
const showSearchResults = ref(false);
const selectedResultIndex = ref(-1);
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

const handleSearchInput = () => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    showSearchResults.value = false;
    selectedResultIndex.value = -1;
    return;
  }

  searchDebounceTimer = setTimeout(async () => {
    const results = await searchLocation(searchQuery.value);
    searchResults.value = results;
    showSearchResults.value = true;
    selectedResultIndex.value = -1;
  }, 500);
};

const handleSearchFocus = () => {
  if (searchResults.value.length > 0) {
    showSearchResults.value = true;
  }
};

const handleSearchKeydown = (e: KeyboardEvent) => {
  if (!showSearchResults.value) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedResultIndex.value = Math.min(selectedResultIndex.value + 1, searchResults.value.length - 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedResultIndex.value = Math.max(selectedResultIndex.value - 1, -1);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (selectedResultIndex.value >= 0) {
      selectSearchResult(searchResults.value[selectedResultIndex.value]!);
    } else if (searchResults.value.length > 0) {
      selectSearchResult(searchResults.value[0]!);
    }
  } else if (e.key === 'Escape') {
    showSearchResults.value = false;
    selectedResultIndex.value = -1;
  }
};

const selectSearchResult = (result: GeocodingResult) => {
  const lat = parseFloat(result.lat);
  const lon = parseFloat(result.lon);
  
  emit('fly-to', lat, lon);
  
  showSearchResults.value = false;
  selectedResultIndex.value = -1;
  console.log(`[MapSearch] Navigated to: ${result.display_name}`);
};

const clearSearch = () => {
  searchQuery.value = '';
  searchResults.value = [];
  showSearchResults.value = false;
  selectedResultIndex.value = -1;
};

const getLocationName = (fullName: string): string => {
  return fullName.split(',')[0] || fullName;
};

// Close on click outside
if (typeof window !== 'undefined') {
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.relative')) {
      showSearchResults.value = false;
    }
  };

  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
}
</script>
