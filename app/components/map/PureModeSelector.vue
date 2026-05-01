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
        'absolute overflow-hidden flex flex-col z-[1000]',
        'bg-white/90 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)]',
        'border border-white/70',
        isMobile 
          ? 'left-0 right-0 bottom-0 max-h-[70vh] rounded-t-3xl' 
          : 'top-4 left-4 bottom-4 w-72 rounded-2xl'
      ]"
    >
      <!-- 標題列 -->
      <div 
        class="relative px-4 py-3 md:px-5 md:py-4 flex items-center justify-between touch-none shrink-0"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <div v-if="isMobile" class="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300/60 rounded-full"></div>
        
        <div class="flex items-center gap-3 mt-1 md:mt-0">
          <div class="w-9 h-9 bg-gradient-to-br from-purple-400 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-md shadow-purple-200/50">
            <Icon name="lucide:gem" class="w-[18px] h-[18px] text-white" />
          </div>
          <div>
            <h2 class="font-bold text-gray-800 text-[15px] tracking-tight">純種模式</h2>
            <p class="text-[11px] text-gray-400 hidden md:block">選擇要尋找的飾品類型</p>
          </div>
        </div>
        <button
          @click="showTutorial = true"
          class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
          title="使用說明"
        >
          <Icon name="lucide:help-circle" class="h-4 w-4" />
        </button>
      </div>

      <!-- 統計 + 操作 -->
      <div class="px-4 pb-3 md:px-5 md:pb-4 shrink-0">
        <div class="flex gap-2 mb-3">
          <div class="flex-1 bg-purple-50/80 rounded-xl px-3 py-2 border border-purple-100/60">
            <div class="text-[10px] text-purple-600/70 font-medium mb-0.5">已選擇</div>
            <div class="text-lg font-bold text-purple-600 tabular-nums leading-tight">
              {{ selectedTypes.length }}
              <span class="text-xs font-normal text-purple-400">種</span>
            </div>
          </div>
          <div class="flex-1 bg-gray-50/80 rounded-xl px-3 py-2 border border-gray-100/60">
            <div class="text-[10px] text-gray-500 font-medium mb-0.5">狀態</div>
            <div v-if="isLoading" class="flex items-center gap-1.5 text-purple-600">
              <svg class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-xs font-medium">載入中</span>
            </div>
            <div v-else-if="cachedTypesCount > 0" class="flex items-center gap-1 text-emerald-600">
              <Icon name="lucide:database" class="w-3.5 h-3.5" />
              <span class="text-xs font-bold">{{ cachedTypesCount }} 種</span>
            </div>
            <div v-else class="text-xs text-gray-400 leading-tight mt-0.5">就緒</div>
          </div>
        </div>
        
        <div class="flex gap-2">
          <button
            @click="selectPopular"
            class="flex-1 px-3 py-2 bg-purple-500 hover:bg-purple-600 active:scale-[0.97] text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm shadow-purple-200/50"
          >
            熱門選擇
          </button>
          <button
            @click="clearAll"
            class="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 active:scale-[0.97] text-gray-600 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            清除全部
          </button>
        </div>
      </div>

      <div class="h-px bg-gradient-to-r from-transparent via-gray-200/60 to-transparent mx-4 shrink-0"></div>

      <!-- 類型列表 -->
      <div 
        :class="[
          'flex-1 overflow-y-auto min-h-0',
          isMobile ? 'p-2.5 grid grid-cols-2 gap-1.5 content-start auto-rows-min' : 'p-3 space-y-0.5'
        ]"
      >
        <!-- ===== 手機版：橫向 Chip ===== -->
        <label
          v-if="isMobile"
          v-for="type in allTypes"
          :key="type.id"
          :class="[
            'decor-chip relative flex items-center gap-2.5 cursor-pointer overflow-hidden rounded-xl transition-all duration-200 active:scale-[0.97]',
            'px-2.5 py-2',
            selectedTypes.includes(type.id) 
              ? 'bg-gradient-to-r from-purple-50 to-fuchsia-50/60 border border-purple-300/50 shadow-sm' 
              : 'bg-white/70 border border-gray-100',
          ]"
        >
          <input type="checkbox" :value="type.id" v-model="selectedTypes" @change="handleSelectionChange" class="peer sr-only" />

          <!-- 壓印背景 -->
          <div :class="[
            'absolute -right-1 top-1/2 -translate-y-1/2 pointer-events-none select-none transition-opacity duration-300',
            selectedTypes.includes(type.id) ? 'opacity-[0.18]' : 'opacity-[0.06]'
          ]">
            <Icon v-if="type.iconName" :name="type.iconName" class="w-11 h-11" />
          </div>

          <!-- 圖示 -->
          <Icon v-if="type.iconName" :name="type.iconName" class="shrink-0 w-7 h-7" />
          <span v-else class="shrink-0 text-xl">{{ type.emoji }}</span>

          <!-- 文字 -->
          <span :class="[
            'relative z-10 text-[12px] leading-tight font-medium line-clamp-1 flex-1',
            selectedTypes.includes(type.id) ? 'text-purple-700' : 'text-gray-600'
          ]">
            {{ type.name }}
          </span>

          <!-- 選中指示 -->
          <div :class="[
            'shrink-0 w-[18px] h-[18px] rounded-full flex items-center justify-center transition-all duration-150',
            selectedTypes.includes(type.id)
              ? 'bg-purple-500'
              : 'border-[1.5px] border-gray-300/80'
          ]">
            <Icon v-if="selectedTypes.includes(type.id)" name="lucide:check" class="w-2.5 h-2.5 text-white" />
          </div>

          <!-- 快取 -->
          <div v-if="isCached(type.id)" class="absolute top-1 left-1">
            <Icon name="lucide:database" class="w-2.5 h-2.5 text-emerald-400" />
          </div>
        </label>

        <!-- ===== 桌面版：行列式 ===== -->
        <label
          v-if="!isMobile"
          v-for="type in allTypes"
          :key="type.id"
          :class="[
            'decor-item relative flex items-center cursor-pointer transition-all duration-200 overflow-hidden group',
            'gap-3 px-3 py-2.5 rounded-xl',
            selectedTypes.includes(type.id) 
              ? 'bg-purple-50/90 ring-1 ring-purple-300/60' 
              : 'hover:bg-gray-50/80',
          ]"
        >
          <div class="absolute -right-1 top-1/2 -translate-y-1/2 opacity-[0.35] pointer-events-none select-none transition-opacity duration-300 group-hover:opacity-[0.8]">
            <Icon v-if="type.iconName" :name="type.iconName" class="w-16 h-16" />
            <span v-else class="text-5xl">{{ type.emoji }}</span>
          </div>

          <input type="checkbox" :value="type.id" v-model="selectedTypes" @change="handleSelectionChange" class="peer sr-only" />
          
          <div :class="[
            'shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200',
            selectedTypes.includes(type.id)
              ? 'bg-purple-500 border-purple-500 shadow-sm shadow-purple-200/60'
              : 'border-gray-300 group-hover:border-purple-300'
          ]">
            <Icon v-if="selectedTypes.includes(type.id)" name="lucide:check" class="w-3 h-3 text-white" />
          </div>

          <span :class="[
            'relative z-10 text-[13px] font-medium flex-1 transition-colors duration-200',
            selectedTypes.includes(type.id) ? 'text-purple-800' : 'text-gray-600 group-hover:text-gray-800'
          ]">
            {{ type.name }}
          </span>

          <span v-if="isCached(type.id)" class="relative z-10" title="已快取">
            <Icon name="lucide:database" class="w-3 h-3 text-emerald-400" />
          </span>
        </label>
      </div>

      <!-- 載入狀態 -->
      <div v-if="isLoading" class="p-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-center shrink-0">
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

  <!-- 收起按鈕 -->
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
      class="absolute top-28 left-4 z-[1000] bg-purple-500 hover:bg-purple-600 text-white rounded-2xl px-4 py-2.5 shadow-xl flex items-center gap-2 glow-effect cursor-pointer transition-colors"
    >
      <Icon name="lucide:gem" class="w-4 h-4" />
      <span class="text-sm font-semibold">純種篩選器</span>
    </button>
  </Transition>

  <!-- 教學 -->
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
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4"
      @click.self="dismissTutorial"
    >
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div class="text-center mb-5">
          <div class="w-14 h-14 mx-auto bg-gradient-to-br from-purple-400 to-fuchsia-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-purple-200/50">
            <Icon name="lucide:target" class="w-7 h-7 text-white" />
          </div>
          <h3 class="font-bold text-lg text-gray-800">純種模式說明</h3>
        </div>
        <div class="space-y-3 text-sm text-gray-600 mb-6">
          <div class="flex items-start gap-3">
            <span class="bg-purple-500 text-white rounded-lg w-6 h-6 flex items-center justify-center shrink-0 text-xs font-bold">1</span>
            <p>勾選要尋找的飾品類型（可<span class="font-bold text-purple-600">複選</span>）</p>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-purple-500 text-white rounded-lg w-6 h-6 flex items-center justify-center shrink-0 text-xs font-bold">2</span>
            <p>地圖會顯示這些類型的「純種格」位置，<span class="font-bold text-purple-600">請注意記得放雷達模擬掃描範圍</span></p>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-purple-500 text-white rounded-lg w-6 h-6 flex items-center justify-center shrink-0 text-xs font-bold">3</span>
            <p>已載入的資料會<span class="font-bold text-emerald-600">自動快取</span>，加快下次載入速度！</p>
          </div>
        </div>
        <button 
          @click="dismissTutorial"
          class="w-full py-3 bg-purple-500 hover:bg-purple-600 active:scale-[0.98] text-white font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-purple-200/50"
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

const isMobile = ref(false);
const internalShowPanel = computed({
  get: () => props.showPanel ?? true,
  set: (val) => emit('update:showPanel', val)
});
const showTutorial = ref(false);
const TUTORIAL_KEY = 'pure-mode-tutorial-seen-v4';

const selectedTypes = computed({
  get: () => props.selectedTypes,
  set: (val) => emit('update:selectedTypes', val)
});

const cachedTypesCount = computed(() => props.cachedTypes?.length || 0);
const isCached = (typeId: string) => props.cachedTypes?.includes(typeId) || false;
let tutorialTimer: ReturnType<typeof setTimeout> | null = null;

const updateIsMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  updateIsMobile();
  window.addEventListener('resize', updateIsMobile, { passive: true });
  if (!localStorage.getItem(TUTORIAL_KEY)) {
    tutorialTimer = setTimeout(() => { showTutorial.value = true; }, 500);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateIsMobile);
  if (tutorialTimer) {
    clearTimeout(tutorialTimer);
    tutorialTimer = null;
  }
});

const dismissTutorial = () => {
  showTutorial.value = false;
  localStorage.setItem(TUTORIAL_KEY, 'true');
};

const handleSelectionChange = () => {
  const typesToLoad = selectedTypes.value.filter(t => !isCached(t));
  if (typesToLoad.length > 0) emit('load', typesToLoad);
};

const selectPopular = () => {
  selectedTypes.value = ['restaurant', 'cafe', 'convenience', 'park', 'station'];
  handleSelectionChange();
};
const clearAll = () => { selectedTypes.value = []; };

const touchStartY = ref(0);
const touchCurrentY = ref(0);
const isPanelDragging = ref(false);

const handleTouchStart = (e: TouchEvent) => {
  if (!isMobile.value) return;
  const touch = e.touches[0];
  if (!touch) return;
  touchStartY.value = touch.clientY;
  isPanelDragging.value = true;
};
const handleTouchMove = (e: TouchEvent) => {
  if (!isPanelDragging.value) return;
  const touch = e.touches[0];
  if (!touch) return;
  touchCurrentY.value = touch.clientY;
};
const handleTouchEnd = () => {
  if (!isPanelDragging.value) return;
  if (touchCurrentY.value - touchStartY.value > 50 && touchCurrentY.value !== 0) {
    internalShowPanel.value = false;
  }
  isPanelDragging.value = false;
  touchStartY.value = 0;
  touchCurrentY.value = 0;
};

const allTypes = [
  { id: 'restaurant', name: '餐廳', emoji: '🍽️', iconName: 'noto:fork-and-knife-with-plate' },
  { id: 'cafe', name: '咖啡廳', emoji: '☕', iconName: 'noto:hot-beverage' },
  { id: 'convenience', name: '便利商店', emoji: '🏪', iconName: 'noto:convenience-store' },
  { id: 'park', name: '公園', emoji: '🏞️', iconName: 'noto:four-leaf-clover' },
  { id: 'station', name: '車站', emoji: '🚉', iconName: 'noto:station' },
  { id: 'supermarket', name: '超市', emoji: '🛒', iconName: 'noto:shopping-cart' },
  { id: 'burger', name: '漢堡店', emoji: '🍔', iconName: 'noto:hamburger' },
  { id: 'bakery', name: '麵包店', emoji: '🥖', iconName: 'noto:croissant' },
  { id: 'sweetshop', name: '甜點店', emoji: '🍰', iconName: 'noto:shortcake' },
  { id: 'pharmacy', name: '藥局', emoji: '💊', iconName: 'noto:pill' },
  { id: 'post_office', name: '郵局', emoji: '📮', iconName: 'noto:envelope' },
  { id: 'library', name: '圖書館', emoji: '📚', iconName: 'noto:books' },
  { id: 'hotel', name: '飯店', emoji: '🏨', iconName: 'noto:hotel' },
  { id: 'university', name: '大學', emoji: '🎓', iconName: 'noto:graduation-cap' },
  { id: 'stadium', name: '體育場', emoji: '🏟️', iconName: 'noto:stadium' },
  { id: 'art_gallery', name: '美術館', emoji: '🎨', iconName: 'noto:artist-palette' },
  { id: 'electronics', name: '電器行', emoji: '📱', iconName: 'noto:electric-plug' },
  { id: 'clothing', name: '服飾店', emoji: '👕', iconName: 'noto:necktie' },
  { id: 'hair_salon', name: '髮廊', emoji: '💇', iconName: 'noto:barber-pole' },
  { id: 'laundry', name: '洗衣店', emoji: '🧺', iconName: 'noto:basket' },
  { id: 'cosmetics', name: '化妝品', emoji: '💄', iconName: 'noto:lipstick' },
  { id: 'hardware', name: '五金行', emoji: '🔧', iconName: 'noto:wrench' },
  { id: 'waterside', name: '水邊', emoji: '🌊', iconName: 'noto:water-wave' },
  { id: 'bridge', name: '橋', emoji: '🌉', iconName: 'noto:bridge-at-night' },
  { id: 'bus_stop', name: '公車站', emoji: '🚌', iconName: 'noto:bus' },
  { id: 'forest', name: '森林', emoji: '🌲', iconName: 'noto:evergreen-tree' },
  { id: 'mountain', name: '山', emoji: '⛰️', iconName: 'noto:mountain' },
  { id: 'beach', name: '海灘', emoji: '🏖️', iconName: 'noto:beach-with-umbrella' },
  { id: 'theme_park', name: '遊樂園', emoji: '🎢', iconName: 'noto:roller-coaster' },
  { id: 'airport', name: '機場', emoji: '✈️', iconName: 'noto:airplane' },
  { id: 'zoo', name: '動物園', emoji: '🦁', iconName: 'noto:lion' },
  { id: 'movie_theater', name: '電影院', emoji: '🎬', iconName: 'noto:clapper-board' },
  { id: 'ramen', name: '拉麵店', emoji: '🍜', iconName: 'noto:steaming-bowl' },
  { id: 'italian', name: '義式餐廳', emoji: '🍝', iconName: 'noto:pizza' },
];
</script>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(168, 85, 247, 0.2) transparent;
}
.overflow-y-auto::-webkit-scrollbar { width: 4px; }
.overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(168, 85, 247, 0.2);
  border-radius: 4px;
}
.decor-chip { -webkit-tap-highlight-color: transparent; }

@keyframes glow {
  0% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.5); }
  70% { box-shadow: 0 0 0 8px rgba(168, 85, 247, 0); }
  100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
}
.glow-effect { animation: glow 2s infinite; }
</style>
