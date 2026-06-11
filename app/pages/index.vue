<template>
  <div class="min-h-screen relative pb-20 overflow-hidden">
    <div class="relative z-10 pt-4 md:pt-8">
      <HomeBentoGrid>
          <!-- 1. Hero -->
          <template #hero>
              <HomeHeroSection :bg-x="bgXSpring" :bg-y="bgYSpring" :bg-image="bgImage" />
          </template>

          <!-- 2. Near Complete -->
          <template #near-complete>
             <HomeNearCompleteScroll 
                :categories="nearCompleteCategories" 
                :bg-x="bgXSpring"
                :bg-y="bgYSpring"
                :bg-image="bgImage"
                @select-category="goToCategory"
            />
          </template>

          <!-- 3. Missing Action -->
            <template #action-missing>
              <LiquidGlassCard 
                @click="showMissingItems" 
                :blur-value="12"
                :glass-opacity="0.2"
                :bg-x="bgXSpring"
                :bg-y="bgYSpring"
                :bg-image="bgImage"
                :magnification="1.05"
                :is-draggable="false"
                class="group h-full w-full min-h-[220px] p-6 flex flex-col items-start justify-between relative overflow-hidden rounded-[2.5rem] cursor-pointer"
              >
                   <!-- Soft Aurora Background -->
                   <div class="absolute top-[-20%] right-[-20%] w-64 h-64 bg-orange-200/40 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-300/50 transition-colors duration-700"></div>
                   <div class="absolute bottom-[-20%] left-[-20%] w-64 h-64 bg-red-100/30 rounded-full blur-2xl pointer-events-none group-hover:bg-red-200/40 transition-colors duration-700"></div>

                   <!-- Icon -->
                   <div class="bg-white/40 border border-white/60 shadow-inner w-14 h-14 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 relative z-10 mb-4 backdrop-blur-md">
                       <Icon name="lucide:help-circle" class="text-emerald-700" />
                   </div>

                   <!-- Text Content -->
                   <div class="relative z-10 space-y-1 mb-auto pointer-events-none">
                       <h3 class="readable-outline text-gray-900 text-2xl font-black tracking-tight group-hover:text-orange-700 transition-colors drop-shadow-sm">{{ $t('home.missing.title') }}</h3>
                       <p class="readable-outline text-gray-800 text-sm font-bold">{{ $t('home.missing.desc') }}</p>
                   </div>
                   
                   <!-- Count -->
                   <div class="relative z-10 mt-4 flex items-baseline gap-1.5 pointer-events-none">
                       <span class="text-4xl font-black text-orange-600 leading-none drop-shadow-md">{{ uncollectedCount }}</span>
                       <span class="readable-outline text-gray-800 text-sm font-extrabold">{{ $t('home.missing.count_suffix') }}</span>
                   </div>
              </LiquidGlassCard>
          </template>

          <!-- 4. Limited Action -->
            <template #action-limited>
              <LiquidGlassCard 
                @click="showUnobtainable" 
                :blur-value="12"
                :glass-opacity="0.2"
                :bg-x="bgXSpring"
                :bg-y="bgYSpring"
                :bg-image="bgImage"
                :magnification="1.05"
                :is-draggable="false"
                class="group h-full w-full min-h-[220px] p-6 flex flex-col items-start justify-between relative overflow-hidden rounded-[2.5rem] cursor-pointer"
              >
                  <!-- Soft Aurora Background -->
                  <div class="absolute top-[-20%] right-[-20%] w-64 h-64 bg-purple-200/40 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-300/50 transition-colors duration-700"></div>
                  <div class="absolute bottom-[-20%] left-[-20%] w-64 h-64 bg-pink-100/30 rounded-full blur-2xl pointer-events-none group-hover:bg-pink-200/40 transition-colors duration-700"></div>
                  
                  <!-- Icon -->
                   <div class="bg-white/40 border border-white/60 shadow-inner w-14 h-14 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 relative z-10 mb-4 backdrop-blur-md">
                       <Icon name="lucide:alert-circle" class="text-emerald-700" />
                   </div>

                   <!-- Text Content -->
                   <div class="relative z-10 space-y-1 mb-auto pointer-events-none">
                       <h3 class="readable-outline text-gray-900 text-2xl font-black tracking-tight group-hover:text-purple-700 transition-colors drop-shadow-sm">{{ $t('home.limited.title') }}</h3>
                       <p class="readable-outline text-gray-800 text-sm font-bold">{{ $t('home.limited.desc') }}</p>
                   </div>

                   <!-- Count -->
                   <div class="relative z-10 mt-4 flex items-baseline gap-1.5 pointer-events-none">
                       <span class="text-4xl font-black text-purple-600 leading-none drop-shadow-md">{{ limitedCount }}</span>
                       <span class="readable-outline text-gray-800 text-sm font-extrabold">{{ $t('home.limited.count_suffix') }}</span>
                   </div>
              </LiquidGlassCard>
          </template>

           <!-- 5. Map Action -->
            <template #action-map>
              <LiquidGlassCard 
                @click="router.push('/map')" 
                :blur-value="12"
                :glass-opacity="0.2"
                :bg-x="bgXSpring"
                :bg-y="bgYSpring"
                :bg-image="bgImage"
                :magnification="1.05"
                :is-draggable="false"
                class="group h-full w-full min-h-[220px] p-6 flex flex-col justify-between relative overflow-hidden rounded-[2.5rem] cursor-pointer"
              >
                   <!-- Soft Aurora Background -->
                   <div class="absolute top-[-20%] right-[-20%] w-64 h-64 bg-emerald-200/40 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-300/50 transition-colors duration-700"></div>
                   <div class="absolute bottom-[-20%] left-[-20%] w-64 h-64 bg-teal-100/30 rounded-full blur-2xl pointer-events-none group-hover:bg-teal-200/40 transition-colors duration-700"></div>
                   
                  <div class="flex items-start justify-between relative z-10 pointer-events-none">
                       <div class="bg-white/40 border border-white/60 shadow-inner backdrop-blur-md w-14 h-14 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                           <Icon name="lucide:map-pin" class="text-emerald-700 drop-shadow-sm" />
                       </div>
                  </div>

                  <div class="mt-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300 pointer-events-none">
                       <h3 class="readable-outline text-gray-900 text-2xl font-black tracking-tight drop-shadow-sm">{{ $t('home.map.title') }}</h3>
                       <p class="readable-outline text-gray-800 text-sm font-bold opacity-90 group-hover:text-emerald-800 transition-colors">{{ $t('home.map.desc') }}</p>
                  </div>
              </LiquidGlassCard>
          </template>
      </HomeBentoGrid>

      <div class="mt-6 md:mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div class="space-y-4">
          <LiquidGlassCard
            @click="router.push('/collection')"
            :blur-value="10"
            :glass-opacity="0.25"
            :bg-x="bgXSpring"
            :bg-y="bgYSpring"
            :bg-image="bgImage"
            :magnification="1.02"
            :is-draggable="false"
            class="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-[1.5rem] cursor-pointer hover:scale-[1.02] transition-transform duration-300 group"
          >
            <span class="text-2xl group-hover:scale-110 transition-transform">📖</span>
            <span class="readable-outline text-gray-900 font-extrabold tracking-wide drop-shadow-sm">{{ $t('home.actions.browse_collection') }}</span>
          </LiquidGlassCard>
          <LiquidGlassCard
            @click="router.push('/map')"
            :blur-value="10"
            :glass-opacity="0.25"
            :bg-x="bgXSpring"
            :bg-y="bgYSpring"
            :bg-image="bgImage"
            :magnification="1.02"
            :is-draggable="false"
            class="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-[1.5rem] cursor-pointer hover:scale-[1.02] transition-transform duration-300 group"
          >
            <span class="text-2xl group-hover:scale-110 transition-transform">🗺️</span>
            <span class="readable-outline text-gray-900 font-extrabold tracking-wide drop-shadow-sm">{{ $t('home.actions.open_map') }}</span>
          </LiquidGlassCard>
        </div>

        <LiquidGlassCard 
          :blur-value="16"
          :glass-opacity="0.2"
          :bg-x="bgXSpring"
          :bg-y="bgYSpring"
          :bg-image="bgImage"
          :magnification="1.05"
          :is-draggable="false"
          class="rounded-3xl p-6 relative overflow-hidden"
        >
          <div class="flex items-center gap-3 mb-4 relative z-10 pointer-events-none">
            <div class="bg-white/40 border border-white/60 shadow-inner w-12 h-12 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-md">💡</div>
            <div>
              <h3 class="readable-outline text-gray-900 text-lg font-extrabold drop-shadow-sm">{{ $t('home.tips.title') }}</h3>
              <p class="readable-outline text-gray-700 text-xs font-bold">{{ $t('home.tips.subtitle') }}</p>
            </div>
          </div>
          <ul class="space-y-3 text-sm text-gray-800 font-bold relative z-10 pointer-events-none">
            <li class="flex items-start gap-2">
              <span class="text-emerald-600 font-black mt-0.5">✓</span>
              <span class="readable-outline drop-shadow-sm">{{ $t('home.tips.tip1') }}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-emerald-600 font-black mt-0.5">✓</span>
              <span class="readable-outline drop-shadow-sm">{{ $t('home.tips.tip2') }}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-emerald-600 font-black mt-0.5">✓</span>
              <span class="readable-outline drop-shadow-sm">{{ $t('home.tips.tip3') }}</span>
            </li>
          </ul>
        </LiquidGlassCard>
      </div>
      
      <!-- Footer Buttons (Pikmin Type, etc) - keeping them simple below for now or integrating better later -->
    </div>

    <!-- Modals (Pikmin Type, etc) -->

    <!-- Pikmin Type Selection Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div 
          v-if="showPikminModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          @click.self="showPikminModal = false"
        >
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-4"
          >
            <LiquidGlassCard 
              v-if="showPikminModal" 
              :blur-value="24"
              :glass-opacity="0.3"
              :bg-x="bgXSpring"
              :bg-y="bgYSpring"
              :bg-image="bgImage"
              :magnification="1.1"
              :is-draggable="false"
              class="rounded-[2rem] p-6 max-w-md w-full relative overflow-hidden"
              @click.stop
            >
                <!-- Decorative background -->
                <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-100/50 to-transparent rounded-bl-full opacity-50 -z-10 pointer-events-none"></div>

              <div class="flex items-center justify-between mb-6 relative z-10">
                <h3 class="text-xl font-extrabold text-gray-900 flex items-center gap-2 drop-shadow-sm">
                  <span class="text-2xl">🌈</span> {{ $t('home.modal.select_type') }}
                </h3>
                <button 
                    @click="showPikminModal = false" 
                    class="bg-white/30 border border-white/50 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/50 transition-colors shadow-sm"
                >
                    <Icon name="ion:close" class="text-xl text-gray-800" />
                </button>
              </div>
              
              <div class="grid grid-cols-4 gap-3 relative z-10">
                <button 
                  v-for="type in PIKMIN_TYPES" 
                  :key="type"
                  @click="goToPikminType(type)"
                  class="bg-white/20 backdrop-blur-md flex flex-col items-center gap-2 p-3 rounded-2xl border border-white/50 hover:border-emerald-300 hover:bg-white/40 transition-all shadow-sm hover:shadow-lg hover:shadow-emerald-500/20 group"
                >
                  <div 
                    class="w-10 h-10 rounded-full shadow-md group-hover:scale-110 transition-transform border-2 border-white/50"
                    :class="PIKMIN_TYPE_COLORS[type]"
                  ></div>
                  <span class="text-[10px] font-extrabold text-gray-800 group-hover:text-emerald-800 drop-shadow-sm">{{ $t('pikmin_types.' + type ) }}</span>
                  <span class="text-[10px] font-bold text-gray-600 group-hover:text-emerald-700">{{ getPikminTypePercentage(type) }}%</span>
                </button>
              </div>
            </LiquidGlassCard>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { PIKMIN_TYPES, PIKMIN_TYPE_NAMES, PIKMIN_TYPE_COLORS, type PikminType } from '~/types/decor';

const { t, locale } = useI18n();

const router = useRouter();
const { getStats } = useCollection();
const { getDecorDefinitions } = useDecorData();

// 使用全域共享背景視察與底圖偵測
const { bgXSpring, bgYSpring, bgImage } = useParallax();

// Stats
const stats = computed(() => getStats());

// Modal states
const showPikminModal = ref(false);

// 1. Uncollected Count
const uncollectedCount = computed(() => {
  return stats.value.total - stats.value.collected;
});

// 2. Limited Items Count (regional + special)
const limitedCount = computed(() => {
  const regional = stats.value.byCategoryType['regional']?.total || 0;
  const special = stats.value.byCategoryType['special']?.total || 0;
  return regional + special;
});

// 3. Near Complete Categories (70-99% complete)
const nearCompleteCategories = computed(() => {
  const definitions = getDecorDefinitions();
  const results: Array<{
    id: string;
    name: string;
    icon: string;
    collected: number;
    total: number;
    remaining: number;
    percentage: number;
  }> = [];

  definitions.forEach(def => {
    const catStats = stats.value.byCategory[def.category.id];
    if (!catStats || catStats.total === 0) return;
    
    // Calculate percentage
    const percentage = Math.round((catStats.collected / catStats.total) * 100);
    const remaining = catStats.total - catStats.collected;
    
    // Find a representative icon (Red Pikmin of the first variant)
    let iconUrl = '';
    if (def.variants.length > 0) {
        const firstVar = def.variants[0];
        // Try Red first, then fallback to any available
        if ((firstVar as any).imageUrls?.['red']) {
            iconUrl = (firstVar as any).imageUrls['red'];
        } else if ((firstVar as any).imageUrl) {
            iconUrl = (firstVar as any).imageUrl;
        }
    }

    // Condition: 70% to 99% collected, and at least 1 remaining
    if (percentage >= 70 && percentage < 100 && remaining > 0) {
      results.push({
        id: def.category.id,
        name: locale.value === 'en' ? def.category.nameEn : def.category.name,
        // If we found an image URL, use it. Otherwise fallback to Notomoji without 'lucide:' prefix
        icon: iconUrl || (def.category.icon || 'fluent-emoji:package'), 
        collected: catStats.collected,
        total: catStats.total,
        remaining,
        percentage,
      });
    }
  });

  // Sort by percentage (highest first) and take top 6
  return results.sort((a, b) => b.percentage - a.percentage).slice(0, 6);
});

const getPikminTypePercentage = (type: PikminType): number => {
  const data = stats.value.byPikminType[type];
  if (!data || data.total === 0) return 0;
  return Math.round((data.collected / data.total) * 100);
};

// Navigation Actions
const showMissingItems = () => {
  router.push({ path: '/collection', query: { status: 'uncollected' } });
};

const showUnobtainable = () => {
  router.push({ path: '/collection', query: { limited: 'true' } });
};

const goToPikminType = (type: PikminType) => {
  showPikminModal.value = false;
  router.push({ path: '/collection', query: { pikmin: type } });
};

const goToCategory = (categoryId: string) => {
  router.push({ path: '/collection', query: { category: categoryId } });
};
</script>
