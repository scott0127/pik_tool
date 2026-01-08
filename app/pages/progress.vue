<template>
  <div class="min-h-screen py-8 px-4">
    <!-- Background Decorations -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div class="absolute top-20 left-10 text-6xl opacity-10 animate-float">📊</div>
      <div class="absolute bottom-40 right-20 text-5xl opacity-10 animate-float" style="animation-delay: 1s;">🎯</div>
    </div>

    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Page Header -->
      <header class="text-center mb-12 animate-slide-up">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl shadow-emerald-200 mb-4">
          <span class="text-4xl">📊</span>
        </div>
        <h1 class="text-3xl font-extrabold gradient-text mb-2">蒐集統計</h1>
        <p class="text-gray-500">詳細檢視各分類的蒐集進度</p>
      </header>

      <!-- Overall Stats Card -->
      <section class="glass rounded-3xl p-8 animate-slide-up" style="animation-delay: 0.1s;">
        <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span class="text-2xl">🎯</span>
          總體進度
        </h2>
        
        <!-- Big Progress Circle -->
        <div class="flex flex-col md:flex-row items-center gap-8 mb-6">
          <div class="relative w-48 h-48 flex-shrink-0">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                stroke-width="8"
                fill="none"
                class="text-gray-200"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="url(#progressGradient)"
                stroke-width="8"
                fill="none"
                stroke-linecap="round"
                :stroke-dasharray="`${2 * Math.PI * 42}`"
                :stroke-dashoffset="`${2 * Math.PI * 42 * (1 - stats.collected / Math.max(stats.total, 1))}`"
                class="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#10B981" />
                  <stop offset="100%" stop-color="#14B8A6" />
                </linearGradient>
              </defs>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-4xl font-extrabold gradient-text">{{ Math.round((stats.collected / Math.max(stats.total, 1)) * 100) }}%</span>
              <span class="text-sm text-gray-500">完成度</span>
            </div>
          </div>
          
          <div class="flex-1 grid grid-cols-3 gap-4 w-full">
            <div class="stat-card">
              <p class="stat-value text-emerald-500">{{ stats.collected }}</p>
              <p class="stat-label">已蒐集</p>
            </div>
            <div class="stat-card">
              <p class="stat-value text-gray-400">{{ stats.total - stats.collected }}</p>
              <p class="stat-label">未蒐集</p>
            </div>
            <div class="stat-card">
              <p class="stat-value text-teal-500">{{ stats.total }}</p>
              <p class="stat-label">總數</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Category Type Progress -->
      <section class="glass rounded-3xl p-8 animate-slide-up" style="animation-delay: 0.2s;">
        <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span class="text-2xl">📁</span>
          分類進度
        </h2>
        <div class="space-y-5">
          <div v-for="type in DECOR_CATEGORY_TYPES" :key="type.id" class="group">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                <span class="text-xl">{{ type.icon }}</span>
                <span class="font-semibold text-gray-700">{{ type.name }}</span>
              </div>
              <span class="text-sm font-medium text-gray-500">
                {{ stats.byCategoryType[type.id]?.collected || 0 }} / {{ stats.byCategoryType[type.id]?.total || 0 }}
              </span>
            </div>
            <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-700 group-hover:shadow-lg"
                :class="getCategoryTypeGradient(type.id)"
                :style="{ width: `${getCategoryTypePercentage(type.id)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Pikmin Type Progress -->
      <section class="glass rounded-3xl p-8 animate-slide-up" style="animation-delay: 0.3s;">
        <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span class="text-2xl">🌱</span>
          皮克敏類型進度
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            v-for="type in PIKMIN_TYPES" 
            :key="type"
            class="glass rounded-2xl p-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <div 
              class="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 shadow-lg"
              :class="PIKMIN_TYPE_COLORS[type]"
            >
              <span class="text-white text-xl font-bold">{{ getPikminEmoji(type) }}</span>
            </div>
            <p class="font-semibold text-gray-700 text-sm mb-1">{{ PIKMIN_TYPE_NAMES[type] }}</p>
            <p class="text-2xl font-extrabold gradient-text">
              {{ Math.round((stats.byPikminType[type]?.collected || 0) / Math.max(stats.byPikminType[type]?.total || 1, 1) * 100) }}%
            </p>
            <p class="text-xs text-gray-400">
              {{ stats.byPikminType[type]?.collected || 0 }} / {{ stats.byPikminType[type]?.total || 0 }}
            </p>
          </div>
        </div>
      </section>

      <!-- Individual Category Progress -->
      <section class="glass rounded-3xl p-8 animate-slide-up" style="animation-delay: 0.4s;">
        <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span class="text-2xl">🏷️</span>
          各飾品分類進度
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="category in getAllCategories()" 
            :key="category.id"
            class="bg-white/60 rounded-2xl p-4 transition-all duration-300 hover:bg-white hover:shadow-lg cursor-default group"
          >
            <div class="flex items-center gap-3 mb-3">
              <span class="text-xl">{{ category.icon }}</span>
              <span class="font-medium text-gray-700 text-sm truncate">{{ category.name }}</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 group-hover:shadow-glow"
                  :style="{ width: `${getCategoryPercentage(category.id)}%` }"
                ></div>
              </div>
              <span class="text-xs font-semibold text-gray-500 whitespace-nowrap min-w-[60px] text-right">
                {{ stats.byCategory[category.id]?.collected || 0 }}/{{ stats.byCategory[category.id]?.total || 0 }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Data Management -->
      <section class="glass rounded-3xl p-8 animate-slide-up" style="animation-delay: 0.5s;">
        <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span class="text-2xl">💾</span>
          資料管理
        </h2>
        <div class="space-y-4">
          <!-- Export/Import Buttons -->
          <div class="flex flex-wrap gap-4">
            <button 
              @click="handleExport" 
              class="btn-primary flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              匯出蒐集資料
            </button>
            
            <label class="btn-secondary flex items-center gap-2 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
              匯入蒐集資料
              <input 
                type="file" 
                accept=".json"
                class="hidden"
                @change="handleImport"
              >
            </label>
          </div>

          <!-- Reset Button -->
          <div class="pt-4 border-t border-gray-200/50">
            <button 
              @click="showResetConfirm = true" 
              class="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              重置所有蒐集資料
            </button>
          </div>
        </div>
      </section>
    </div>

    <!-- Reset Confirmation Modal -->
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
          v-if="showResetConfirm" 
          class="modal-overlay"
          @click.self="showResetConfirm = false"
        >
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-4"
          >
            <div v-if="showResetConfirm" class="modal-content">
              <div class="text-center mb-6">
                <div class="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <span class="text-3xl">⚠️</span>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">確認重置？</h3>
                <p class="text-gray-500">此操作將清除所有蒐集記錄，無法復原。</p>
              </div>
              <div class="flex gap-3">
                <button 
                  @click="showResetConfirm = false"
                  class="btn-secondary flex-1"
                >
                  取消
                </button>
                <button 
                  @click="handleReset"
                  class="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  確認重置
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast Notification -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
      >
        <div
          v-if="toastMessage"
          class="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-gray-900 text-white rounded-2xl shadow-2xl flex items-center gap-2 z-50"
        >
          <span>{{ toastIcon }}</span>
          <span>{{ toastMessage }}</span>
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
const toastMessage = ref('');
const toastIcon = ref('');

const showToast = (message: string, icon: string = '✓') => {
  toastMessage.value = message;
  toastIcon.value = icon;
  setTimeout(() => {
    toastMessage.value = '';
  }, 3000);
};

const getCategoryPercentage = (categoryId: string): number => {
  const cat = stats.value.byCategory[categoryId];
  if (!cat || cat.total === 0) return 0;
  return Math.round((cat.collected / cat.total) * 100);
};

const getCategoryTypePercentage = (typeId: DecorCategoryType): number => {
  const cat = stats.value.byCategoryType[typeId];
  if (!cat || cat.total === 0) return 0;
  return Math.round((cat.collected / cat.total) * 100);
};

const getCategoryTypeGradient = (type: DecorCategoryType): string => {
  const gradients: Record<DecorCategoryType, string> = {
    regular: 'bg-gradient-to-r from-blue-400 to-blue-600',
    special: 'bg-gradient-to-r from-amber-400 to-orange-500',
    roadside: 'bg-gradient-to-r from-gray-400 to-gray-600',
    weather: 'bg-gradient-to-r from-cyan-400 to-blue-500',
    regional: 'bg-gradient-to-r from-purple-400 to-purple-600',
    rare: 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500',
  };
  return gradients[type] || 'bg-gradient-to-r from-emerald-400 to-teal-500';
};

const getPikminEmoji = (type: PikminType): string => {
  const emojis: Record<PikminType, string> = {
    red: '🔴',
    yellow: '🟡',
    blue: '🔵',
    purple: '🟣',
    white: '⚪',
    rock: '🪨',
    winged: '🩷',
    ice: '🩵',
  };
  return emojis[type] || '🌱';
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
  showToast('已匯出蒐集資料', '📤');
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
      showToast('匯入成功！', '✅');
    } else {
      showToast('匯入失敗，請確認檔案格式', '❌');
    }
  };
  reader.readAsText(file);
  input.value = '';
};

const handleReset = () => {
  resetCollection();
  showResetConfirm.value = false;
  showToast('已重置所有資料', '🗑️');
};
</script>
