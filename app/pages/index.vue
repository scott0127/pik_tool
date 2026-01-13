<template>
  <div class="space-y-8 pb-8">
    <!-- Hero Section -->
    <section class="relative text-center py-10 overflow-hidden">
      <!-- Background decorations -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <span class="leaf-decoration top-4 left-[10%] sway text-5xl">🌿</span>
        <span class="leaf-decoration top-8 right-[15%] sway text-4xl" style="animation-delay: 0.5s">🍃</span>
        <span class="leaf-decoration bottom-4 left-[20%] sway text-3xl" style="animation-delay: 1s">🌱</span>
        <span class="leaf-decoration bottom-8 right-[10%] float text-4xl">🌸</span>
      </div>

      <!-- Main content -->
      <div class="relative z-10">
        <div class="inline-block mb-4">
          <div class="relative">
            <div class="w-20 h-20 bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-500 rounded-[1.5rem] shadow-2xl flex items-center justify-center float glow-emerald">
              <span class="text-4xl">🌱</span>
            </div>
            <span class="absolute -top-1 -right-1 text-xl sparkle">✨</span>
          </div>
        </div>
        
        <h1 class="text-3xl md:text-4xl font-extrabold mb-3">
          <span class="text-gradient">Pikmin Bloom</span>
          <span class="text-gray-700"> 飾品圖鑑</span>
        </h1>
        
        <p class="text-gray-500 text-base max-w-md mx-auto">
          追蹤你的皮克敏飾品蒐集進度，成為圖鑑大師！
        </p>
      </div>
    </section>

    <!-- ⭐ 四大功能按鈕區 -->
    <section class="max-w-4xl mx-auto">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 1. 我還缺什麼 -->
        <button 
          @click="showMissingItems"
          class="glass rounded-2xl p-5 text-left transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group"
        >
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
            <span class="text-2xl">❓</span>
          </div>
          <h3 class="font-bold text-gray-800 mb-1">我還缺什麼？</h3>
          <p class="text-sm text-gray-500 mb-2">快速找到未蒐集飾品</p>
          <div class="flex items-center gap-2">
            <span class="text-2xl font-extrabold text-orange-500">{{ uncollectedCount }}</span>
            <span class="text-xs text-gray-400">件未蒐集</span>
          </div>
        </button>

        <!-- 2. 無法取得的飾品 -->
        <button 
          @click="showUnobtainable"
          class="glass rounded-2xl p-5 text-left transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group"
        >
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
            <span class="text-2xl">🔒</span>
          </div>
          <h3 class="font-bold text-gray-800 mb-1">無法取得？</h3>
          <p class="text-sm text-gray-500 mb-2">地區/活動限定飾品</p>
          <div class="flex items-center gap-2">
            <span class="text-2xl font-extrabold text-purple-500">{{ limitedCount }}</span>
            <span class="text-xs text-gray-400">件限定飾品</span>
          </div>
        </button>

        <!-- 3. 即將完成 -->
        <button 
          @click="showNearComplete"
          class="glass rounded-2xl p-5 text-left transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group"
        >
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
            <span class="text-2xl">🎯</span>
          </div>
          <h3 class="font-bold text-gray-800 mb-1">即將完成！</h3>
          <p class="text-sm text-gray-500 mb-2">差一點就完成的類別</p>
          <div class="flex items-center gap-2">
            <span class="text-2xl font-extrabold text-emerald-500">{{ nearCompleteCategories.length }}</span>
            <span class="text-xs text-gray-400">個類別快完成</span>
          </div>
        </button>

        <!-- 4. 按皮克敏查看 -->
        <button 
          @click="showPikminModal = true"
          class="glass rounded-2xl p-5 text-left transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group"
        >
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
            <span class="text-2xl">🌈</span>
          </div>
          <h3 class="font-bold text-gray-800 mb-1">按類型查看</h3>
          <p class="text-sm text-gray-500 mb-2">選擇皮克敏類型篩選</p>
          <div class="flex items-center gap-1">
            <div 
              v-for="type in PIKMIN_TYPES.slice(0, 5)" 
              :key="type"
              class="w-5 h-5 rounded-full shadow-sm"
              :class="PIKMIN_TYPE_COLORS[type]"
            ></div>
            <span class="text-xs text-gray-400 ml-1">+{{ PIKMIN_TYPES.length - 5 }}</span>
          </div>
        </button>
      </div>
    </section>

    <!-- Overall Progress Card -->
    <section class="max-w-2xl mx-auto">
      <div class="card relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-100 to-transparent rounded-bl-full opacity-50"></div>
        
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-6">
            <span class="text-2xl">🏆</span>
            <h2 class="text-xl font-bold text-gray-800">總體蒐集進度</h2>
          </div>

          <div class="flex items-center justify-center gap-8 mb-6">
            <!-- Progress Circle -->
            <div class="relative w-28 h-28">
              <svg class="w-28 h-28 progress-ring" viewBox="0 0 36 36">
                <circle class="text-gray-200" stroke="currentColor" stroke-width="2.5" fill="transparent" r="16" cx="18" cy="18"/>
                <circle class="text-emerald-500 progress-ring-circle" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="transparent" r="16" cx="18" cy="18"
                  :stroke-dasharray="100.53"
                  :stroke-dashoffset="100.53 - (stats.percentage / 100) * 100.53"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-2xl font-extrabold text-gradient">{{ stats.percentage }}%</span>
              </div>
            </div>

            <!-- Stats -->
            <div class="text-left">
              <div class="mb-3">
                <p class="text-sm text-gray-500 mb-1">已蒐集</p>
                <p class="text-3xl font-extrabold text-emerald-600">{{ stats.collected }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 mb-1">總數量</p>
                <p class="text-xl font-bold text-gray-400">{{ stats.total }}</p>
              </div>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 transition-all duration-1000 ease-out rounded-full"
              :style="{ width: `${stats.percentage}%` }"
            ></div>
          </div>
          <p class="text-center text-sm text-gray-500 mt-2">
            還差 <span class="font-bold text-emerald-600">{{ stats.total - stats.collected }}</span> 件即可完成圖鑑！
          </p>
        </div>
      </div>
    </section>

    <!-- Quick Actions -->
    <section class="flex flex-col sm:flex-row gap-4 justify-center">
      <NuxtLink to="/collection" class="btn-primary text-base">
        <span class="mr-2">📖</span> 瀏覽完整圖鑑
      </NuxtLink>
      <NuxtLink to="/map" class="btn-primary text-base">
        <span class="mr-2">🗺️</span> 飾品地點地圖
      </NuxtLink>
    </section>

    <!-- Near Complete Categories (Expandable) -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <section v-if="showNearCompleteSection" ref="nearCompleteRef" class="max-w-4xl mx-auto">
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <span class="text-2xl">🎯</span>
              <h2 class="text-xl font-bold text-gray-800">即將完成的類別</h2>
            </div>
            <button @click="showNearCompleteSection = false" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>
          
          <div v-if="nearCompleteCategories.length === 0" class="text-center py-8 text-gray-500">
            <span class="text-4xl mb-2 block">🎉</span>
            <p>太棒了！你沒有接近完成的類別</p>
            <p class="text-sm">繼續努力蒐集更多飾品吧！</p>
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="cat in nearCompleteCategories" 
              :key="cat.id"
              @click="goToCategory(cat.id)"
              class="flex items-center gap-4 p-3 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer transition-colors"
            >
              <span class="text-2xl">{{ cat.icon }}</span>
              <div class="flex-1">
                <p class="font-semibold text-gray-800">{{ cat.name }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                      :style="{ width: `${cat.percentage}%` }"
                    ></div>
                  </div>
                  <span class="text-sm font-medium text-emerald-600">{{ cat.percentage }}%</span>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-bold text-orange-500">差 {{ cat.remaining }} 件</p>
                <p class="text-xs text-gray-400">{{ cat.collected }}/{{ cat.total }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Transition>

    <!-- Tips Card -->
    <section class="max-w-2xl mx-auto">
      <div class="card">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-2xl">💡</span>
          <h3 class="text-lg font-bold text-gray-800">使用小提示</h3>
        </div>
        <ul class="space-y-2 text-gray-600 text-sm">
          <li class="flex items-start gap-2">
            <span class="text-emerald-500 mt-0.5">✓</span>
            <span>點擊飾品卡片即可標記為「已蒐集」</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-emerald-500 mt-0.5">✓</span>
            <span>支援中文搜尋，輸入「紅」找紅色皮克敏</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-emerald-500 mt-0.5">✓</span>
            <span>登入帳號可以雲端同步蒐集進度</span>
          </li>
        </ul>
      </div>
    </section>

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
          class="modal-overlay"
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
            <div v-if="showPikminModal" class="modal-content max-w-md">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span>🌈</span> 選擇皮克敏類型
                </h3>
                <button @click="showPikminModal = false" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              
              <div class="grid grid-cols-4 gap-3">
                <button 
                  v-for="type in PIKMIN_TYPES" 
                  :key="type"
                  @click="goToPikminType(type)"
                  class="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/80 hover:bg-white border-2 border-transparent hover:border-emerald-300 transition-all hover:shadow-lg"
                >
                  <div 
                    class="w-12 h-12 rounded-full shadow-lg"
                    :class="PIKMIN_TYPE_COLORS[type]"
                  ></div>
                  <span class="text-xs font-semibold text-gray-700">{{ PIKMIN_TYPE_NAMES[type] }}</span>
                  <span class="text-sm font-bold text-emerald-600">{{ getPikminTypePercentage(type) }}%</span>
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
import { DECOR_CATEGORY_TYPES, PIKMIN_TYPES, PIKMIN_TYPE_NAMES, PIKMIN_TYPE_COLORS, type PikminType, type DecorCategoryType } from '~/types/decor';

const router = useRouter();
const supabase = useSupabaseClient();
const { getStats, isCollected } = useCollection();
const { getDecorDefinitions, getAllDecorItems, getItemsByCategoryType } = useDecorData();

// Wait for auth to initialize (important for OAuth callback)
const authInitialized = ref(false);

onMounted(async () => {
  // Listen for auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      // User just signed in via OAuth, ensure state is fully loaded
      await new Promise(resolve => setTimeout(resolve, 500));
      authInitialized.value = true;
    }
  });

  // Check current session immediately
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    // Already has session, mark as initialized
    authInitialized.value = true;
  } else {
    // No session yet, but if there's a hash (OAuth callback), wait a bit
    if (window.location.hash) {
      // Wait max 3 seconds for OAuth to complete
      const maxWait = 3000;
      const startTime = Date.now();
      
      while (!authInitialized.value && (Date.now() - startTime < maxWait)) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // If still not initialized after waiting, mark as initialized anyway
    if (!authInitialized.value) {
      authInitialized.value = true;
    }
  }
  
  // Cleanup subscription when component unmounts
  return () => {
    subscription.unsubscribe();
  };
});

const stats = computed(() => getStats());

// Modal states
const showPikminModal = ref(false);
const showNearCompleteSection = ref(false);
const nearCompleteRef = ref<HTMLElement | null>(null);

// 1. 未蒐集數量
const uncollectedCount = computed(() => {
  return stats.value.total - stats.value.collected;
});

// 2. 限定飾品數量 (regional + special)
const limitedCount = computed(() => {
  const regional = stats.value.byCategoryType['regional']?.total || 0;
  const special = stats.value.byCategoryType['special']?.total || 0;
  return regional + special;
});

// 3. 即將完成的類別 (80-99% 完成度)
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
    
    const percentage = Math.round((catStats.collected / catStats.total) * 100);
    const remaining = catStats.total - catStats.collected;
    
    // 80-99% 完成，且至少差 1 件
    if (percentage >= 70 && percentage < 100 && remaining > 0) {
      results.push({
        id: def.category.id,
        name: def.category.name,
        icon: def.category.icon || '📦',
        collected: catStats.collected,
        total: catStats.total,
        remaining,
        percentage,
      });
    }
  });

  // 按完成度排序（高到低）
  return results.sort((a, b) => b.percentage - a.percentage).slice(0, 5);
});

const getPikminTypePercentage = (type: PikminType): number => {
  const data = stats.value.byPikminType[type];
  if (!data || data.total === 0) return 0;
  return Math.round((data.collected / data.total) * 100);
};

// 功能按鈕動作
const showMissingItems = () => {
  // 導航到圖鑑頁面，篩選未蒐集
  router.push({ path: '/collection', query: { status: 'uncollected' } });
};

const showUnobtainable = () => {
  // 導航到圖鑑頁面，篩選限定飾品
  router.push({ path: '/collection', query: { limited: 'true' } });
};

const showNearComplete = () => {
  showNearCompleteSection.value = !showNearCompleteSection.value;
  
  // 如果顯示區塊，自動滾動到該區塊（置中顯示）
  if (showNearCompleteSection.value) {
    nextTick(() => {
      if (nearCompleteRef.value) {
        nearCompleteRef.value.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' // 改成置中，避免滑過頭
        });
      }
    });
  }
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
