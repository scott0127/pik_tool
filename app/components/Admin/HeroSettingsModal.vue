<template>
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
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        @click.self="close"
      >
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div v-if="isOpen" class="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-w-md w-full relative overflow-visible transform transition-all">
            
            <!-- Decorative background -->
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-100 to-transparent rounded-bl-full opacity-50 -z-10"></div>
            
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Icon name="lucide:settings" class="text-emerald-500" />
                首頁飾品設定
              </h3>
              <button @click="close" class="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <Icon name="ion:close" class="text-xl text-gray-500" />
              </button>
            </div>

            <div class="space-y-6">
              <!-- Row 1 Select -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">上排飾品種類</label>
                <div class="relative">
                  <select v-model="selectedRow1" class="w-full pl-4 pr-10 py-3 appearance-none rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors bg-gray-50 font-medium text-gray-700">
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                      {{ cat.name }} ({{ cat.nameEn }})
                    </option>
                  </select>
                  <Icon name="lucide:chevron-down" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <!-- Row 2 Select -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">下排飾品種類</label>
                <div class="relative">
                  <select v-model="selectedRow2" class="w-full pl-4 pr-10 py-3 appearance-none rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors bg-gray-50 font-medium text-gray-700">
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                      {{ cat.name }} ({{ cat.nameEn }})
                    </option>
                  </select>
                  <Icon name="lucide:chevron-down" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="mt-8 flex gap-3">
              <button @click="close" class="flex-1 px-4 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                取消
              </button>
              <button @click="save" :disabled="isConfigLoading" class="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2">
                <template v-if="isConfigLoading">
                  <Icon name="lucide:loader-2" class="animate-spin" />
                  儲存中...
                </template>
                <template v-else>
                  儲存設定
                </template>
              </button>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useDecorData } from '~/composables/useDecorData';
import { useSiteConfig } from '~/composables/useSiteConfig';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close', 'saved']);

const { getAllCategories } = useDecorData();
const { heroFeaturedConfig, isConfigLoading, updateHeroConfig } = useSiteConfig();

const allCats = getAllCategories();
// 稍微將名稱照注音或筆畫排序一下，方便找
const categories = computed(() => {
    return [...allCats].sort((a, b) => a.name.localeCompare(b.name, 'zh-TW'));
});

const selectedRow1 = ref('');
const selectedRow2 = ref('');

// 當彈窗打開時，同步當前設定
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (heroFeaturedConfig.value) {
      selectedRow1.value = heroFeaturedConfig.value.row1 || 'reverse-valentine-sticker';
      selectedRow2.value = heroFeaturedConfig.value.row2 || '彩色粉末-世界節慶';
    } else {
      selectedRow1.value = 'reverse-valentine-sticker';
      selectedRow2.value = '彩色粉末-世界節慶';
    }
  }
});

const close = () => {
  emit('close');
};

const save = async () => {
  if (!selectedRow1.value || !selectedRow2.value) return;
  const success = await updateHeroConfig(selectedRow1.value, selectedRow2.value);
  if (success) {
    emit('saved');
    close();
  }
};
</script>
