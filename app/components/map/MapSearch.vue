<template>
  <div>
    <!-- 地點搜尋欄 -->
    <div 
      class="map-search-wrap absolute z-[1001]"
      :class="{ 'is-panel-visible': panelVisible }"
    >
      <div class="relative">
        <!-- 搜尋輸入框 -->
        <div class="map-search-field flex items-center overflow-hidden">
          <div class="pl-3 md:pl-4 text-gray-400">
            <Icon v-if="!isSearching" name="lucide:search" class="h-4 w-4 md:h-[18px] md:w-[18px]" />
            <Icon v-else name="lucide:loader-circle" class="h-4 w-4 animate-spin md:h-[18px] md:w-[18px]" />
          </div>
          <input
            v-model="searchQuery"
            @input="handleSearchInput"
            @focus="handleSearchFocus"
            @keydown="handleSearchKeydown"
            type="text"
            :placeholder="$t('map.search.placeholder')"
            class="map-search-input flex-1 px-3 h-full outline-none"
          />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="map-search-clear mr-1.5 flex h-8 w-8 items-center justify-center text-gray-400 transition-colors"
            :title="$t('map.search.clear')"
          >
            <Icon name="lucide:x" class="h-4 w-4" />
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
            class="map-search-results absolute top-full mt-2 w-full overflow-hidden max-h-80 overflow-y-auto"
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
                  'map-search-result w-full text-left px-3 md:px-4 py-2 md:py-3 transition-colors border-b border-gray-100 last:border-b-0',
                  selectedResultIndex === index ? 'is-active' : ''
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
    <div class="map-search-area absolute left-1/2 -translate-x-1/2 z-[1000]">
      <button
        v-if="!isLoading && canSearchArea && hasSelectedFilters && !isSingleMode"
        @click="$emit('search-area')"
        class="map-search-area-button flex items-center gap-2 px-4 font-bold transition-all"
      >
        <Icon name="lucide:search" class="h-4 w-4" />
        <span>{{ $t('map.search.search_area') }}</span>
      </button>

      <!-- Loading State Pill -->
      <div
        v-else-if="isLoading"
        class="map-search-area-button flex items-center gap-2 px-4 font-bold"
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
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = null;
    }
    document.removeEventListener('click', handleClickOutside);
  });
}
</script>

<style scoped>
.map-search-wrap {
  top: 0.75rem;
  right: 12.15rem;
  left: 4rem;
  transition:
    left 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
    width 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.map-search-field,
.map-search-results,
.map-search-area-button {
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(255, 255, 255, 0.94);
  box-shadow:
    0 8px 22px rgba(15, 23, 42, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.map-search-field {
  height: 2.75rem;
  border-radius: 0.78rem;
}

.map-search-field:focus-within {
  border-color: rgba(13, 148, 136, 0.5);
  box-shadow:
    0 9px 24px rgba(15, 118, 110, 0.12),
    0 0 0 3px rgba(20, 184, 166, 0.12);
}

.map-search-input {
  min-width: 0;
  background: transparent;
  color: rgb(30 41 59);
  font-size: 0.86rem;
  font-weight: 650;
}

.map-search-input::placeholder {
  color: rgb(148 163 184);
  font-weight: 600;
}

.map-search-clear {
  flex: 0 0 auto;
  border-radius: 0.55rem;
}

.map-search-clear:hover,
.map-search-clear:focus-visible {
  background: rgb(241 245 249);
  color: rgb(15 118 110);
  outline: none;
}

.map-search-results {
  border-radius: 0.78rem;
}

.map-search-result {
  line-height: 1.35;
}

.map-search-result:hover,
.map-search-result:focus-visible,
.map-search-result.is-active {
  background: rgb(240 253 250);
  outline: none;
}

.map-search-area {
  top: 4.75rem;
}

.map-search-area-button {
  height: 2.55rem;
  border-color: rgba(20, 184, 166, 0.28);
  border-radius: 0.74rem;
  color: rgb(15 118 110);
  font-size: 0.82rem;
  white-space: nowrap;
}

.map-search-area-button:hover,
.map-search-area-button:focus-visible {
  border-color: rgba(13, 148, 136, 0.48);
  background: rgb(240 253 250);
  outline: none;
}

.map-search-area-button:active {
  transform: scale(0.97);
}

@media (min-width: 768px) {
  .map-search-wrap {
    right: auto;
    left: 4rem;
    width: 20rem;
  }

  .map-search-wrap.is-panel-visible {
    left: 22rem;
  }
}

@media (max-width: 767px) {
  .map-search-wrap {
    top: 0.7rem;
    right: 12.1rem;
    left: 4rem;
  }

  .map-search-field {
    height: 2.65rem;
  }

  .map-search-input {
    padding-inline: 0.65rem;
    font-size: 0.78rem;
  }

  .map-search-area {
    top: 4.65rem;
  }

  .map-search-area-button {
    height: 2.45rem;
    padding-inline: 0.85rem;
    font-size: 0.78rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .map-search-wrap,
  .map-search-area-button {
    transition-duration: 0.01ms;
  }
}
</style>
