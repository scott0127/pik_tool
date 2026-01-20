<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    :enter-from-class="isMobile ? 'opacity-0 translate-y-full' : 'opacity-0 -translate-x-full'"
    :enter-to-class="isMobile ? 'opacity-100 translate-y-0' : 'opacity-100 translate-x-0'"
    leave-active-class="transition duration-200 ease-in"
    :leave-from-class="isMobile ? 'opacity-100 translate-y-0' : 'opacity-100 translate-x-0'"
    :leave-to-class="isMobile ? 'opacity-0 translate-y-full' : 'opacity-0 -translate-x-full'"
  >
    <div
      v-if="internalShowPanel"
      :class="[
        'absolute bg-white shadow-2xl overflow-hidden flex flex-col z-[1000] border border-gray-200',
        isMobile 
          ? 'left-0 right-0 bottom-0 max-h-[60vh] rounded-t-3xl' 
          : 'top-4 left-4 bottom-4 w-72 rounded-2xl'
      ]"
    >
      <!-- 標題列 -->
      <div 
        class="relative p-3 md:p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-fuchsia-50 touch-none"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- 手機拖動指示條 -->
        <div 
          v-if="isMobile"
          class="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-300/50 rounded-full"
        ></div>
        
        <div class="flex items-center gap-2 md:gap-3 mt-1 md:mt-0">
          <div>
            <h2 class="font-bold text-gray-800 text-sm md:text-base">純種模式</h2>
            <p class="text-xs text-gray-500 hidden md:block">選擇要尋找的飾品類型</p>
          </div>
        </div>
        <button
          @click="showTutorial = true"
          class="p-2 hover:bg-white/50 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
          title="使用說明"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- 統計資訊 + 快速操作 -->
      <div class="p-3 md:p-4 bg-gray-50 border-b border-gray-200">
        <div class="flex items-center justify-between text-xs md:text-sm mb-2">
          <div>
            <span class="text-gray-600">已選擇</span>
            <span class="font-bold ml-1 text-purple-600">{{ selectedTypes.length }}</span>
            <span class="text-gray-400">種</span>
          </div>
          <div v-if="isLoading" class="flex items-center gap-1 text-purple-600">
            <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>載入中</span>
          </div>
          <div v-else class="flex items-center gap-1 text-gray-500">
            <span v-if="cachedTypesCount > 0" class="text-xs text-emerald-600">
              💾 已快取 {{ cachedTypesCount }} 種
            </span>
          </div>
        </div>
        
        <div class="flex gap-2">
          <button
            @click="selectPopular"
            class="flex-1 px-3 py-2 bg-purple-100 hover:bg-purple-200 active:bg-purple-300 text-purple-700 rounded-lg text-xs font-medium transition-colors"
          >
            熱門選擇
          </button>
          <button
            @click="clearAll"
            class="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 rounded-lg text-xs font-medium transition-colors"
          >
            清除全部
          </button>
        </div>
      </div>

      <!-- 類型選擇列表（複選） -->
      <div 
        :class="[
          'flex-1 overflow-y-auto p-2 md:p-4 bg-white',
          isMobile ? 'grid grid-cols-4 gap-1 content-start' : 'space-y-1'
        ]"
      >
        <label
          v-for="type in allTypes"
          :key="type.id"
          :class="[
            'flex items-center cursor-pointer transition-all relative',
            isMobile 
              ? 'flex-col gap-1 p-2 rounded-xl text-center'
              : 'gap-3 p-3 rounded-xl hover:bg-gray-100 group',
            selectedTypes.includes(type.id) 
              ? 'bg-purple-50 border border-purple-300' 
              : isMobile ? 'bg-gray-50' : '',
          ]"
        >
          <input
            type="checkbox"
            :value="type.id"
            v-model="selectedTypes"
            @change="handleSelectionChange"
            :class="[
              'rounded border-gray-300 text-purple-500 focus:ring-purple-500 focus:ring-offset-0',
              isMobile ? 'w-3 h-3 absolute top-1 right-1' : 'w-4 h-4'
            ]"
          />
          <span :class="isMobile ? 'text-2xl' : 'text-2xl group-hover:scale-110 transition-transform'">{{ type.emoji }}</span>
          <span :class="isMobile ? 'text-[10px] leading-tight text-gray-600 line-clamp-2' : 'text-sm font-medium text-gray-700 flex-1'">
            {{ type.name }}
          </span>
          <!-- 快取指示 -->
          <span 
            v-if="isCached(type.id) && !isMobile" 
            class="text-xs text-emerald-500"
            title="已快取"
          >
            💾
          </span>
        </label>
      </div>

      <!-- 載入狀態指示器 -->
      <div
        v-if="isLoading"
        class="p-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-center"
      >
        <div class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span class="text-sm font-medium">載入純種格資料中...</span>
        </div>
      </div>
    </div>
  </Transition>

  <!-- 面板收起後的小按鈕（手機版）-->
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <button
      v-if="!internalShowPanel && isMobile"
      @click="internalShowPanel = true"
      class="absolute top-28 left-4 z-[1000] bg-purple-500 text-white rounded-full p-3 shadow-xl flex items-center gap-2 glow-effect"
    >
      <span class="text-sm font-medium">純種篩選器</span>
    </button>
  </Transition>

  <!-- 教學彈出層 -->
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div 
      v-if="showTutorial"
      class="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center p-4"
      @click.self="dismissTutorial"
    >
      <div class="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl">
        <div class="text-center mb-4">
          <div class="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-3">
            <span class="text-3xl">🎯</span>
          </div>
          <h3 class="font-bold text-lg text-gray-800">純種模式說明</h3>
        </div>
        
        <div class="space-y-3 text-sm text-gray-600 mb-5">
          <div class="flex items-start gap-3">
            <span class="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs font-bold">1</span>
            <p>勾選要尋找的飾品類型（可<span class="font-bold text-purple-600">複選</span>）</p>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs font-bold">2</span>
            <p>地圖會顯示這些類型的「純種格」位置，<span class="font-bold text-purple-600">請注意記得放雷達模擬掃描範圍</span></p>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs font-bold">3</span>
            <p>已載入的資料會<span class="font-bold text-emerald-600">自動快取</span>，加快下次載入速度！</p>
          </div>
        </div>
        
        <button 
          @click="dismissTutorial"
          class="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl transition-colors"
        >
          我知道了！
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  selectedTypes: string[];
  isLoading?: boolean;
  cachedTypes?: string[];
  showPanel?: boolean;
}>();

const emit = defineEmits<{
  'update:selectedTypes': [types: string[]];
  'update:showPanel': [show: boolean];
  load: [types: string[]];
}>();

// 響應式檢測
const isMobile = ref(false);

// 內部面板顯示狀態
const internalShowPanel = computed({
  get: () => props.showPanel ?? true,
  set: (val) => emit('update:showPanel', val)
});
const showTutorial = ref(false);
const TUTORIAL_KEY = 'pure-mode-tutorial-seen-v4';

// 使用 computed 來同步 selectedTypes
const selectedTypes = computed({
  get: () => props.selectedTypes,
  set: (val) => emit('update:selectedTypes', val)
});

const cachedTypesCount = computed(() => props.cachedTypes?.length || 0);

const isCached = (typeId: string) => props.cachedTypes?.includes(typeId) || false;

onMounted(() => {
  isMobile.value = window.innerWidth < 768;
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768;
  });
  
  // 首次使用顯示教學
  if (!localStorage.getItem(TUTORIAL_KEY)) {
    setTimeout(() => {
      showTutorial.value = true;
    }, 500);
  }
});

const dismissTutorial = () => {
  showTutorial.value = false;
  localStorage.setItem(TUTORIAL_KEY, 'true');
};

// 處理選擇變化
const handleSelectionChange = () => {
  // 只載入尚未快取的類型
  const typesToLoad = selectedTypes.value.filter(t => !isCached(t));
  if (typesToLoad.length > 0) {
    emit('load', typesToLoad);
  }
};

const selectPopular = () => {
  const popular = ['restaurant', 'cafe', 'convenience', 'park', 'station'];
  selectedTypes.value = popular;
  handleSelectionChange();
};

const clearAll = () => {
  selectedTypes.value = [];
};

// Mobile drag logic
const touchStartY = ref(0);
const touchCurrentY = ref(0);
const isPanelDragging = ref(false);

const handleTouchStart = (e: TouchEvent) => {
  if (!isMobile.value) return;
  touchStartY.value = e.touches[0].clientY;
  isPanelDragging.value = true;
};

const handleTouchMove = (e: TouchEvent) => {
  if (!isPanelDragging.value) return;
  touchCurrentY.value = e.touches[0].clientY;
};

const handleTouchEnd = () => {
  if (!isPanelDragging.value) return;
  const distance = touchCurrentY.value - touchStartY.value;
  if (distance > 50 && touchCurrentY.value !== 0) {
    // 真正隱藏面板
    internalShowPanel.value = false;
  }
  isPanelDragging.value = false;
  touchStartY.value = 0;
  touchCurrentY.value = 0;
};

// 所有類型
const allTypes = [
  { id: 'restaurant', name: '餐廳', emoji: '🍽️' },
  { id: 'cafe', name: '咖啡廳', emoji: '☕' },
  { id: 'convenience', name: '便利商店', emoji: '🏪' },
  { id: 'park', name: '公園', emoji: '🏞️' },
  { id: 'station', name: '車站', emoji: '🚉' },
  { id: 'supermarket', name: '超市', emoji: '🛒' },
  { id: 'burger', name: '漢堡店', emoji: '🍔' },
  { id: 'bakery', name: '麵包店', emoji: '🥖' },
  { id: 'sweetshop', name: '甜點店', emoji: '🍰' },
  { id: 'pharmacy', name: '藥局', emoji: '💊' },
  { id: 'post_office', name: '郵局', emoji: '📮' },
  { id: 'library', name: '圖書館', emoji: '📚' },
  { id: 'hotel', name: '飯店', emoji: '🏨' },
  { id: 'university', name: '大學', emoji: '🎓' },
  { id: 'stadium', name: '體育場', emoji: '🏟️' },
  { id: 'art_gallery', name: '美術館', emoji: '🎨' },
  { id: 'electronics', name: '電器行', emoji: '📱' },
  { id: 'clothing', name: '服飾店', emoji: '👕' },
  { id: 'hair_salon', name: '髮廊', emoji: '💇' },
  { id: 'laundry', name: '洗衣店', emoji: '🧺' },
  { id: 'cosmetics', name: '化妝品', emoji: '💄' },
  { id: 'hardware', name: '五金行', emoji: '🔧' },
  { id: 'waterside', name: '水邊', emoji: '🌊' },
  { id: 'bridge', name: '橋', emoji: '🌉' },
  { id: 'bus_stop', name: '公車站', emoji: '🚌' },
  { id: 'forest', name: '森林', emoji: '🌲' },
  { id: 'mountain', name: '山', emoji: '⛰️' },
  { id: 'beach', name: '海灘', emoji: '🏖️' },
  { id: 'theme_park', name: '遊樂園', emoji: '🎢' },
  { id: 'airport', name: '機場', emoji: '✈️' },
  { id: 'zoo', name: '動物園', emoji: '🦁' },
  { id: 'movie_theater', name: '電影院', emoji: '🎬' },
  { id: 'ramen', name: '拉麵店', emoji: '🍜' },
  { id: 'italian', name: '義式餐廳', emoji: '🍝' },
];
</script>

<style scoped>
/* 自訂捲軸樣式 */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(168, 85, 247, 0.3) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(168, 85, 247, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(168, 85, 247, 0.5);
}

@keyframes glow {
  0% {
    box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(168, 85, 247, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(168, 85, 247, 0);
  }
}

.glow-effect {
  animation: glow 2s infinite;
}
</style>
