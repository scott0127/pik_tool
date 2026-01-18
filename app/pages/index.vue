<template>
  <div class="min-h-screen relative pb-20">

    <div class="relative z-10 pt-4 md:pt-8">
      <HomeBentoGrid>
          <!-- 1. Hero -->
          <template #hero>
              <HomeHeroSection />
          </template>

          <!-- 2. Near Complete -->
          <template #near-complete>
             <HomeNearCompleteScroll 
                :categories="nearCompleteCategories" 
                @select-category="goToCategory"
            />
          </template>

          <!-- 3. Missing Action -->
            <template #action-missing>
              <div @click="showMissingItems" class="group h-full w-full min-h-[220px] p-6 flex flex-col items-start justify-between relative overflow-hidden bg-white/60 backdrop-blur-md rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border-2 border-white/60 hover:border-orange-200">
                   <!-- Soft Aurora Background -->
                   <div class="absolute top-[-20%] right-[-20%] w-64 h-64 bg-orange-200/40 rounded-full blur-[80px] pointer-events-none group-hover:bg-orange-300/50 transition-colors duration-700"></div>
                   <div class="absolute bottom-[-20%] left-[-20%] w-64 h-64 bg-red-100/40 rounded-full blur-[80px] pointer-events-none group-hover:bg-red-200/50 transition-colors duration-700"></div>

                   <!-- Icon -->
                   <div class="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-3xl shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform duration-300 relative z-10 mb-4">
                       <Icon name="lucide:help-circle" class="text-white" />
                   </div>

                   <!-- Text Content -->
                   <div class="relative z-10 space-y-1 mb-auto">
                       <h3 class="text-2xl font-black text-gray-800 tracking-tight group-hover:text-orange-600 transition-colors">{{ $t('home.missing.title') }}</h3>
                       <p class="text-sm text-gray-500 font-medium">{{ $t('home.missing.desc') }}</p>
                   </div>
                   
                   <!-- Count -->
                   <div class="relative z-10 mt-4 flex items-baseline gap-1.5">
                       <span class="text-4xl font-black text-orange-500 leading-none">{{ uncollectedCount }}</span>
                       <span class="text-sm font-bold text-gray-400">{{ $t('home.missing.count_suffix') }}</span>
                   </div>
              </div>
          </template>

          <!-- 4. Limited Action -->
            <template #action-limited>
              <div @click="showUnobtainable" class="group h-full w-full min-h-[220px] p-6 flex flex-col items-start justify-between relative overflow-hidden bg-white/60 backdrop-blur-md rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border-2 border-white/60 hover:border-purple-200">
                  <!-- Soft Aurora Background -->
                  <div class="absolute top-[-20%] right-[-20%] w-64 h-64 bg-purple-200/40 rounded-full blur-[80px] pointer-events-none group-hover:bg-purple-300/50 transition-colors duration-700"></div>
                  <div class="absolute bottom-[-20%] left-[-20%] w-64 h-64 bg-pink-100/40 rounded-full blur-[80px] pointer-events-none group-hover:bg-pink-200/50 transition-colors duration-700"></div>
                  
                  <!-- Icon -->
                   <div class="w-14 h-14 rounded-2xl bg-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform duration-300 relative z-10 mb-4">
                       <Icon name="lucide:alert-circle" class="text-white" />
                   </div>

                   <!-- Text Content -->
                   <div class="relative z-10 space-y-1 mb-auto">
                       <h3 class="text-2xl font-black text-gray-800 tracking-tight group-hover:text-purple-600 transition-colors">{{ $t('home.limited.title') }}</h3>
                       <p class="text-sm text-gray-500 font-medium">{{ $t('home.limited.desc') }}</p>
                   </div>

                   <!-- Count -->
                   <div class="relative z-10 mt-4 flex items-baseline gap-1.5">
                       <span class="text-4xl font-black text-purple-500 leading-none">{{ limitedCount }}</span>
                       <span class="text-sm font-bold text-gray-400">{{ $t('home.limited.count_suffix') }}</span>
                   </div>
              </div>
          </template>

           <!-- 5. Map Action -->
            <template #action-map>
              <div @click="router.push('/map')" class="group h-full w-full min-h-[220px] p-6 flex flex-col justify-between relative overflow-hidden bg-white/60 backdrop-blur-md rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border-2 border-white/60 hover:border-emerald-200">
                   <!-- Soft Aurora Background -->
                   <div class="absolute top-[-20%] right-[-20%] w-64 h-64 bg-emerald-200/40 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-300/50 transition-colors duration-700"></div>
                   <div class="absolute bottom-[-20%] left-[-20%] w-64 h-64 bg-teal-100/40 rounded-full blur-[80px] pointer-events-none group-hover:bg-teal-200/50 transition-colors duration-700"></div>
                   
                  <div class="flex items-start justify-between relative z-10">
                       <div class="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center text-3xl shadow-sm border border-white/50 group-hover:scale-110 transition-transform duration-300">
                           <Icon name="lucide:map-pin" class="text-emerald-500 drop-shadow-sm" />
                       </div>
                  </div>

                  <div class="mt-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300">
                       <h3 class="text-2xl font-black text-gray-800 tracking-tight">{{ $t('home.map.title') }}</h3>
                       <p class="text-sm text-gray-500 font-medium opacity-90 group-hover:text-emerald-600 transition-colors">{{ $t('home.map.desc') }}</p>
                  </div>
              </div>
          </template>
      </HomeBentoGrid>

      <div class="mt-6 md:mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div class="space-y-3">
          <button
            @click="router.push('/collection')"
            class="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            <span class="text-xl">📖</span>
            <span>{{ $t('home.actions.browse_collection') }}</span>
          </button>
          <button
            @click="router.push('/map')"
            class="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            <span class="text-xl">🗺️</span>
            <span>{{ $t('home.actions.open_map') }}</span>
          </button>
        </div>

        <div class="bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border-2 border-white/60">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl">💡</div>
            <div>
              <h3 class="text-lg font-extrabold text-gray-800">{{ $t('home.tips.title') }}</h3>
              <p class="text-xs text-gray-500">{{ $t('home.tips.subtitle') }}</p>
            </div>
          </div>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-start gap-2">
              <span class="text-emerald-500 mt-0.5">✓</span>
              <span>{{ $t('home.tips.tip1') }}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-emerald-500 mt-0.5">✓</span>
              <span>{{ $t('home.tips.tip2') }}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-emerald-500 mt-0.5">✓</span>
              <span>{{ $t('home.tips.tip3') }}</span>
            </li>
          </ul>
        </div>
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
            <div v-if="showPikminModal" class="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full relative overflow-hidden">
                <!-- Decorative background -->
                <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-100 to-transparent rounded-bl-full opacity-50 -z-10"></div>

              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span class="text-2xl">🌈</span> {{ $t('home.modal.select_type') }}
                </h3>
                <button 
                    @click="showPikminModal = false" 
                    class="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                    <Icon name="ion:close" class="text-xl text-gray-500" />
                </button>
              </div>
              
              <div class="grid grid-cols-4 gap-3">
                <button 
                  v-for="type in PIKMIN_TYPES" 
                  :key="type"
                  @click="goToPikminType(type)"
                  class="flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border-2 border-transparent hover:border-emerald-200 transition-all hover:shadow-md group"
                >
                  <div 
                    class="w-10 h-10 rounded-full shadow-sm group-hover:scale-110 transition-transform"
                    :class="PIKMIN_TYPE_COLORS[type]"
                  ></div>
                  <span class="text-[10px] font-bold text-gray-600 group-hover:text-emerald-700">{{ $t('pikmin_types.' + type ) }}</span>
                  <span class="text-[10px] font-medium text-gray-400 group-hover:text-emerald-500">{{ getPikminTypePercentage(type) }}%</span>
                </button>
              </div>
            </div>
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
```
