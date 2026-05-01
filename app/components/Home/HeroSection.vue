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
    <div class="relative z-10 flex-1 text-center md:text-left transition-transform duration-200 ease-out hero-copy-readable" :style="textStyle">
      <div class="glass-control text-on-glass inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-5 hover:scale-105 transition-transform cursor-default">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        {{ $t('hero.badge') }}
      </div>

      <h1 class="text-5xl md:text-7xl font-black text-gray-900 leading-[0.92] mb-5 tracking-tight hero-title-shadow readable-on-art">
        {{ $t('hero.title.prefix') }} <br />
        <span
          class="hero-title-green"
          :data-text="$t('hero.title.suffix')"
        >
          {{ $t('hero.title.suffix') }}
        </span>
      </h1>
      
      <p class="readable-on-art text-base md:text-lg max-w-md mx-auto md:mx-0 leading-[1.75] font-extrabold mb-12 hero-subtitle-shadow">
        {{ $t('hero.subtitle.line1') }}<br />
        {{ $t('hero.subtitle.line2') }}
      </p>

       <!-- Interactive & Tracker Unified Container -->
       <div class="flex flex-col items-stretch w-full sm:w-[100%] md:w-[100%] mx-auto md:mx-0 mt-8 gap-3 md:gap-4 relative z-10">
           
           <!-- Interactive Pikmin Spirits -->
           <div class="glass-surface-clear relative rounded-3xl md:rounded-[2rem] p-4 w-full flex flex-col md:flex-row md:items-center md:justify-center gap-4 md:gap-2 hover:scale-105 transition-transform duration-300">
               <!-- Admin Settings Button -->
               <button
                 v-if="isAdmin"
                 @click.stop="showSettingsModal = true"
                 class="glass-control absolute top-3 right-3 z-50 w-9 h-9 rounded-full text-emerald-600 hover:text-emerald-700 hover:scale-110 transition-all"
                 aria-label="Hero settings"
               >
                  <Icon name="lucide:settings" class="w-4.5 h-4.5" />
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
           <button @click="showMissingModal = true" class="glass-surface-readable group relative w-full inline-flex flex-col md:flex-row items-center md:justify-between gap-2 md:gap-3 px-5 py-4 min-h-[56px] md:py-3.5 text-sm md:text-[15px] font-medium rounded-3xl md:rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-transform hover:-translate-y-0.5">
              
              <div class="flex items-center gap-2">
                 <Icon name="lucide:search" class="text-xl text-emerald-600 shrink-0" />
                 <span class="text-on-glass font-bold whitespace-nowrap">本月皮克敏還少了:</span>
              </div>

              <div v-if="missingValentine.length > 0 || missingPowder.length > 0" class="flex items-center justify-center flex-wrap gap-2 w-full md:w-auto">
                  <span v-if="missingValentine.length > 0" class="inline-flex items-center gap-1.5 bg-pink-100/80 text-pink-700 px-3 py-1 rounded-full text-xs md:text-sm font-bold border border-pink-200/60 transition-transform hover:scale-105">
                    貼紙 <span class="bg-white rounded-full px-1.5 text-pink-800 shadow-sm">{{ missingValentine.length }}</span>
                  </span>
                  <span v-if="missingPowder.length > 0" class="inline-flex items-center gap-1.5 bg-indigo-100/80 text-indigo-700 px-3 py-1 rounded-full text-xs md:text-sm font-bold border border-indigo-200/60 transition-transform hover:scale-105">
                    粉末 <span class="bg-white rounded-full px-1.5 text-indigo-800 shadow-sm">{{ missingPowder.length }}</span>
                  </span>
              </div>
              <span v-else class="text-on-glass tracking-wide font-normal px-2">
                🎉 太神啦！近期活動收集完畢！
              </span>

              <span v-if="missingValentine.length > 0 || missingPowder.length > 0" class="text-emerald-600/90 border-b border-emerald-400 group-hover:text-emerald-700 group-hover:border-emerald-600 transition-colors whitespace-nowrap text-[13px] md:text-sm font-semibold pb-0.5 mt-1 md:mt-0 md:ml-1 self-center">點擊查看缺誰</span>
           </button>
       </div>
    </div>

    <!-- Right Content: Floating 3D Stats Core -->
    <div class="relative z-20 w-auto perspective-1000">
        <div 
            class="relative w-72 h-72 md:w-96 md:h-96"
            @click="enableDeviceTilt"
        >
            <div class="absolute inset-0 preserve-3d transition-transform duration-100 ease-out" :style="cardStyle">
                <!-- 1. Back Glow Layer (Furthest back) -->
                <div class="absolute inset-10 bg-gradient-to-tr from-emerald-400 to-teal-400 rounded-full blur-[60px] opacity-40 animate-pulse-slow translate-z-[-20px]"></div>

                <!-- 2. The Glass Sphere/Container -->
                <div class="liquid-glass-2026 liquid-glass-dynamic absolute inset-0 rounded-full flex items-center justify-center translate-z-[0px]">
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
                            <stop offset="0%" stop-color="#00b92f" />
                            <stop offset="100%" stop-color="#008523" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <!-- 4. Glass backgrounds only; crisp text is rendered above this transformed layer -->
                <div class="absolute inset-0 flex flex-col items-center justify-center translate-z-[40px] pointer-events-none">
                    <div class="liquid-glass-2026 liquid-glass-dynamic w-32 h-32 rounded-full mb-2"></div>
                    <div class="hero-stat-pill-shell rounded-full mt-4 h-[30px] w-[116px]"></div>
                </div>

                <!-- 5. Floating Orbs (Decorations) -->
                <div class="absolute top-0 right-10 w-12 h-12 bg-yellow-300 rounded-full blur-md opacity-60 animate-float translate-z-[30px]"></div>
                <div class="absolute bottom-10 left-10 w-8 h-8 bg-pink-400 rounded-full blur-md opacity-50 animate-float delay-700 translate-z-[25px]"></div>
            </div>

            <!-- Screen-space text layer stays crisp while the glass rotates underneath -->
            <div class="hero-stat-core absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div class="w-32 h-32 rounded-full flex flex-col items-center justify-center mb-2">
                    <Icon name="lucide:sprout" class="text-4xl text-emerald-500 mb-1 animate-bounce-gentle" />
                    <span class="hero-stat-value text-3xl font-black text-gray-800 leading-none">{{ stats.percentage }}%</span>
                </div>
                <div class="hero-stat-pill text-emerald-900 text-xs font-bold px-4 py-1.5 rounded-full mt-4">
                    {{ stats.collected }} {{ $t('hero.collected') }}
                </div>
            </div>

        </div>
    </div>
  </div>

  <!-- Missing Pikmin Modal -->
  <div v-if="showMissingModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in" @click.self="showMissingModal = false">
    <div class="glass-surface-readable rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-pop-in">
      <div class="p-5 border-b border-white/60 flex justify-between items-center shrink-0">
        <h3 class="text-xl font-bold text-emerald-800 flex items-center gap-2">
          <Icon name="lucide:search" class="text-emerald-500" />
          目前缺少的現時活動飾品
        </h3>
        <button @click="showMissingModal = false" class="glass-control text-gray-600 hover:text-gray-800 transition-colors rounded-full p-1.5">
          <Icon name="lucide:x" class="w-5 h-5" />
        </button>
      </div>
      
      <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
        <p v-if="missingValentine.length > 0 || missingPowder.length > 0" class="glass-surface-clear text-on-glass text-sm mb-6 font-bold text-center py-2.5 rounded-xl">
          這是您目前尚未收集到的活動顏色喔！快出門尋找它們吧！
        </p>
        
        <!-- Section 1: Dynamic Row 1 -->
        <div v-if="missingValentine.length > 0" class="mb-8">
            <h4 class="text-md font-bold text-gray-700 mb-3 border-l-4 border-pink-400 pl-2">{{ row1CategoryName }} (差 {{ missingValentine.length }} 種)</h4>
            <div class="grid grid-cols-4 sm:grid-cols-4 gap-3">
              <div v-for="spirit in missingValentine" :key="spirit.id" class="glass-surface-clear flex flex-col items-center p-2 rounded-xl hover:border-pink-200 transition-colors group">
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
              <div v-for="spirit in missingPowder" :key="spirit.id" class="glass-surface-clear flex flex-col items-center p-2 rounded-xl hover:border-indigo-200 transition-colors group">
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
      
      <div class="p-4 border-t border-white/60 flex flex-wrap justify-end gap-3 shrink-0">
         <button @click="showMissingModal = false" class="glass-control px-5 py-2.5 text-gray-800 rounded-xl font-bold transition-colors">
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
const deviceTiltEnabled = ref(false);
let hasDeviceOrientationListener = false;

onMounted(async () => {
    await fetchHeroConfig();
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
        addDeviceOrientationListener();
    }
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
    if (deviceTiltEnabled.value) return;
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
    if (deviceTiltEnabled.value) return;
    tiltX.value = 0;
    tiltY.value = 0;
};

const clampTilt = (value: number) => Math.max(-10, Math.min(10, value));

const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
    if (!deviceTiltEnabled.value) return;
    const beta = event.beta ?? 0;
    const gamma = event.gamma ?? 0;
    tiltX.value = clampTilt((beta - 45) / 4);
    tiltY.value = clampTilt(gamma / 4);
};

const addDeviceOrientationListener = () => {
    if (hasDeviceOrientationListener || typeof window === 'undefined') return;
    window.addEventListener('deviceorientation', handleDeviceOrientation, true);
    hasDeviceOrientationListener = true;
};

const enableDeviceTilt = async () => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) return;
    const orientationEvent = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    if (typeof orientationEvent.requestPermission === 'function') {
        const permission = await orientationEvent.requestPermission();
        if (permission !== 'granted') return;
    }
    deviceTiltEnabled.value = true;
    addDeviceOrientationListener();
};

onUnmounted(() => {
    if (hasDeviceOrientationListener && typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleDeviceOrientation, true);
    }
});

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

.hero-title-shadow {
  -webkit-text-stroke: 0.018em rgba(255, 255, 255, 0.48);
  paint-order: stroke fill;
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.9),
    0 -1px 0 rgba(255, 255, 255, 0.56),
    1px 0 0 rgba(255, 255, 255, 0.5),
    -1px 0 0 rgba(255, 255, 255, 0.5),
    0 5px 12px rgba(15, 23, 42, 0.28),
    0 18px 38px rgba(0, 133, 35, 0.18);
}

.hero-subtitle-shadow {
  color: rgb(15 23 42 / 0.96);
  -webkit-text-stroke: 0.03em rgba(255, 255, 255, 0.86);
  paint-order: stroke fill;
  text-shadow:
    0 0 1px rgba(255, 255, 255, 0.98),
    0 0 5px rgba(255, 255, 255, 0.86),
    0 0 11px rgba(255, 255, 255, 0.7),
    0 1px 0 rgba(255, 255, 255, 0.9),
    0 4px 10px rgba(15, 23, 42, 0.22);
}

@media (min-width: 768px) {
  .hero-copy-readable::before {
    position: absolute;
    inset: -1.5rem -2rem;
    z-index: -1;
    content: "";
    border-radius: 2rem;
    background: radial-gradient(ellipse at 40% 42%, rgba(255, 255, 255, 0.46), rgba(255, 255, 255, 0.18) 46%, transparent 72%);
    filter: blur(18px);
  }
}
.preserve-3d {
    transform-style: preserve-3d;
}

.hero-stat-core {
  transform: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: geometricPrecision;
}

.hero-stat-value,
.hero-stat-pill {
  letter-spacing: 0;
  transform: none;
  filter: none;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.68);
}

.hero-stat-pill,
.hero-stat-pill-shell {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.76), rgba(255, 255, 255, 0.34)),
    rgba(237, 255, 242, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.82);
  box-shadow:
    0 10px 22px rgba(0, 133, 35, 0.12),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
}

.hero-stat-value {
  color: rgb(15 23 42 / 0.96);
  font-variant-numeric: tabular-nums;
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
