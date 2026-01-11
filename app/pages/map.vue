<template>
  <ClientOnly>
    <div class="relative h-screen w-full overflow-hidden">
      <!-- 地圖容器 -->
      <div id="map" class="w-full h-full rounded-3xl overflow-hidden shadow-2xl">
        <LMap
          ref="mapRef"
          :zoom="mapZoom"
          :center="mapCenter"
          :use-global-leaflet="false"
          @ready="onMapReady"
          @moveend="onMapMoveEnd"
        >
          <LTileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            :max-zoom="19"
          />
          
          <!-- POI 標記點 -->
          <LMarker
            v-for="poi in fetchedPoints"
            :key="poi.id"
            :lat-lng="[poi.lat, poi.lon]"
          >
            <LIcon :icon-size="[52, 52]" :icon-anchor="[26, 26]" class-name="poi-icon">
              <div class="poi-marker">
                <img 
                  v-if="poi.iconUrl" 
                  :src="poi.iconUrl" 
                  :alt="poi.decorName"
                  class="poi-icon-img"
                />
                <span v-else class="poi-icon-emoji">{{ poi.decorIcon }}</span>
              </div>
            </LIcon>
            <LPopup>
              <div class="text-center min-w-[180px] p-1">
                <img 
                  v-if="poi.iconUrl" 
                  :src="poi.iconUrl" 
                  :alt="poi.decorName"
                  class="w-12 h-12 mx-auto mb-2 object-contain"
                />
                <div v-else class="text-4xl mb-2">{{ poi.decorIcon }}</div>
                <div class="font-bold text-gray-800 text-base mb-1">{{ poi.name }}</div>
                <div class="text-sm text-emerald-600 font-medium mb-2">{{ poi.decorName }}</div>
                <div class="text-xs text-gray-400">
                  📍 {{ poi.lat.toFixed(5) }}, {{ poi.lon.toFixed(5) }}
                </div>
              </div>
            </LPopup>
          </LMarker>
        </LMap>
      </div>

      <!-- 側邊/底部控制面板 (響應式) -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        :enter-from-class="isMobile ? 'opacity-0 translate-y-full' : 'opacity-0 -translate-x-full'"
        :enter-to-class="isMobile ? 'opacity-100 translate-y-0' : 'opacity-100 translate-x-0'"
        leave-active-class="transition duration-200 ease-in"
        :leave-from-class="isMobile ? 'opacity-100 translate-y-0' : 'opacity-100 translate-x-0'"
        :leave-to-class="isMobile ? 'opacity-0 translate-y-full' : 'opacity-0 -translate-x-full'"
      >
        <div
          v-if="showPanel"
          :class="[
            'absolute bg-white shadow-2xl overflow-hidden flex flex-col z-[1000] border border-gray-200',
            isMobile 
              ? 'left-0 right-0 bottom-0 max-h-[60vh] rounded-t-3xl' 
              : 'top-4 left-4 bottom-4 w-80 rounded-2xl'
          ]"
        >
          <!-- 標題列 -->
          <div class="p-3 md:p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
            <!-- 手機拖動指示條 -->
            <div v-if="isMobile" class="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full"></div>
            
            <div class="flex items-center gap-2 md:gap-3">
              <span class="text-xl md:text-2xl">🗺️</span>
              <div>
                <h2 class="font-bold text-gray-800 text-sm md:text-base">飾品地點篩選</h2>
                <p class="text-xs text-gray-500 hidden md:block">選擇要顯示的飾品類型</p>
              </div>
            </div>
            <button
              @click="showPanel = false"
              class="p-2 hover:bg-white/50 rounded-lg transition-colors"
              :title="isMobile ? '關閉' : '隱藏面板'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path v-if="isMobile" fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                <path v-else fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- 統計資訊 -->
          <div class="p-3 md:p-4 bg-gray-50 border-b border-gray-200">
            <div class="flex items-center justify-between text-xs md:text-sm">
              <div>
                <span class="text-gray-600">已選擇</span>
                <span class="font-bold text-emerald-600 ml-1">{{ selectedFilters.length }}</span>
                <span class="text-gray-400">/ {{ decorRules.length }}</span>
              </div>
              <div>
                <span class="text-gray-600">找到</span>
                <span class="font-bold text-teal-600 ml-1">{{ fetchedPoints.length }}</span>
                <span class="text-gray-400">個地點</span>
              </div>
            </div>
            <div class="mt-2 flex gap-2">
              <button
                @click="selectAll"
                class="flex-1 px-3 py-2 bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 text-emerald-700 rounded-lg text-xs font-medium transition-colors"
              >
                全選
              </button>
              <button
                @click="clearAll"
                class="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 rounded-lg text-xs font-medium transition-colors"
              >
                清除
              </button>
            </div>
          </div>

          <!-- 篩選列表 - 手機使用網格佈局 -->
          <div 
            :class="[
              'flex-1 overflow-y-auto p-2 md:p-4 bg-white',
              isMobile ? 'grid grid-cols-3 gap-1 content-start' : 'space-y-1'
            ]"
          >
            <label
              v-for="rule in decorRules"
              :key="rule.id"
              :class="[
                'flex items-center cursor-pointer transition-all',
                isMobile 
                  ? 'flex-col gap-1 p-2 rounded-xl text-center'
                  : 'gap-3 p-3 rounded-xl hover:bg-gray-100 group',
                selectedFilters.includes(rule.id) 
                  ? 'bg-emerald-50 border border-emerald-200' 
                  : isMobile ? 'bg-gray-50' : ''
              ]"
            >
              <input
                type="checkbox"
                :value="rule.id"
                v-model="selectedFilters"
                :class="[
                  'rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0',
                  isMobile ? 'w-3 h-3 absolute opacity-0' : 'w-4 h-4'
                ]"
              />
              <span :class="isMobile ? 'text-2xl' : 'text-2xl group-hover:scale-110 transition-transform'">{{ rule.icon }}</span>
              <span :class="isMobile ? 'text-[10px] leading-tight text-gray-600 line-clamp-2' : 'text-sm font-medium text-gray-700 flex-1'">
                {{ isMobile ? rule.name.split('/')[0].replace(/\(.*\)/, '').trim() : rule.name }}
              </span>
              <span v-if="!isMobile" class="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {{ getCountForRule(rule.id) }}
              </span>
            </label>
          </div>

          <!-- 載入狀態指示器 -->
          <div
            v-if="isLoading"
            class="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center"
          >
            <div class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span class="text-sm font-medium">查詢中...</span>
            </div>
          </div>

          <!-- 錯誤訊息 -->
          <div
            v-if="error"
            class="p-3 bg-red-50 border-t border-red-200 text-red-600 text-sm"
          >
            <div class="flex items-start gap-2">
              <span>⚠️</span>
              <span>{{ error }}</span>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 展開按鈕（當面板隱藏時顯示） -->
      <button
        v-if="!showPanel"
        @click="showPanel = true"
        class="absolute top-3 md:top-4 left-3 md:left-4 bg-white rounded-xl p-2.5 md:p-3 shadow-lg hover:shadow-xl active:scale-95 transition-all z-[1000] border border-gray-200"
        title="顯示篩選面板"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" />
        </svg>
      </button>

      <!-- 返回主頁按鈕 -->
      <NuxtLink
        to="/"
        class="absolute top-3 md:top-4 right-3 md:right-4 bg-white rounded-xl p-2.5 md:p-3 shadow-lg hover:shadow-xl active:scale-95 transition-all z-[1000] border border-gray-200"
        title="返回首頁"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      </NuxtLink>

      <!-- 縮放等級 + 搜尋按鈕 (合併在一起) -->
      <div class="absolute top-3 md:top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-[1000]">
        <!-- 縮放等級指示器 -->
        <div class="bg-white rounded-xl px-2.5 md:px-3 py-1.5 md:py-2 shadow-lg border border-gray-200">
          <div class="flex items-center gap-1.5 md:gap-2">
            <span class="text-[10px] md:text-xs text-gray-500">Lv.</span>
            <span 
              class="font-bold text-sm md:text-base"
              :class="canSearch ? 'text-emerald-600' : 'text-orange-500'"
            >
              {{ mapZoom }}
            </span>
            <span 
              class="text-[10px] md:text-xs px-1.5 py-0.5 rounded-full"
              :class="canSearch ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-500'"
            >
              {{ canSearch ? '可搜尋' : `需≥${MIN_ZOOM_FOR_QUERY}` }}
            </span>
          </div>
        </div>

        <!-- 搜尋按鈕 -->
        <button
          v-if="!isLoading"
          @click="handleSearch"
          :disabled="!canSearch || selectedFilters.length === 0"
          class="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl shadow-lg transition-all duration-200 text-sm"
          :class="canSearch && selectedFilters.length > 0
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-white cursor-pointer'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
          <span class="font-medium hidden md:inline">
            {{ !canSearch ? '放大地圖' : selectedFilters.length === 0 ? '選擇類型' : '搜尋此區域' }}
          </span>
          <span class="font-medium md:hidden">
            {{ !canSearch ? '放大' : selectedFilters.length === 0 ? '選類型' : '搜尋' }}
          </span>
        </button>

        <!-- 載入中狀態 -->
        <div
          v-else
          class="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg text-white text-sm"
        >
          <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span class="font-medium">搜尋中...</span>
        </div>
      </div>

      <!-- 搜尋結果提示 -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div 
          v-if="showSearchResult"
          class="absolute top-16 md:top-20 left-1/2 -translate-x-1/2 bg-white rounded-xl px-4 py-2 shadow-lg z-[1000] border border-emerald-200"
        >
          <span class="text-sm text-emerald-600 font-medium">
            🎉 找到 {{ fetchedPoints.length }} 個飾品地點！
          </span>
        </div>
      </Transition>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { LMap, LTileLayer, LMarker, LPopup, LIcon } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapBounds, POIPoint } from '~/types/map';
import { useDecorRules } from '~/composables/useDecorRules';
import { useOverpassAPI } from '~/composables/useOverpassAPI';

// Composables
const { decorRules } = useDecorRules();
const { fetchPOIs, isLoading, error } = useOverpassAPI();

// 響應式視窗寬度
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);
const isMobile = computed(() => windowWidth.value < 768);

// 監聯視窗大小變化
const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth);
});

// 地圖設定 - 預設台北車站，縮放層級 14 (街道層級，比較容易查詢到結果)
const mapCenter = ref<[number, number]>([25.0478, 121.5170]); // 台北車站
const mapZoom = ref(14);
const mapRef = ref();
const MIN_ZOOM_FOR_QUERY = 12; // 最小查詢縮放層級

// ⚠️ 重要：使用 shallowRef 避免 Vue 對 Leaflet 物件進行深層響應式監聯
// 這是 Vue + Leaflet 效能優化的關鍵！
let leafletMap: any = null; // 不使用 ref，直接用普通變數

// 狀態管理
const showPanel = ref(true);
const selectedFilters = ref<string[]>(decorRules.map(r => r.id)); // 預設全選


// ⚠️ 使用 shallowRef 來儲存 POI 點位，避免 Vue 對每個點位物件進行深層監聽
const fetchedPoints = shallowRef<POIPoint[]>([]);

// 使用普通物件儲存邊界，不需要響應式
let currentBounds: MapBounds | null = null;

// SEO
useHead({
  title: '飾品地點地圖 - Pikmin Bloom 飾品圖鑑',
  meta: [
    { name: 'description', content: '互動式地圖顯示 Pikmin Bloom 飾品皮克敏的潛在生成點，幫助你找到想要的飾品！' }
  ]
});

// 計算每個規則的數量
const getCountForRule = (ruleId: string) => {
  return fetchedPoints.value.filter(p => p.decorType === ruleId).length;
};

// 地圖準備完成
const onMapReady = (map: any) => {
  // 不使用 ref 儲存 Leaflet 地圖實例！
  leafletMap = map;
  // 只更新邊界，不自動查詢
  updateMapBounds();
};

// 地圖移動結束 - 只更新邊界，不自動查詢
const onMapMoveEnd = () => {
  updateMapBounds();
};

// 更新地圖邊界和縮放層級
const updateMapBounds = () => {
  if (!leafletMap) return;
  
  // 同步縮放層級
  mapZoom.value = leafletMap.getZoom();
  
  const bounds = leafletMap.getBounds();
  // 使用普通物件，不需要響應式
  currentBounds = {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
  };
};

// 是否可以搜尋
const canSearch = computed(() => mapZoom.value >= MIN_ZOOM_FOR_QUERY);

// 搜尋結果提示
const showSearchResult = ref(false);
let searchResultTimer: ReturnType<typeof setTimeout> | null = null;

// 手動搜尋
const handleSearch = async () => {
  if (!currentBounds) {
    console.log('[Map] No bounds yet');
    return;
  }
  
  if (!canSearch.value) {
    console.log(`[Map] Zoom level ${mapZoom.value} is too low, need at least ${MIN_ZOOM_FOR_QUERY}`);
    return;
  }
  
  if (selectedFilters.value.length === 0) {
    return;
  }

  console.log('[Map] Searching POIs...', { bounds: currentBounds, filters: selectedFilters.value.length });
  
  const selectedRules = decorRules.filter(r => selectedFilters.value.includes(r.id));
  const points = await fetchPOIs(currentBounds, selectedRules);
  
  console.log('[Map] Received', points.length, 'points');
  
  // 使用 shallowRef，直接賦值整個陣列來觸發更新
  fetchedPoints.value = Object.freeze(points) as POIPoint[];
  
  // 顯示搜尋結果提示
  showSearchResult.value = true;
  if (searchResultTimer) clearTimeout(searchResultTimer);
  searchResultTimer = setTimeout(() => {
    showSearchResult.value = false;
  }, 3000);
};

// 全選
const selectAll = () => {
  selectedFilters.value = decorRules.map(r => r.id);
};

// 清除全部
const clearAll = () => {
  selectedFilters.value = [];
};

// 清理
onUnmounted(() => {
  if (searchResultTimer) {
    clearTimeout(searchResultTimer);
  }
  window.removeEventListener('resize', updateWindowWidth);
  leafletMap = null;
});
</script>

<style scoped>
.poi-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(16, 185, 129, 0.5);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.poi-marker:hover {
  transform: scale(1.25);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4), 0 0 0 4px rgba(16, 185, 129, 0.7);
  z-index: 1000 !important;
}

.poi-icon-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.poi-icon-emoji {
  font-size: 28px;
  line-height: 1;
}

/* 自訂捲軸樣式 */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(16, 185, 129, 0.3) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(16, 185, 129, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(16, 185, 129, 0.5);
}
</style>
