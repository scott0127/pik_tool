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
            <LiquidGlassCard 
              :blur-value="14"
              :glass-opacity="0.15"
              :bg-x="bgX"
              :bg-y="bgY"
              :bg-image="bgImage"
              :magnification="1.05"
              :is-draggable="false"
              class="hero-spirit-showcase relative rounded-3xl md:rounded-[2rem] p-4 w-full flex flex-col md:flex-row md:items-center md:justify-center gap-3 md:gap-2 transition-transform duration-300"
            >
                <!-- Admin Settings Button -->
                <button
                  v-if="isAdmin"
                  @click.stop="showSettingsModal = true"
                  class="glass-control absolute top-3 right-3 z-50 w-9 h-9 rounded-full text-emerald-600 hover:text-emerald-700 hover:scale-110 transition-all"
                  aria-label="Hero settings"
                >
                   <Icon name="lucide:settings" class="w-4.5 h-4.5" />
                </button>
                <div class="hero-spirit-content">
                  <!-- Row 1: Reverse Valentine Stickers -->
                  <div class="hero-spirit-row group">
                     <div v-for="(pikmin, index) in valentineSpirits" :key="pikmin.id" 
                          class="hero-spirit-item"
                          :style="{ zIndex: index }">
                          <img :src="pikmin.image" :alt="pikmin.name" class="w-full h-full object-contain" />
                     </div>
                     
                    <!-- Tooltip (appears on hover of container) -->
                    <div class="hero-spirit-tooltip text-pink-700 border-pink-100/50">
                        {{ row1CategoryName }}
                    </div>
                 </div>

                 <!-- Row 2: Colored Powder -->
                  <div class="hero-spirit-row group">
                     <div v-for="(pikmin, index) in powderSpirits" :key="pikmin.id" 
                          class="hero-spirit-item"
                          :style="{ zIndex: index }">
                          <img :src="pikmin.image" :alt="pikmin.name" class="w-full h-full object-contain" />
                     </div>
                    
                    <!-- Tooltip (appears on hover of container) -->
                    <div class="hero-spirit-tooltip text-indigo-700 border-indigo-100/50">
                        {{ row2CategoryName }}
                    </div>
                  </div>
                </div>
            </LiquidGlassCard>

            <!-- Missing Tracker Badge -->
            <LiquidGlassCard 
              @click="showMissingModal = true"
              :blur-value="14"
              :glass-opacity="0.15"
              :bg-x="bgX"
              :bg-y="bgY"
              :bg-image="bgImage"
              :magnification="1.05"
              :is-draggable="false"
              class="group relative w-full inline-flex flex-col md:flex-row items-center md:justify-between gap-2 md:gap-3 px-5 py-4 min-h-[56px] md:py-3.5 text-sm md:text-[15px] font-medium rounded-3xl md:rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-transform hover:-translate-y-0.5 cursor-pointer"
            >
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
            </LiquidGlassCard>
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
                <LiquidGlassCard
                  :blur-value="24"
                  :glass-opacity="0.15"
                  :bg-x="bgX"
                  :bg-y="bgY"
                  :bg-image="bgImage"
                  :magnification="1.15"
                  :is-draggable="false"
                  :is-tiltable="false"
                  class="absolute inset-0 rounded-full flex items-center justify-center translate-z-[10px]"
                />

                <!-- 3. Progress Ring (Floating 3D Crystal Green Ring) -->
                <div class="absolute inset-4 translate-z-[20px]">
                    <svg class="w-full h-full -rotate-90 drop-shadow-xl" viewBox="0 0 100 100">
                        <!-- ================= TRACK (Full 360-degree Transparent Glass/Crystal Ring) ================= -->
                        <!-- 1. Track Body (Frosted/Clear Glass Base) -->
                        <circle cx="50" cy="50" r="40" stroke="rgba(255, 255, 255, 0.08)" stroke-width="6.5" fill="none" />
                        
                        <!-- 2. Track Glass Gloss (360-degree light reflection with sweep shimmer) -->
                        <circle cx="50" cy="50" r="40" stroke="url(#trackGlossGradient)" stroke-width="6.5" fill="none" class="mix-blend-overlay" />
                        
                        <!-- 3. Track Outer Sharp Edge -->
                        <circle cx="50" cy="50" r="42.2" stroke="rgba(255, 255, 255, 0.35)" stroke-width="0.6" fill="none" class="mix-blend-overlay" />
                        
                        <!-- 4. Track Inner Sharp Edge -->
                        <circle cx="50" cy="50" r="37.8" stroke="rgba(255, 255, 255, 0.2)" stroke-width="0.5" fill="none" class="mix-blend-overlay" />


                        <!-- ================= PROGRESS (Glowing Green Crystal Filling) ================= -->
                        <!-- 4.5 Progress: 3D Cast Shadow (Casts a shadow onto the glass track underneath) -->
                        <circle cx="50" cy="50" r="40" stroke="rgba(0, 35, 10, 0.26)" stroke-width="6.5" fill="none" stroke-linecap="round"
                                :stroke-dasharray="251.2"
                                :stroke-dashoffset="251.2 - (stats.percentage / 100) * 251.2"
                                filter="url(#shadowBlur)"
                                transform="translate(0.5, 0.8)"
                                class="transition-all duration-1000 ease-out"
                        />
                        
                        <!-- 5. Progress Green Body (Semi-transparent brand-green with shadow glow filter) -->
                        <circle cx="50" cy="50" r="40" stroke="url(#crystalBrandGreenGradient)" stroke-width="6.5" fill="none" stroke-linecap="round"
                                :stroke-dasharray="251.2"
                                :stroke-dashoffset="251.2 - (stats.percentage / 100) * 251.2"
                                filter="url(#brandGreenGlow)"
                                class="transition-all duration-1000 ease-out"
                        />
                        <!-- 6. Progress Glowing Inner Core (Neon-green theme) -->
                        <circle cx="50" cy="50" r="40" stroke="url(#crystalBrandCoreGradient)" stroke-width="3" fill="none" stroke-linecap="round"
                                :stroke-dasharray="251.2"
                                :stroke-dashoffset="251.2 - (stats.percentage / 100) * 251.2"
                                class="transition-all duration-1000 ease-out"
                        />
                        <!-- 7. Progress Glossy Highlight Reflection (Sweeping Top Light Source overlay) -->
                        <circle cx="50" cy="50" r="40" stroke="url(#progressGlossGradient)" stroke-width="6.5" fill="none" stroke-linecap="round"
                                :stroke-dasharray="251.2"
                                :stroke-dashoffset="251.2 - (stats.percentage / 100) * 251.2"
                                class="transition-all duration-1000 ease-out mix-blend-overlay"
                        />
                        
                        <!-- 8. Progress Outer Edge Highlight Reflection -->
                        <circle cx="50" cy="50" r="42.2" stroke="rgba(255, 255, 255, 0.7)" stroke-width="0.8" fill="none" stroke-linecap="round"
                                :stroke-dasharray="251.2"
                                :stroke-dashoffset="251.2 - (stats.percentage / 100) * 251.2"
                                class="transition-all duration-1000 ease-out mix-blend-overlay"
                        />
                        <!-- 9. Progress Inner Edge Highlight Reflection -->
                        <circle cx="50" cy="50" r="37.8" stroke="rgba(255, 255, 255, 0.35)" stroke-width="0.5" fill="none" stroke-linecap="round"
                                :stroke-dasharray="251.2"
                                :stroke-dashoffset="251.2 - (stats.percentage / 100) * 251.2"
                                class="transition-all duration-1000 ease-out mix-blend-overlay"
                        />

                        <defs>
                            <!-- Shadow blur for 3D cast shadow -->
                            <filter id="shadowBlur" x="-10%" y="-10%" width="120%" height="120%">
                                <feGaussianBlur stdDeviation="0.8" />
                            </filter>

                            <!-- Ambient Glow Filter to make brand green crystal luminous -->
                            <filter id="brandGreenGlow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="1.2" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>

                            <!-- Track Glass Gloss (With active ambient light sweep animation) -->
                            <linearGradient id="trackGlossGradient" x1="100%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stop-color="rgba(255, 255, 255, 0.45)" />
                                <stop offset="30%" stop-color="rgba(255, 255, 255, 0.15)" />
                                <stop offset="70%" stop-color="rgba(255, 255, 255, 0)" />
                                <stop offset="100%" stop-color="rgba(255, 255, 255, 0)" />
                                <animate attributeName="x1" values="100%; 0%; 100%" dur="12s" repeatCount="indefinite" />
                                <animate attributeName="y1" values="0%; 100%; 0%" dur="12s" repeatCount="indefinite" />
                            </linearGradient>

                            <!-- Crystal Brand Green Theme Gradient (Semi-transparent) -->
                            <linearGradient id="crystalBrandGreenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="rgba(214, 255, 224, 0.72)" />  <!-- brand-green-soft 72% -->
                                <stop offset="45%" stop-color="rgba(0, 185, 47, 0.58)" />     <!-- brand-green 58% -->
                                <stop offset="85%" stop-color="rgba(0, 133, 35, 0.68)" />     <!-- brand-green-dark 68% -->
                                <stop offset="100%" stop-color="rgba(0, 60, 15, 0.78)" />     <!-- deep forest brand green 78% -->
                            </linearGradient>
                            
                            <!-- Glowing Inner Core Gradient (Vibrant neon brand green core) -->
                            <linearGradient id="crystalBrandCoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="rgba(255, 255, 255, 0.95)" />   <!-- specular highlight -->
                                <stop offset="35%" stop-color="rgba(42, 255, 183, 0.88)" />   <!-- neon brand light core -->
                                <stop offset="80%" stop-color="rgba(0, 185, 47, 0.92)" />     <!-- brand-green core -->
                                <stop offset="100%" stop-color="rgba(0, 133, 35, 0.98)" />    <!-- brand-green-dark core -->
                            </linearGradient>
                            
                            <!-- Progress Glass Gloss (With active reflection shimmer sweep) -->
                            <linearGradient id="progressGlossGradient" x1="100%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stop-color="rgba(255, 255, 255, 0.98)" />
                                <stop offset="30%" stop-color="rgba(255, 255, 255, 0.45)" />
                                <stop offset="70%" stop-color="rgba(255, 255, 255, 0)" />
                                <stop offset="100%" stop-color="rgba(255, 255, 255, 0)" />
                                <animate attributeName="x1" values="100%; 0%; 100%" dur="8s" repeatCount="indefinite" />
                                <animate attributeName="y1" values="0%; 100%; 0%" dur="8s" repeatCount="indefinite" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <!-- 4. Glass backgrounds only; crisp text is rendered above this transformed layer -->
                <div class="absolute inset-0 flex flex-col items-center justify-center translate-z-[40px] pointer-events-none">
                    <LiquidGlassCard
                      :blur-value="16"
                      :glass-opacity="0.3"
                      :bg-x="bgX"
                      :bg-y="bgY"
                      :bg-image="bgImage"
                      :magnification="1.1"
                      :is-draggable="false"
                      :is-tiltable="false"
                      class="w-32 h-32 rounded-full mb-2"
                    />
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
    <LiquidGlassCard 
      v-if="showMissingModal"
      :blur-value="24"
      :glass-opacity="0.25"
      :bg-x="bgX"
      :bg-y="bgY"
      :bg-image="bgImage"
      :magnification="1.05"
      :is-draggable="false"
      class="rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-pop-in"
    >
      <div class="p-5 border-b border-white/60 flex justify-between items-center shrink-0 relative z-10">
        <h3 class="text-xl font-bold text-emerald-800 flex items-center gap-2 drop-shadow-sm">
          <Icon name="lucide:search" class="text-emerald-500" />
          目前缺少的現時活動飾品
        </h3>
        <button @click="showMissingModal = false" class="bg-white/30 border border-white/50 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/50 transition-colors shadow-sm">
          <Icon name="lucide:x" class="w-4 h-4 text-gray-800" />
        </button>
      </div>
      
      <div class="p-6 overflow-y-auto flex-1 custom-scrollbar relative z-10">
        <p v-if="missingValentine.length > 0 || missingPowder.length > 0" class="bg-white/20 border border-white/40 text-gray-800 text-sm mb-6 font-bold text-center py-2.5 rounded-xl drop-shadow-sm">
          這是您目前尚未收集到的活動顏色喔！快出門尋找它們吧！
        </p>
        
        <!-- Section 1: Dynamic Row 1 -->
        <div v-if="missingValentine.length > 0" class="mb-8">
            <h4 class="text-md font-bold text-gray-700 mb-3 border-l-4 border-pink-400 pl-2">{{ row1CategoryName }} (差 {{ missingValentine.length }} 種)</h4>
            <div class="grid grid-cols-4 sm:grid-cols-4 gap-3">
              <div v-for="spirit in missingValentine" :key="spirit.id" class="bg-white/20 border border-white/40 flex flex-col items-center p-2 rounded-xl hover:border-pink-200 transition-colors group">
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
              <div v-for="spirit in missingPowder" :key="spirit.id" class="bg-white/20 border border-white/40 flex flex-col items-center p-2 rounded-xl hover:border-indigo-200 transition-colors group">
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
      
      <div class="p-4 border-t border-white/60 flex flex-wrap justify-end gap-3 shrink-0 relative z-10">
         <button @click="showMissingModal = false" class="bg-white/30 border border-white/50 px-5 py-2.5 text-gray-800 rounded-xl font-bold transition-colors shadow-sm hover:bg-white/50">
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
    </LiquidGlassCard>
  </div>

  <AdminHeroSettingsModal :is-open="showSettingsModal" @close="showSettingsModal = false" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/composables/useAuthStore';
import { useSiteConfig } from '~/composables/useSiteConfig';
import { useDecorData } from '~/composables/useDecorData';
import AdminHeroSettingsModal from '~/components/Admin/HeroSettingsModal.vue';

// 使用全域共享背景視差與底圖偵測
const { bgXSpring: bgX, bgYSpring: bgY, bgImage } = useParallax();

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

.hero-spirit-showcase {
  min-height: 10.6rem;
  max-height: 10.6rem;
  overflow: hidden;
}

.hero-spirit-content {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.hero-spirit-row {
  position: relative;
  display: flex;
  width: 100%;
  min-width: 0;
  height: 3.9rem;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: default;
}

.hero-spirit-item {
  position: relative;
  width: 2.35rem;
  height: 3.35rem;
  flex: 0 1 2.35rem;
  margin-inline: -0.25rem;
  filter: drop-shadow(0 5px 8px rgba(15, 23, 42, 0.18));
  transform: translateZ(0);
  transition:
    transform 220ms ease,
    filter 220ms ease;
}

.hero-spirit-item:hover {
  filter: drop-shadow(0 7px 12px rgba(15, 23, 42, 0.22));
  transform: translateY(-0.18rem) scale(1.08);
}

.hero-spirit-tooltip {
  position: absolute;
  top: 0.18rem;
  left: 50%;
  z-index: 40;
  max-width: calc(100% - 1.5rem);
  overflow: hidden;
  padding: 0.34rem 0.8rem;
  font-size: 0.68rem;
  font-weight: 900;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-width: 1px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, -0.25rem);
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.hero-spirit-row:hover .hero-spirit-tooltip {
  opacity: 1;
  transform: translate(-50%, 0);
}

@media (min-width: 768px) {
  .hero-spirit-showcase {
    width: min(100%, 32rem) !important;
    min-height: 6.4rem;
    max-height: 6.4rem;
    overflow: hidden;
    padding: 0.72rem 1rem;
  }

  .hero-spirit-content {
    flex-direction: row;
    justify-content: center;
    gap: 1.1rem;
  }

  .hero-spirit-row {
    width: min(100%, 14.4rem);
    max-width: 14.4rem;
    height: 4.8rem;
    flex: 1 1 0;
  }

  .hero-spirit-item {
    width: 2.75rem;
    height: 4rem;
    flex-basis: 2.75rem;
    margin-inline: -0.5rem;
  }

  .hero-spirit-tooltip {
    top: 0.36rem;
  }
}

@media (max-width: 420px) {
  .hero-spirit-showcase {
    min-height: 9.8rem;
    max-height: 9.8rem;
    padding-inline: 0.75rem;
  }

  .hero-spirit-row {
    height: 3.55rem;
  }

  .hero-spirit-item {
    width: 2.05rem;
    height: 3.05rem;
    flex-basis: 2.05rem;
    margin-inline: -0.3rem;
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
.translate-z-\[10px\] { transform: translateZ(10px); }
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
