<template>
  <!-- 3D Container -->
  <div 
    ref="heroContainer"
    class="relative h-full w-full px-2 py-6 sm:px-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-10 overflow-visible perspective-1000"
    @mousemove="handleMouseMove"
    @mouseleave="resetTilt"
  >

    <!-- Moving Background Spirits (Organic Blobs) -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden rounded-[3rem]">
        <div class="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-radial from-emerald-300/30 to-transparent blur-[120px] animate-pulse-slow"></div>
        <div class="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-radial from-teal-300/20 to-transparent blur-[100px] animate-float-slow delay-1000"></div>
        <div class="absolute top-[20%] left-[30%] w-[300px] h-[300px] bg-gradient-radial from-lime-200/20 to-transparent blur-[80px] animate-float-slow delay-500"></div>
    </div>

    <!-- Left Content: Title & Text (Floats forward slightly) -->
    <div class="relative z-10 flex-1 text-center md:text-left transition-transform duration-200 ease-out" :style="textStyle">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-white/50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm hover:scale-105 transition-transform cursor-default">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        {{ $t('hero.badge') }}
      </div>

      <h1 class="text-5xl md:text-7xl font-black text-gray-800 leading-[0.9] mb-6 tracking-tighter drop-shadow-sm">
        {{ $t('hero.title.prefix') }} <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-lime-500 bg-300% animate-gradient">
          {{ $t('hero.title.suffix') }}
        </span>
      </h1>
      
      <p class="text-gray-600 text-lg md:text-xl max-w-md mx-auto md:mx-0 leading-relaxed font-medium mb-12">
        {{ $t('hero.subtitle.line1') }}<br />
        {{ $t('hero.subtitle.line2') }}
      </p>

       <!-- Interactive & Tracker Unified Container -->
       <div class="flex flex-col items-stretch w-full sm:w-[100%] md:w-max mx-auto md:mx-0 mt-8 gap-3 md:gap-4 relative z-10">
           
           <!-- Interactive Pikmin Spirits -->
           <div class="relative bg-white/40 backdrop-blur-sm rounded-3xl md:rounded-[2rem] border border-white/50 shadow-sm p-4 w-full flex flex-col md:flex-row md:items-center md:justify-center gap-4 md:gap-2 hover:scale-105 transition-transform duration-300">
               <!-- Admin Settings Button -->
               <button v-if="isAdmin" @click.stop="showSettingsModal = true" class="absolute -top-3 -right-3 z-50 bg-white shadow-md border border-gray-100 rounded-full p-2 text-gray-400 hover:text-emerald-500 hover:scale-110 transition-all">
                  <Icon name="lucide:settings" class="w-4 h-4" />
               </button>
               <!-- Row 1: Reverse Valentine Stickers -->
               <div class="flex items-center justify-center -space-x-2 md:-space-x-4 relative group h-14 cursor-none w-full md:w-auto">
                  <div v-for="(pikmin, index) in valentineSpirits" :key="pikmin.id" 
                       class="w-10 h-14 transform transition-all duration-300 hover:scale-125 hover:-translate-y-4 hover:z-20 relative filter drop-shadow-md"
                       :style="{ zIndex: index }">
                       <img :src="pikmin.image" :alt="pikmin.name" class="w-full h-full object-contain" />
                  </div>
                  
                 <!-- Tooltip (appears on hover of container) -->
                 <div class="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 text-[11px] font-bold text-pink-700 bg-white/95 shadow-md border border-pink-100/50 px-3.5 py-1.5 rounded-full pointer-events-none whitespace-nowrap z-40 transform group-hover:-translate-y-1">
                     {{ row1CategoryName }}
                 </div>
              </div>

              <!-- Row 2: Colored Powder -->
               <div class="flex items-center justify-center -space-x-2 md:-space-x-4 relative group h-14 cursor-none w-full md:w-auto">
                  <div v-for="(pikmin, index) in powderSpirits" :key="pikmin.id" 
                       class="w-10 h-14 transform transition-all duration-300 hover:scale-125 hover:-translate-y-4 hover:z-20 relative filter drop-shadow-md"
                       :style="{ zIndex: index }">
                       <img :src="pikmin.image" :alt="pikmin.name" class="w-full h-full object-contain" />
                  </div>
                 
                 <!-- Tooltip (appears on hover of container) -->
                 <div class="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 text-[11px] font-bold text-indigo-700 bg-white/95 shadow-md border border-indigo-100/50 px-3.5 py-1.5 rounded-full pointer-events-none whitespace-nowrap z-40 transform group-hover:-translate-y-1">
                     {{ row2CategoryName }}
                 </div>
              </div>
           </div>

           <!-- Missing Tracker Badge -->
           <button @click="showMissingModal = true" class="group relative w-full inline-flex flex-col md:flex-row items-center md:justify-between gap-2 md:gap-3 px-5 py-4 min-h-[56px] md:py-3.5 text-sm md:text-[15px] font-medium text-emerald-800 bg-[#e7f9ec] backdrop-blur-sm shadow-[0_4px_15px_-4px_rgba(52,211,153,0.3)] rounded-3xl md:rounded-[2rem] hover:bg-[#d5f5de] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 overflow-hidden border border-emerald-100/60 transition-transform hover:-translate-y-0.5">
              
              <div class="flex items-center gap-2">
                 <Icon name="lucide:search" class="text-xl text-emerald-600 shrink-0" />
                 <span class="text-gray-700 font-bold whitespace-nowrap">本月皮克敏還少了:</span>
              </div>

              <div v-if="missingValentine.length > 0 || missingPowder.length > 0" class="flex items-center justify-center flex-wrap gap-2 w-full md:w-auto">
                  <span v-if="missingValentine.length > 0" class="inline-flex items-center gap-1.5 bg-pink-100/80 text-pink-700 px-3 py-1 rounded-full text-xs md:text-sm font-bold border border-pink-200/60 transition-transform hover:scale-105">
                    貼紙 <span class="bg-white rounded-full px-1.5 text-pink-800 shadow-sm">{{ missingValentine.length }}</span>
                  </span>
                  <span v-if="missingPowder.length > 0" class="inline-flex items-center gap-1.5 bg-indigo-100/80 text-indigo-700 px-3 py-1 rounded-full text-xs md:text-sm font-bold border border-indigo-200/60 transition-transform hover:scale-105">
                    粉末 <span class="bg-white rounded-full px-1.5 text-indigo-800 shadow-sm">{{ missingPowder.length }}</span>
                  </span>
              </div>
              <span v-else class="text-gray-700 tracking-wide font-normal px-2">
                🎉 太神啦！近期活動收集完畢！
              </span>

              <span v-if="missingValentine.length > 0 || missingPowder.length > 0" class="text-emerald-600/90 border-b border-emerald-400 group-hover:text-emerald-700 group-hover:border-emerald-600 transition-colors whitespace-nowrap text-[13px] md:text-sm font-semibold pb-0.5 mt-1 md:mt-0 md:ml-1 self-center">點擊查看缺誰</span>
           </button>
       </div>
    </div>

    <!-- Right Content: Floating 3D Stats Core -->
    <div class="relative z-20 w-auto perspective-1000">
        <div 
            class="relative w-72 h-72 md:w-96 md:h-96 transition-transform duration-100 ease-out preserve-3d cursor-pointer"
            :style="cardStyle"
        >
            <!-- 1. Back Glow Layer (Furthest back) -->
            <div class="absolute inset-10 bg-gradient-to-tr from-emerald-400 to-teal-400 rounded-full blur-[60px] opacity-40 animate-pulse-slow translate-z-[-20px]"></div>

            <!-- 2. The Glass Sphere/Container -->
            <div class="absolute inset-0 bg-white/10 backdrop-blur-md rounded-full border border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex items-center justify-center translate-z-[0px] ring-1 ring-white/40">
                <div class="absolute inset-0 rounded-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
            </div>

            <!-- 3. Progress Ring (Floating) -->
            <div class="absolute inset-4 translate-z-[20px]">
                <svg class="w-full h-full -rotate-90 drop-shadow-xl" viewBox="0 0 100 100">
                    <!-- Track -->
                    <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.3)" stroke-width="6" fill="none" />
                    <!-- Progress -->
                    <circle cx="50" cy="50" r="40" stroke="url(#progressGradient)" stroke-width="6" fill="none"
                            stroke-linecap="round"
                            :stroke-dasharray="251.2"
                            :stroke-dashoffset="251.2 - (stats.percentage / 100) * 251.2"
                            class="transition-all duration-1000 ease-out"
                    />
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#34d399" />
                            <stop offset="100%" stop-color="#059669" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <!-- 4. Central Data Core (Furthest forward) -->
            <div class="absolute inset-0 flex flex-col items-center justify-center translate-z-[40px]">
                <div class="w-32 h-32 rounded-full bg-white/80 backdrop-blur-xl shadow-lg flex flex-col items-center justify-center border border-white/60 mb-2">
                    <Icon name="lucide:sprout" class="text-4xl text-emerald-500 mb-1 animate-bounce-gentle" />
                    <span class="text-3xl font-black text-gray-800 tracking-tighter leading-none">{{ stats.percentage }}%</span>
                </div>
                <div class="bg-emerald-100/80 backdrop-blur-md text-emerald-800 text-xs font-bold px-4 py-1.5 rounded-full border border-emerald-200/50 shadow-sm mt-4">
                    {{ stats.collected }} {{ $t('hero.collected') }}
                </div>
            </div>

            <!-- 5. Floating Orbs (Decorations) -->
            <div class="absolute top-0 right-10 w-12 h-12 bg-yellow-300 rounded-full blur-md opacity-60 animate-float translate-z-[30px]"></div>
            <div class="absolute bottom-10 left-10 w-8 h-8 bg-pink-400 rounded-full blur-md opacity-50 animate-float delay-700 translate-z-[25px]"></div>

        </div>
    </div>
  </div>

  <!-- Missing Pikmin Modal -->
  <div v-if="showMissingModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in" @click.self="showMissingModal = false">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-pop-in">
      <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-teal-50 shrink-0">
        <h3 class="text-xl font-bold text-emerald-800 flex items-center gap-2">
          <Icon name="lucide:search" class="text-emerald-500" />
          目前缺少的現時活動飾品
        </h3>
        <button @click="showMissingModal = false" class="text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-full p-1.5 shadow-sm border border-gray-100">
          <Icon name="lucide:x" class="w-5 h-5" />
        </button>
      </div>
      
      <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
        <p v-if="missingValentine.length > 0 || missingPowder.length > 0" class="text-gray-600 text-sm mb-6 font-medium text-center bg-yellow-50 text-yellow-800 py-2.5 rounded-xl border border-yellow-200">
          這是您目前尚未收集到的活動顏色喔！快出門尋找它們吧！
        </p>
        
        <!-- Section 1: Dynamic Row 1 -->
        <div v-if="missingValentine.length > 0" class="mb-8">
            <h4 class="text-md font-bold text-gray-700 mb-3 border-l-4 border-pink-400 pl-2">{{ row1CategoryName }} (差 {{ missingValentine.length }} 種)</h4>
            <div class="grid grid-cols-4 sm:grid-cols-4 gap-3">
              <div v-for="spirit in missingValentine" :key="spirit.id" class="flex flex-col items-center p-2 rounded-xl bg-gray-50 border border-gray-100 hover:bg-pink-50 hover:border-pink-200 transition-colors group">
                 <div class="w-12 h-12 flex items-center justify-center mb-1 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 drop-shadow-md">
                    <img :src="spirit.image" :alt="spirit.name" class="w-full h-full object-contain filter grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all duration-300" />
                 </div>
                 <span class="text-[11px] font-bold text-gray-500 group-hover:text-pink-700 capitalize">
                   {{ spirit.name }}
                 </span>
              </div>
            </div>
        </div>

        <!-- Section 2: Dynamic Row 2 -->
        <div v-if="missingPowder.length > 0" class="mb-2">
            <h4 class="text-md font-bold text-gray-700 mb-3 border-l-4 border-indigo-400 pl-2">{{ row2CategoryName }} (差 {{ missingPowder.length }} 種)</h4>
            <div class="grid grid-cols-4 sm:grid-cols-4 gap-3">
              <div v-for="spirit in missingPowder" :key="spirit.id" class="flex flex-col items-center p-2 rounded-xl bg-gray-50 border border-gray-100 hover:bg-indigo-50 hover:border-indigo-200 transition-colors group">
                 <div class="w-12 h-12 flex items-center justify-center mb-1 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 drop-shadow-md">
                    <img :src="spirit.image" :alt="spirit.name" class="w-full h-full object-contain filter grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all duration-300" />
                 </div>
                 <span class="text-[11px] font-bold text-gray-500 group-hover:text-indigo-700 capitalize">
                   {{ spirit.name }}
                 </span>
              </div>
            </div>
        </div>

        <!-- Fully Collected State -->
        <div v-if="missingValentine.length === 0 && missingPowder.length === 0" class="text-center py-10">
          <div class="text-6xl mb-4 animate-bounce-gentle">🏆</div>
          <p class="text-emerald-600 font-extrabold text-2xl">太神啦！</p>
          <p class="text-gray-500 text-md mt-2">您已經集齊了所有當期活動飾品！</p>
        </div>
      </div>
      
      <div class="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap justify-end gap-3 shrink-0">
         <button @click="showMissingModal = false" class="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors shadow-sm">
           關閉
         </button>
         <button v-if="missingValentine.length > 0" @click="navigateTo('/collection?category=' + row1CategoryId); showMissingModal = false" class="px-5 py-2.5 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors shadow-sm flex items-center gap-2">
           去圖鑑打勾 (上排)
           <Icon name="lucide:arrow-right" class="w-4 h-4" />
         </button>
         <button v-if="missingPowder.length > 0" @click="navigateTo('/collection?category=' + row2CategoryId); showMissingModal = false" class="px-5 py-2.5 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors shadow-sm flex items-center gap-2">
           去圖鑑打勾 (下排)
           <Icon name="lucide:arrow-right" class="w-4 h-4" />
         </button>
         <button v-if="missingValentine.length === 0 && missingPowder.length === 0" @click="navigateTo('/collection'); showMissingModal = false" class="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-500 transition-colors shadow-sm flex items-center gap-2">
           去圖鑑
           <Icon name="lucide:arrow-right" class="w-4 h-4" />
         </button>
      </div>
    </div>
  </div>

  <AdminHeroSettingsModal :is-open="showSettingsModal" @close="showSettingsModal = false" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/composables/useAuthStore';
import { useSiteConfig } from '~/composables/useSiteConfig';
import { useDecorData } from '~/composables/useDecorData';
import AdminHeroSettingsModal from '~/components/Admin/HeroSettingsModal.vue';

const { getStats, isCollected } = useCollection();
const { isAdmin } = useAuthStore();
const { fetchHeroConfig, heroFeaturedConfig } = useSiteConfig();
const { getItemsByCategory, getImageUrl, getCategory } = useDecorData();

const showMissingModal = ref(false);
const showSettingsModal = ref(false);
const stats = computed(() => getStats());

// Tilt Logic
const heroContainer = ref<HTMLElement | null>(null);
const tiltX = ref(0);
const tiltY = ref(0);

onMounted(async () => {
    await fetchHeroConfig();
});

// Dynamic Categories
const row1CategoryId = computed(() => heroFeaturedConfig.value?.row1 || 'reverse-valentine-sticker');
const row2CategoryId = computed(() => heroFeaturedConfig.value?.row2 || '彩色粉末-世界節慶');

const row1CategoryName = computed(() => getCategory(row1CategoryId.value)?.name || '未知分類');
const row2CategoryName = computed(() => getCategory(row2CategoryId.value)?.name || '未知分類');

const typeToZh = (type: string) => {
    const map: Record<string, string> = { red: '紅色', yellow: '黃色', blue: '藍色', purple: '紫色', white: '白色', rock: '岩石', winged: '羽翅', ice: '冰水' };
    return map[type] || type;
};

// Dynamic Array of Row 1
const valentineSpirits = computed(() => {
    return getItemsByCategory(row1CategoryId.value).map(item => ({
        type: item.pikminType,
        name: typeToZh(item.pikminType),
        image: getImageUrl(item.categoryId, item.variantId, item.pikminType) || '',
        id: item.id
    }));
});

// Dynamic Array of Row 2
const powderSpirits = computed(() => {
    return getItemsByCategory(row2CategoryId.value).map(item => ({
        type: item.pikminType,
        name: typeToZh(item.pikminType),
        image: getImageUrl(item.categoryId, item.variantId, item.pikminType) || '',
        id: item.id
    }));
});

// Combined for decorative floating display
const combinedSpirits = computed(() => {
    return [...valentineSpirits.value, ...powderSpirits.value];
});

// Filtered missing counts
const missingValentine = computed(() => {
    return valentineSpirits.value.filter(spirit => !isCollected(spirit.id));
});

const missingPowder = computed(() => {
    return powderSpirits.value.filter(spirit => !isCollected(spirit.id));
});

const handleMouseMove = (e: MouseEvent) => {
    if (!heroContainer.value) return;
    const rect = heroContainer.value.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation (max 10 degrees)
    tiltX.value = ((y - centerY) / centerY) * -10; 
    tiltY.value = ((x - centerX) / centerX) * 10;
};

const resetTilt = () => {
    tiltX.value = 0;
    tiltY.value = 0;
};

const cardStyle = computed(() => ({
    transform: `rotateX(${tiltX.value}deg) rotateY(${tiltY.value}deg)`,
}));

const textStyle = computed(() => ({
    transform: `translateX(${tiltY.value * 0.5}px) translateY(${tiltX.value * 0.5}px)`,
}));

</script>

<style scoped>
.perspective-1000 {
    perspective: 1000px;
}
.preserve-3d {
    transform-style: preserve-3d;
}
.translate-z-\[-20px\] { transform: translateZ(-20px); }
.translate-z-\[0px\] { transform: translateZ(0px); }
.translate-z-\[20px\] { transform: translateZ(20px); }
.translate-z-\[25px\] { transform: translateZ(25px); }
.translate-z-\[30px\] { transform: translateZ(30px); }
.translate-z-\[40px\] { transform: translateZ(40px); }

/* Custom Keyframes */
@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}
.animate-float {
    animation: float 4s ease-in-out infinite;
}
.animate-bounce-gentle {
    animation: float 2s ease-in-out infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* Custom Scrollbar for Modal if needed */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 20px;
}
</style>
