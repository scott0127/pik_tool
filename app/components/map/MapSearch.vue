<template>
  <div ref="searchSurface">
    <!-- 地點搜尋欄 -->
    <div 
      class="map-search-wrap absolute z-[1001]"
      :class="{ 'is-panel-visible': panelVisible }"
    >
      <div class="relative">
        <!-- 搜尋輸入框 -->
        <div class="map-search-field flex items-center overflow-hidden">
          <div class="pl-3 md:pl-4 text-gray-400"><span class="map-search-glass">
            <Icon v-if="!isSearching" name="lucide:search" class="h-4 w-4 md:h-[18px] md:w-[18px]" />
            <Icon v-else name="lucide:loader-circle" class="h-4 w-4 animate-spin md:h-[18px] md:w-[18px]" />
          </span></div>
          <input
            v-model="searchQuery"
            @input="handleSearchInput"
            @focus="handleSearchFocus"
            @keydown="handleSearchKeydown"
            type="text"
            :placeholder="$t('map.search.placeholder')"
            :aria-label="$t('map.search.placeholder')"
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
        <Transition :css="false" @enter="enterResults" @leave="leaveResults">
          <div
            v-if="showSearchResults && (searchResults.length > 0 || searchError)"
            class="map-search-results absolute top-full mt-2 w-full overflow-hidden max-h-80 overflow-y-auto"
          >
            <!-- 錯誤訊息 -->
            <div v-if="searchError" class="p-3 text-sm text-red-600 flex items-center gap-2">
              <Icon name="lucide:circle-alert" class="w-4 h-4 shrink-0" />
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
        v-if="canSearchArea && hasSelectedFilters && !isSingleMode"
        @click="$emit('search-area')"
        :disabled="isLoading"
        :aria-busy="isLoading"
        class="map-search-area-button flex items-center gap-2 px-4 font-bold transition-all"
      >
        <span class="map-search-sweep" aria-hidden="true"></span>
        <span class="map-search-area-glyph"><Icon :name="isLoading ? 'lucide:loader-circle' : 'lucide:search'" class="h-4 w-4" :class="{ 'animate-spin': isLoading }" /></span>
        <span class="map-search-area-label">{{ $t(isLoading ? 'map.search.loading' : 'map.search.search_area') }}</span>
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
import { gsap } from 'gsap';
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

const searchSurface = ref<HTMLElement | null>(null);
let searchMotion: gsap.Context | null = null;
let searchSweep: gsap.core.Tween | null = null;
const motionDuration = (duration: number) => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : duration;
onMounted(() => { searchMotion = gsap.context(() => {}, searchSurface.value!); });
const enterResults = (element: Element, done: () => void) => {
  searchMotion?.add(() => {
    gsap.timeline({ onComplete: done })
      .fromTo(element, { y: -8, opacity: 0, scaleY: 0.97, transformOrigin: 'top' }, {
        y: 0, opacity: 1, scaleY: 1, duration: motionDuration(0.3), ease: 'power3.out', clearProps: 'transform,opacity,transformOrigin',
      })
      .fromTo(Array.from(element.querySelectorAll('.map-search-result')).slice(0, 4), { x: -6, opacity: 0 }, {
        x: 0, opacity: 1, duration: motionDuration(0.24), stagger: motionDuration(0.04), ease: 'power2.out', clearProps: 'transform,opacity',
      }, motionDuration(0.08));
  });
};
const leaveResults = (element: Element, done: () => void) => {
  searchMotion?.add(() => gsap.to(element, { y: -5, opacity: 0, duration: motionDuration(0.16), overwrite: true, onComplete: done }));
};
watch(() => props.isLoading, async loading => {
  await nextTick();
  searchSweep?.kill();
  searchSweep = null;
  const sweep = searchSurface.value?.querySelector('.map-search-sweep');
  if (!sweep) return;
  gsap.set(sweep, { scaleX: 0 });
  if (motionDuration(1)) searchMotion?.add(() => {
    gsap.fromTo('.map-search-area-label', { y: loading ? 5 : -5, opacity: 0.6 }, { y: 0, opacity: 1, duration: 0.28, ease: 'power2.out', overwrite: true, clearProps: 'transform,opacity' });
    gsap.fromTo('.map-search-area-glyph', { scale: 0.7, rotation: loading ? -25 : 25 }, { scale: 1, rotation: 0, duration: 0.35, ease: 'back.out(1.6)', overwrite: true, clearProps: 'transform' });
  });
  if (loading && motionDuration(1)) searchMotion?.add(() => {
    searchSweep = gsap.fromTo(sweep, { scaleX: 0.1 }, { scaleX: 1, duration: 1.1, repeat: -1, yoyo: true, ease: 'power1.inOut' });
  });
}, { flush: 'post' });
onUnmounted(() => { searchSweep?.kill(); searchMotion?.revert(); });

const { searchLocation, isSearching, searchError } = useGeocoding();

const searchQuery = ref('');
const searchResults = ref<GeocodingResult[]>([]);
const showSearchResults = ref(false);
const selectedResultIndex = ref(-1);
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

const handleSearchInput = () => {
  lookForPlace();
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
  if (motionDuration(1)) searchMotion?.add(() => {
    gsap.fromTo('.map-search-glass', { rotation: -18, scale: 0.85 }, { rotation: 0, scale: 1, duration: 0.4, ease: 'back.out(1.8)', overwrite: true, clearProps: 'transform' });
  });
  if (searchResults.value.length > 0) {
    showSearchResults.value = true;
  }
};

const lookForPlace = () => {
  const glass = searchSurface.value?.querySelector('.map-search-glass');
  if (!glass || !motionDuration(1)) return;
  gsap.killTweensOf(glass);
  searchMotion?.add(() => gsap.timeline()
    .to(glass, { x: 3, y: -1, rotation: 14, duration: 0.12, ease: 'power2.out' })
    .to(glass, { x: -2, y: 1, rotation: -9, duration: 0.17, ease: 'power1.inOut' })
    .to(glass, { x: 0, y: 0, rotation: 0, duration: 0.25, ease: 'power2.out', clearProps: 'transform' }));
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
<style scoped>
.map-search-wrap { top: 1rem; left: 17rem; right: auto; width: min(24rem, calc(100% - 38rem)); z-index: 1005; }
.map-search-wrap.is-panel-visible { left: 22rem; width: min(24rem, calc(100% - 43rem)); }
.map-search-field, .map-search-results { border-color: #d6dccb; background: #fafaf3; color: #344d3b; box-shadow: 0 3px 0 #c8d0ba, 0 12px 26px rgb(39 58 30 / 13%); }
.map-search-field { height: 48px; border-radius: 0.7rem; }
.map-search-field:focus-within { border-color: var(--map-accent); box-shadow: 0 3px 0 #aebf97, 0 12px 26px rgb(39 58 30 / 13%); }
.map-search-input { color: #344d3b; font-size: 0.86rem; font-weight: 500; }
.map-search-input::placeholder { color: #7a866f; font-weight: 500; }
.map-search-clear { min-width: 44px; height: 44px; }
.map-search-glass, .map-search-area-glyph { display: grid; place-items: center; }
.map-search-area-label { display: inline-block; }
.map-search-results { border-radius: 0.7rem; max-height: min(40dvh, 20rem); }
.map-search-result:hover, .map-search-result:focus-visible, .map-search-result.is-active { background: #e9eedc; }
.map-search-area { top: 5.2rem; }
.map-search-area-button { position: relative; overflow: hidden; height: 44px; border: 1px solid var(--map-action); border-radius: 2rem; background: var(--map-action); color: #fff; box-shadow: 0 3px 0 #b7c29e, 0 10px 22px rgb(37 61 32 / 20%); font-weight: 600; }
.map-search-area-button:hover, .map-search-area-button:focus-visible { background: var(--map-action-hover); border-color: var(--map-action-hover); }
.map-search-area-button:disabled { cursor: progress; }
.map-search-sweep { position: absolute; inset: auto 0 0; height: 3px; background: #d7e7a6; transform: scaleX(0); transform-origin: left; }
.map-search-field:focus-within { outline: 2px solid var(--map-accent); outline-offset: 2px; }
@media (min-width: 768px) and (max-width: 1100px) { .map-search-wrap { width: calc(100% - 18rem); } .map-search-wrap.is-panel-visible { width: calc(100% - 23rem); } .map-search-area { top: 8.6rem; } }
@media (max-width: 767px) {
  .map-search-wrap, .map-search-wrap.is-panel-visible { inset: 0.75rem 0.75rem auto; width: auto; }
  .map-search-input { font-size: 16px; }
  .map-search-area { top: 8rem; left: calc(50% - 1.5rem); }
  .map-search-area-button { font-size: 0.78rem; }
}
</style>
