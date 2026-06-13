<template>
  <!-- 3D Container -->
  <div
    ref="heroContainer"
    class="home-hero-section relative h-full w-full px-2 py-12 sm:px-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-10 overflow-visible perspective-1000"
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
      <div class="hero-motion-item inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/45 backdrop-blur-md border border-white/80 text-[#0a5c43] text-xs font-display font-bold uppercase tracking-[0.08em] mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:scale-105 transition-transform cursor-default">
        <span class="w-2.5 h-2.5 rounded-full bg-[#00be83]"></span>
        {{ $t('hero.badge') }}
      </div>

      <h1 class="hero-motion-item home-hero-title text-5xl md:text-7xl font-black text-gray-800 leading-[0.9] mb-6 tracking-tighter drop-shadow-sm">
        <span class="whitespace-nowrap">{{ $t('hero.title.prefix') }}</span> <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-lime-500 bg-300% animate-gradient whitespace-nowrap inline-block">
          {{ $t('hero.title.suffix') }}
        </span>
      </h1>

      <p class="hero-motion-item home-hero-subtitle text-gray-600 text-lg md:text-xl max-w-md mx-auto md:mx-0 leading-relaxed font-medium mb-12">
        {{ $t('hero.subtitle.line1') }}<br />
        {{ $t('hero.subtitle.line2') }}
      </p>

       <!-- Interactive & Tracker Unified Container -->
       <div class="home-hero-stack flex flex-col items-stretch w-full sm:w-[100%] md:w-[100%] mx-auto md:mx-0 mt-8 gap-3 md:gap-4 relative z-10">

            <!-- Interactive Pikmin Spirits -->
            <section class="hero-motion-item pikmin-stage-card">
                <!-- Admin Settings Button -->
                <button v-if="isAdmin" @click.stop="showSettingsModal = true" class="pikmin-stage-settings" aria-label="Hero settings">
                   <Icon name="lucide:settings" class="w-4 h-4" />
                </button>

                <div class="pikmin-stage-header">
                  <div>
                    <span class="pikmin-stage-kicker">Featured decor</span>
                    <strong>活動皮克敏展示</strong>
                  </div>
                  <span class="pikmin-stage-count">{{ totalFeaturedSpirits }} 隻</span>
                </div>

                <div class="pikmin-stage-rows">
                  <div class="pikmin-lane pikmin-lane-valentine">
                    <div class="pikmin-lane-meta">
                      <span>{{ row1CategoryName }}</span>
                      <small>{{ valentineSpirits.length }} 種類</small>
                    </div>
                    <div class="pikmin-lane-track">
                      <div
                        v-for="(pikmin, index) in valentineSpirits"
                        :key="pikmin.id"
                        class="pikmin-stage-item"
                        :title="pikmin.name"
                      >
                        <img :src="pikmin.image" :alt="pikmin.name" />
                      </div>
                    </div>
                  </div>

                  <div class="pikmin-lane pikmin-lane-powder">
                    <div class="pikmin-lane-meta">
                      <span>{{ row2CategoryName }}</span>
                      <small>{{ powderSpirits.length }} 種類</small>
                    </div>
                    <div class="pikmin-lane-track">
                      <div
                        v-for="(pikmin, index) in powderSpirits"
                        :key="pikmin.id"
                        class="pikmin-stage-item"
                        :title="pikmin.name"
                      >
                        <img :src="pikmin.image" :alt="pikmin.name" />
                      </div>
                    </div>
                  </div>
               </div>
            </section>

            <!-- Missing Tracker Badge -->
            <button @click="showMissingModal = true" class="hero-motion-item missing-summary-card group">

               <div class="missing-summary-title">
                  <span class="missing-summary-icon">
                    <Icon name="lucide:search" />
                  </span>
                  <span>本月皮克敏還少了</span>
               </div>

               <div v-if="missingValentine.length > 0 || missingPowder.length > 0" class="missing-summary-badges">
                   <span v-if="missingValentine.length > 0" class="missing-summary-badge missing-summary-badge-pink">
                     貼紙 <span class="bg-white rounded-full px-1.5 text-pink-800 shadow-sm">{{ missingValentine.length }}</span>
                   </span>
                   <span v-if="missingPowder.length > 0" class="missing-summary-badge missing-summary-badge-indigo">
                     粉末 <span class="bg-white rounded-full px-1.5 text-indigo-800 shadow-sm">{{ missingPowder.length }}</span>
                   </span>
               </div>
               <span v-else class="missing-summary-complete">
                 近期活動收集完畢
               </span>

               <span v-if="missingValentine.length > 0 || missingPowder.length > 0" class="missing-summary-link">點擊查看缺誰</span>
            </button>
       </div>
    </div>

    <!-- Right Content: Floating 3D Stats Core -->
    <div class="relative z-20 w-auto perspective-1000">
        <div
            class="relative w-72 h-72 md:w-96 md:h-96 transition-transform duration-100 ease-out preserve-3d cursor-pointer"
            :style="cardStyle"
            @click="enableDeviceTilt"
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuthStore } from '~/composables/useAuthStore';
import { useSiteConfig } from '~/composables/useSiteConfig';
import { useDecorData } from '~/composables/useDecorData';
import AdminHeroSettingsModal from '~/components/Admin/HeroSettingsModal.vue';

const { locale } = useI18n();
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
let heroMotionContext: ReturnType<typeof gsap.context> | null = null;
let heroMotionMatchMedia: ReturnType<typeof gsap.matchMedia> | null = null;

onMounted(async () => {
    await fetchHeroConfig();
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
        addDeviceOrientationListener();
    }
    await nextTick();
    initHeroMotion();
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

// Filtered missing counts
const missingValentine = computed(() => {
    return valentineSpirits.value.filter(spirit => !isCollected(spirit.id));
});

const missingPowder = computed(() => {
    return powderSpirits.value.filter(spirit => !isCollected(spirit.id));
});

const totalFeaturedSpirits = computed(() => valentineSpirits.value.length + powderSpirits.value.length);

const initHeroMotion = () => {
    if (!heroContainer.value || typeof window === 'undefined') return;

    heroMotionContext?.revert();
    heroMotionMatchMedia?.revert();
    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    heroMotionContext = gsap.context(() => {
        const items = gsap.utils.toArray<HTMLElement>('.hero-motion-item');
        const pikminItems = gsap.utils.toArray<HTMLElement>('.pikmin-stage-item');

        if (reduceMotion) {
            gsap.set([...items, ...pikminItems], { clearProps: 'all' });
            return;
        }

        const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } });

        entrance
            .from(items, {
                y: 18,
                opacity: 0,
                duration: 0.72,
                stagger: 0.08,
                clearProps: 'transform,opacity',
            })
            .from(pikminItems, {
                y: 12,
                opacity: 0,
                scale: 0.92,
                duration: 0.42,
                stagger: {
                    each: 0.025,
                    from: 'center',
                },
                clearProps: 'transform,opacity',
            }, '-=0.18');

        heroMotionMatchMedia = gsap.matchMedia();

        heroMotionMatchMedia.add('(min-width: 768px)', () => {
            const story = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: '.home-hero-stack',
                    start: 'top 18%',
                    end: '+=760',
                    scrub: 0.85,
                    pin: true,
                    anticipatePin: 1,
                },
            });

            story
                .addLabel('establish')
                .to('.pikmin-stage-card', { scale: 1, y: 0, duration: 0.4 })
                .addLabel('focus-first-event')
                .to('.pikmin-lane-powder', { opacity: 0.44, scale: 0.985, duration: 1 })
                .to('.pikmin-lane-valentine', { scale: 1.025, y: -2, duration: 1 }, '<')
                .to('.missing-summary-card', { opacity: 0.62, scale: 0.985, duration: 1 }, '<')
                .addLabel('focus-second-event')
                .to('.pikmin-lane-valentine', { opacity: 0.46, scale: 0.985, y: 0, duration: 1 })
                .to('.pikmin-lane-powder', { opacity: 1, scale: 1.025, y: -2, duration: 1 }, '<')
                .addLabel('resolve-missing')
                .to('.pikmin-lane', { opacity: 1, scale: 1, y: 0, duration: 0.8 })
                .to('.missing-summary-card', { opacity: 1, scale: 1.025, y: -4, duration: 0.8 }, '<')
                .to('.missing-summary-card', { scale: 1, y: 0, duration: 0.35 });
        });

        heroMotionMatchMedia.add('(max-width: 767px)', () => {
            const focusLane = (active: '.pikmin-lane-valentine' | '.pikmin-lane-powder' | '.missing-summary-card') => {
                const allTargets = ['.pikmin-lane-valentine', '.pikmin-lane-powder', '.missing-summary-card'];
                allTargets.forEach((target) => {
                    const isActive = target === active;
                    gsap.to(target, {
                        opacity: isActive ? 1 : 0.68,
                        scale: isActive ? 1.012 : 0.992,
                        duration: 0.32,
                        ease: 'power2.out',
                        overwrite: true,
                    });
                });
            };

            const resetFocus = () => {
                gsap.to(['.pikmin-lane-valentine', '.pikmin-lane-powder', '.missing-summary-card'], {
                    opacity: 1,
                    scale: 1,
                    duration: 0.28,
                    ease: 'power2.out',
                    overwrite: true,
                });
            };

            ScrollTrigger.create({
                trigger: '.pikmin-lane-valentine',
                start: 'top 62%',
                end: 'bottom 38%',
                onEnter: () => focusLane('.pikmin-lane-valentine'),
                onEnterBack: () => focusLane('.pikmin-lane-valentine'),
                onLeaveBack: resetFocus,
            });

            ScrollTrigger.create({
                trigger: '.pikmin-lane-powder',
                start: 'top 62%',
                end: 'bottom 38%',
                onEnter: () => focusLane('.pikmin-lane-powder'),
                onEnterBack: () => focusLane('.pikmin-lane-powder'),
            });

            ScrollTrigger.create({
                trigger: '.missing-summary-card',
                start: 'top 68%',
                end: 'bottom 36%',
                onEnter: () => focusLane('.missing-summary-card'),
                onEnterBack: () => focusLane('.missing-summary-card'),
                onLeave: resetFocus,
            });
        });
    }, heroContainer.value);
};

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
    heroMotionMatchMedia?.revert();
    heroMotionMatchMedia = null;
    heroMotionContext?.revert();
    heroMotionContext = null;
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
.preserve-3d {
    transform-style: preserve-3d;
}
.translate-z-\[-20px\] { transform: translateZ(-20px); }
.translate-z-\[0px\] { transform: translateZ(0px); }
.translate-z-\[20px\] { transform: translateZ(20px); }
.translate-z-\[25px\] { transform: translateZ(25px); }
.translate-z-\[30px\] { transform: translateZ(30px); }
.translate-z-\[40px\] { transform: translateZ(40px); }

.home-hero-stack {
    max-width: 38rem;
}

.pikmin-stage-card {
    position: relative;
    width: 100%;
    overflow: hidden;
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.78);
    border-radius: 2rem;
    background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.62), rgba(236, 253, 245, 0.54)),
        rgba(255, 255, 255, 0.46);
    box-shadow:
        0 14px 34px rgba(16, 122, 92, 0.12),
        0 1px 0 rgba(255, 255, 255, 0.86) inset;
    backdrop-filter: blur(7px);
    -webkit-backdrop-filter: blur(7px);
}

.pikmin-stage-card::before {
    position: absolute;
    inset: 0.45rem;
    content: "";
    pointer-events: none;
    border: 1px solid rgba(255, 255, 255, 0.56);
    border-radius: 1.55rem;
}

.pikmin-stage-settings {
    position: absolute;
    top: 0.85rem;
    right: 0.85rem;
    z-index: 5;
    display: inline-flex;
    width: 2.45rem;
    height: 2.45rem;
    align-items: center;
    justify-content: center;
    color: #047857;
    border: 1px solid rgba(255, 255, 255, 0.78);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.72);
    box-shadow: 0 8px 18px rgba(6, 95, 70, 0.12);
    transition: transform 220ms ease, background 220ms ease, color 220ms ease;
}

.pikmin-stage-settings:hover {
    color: #005f4e;
    background: rgba(255, 255, 255, 0.92);
    transform: translateY(-1px) scale(1.03);
}

.pikmin-stage-header {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.85rem;
    padding-inline: 0.25rem 2.6rem;
    color: #064e3b;
}

.pikmin-stage-header strong {
    display: block;
    font-size: 1rem;
    font-weight: 900;
    line-height: 1.2;
    letter-spacing: 0.01em;
}

.pikmin-stage-kicker {
    display: block;
    margin-bottom: 0.12rem;
    color: rgba(5, 95, 70, 0.58);
    font-size: 0.66rem;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.pikmin-stage-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 3.25rem;
    padding: 0.32rem 0.65rem;
    color: #047857;
    border: 1px solid rgba(16, 185, 129, 0.18);
    border-radius: 999px;
    background: rgba(236, 253, 245, 0.78);
    font-size: 0.78rem;
    font-weight: 900;
    white-space: nowrap;
}

.pikmin-stage-rows {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 0.65rem;
}

.pikmin-lane {
    display: grid;
    grid-template-columns: 5.7rem minmax(0, 1fr);
    align-items: center;
    gap: 0.75rem;
    min-height: 4.2rem;
    padding: 0.55rem 0.7rem;
    border: 1px solid rgba(255, 255, 255, 0.66);
    border-radius: 1.35rem;
    background: rgba(255, 255, 255, 0.42);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.66) inset;
}

.pikmin-lane-meta {
    min-width: 0;
    color: #0f172a;
    text-align: left;
}

.pikmin-lane-meta span,
.pikmin-lane-meta small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.pikmin-lane-meta span {
    font-size: 0.82rem;
    font-weight: 900;
    line-height: 1.2;
}

.pikmin-lane-meta small {
    margin-top: 0.18rem;
    color: #64748b;
    font-size: 0.68rem;
    font-weight: 800;
}

.pikmin-lane-track {
    display: flex;
    min-width: 0;
    align-items: flex-end;
    justify-content: center;
    gap: clamp(0.1rem, 1vw, 0.35rem);
}

.pikmin-stage-item {
    position: relative;
    display: flex;
    width: clamp(1.62rem, 6.5vw, 2.35rem);
    height: clamp(2.35rem, 8.6vw, 3.35rem);
    flex: 0 1 auto;
    align-items: flex-end;
    justify-content: center;
    filter: drop-shadow(0 7px 8px rgba(15, 23, 42, 0.13));
    transform-origin: bottom center;
    transition: transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1), filter 260ms ease;
}

.pikmin-stage-item img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none;
}

.pikmin-stage-item:hover {
    z-index: 4;
    filter: drop-shadow(0 11px 10px rgba(15, 23, 42, 0.18));
    transform: translateY(-0.38rem) scale(1.12);
}

.missing-summary-card {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.8rem 1rem;
    width: 100%;
    min-height: 5.6rem;
    padding: 1rem 1.15rem;
    overflow: hidden;
    color: #064e3b;
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 1.75rem;
    background: #e7f9ec;
    box-shadow:
        0 10px 22px rgba(16, 122, 92, 0.11),
        0 1px 0 rgba(255, 255, 255, 0.78) inset;
    text-align: left;
    transition: transform 220ms ease, background 220ms ease, box-shadow 220ms ease;
}

.missing-summary-card:hover {
    background: #def6e7;
    box-shadow:
        0 14px 26px rgba(16, 122, 92, 0.14),
        0 1px 0 rgba(255, 255, 255, 0.86) inset;
    transform: translateY(-2px);
}

.missing-summary-title {
    display: inline-flex;
    min-width: 0;
    align-items: center;
    gap: 0.7rem;
    color: #1f2937;
    font-size: 1rem;
    font-weight: 900;
}

.missing-summary-icon {
    display: inline-flex;
    width: 2.25rem;
    height: 2.25rem;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    color: #008c72;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.62);
    font-size: 1.25rem;
}

.missing-summary-badges {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.45rem;
}

.missing-summary-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.42rem;
    padding: 0.34rem 0.7rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 900;
    white-space: nowrap;
}

.missing-summary-badge-pink {
    color: #be185d;
    border: 1px solid rgba(244, 114, 182, 0.32);
    background: rgba(252, 231, 243, 0.86);
}

.missing-summary-badge-indigo {
    color: #4338ca;
    border: 1px solid rgba(129, 140, 248, 0.3);
    background: rgba(224, 231, 255, 0.88);
}

.missing-summary-complete {
    justify-self: end;
    color: #047857;
    font-size: 0.9rem;
    font-weight: 900;
}

.missing-summary-link {
    grid-column: 1 / -1;
    justify-self: center;
    color: #008c72;
    border-bottom: 1px solid currentColor;
    font-size: 0.86rem;
    font-weight: 900;
    line-height: 1.2;
}

@media (max-width: 520px) {
    .home-hero-section {
        min-height: auto;
        justify-content: flex-start;
        padding-top: 2rem;
        padding-bottom: 1.25rem;
        gap: 2.75rem;
    }

    .home-hero-title {
        font-size: clamp(3.2rem, 14.8vw, 4.65rem);
        letter-spacing: -0.035em;
        margin-bottom: 1.6rem;
    }

    .home-hero-subtitle {
        margin-bottom: 2.25rem;
        font-size: 1.15rem;
        line-height: 1.72;
        font-weight: 700;
    }

    .home-hero-stack {
        max-width: 100%;
        gap: 1rem;
    }

    .pikmin-stage-card {
        padding: 0.9rem;
        border-radius: 1.75rem;
    }

    .pikmin-stage-card::before {
        inset: 0.38rem;
        border-radius: 1.38rem;
    }

    .pikmin-stage-header {
        margin-bottom: 0.75rem;
        padding-inline: 0.2rem 2.65rem;
    }

    .pikmin-stage-rows {
        gap: 0.55rem;
    }

    .pikmin-lane {
        grid-template-columns: 4.65rem minmax(0, 1fr);
        gap: 0.52rem;
        min-height: 4rem;
        padding: 0.5rem 0.55rem;
        border-radius: 1.18rem;
    }

    .pikmin-lane-meta span {
        font-size: 0.74rem;
    }

    .pikmin-lane-meta small {
        font-size: 0.62rem;
    }

    .pikmin-stage-item {
        width: clamp(1.35rem, 6vw, 1.9rem);
        height: clamp(2rem, 8vw, 2.8rem);
    }

    .missing-summary-card {
        grid-template-columns: 1fr;
        justify-items: center;
        min-height: auto;
        padding: 1rem;
        text-align: center;
        border-radius: 1.55rem;
    }

    .missing-summary-badges {
        justify-content: center;
    }

    .missing-summary-complete {
        justify-self: center;
    }
}

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
