<template>
  <div class="space-y-8">
    <!-- Page Title -->
    <div>
      <h1 class="text-2xl font-bold text-gray-800">📊 蒐集統計</h1>
      <p class="text-gray-600">詳細檢視各分類的蒐集進度</p>
    </div>

    <!-- Overall Stats -->
    <section class="card">
      <h2 class="text-lg font-bold text-gray-800 mb-4">總體進度</h2>
      <div class="grid grid-cols-3 gap-4 text-center mb-4">
        <div>
          <p class="text-3xl font-bold text-primary-600">{{ stats.collected }}</p>
          <p class="text-sm text-gray-500">已蒐集</p>
        </div>
        <div>
          <p class="text-3xl font-bold text-gray-400">{{ stats.total - stats.collected }}</p>
          <p class="text-sm text-gray-500">未蒐集</p>
        </div>
        <div>
          <p class="text-3xl font-bold text-leaf-600">{{ stats.total }}</p>
          <p class="text-sm text-gray-500">總數</p>
        </div>
      </div>
      <ProgressBar 
        label="完成度"
        :collected="stats.collected"
        :total="stats.total"
      />
    </section>

    <!-- By Category Type -->
    <section class="card">
      <h2 class="text-lg font-bold text-gray-800 mb-4">分類進度</h2>
      <div class="space-y-4">
        <div v-for="type in DECOR_CATEGORY_TYPES" :key="type.id">
          <div class="flex items-center gap-2 mb-1">
            <span>{{ type.icon }}</span>
            <span class="font-medium text-gray-700">{{ type.name }}</span>
          </div>
          <ProgressBar 
            label=""
            :collected="stats.byCategoryType[type.id]?.collected || 0"
            :total="stats.byCategoryType[type.id]?.total || 0"
            :color-class="getCategoryColor(type.id)"
          />
        </div>
      </div>
    </section>

    <!-- By Pikmin Type -->
    <section class="card">
      <h2 class="text-lg font-bold text-gray-800 mb-4">皮克敏類型進度</h2>
      <div class="space-y-4">
        <div v-for="type in PIKMIN_TYPES" :key="type">
          <div class="flex items-center gap-2 mb-1">
            <div 
              class="w-4 h-4 rounded-full"
              :class="PIKMIN_TYPE_COLORS[type]"
            ></div>
            <span class="font-medium text-gray-700">{{ PIKMIN_TYPE_NAMES[type] }}</span>
          </div>
          <ProgressBar 
            label=""
            :collected="stats.byPikminType[type]?.collected || 0"
            :total="stats.byPikminType[type]?.total || 0"
            :color-class="getPikminProgressColor(type)"
          />
        </div>
      </div>
    </section>

    <!-- By Individual Category -->
    <section class="card">
      <h2 class="text-lg font-bold text-gray-800 mb-4">各飾品分類進度</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="category in getAllCategories()" 
          :key="category.id"
          class="p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center gap-2 mb-2">
            <span>{{ category.icon }}</span>
            <span class="font-medium text-gray-700 text-sm">{{ category.name }}</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                class="h-full bg-primary-500 transition-all duration-300"
                :style="{ width: `${getCategoryPercentage(category.id)}%` }"
              ></div>
            </div>
            <span class="text-xs text-gray-500 whitespace-nowrap">
              {{ stats.byCategory[category.id]?.collected || 0 }}/{{ stats.byCategory[category.id]?.total || 0 }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Data Management -->
    <section class="card">
      <h2 class="text-lg font-bold text-gray-800 mb-4">資料管理</h2>
      <div class="space-y-4">
        <!-- Export -->
        <div>
          <button @click="handleExport" class="btn-primary w-full sm:w-auto">
            📤 匯出蒐集資料
          </button>
        </div>
        
        <!-- Import -->
        <div>
          <label class="block">
            <span class="btn-secondary inline-block cursor-pointer">
              📥 匯入蒐集資料
            </span>
            <input 
              type="file" 
              accept=".json"
              class="hidden"
              @change="handleImport"
            >
          </label>
        </div>

        <!-- Reset -->
        <div class="pt-4 border-t border-gray-200">
          <button 
            @click="showResetConfirm = true" 
            class="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            🗑️ 重置所有蒐集資料
          </button>
        </div>
      </div>
    </section>

    <!-- Reset Confirmation Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div 
          v-if="showResetConfirm" 
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click.self="showResetConfirm = false"
        >
          <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 class="text-lg font-bold text-gray-800 mb-2">確認重置？</h3>
            <p class="text-gray-600 mb-4">此操作將清除所有蒐集記錄，無法復原。</p>
            <div class="flex gap-3">
              <button 
                @click="showResetConfirm = false"
                class="btn-secondary flex-1"
              >
                取消
              </button>
              <button 
                @click="handleReset"
                class="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                確認重置
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { DECOR_CATEGORY_TYPES, PIKMIN_TYPES, PIKMIN_TYPE_NAMES, PIKMIN_TYPE_COLORS, type PikminType, type DecorCategoryType } from '~/types/decor';

const { getStats, exportCollection, importCollection, resetCollection } = useCollection();
const { getAllCategories } = useDecorData();

const stats = computed(() => getStats());
const showResetConfirm = ref(false);

const getCategoryPercentage = (categoryId: string): number => {
  const cat = stats.value.byCategory[categoryId];
  if (!cat || cat.total === 0) return 0;
  return Math.round((cat.collected / cat.total) * 100);
};

const getCategoryColor = (type: DecorCategoryType): string => {
  const colors: Record<DecorCategoryType, string> = {
    regular: 'bg-blue-500',
    special: 'bg-yellow-500',
    roadside: 'bg-gray-500',
    weather: 'bg-cyan-500',
    regional: 'bg-purple-500',
    rare: 'bg-gradient-to-r from-yellow-400 to-orange-500',
  };
  return colors[type] || 'bg-primary-500';
};

const getPikminProgressColor = (type: PikminType): string => {
  const colors: Record<PikminType, string> = {
    red: 'bg-pikmin-red',
    yellow: 'bg-pikmin-yellow',
    blue: 'bg-pikmin-blue',
    purple: 'bg-pikmin-purple',
    white: 'bg-gray-400',
    rock: 'bg-pikmin-rock',
    winged: 'bg-pikmin-winged',
  };
  return colors[type];
};

const handleExport = () => {
  const data = exportCollection();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pikmin-bloom-collection-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const handleImport = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    const success = importCollection(content);
    if (success) {
      alert('匯入成功！');
    } else {
      alert('匯入失敗，請確認檔案格式正確。');
    }
  };
  reader.readAsText(file);
  input.value = '';
};

const handleReset = () => {
  resetCollection();
  showResetConfirm.value = false;
};
</script>
