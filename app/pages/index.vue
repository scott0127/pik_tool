<template>
  <div class="space-y-8 pb-8">
    <!-- Hero Section -->
    <section class="relative text-center py-12 overflow-hidden">
      <!-- Background decorations -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <span class="leaf-decoration top-4 left-[10%] sway text-5xl">🌿</span>
        <span class="leaf-decoration top-8 right-[15%] sway text-4xl" style="animation-delay: 0.5s">🍃</span>
        <span class="leaf-decoration bottom-4 left-[20%] sway text-3xl" style="animation-delay: 1s">🌱</span>
        <span class="leaf-decoration bottom-8 right-[10%] float text-4xl">🌸</span>
      </div>

      <!-- Main content -->
      <div class="relative z-10">
        <div class="inline-block mb-6">
          <div class="relative">
            <div class="w-24 h-24 bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-500 rounded-[2rem] shadow-2xl flex items-center justify-center float glow-emerald">
              <span class="text-5xl">🌱</span>
            </div>
            <span class="absolute -top-2 -right-2 text-2xl sparkle">✨</span>
            <span class="absolute -bottom-1 -left-2 text-xl float-delayed">🍀</span>
          </div>
        </div>
        
        <h1 class="text-4xl md:text-5xl font-extrabold mb-4">
          <span class="text-gradient">Pikmin Bloom</span>
          <br>
          <span class="text-gray-700">飾品圖鑑</span>
        </h1>
        
        <p class="text-gray-600 text-lg max-w-md mx-auto mb-8">
          追蹤你的皮克敏飾品蒐集進度<br>
          成為最強圖鑑大師！
        </p>

        <!-- Quick action buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink to="/collection" class="btn-primary text-lg">
            <span class="mr-2">📖</span> 開始探索圖鑑
          </NuxtLink>
          <NuxtLink to="/progress" class="btn-secondary text-lg">
            <span class="mr-2">📊</span> 查看我的統計
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Overall Progress Card -->
    <section class="max-w-2xl mx-auto">
      <div class="card relative overflow-hidden">
        <!-- Decorative corner -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-100 to-transparent rounded-bl-full opacity-50"></div>
        
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-6">
            <span class="text-3xl">🏆</span>
            <h2 class="text-2xl font-bold text-gray-800">總體蒐集進度</h2>
          </div>

          <div class="flex items-center justify-center gap-8 mb-6">
            <!-- Progress Circle -->
            <div class="relative w-32 h-32">
              <svg class="w-32 h-32 progress-ring" viewBox="0 0 36 36">
                <circle
                  class="text-gray-200"
                  stroke="currentColor"
                  stroke-width="2.5"
                  fill="transparent"
                  r="16"
                  cx="18"
                  cy="18"
                />
                <circle
                  class="text-emerald-500 progress-ring-circle"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  fill="transparent"
                  r="16"
                  cx="18"
                  cy="18"
                  :stroke-dasharray="100.53"
                  :stroke-dashoffset="100.53 - (stats.percentage / 100) * 100.53"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-3xl font-extrabold text-gradient">{{ stats.percentage }}%</span>
              </div>
            </div>

            <!-- Stats -->
            <div class="text-left">
              <div class="mb-4">
                <p class="text-sm text-gray-500 mb-1">已蒐集</p>
                <p class="text-4xl font-extrabold text-emerald-600">{{ stats.collected }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 mb-1">總數量</p>
                <p class="text-2xl font-bold text-gray-400">{{ stats.total }}</p>
              </div>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
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

    <!-- Category Progress Grid -->
    <section>
      <div class="flex items-center gap-3 mb-6">
        <span class="text-2xl">📁</span>
        <h2 class="text-2xl font-bold text-gray-800">飾品分類</h2>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <NuxtLink 
          v-for="(type, index) in categoryTypes" 
          :key="type.id"
          :to="`/collection?type=${type.id}`"
          class="card-hover group"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="text-center">
            <div class="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-md">
              {{ type.icon }}
            </div>
            <h3 class="font-bold text-gray-700 mb-2">{{ type.name }}</h3>
            
            <!-- Mini progress -->
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
              <div 
                class="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-500"
                :style="{ width: `${getCategoryTypePercentage(type.id)}%` }"
              ></div>
            </div>
            <p class="text-xs text-gray-500">
              {{ stats.byCategoryType[type.id]?.collected || 0 }} / {{ stats.byCategoryType[type.id]?.total || 0 }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Pikmin Type Progress -->
    <section>
      <div class="flex items-center gap-3 mb-6">
        <span class="text-2xl">🌈</span>
        <h2 class="text-2xl font-bold text-gray-800">皮克敏類型</h2>
      </div>

      <div class="grid grid-cols-4 md:grid-cols-8 gap-3">
        <div 
          v-for="type in pikminTypes" 
          :key="type"
          class="stat-card group cursor-pointer"
          @click="goToPikminType(type)"
        >
          <div 
            class="w-10 h-10 rounded-full mx-auto mb-2 shadow-lg group-hover:scale-110 transition-transform"
            :class="PIKMIN_TYPE_COLORS[type]"
          ></div>
          <p class="text-xs font-semibold text-gray-600 mb-1">{{ PIKMIN_TYPE_NAMES[type] }}</p>
          <p class="text-lg font-extrabold text-gradient">
            {{ getPikminTypePercentage(type) }}%
          </p>
          <p class="text-[10px] text-gray-400">
            {{ stats.byPikminType[type]?.collected || 0 }}/{{ stats.byPikminType[type]?.total || 0 }}
          </p>
        </div>
      </div>
    </section>

    <!-- Recent Activity / Tips -->
    <section class="grid md:grid-cols-2 gap-6">
      <!-- Tips Card -->
      <div class="card">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-2xl">💡</span>
          <h3 class="text-lg font-bold text-gray-800">小提示</h3>
        </div>
        <ul class="space-y-3 text-gray-600">
          <li class="flex items-start gap-2">
            <span class="text-emerald-500 mt-1">✓</span>
            <span>點擊飾品卡片即可標記為「已蒐集」</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-emerald-500 mt-1">✓</span>
            <span>使用篩選功能快速找到想要的飾品</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-emerald-500 mt-1">✓</span>
            <span>登入帳號可以雲端同步你的蒐集進度</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-emerald-500 mt-1">✓</span>
            <span>支援中文搜尋，輸入「紅」找紅色皮克敏</span>
          </li>
        </ul>
      </div>

      <!-- Quick Stats Card -->
      <div class="card">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-2xl">⚡</span>
          <h3 class="text-lg font-bold text-gray-800">快速統計</h3>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-emerald-50 rounded-2xl p-4 text-center">
            <p class="text-3xl font-extrabold text-emerald-600">{{ totalCategories }}</p>
            <p class="text-sm text-gray-500">飾品分類</p>
          </div>
          <div class="bg-teal-50 rounded-2xl p-4 text-center">
            <p class="text-3xl font-extrabold text-teal-600">{{ totalVariants }}</p>
            <p class="text-sm text-gray-500">飾品變體</p>
          </div>
          <div class="bg-emerald-50 rounded-2xl p-4 text-center">
            <p class="text-3xl font-extrabold text-emerald-600">{{ pikminTypes.length }}</p>
            <p class="text-sm text-gray-500">皮克敏種類</p>
          </div>
          <div class="bg-teal-50 rounded-2xl p-4 text-center">
            <p class="text-3xl font-extrabold text-teal-600">{{ stats.total }}</p>
            <p class="text-sm text-gray-500">總收藏項目</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { DECOR_CATEGORY_TYPES, PIKMIN_TYPES, PIKMIN_TYPE_NAMES, PIKMIN_TYPE_COLORS, type PikminType } from '~/types/decor';

const router = useRouter();
const { getStats } = useCollection();
const { getDecorDefinitions } = useDecorData();

const stats = computed(() => getStats());
const categoryTypes = DECOR_CATEGORY_TYPES;
const pikminTypes = PIKMIN_TYPES;

const totalCategories = computed(() => getDecorDefinitions().length);
const totalVariants = computed(() => {
  return getDecorDefinitions().reduce((sum, def) => sum + def.variants.length, 0);
});

const getCategoryTypePercentage = (typeId: string): number => {
  const data = stats.value.byCategoryType[typeId];
  if (!data || data.total === 0) return 0;
  return Math.round((data.collected / data.total) * 100);
};

const getPikminTypePercentage = (type: PikminType): number => {
  const data = stats.value.byPikminType[type];
  if (!data || data.total === 0) return 0;
  return Math.round((data.collected / data.total) * 100);
};

const goToPikminType = (type: PikminType) => {
  router.push({ path: '/collection', query: { pikmin: type } });
};
</script>
