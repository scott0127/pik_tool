<template>
  <div class="space-y-8">
    <!-- Hero Section -->
    <section class="text-center py-8">
      <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-leaf-500 rounded-3xl shadow-lg mb-4">
        <span class="text-4xl">🌸</span>
      </div>
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Pikmin Bloom 飾品圖鑑</h1>
      <p class="text-gray-600 max-w-md mx-auto">
        追蹤你的皮克敏飾品蒐集進度，掌握圖鑑完成度
      </p>
    </section>

    <!-- Overall Progress -->
    <section class="card max-w-lg mx-auto">
      <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>📊</span> 總體進度
      </h2>
      <div class="text-center mb-4">
        <span class="text-5xl font-bold text-primary-600">{{ stats.percentage }}%</span>
      </div>
      <div class="h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div 
          class="h-full bg-gradient-to-r from-primary-500 to-leaf-500 transition-all duration-700"
          :style="{ width: `${stats.percentage}%` }"
        ></div>
      </div>
      <p class="text-center text-gray-600">
        已蒐集 <span class="font-bold text-primary-600">{{ stats.collected }}</span> / {{ stats.total }} 件飾品
      </p>
    </section>

    <!-- Quick Stats by Category Type -->
    <section>
      <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>📁</span> 分類進度
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <NuxtLink 
          v-for="type in categoryTypes" 
          :key="type.id"
          :to="`/collection?type=${type.id}`"
          class="card-hover"
        >
          <div class="flex items-center gap-3 mb-3">
            <span class="text-2xl">{{ type.icon }}</span>
            <span class="font-medium text-gray-700">{{ type.name }}</span>
          </div>
          <ProgressBar 
            :label="''"
            :collected="stats.byCategoryType[type.id]?.collected || 0"
            :total="stats.byCategoryType[type.id]?.total || 0"
          />
        </NuxtLink>
      </div>
    </section>

    <!-- Quick Stats by Pikmin Type -->
    <section>
      <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>🌱</span> 皮克敏進度
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div 
          v-for="type in pikminTypes" 
          :key="type"
          class="card text-center"
        >
          <div 
            class="w-10 h-10 rounded-full mx-auto mb-2"
            :class="PIKMIN_TYPE_COLORS[type]"
          ></div>
          <p class="text-xs text-gray-600 mb-1">{{ PIKMIN_TYPE_NAMES[type] }}</p>
          <p class="font-bold text-primary-600">
            {{ Math.round((stats.byPikminType[type]?.collected || 0) / (stats.byPikminType[type]?.total || 1) * 100) }}%
          </p>
          <p class="text-xs text-gray-400">
            {{ stats.byPikminType[type]?.collected || 0 }}/{{ stats.byPikminType[type]?.total || 0 }}
          </p>
        </div>
      </div>
    </section>

    <!-- Quick Actions -->
    <section class="flex flex-col sm:flex-row gap-4 justify-center">
      <NuxtLink to="/collection" class="btn-primary text-center">
        📖 開始瀏覽圖鑑
      </NuxtLink>
      <NuxtLink to="/progress" class="btn-secondary text-center">
        📊 查看詳細統計
      </NuxtLink>
    </section>
  </div>
</template>

<script setup lang="ts">
import { DECOR_CATEGORY_TYPES, PIKMIN_TYPES, PIKMIN_TYPE_NAMES, PIKMIN_TYPE_COLORS } from '~/types/decor';

const { getStats } = useCollection();

const stats = computed(() => getStats());

const categoryTypes = DECOR_CATEGORY_TYPES;
const pikminTypes = PIKMIN_TYPES;
</script>
