<template>
  <div class="space-y-3">
    <!-- Quick Filter Chips -->
    <div class="-mx-4 px-4 py-1">
      <div class="flex flex-wrap gap-2">
        <!-- All -->
        <button
          @click="$emit('select', null)"
          class="filter-chip"
          :class="[selected === null ? 'filter-chip-active' : 'filter-chip-inactive']"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
          <span>全部</span>
          <span class="text-xs opacity-70">({{ totalCount }})</span>
        </button>

        <!-- Regular: 一般飾品 -->
        <button
          @click="$emit('select', 'regular')"
          class="filter-chip"
          :class="[selected === 'regular' ? 'filter-chip-active' : 'filter-chip-inactive']"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
          <span>一般飾品</span>
          <span class="text-xs opacity-70">({{ getCategoryCount('regular') }})</span>
        </button>

        <!-- Special: 特殊飾品 -->
        <button
          @click="$emit('select', 'special')"
          class="filter-chip group"
          :class="[selected === 'special' ? 'filter-chip-active' : 'filter-chip-inactive']"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>特殊飾品</span>
          <span class="text-xs opacity-70">({{ getCategoryCount('special') }})</span>
        </button>

        <!-- Uncollected Regular: 待收集（一般） -->
        <button
          @click="$emit('select', 'uncollected-regular')"
          class="filter-chip"
          :class="[selected === 'uncollected-regular' ? 'filter-chip-active bg-emerald-600 border-emerald-600' : 'filter-chip-inactive']"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
          </svg>
          <span>待收集（一般）</span>
          <span class="text-xs opacity-70">({{ getUncollectedRegularCount() }})</span>
        </button>

        <!-- Anniversary: 週年紀念 -->
        <button
          @click="$emit('select', 'anniversary')"
          class="filter-chip"
          :class="[selected === 'anniversary' ? 'filter-chip-active bg-purple-500 border-purple-500' : 'filter-chip-inactive']"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          <span>週年紀念</span>
          <span class="text-xs opacity-70">({{ getAnniversaryCount() }})</span>
        </button>

      </div>
    </div>

    <!-- Info tooltip for selected category -->
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div 
        v-if="selected && selectedInfo"
        class="flex items-start gap-2 px-3 py-2 bg-gray-50 rounded-xl text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <div>
          <span class="text-gray-600">{{ selectedInfo.description }}</span>
          <span v-if="selected === 'special' || selected === 'anniversary'" class="text-orange-600 font-medium ml-1">
            （可能已結束活動）
          </span>
        </div>
      </div>
    </Transition>
  </div>
</template>


<script setup lang="ts">
import { DECOR_CATEGORY_TYPES, type DecorCategoryType } from '~/types/decor';

const props = defineProps<{
  selected: DecorCategoryType | 'uncollected-regular' | 'anniversary' | null;
}>();

defineEmits<{
  select: [type: DecorCategoryType | 'uncollected-regular' | 'anniversary' | null];
}>();

const { getAllDecorItems, getItemsByCategoryType, getDecorDefinitions } = useDecorData();
const { isCollected } = useCollection();

const totalCount = computed(() => getAllDecorItems().length);

const getCategoryCount = (type: DecorCategoryType) => {
  return getItemsByCategoryType(type).length;
};

// 計算待收集（一般）的數量
const getUncollectedRegularCount = () => {
  const regularItems = getItemsByCategoryType('regular');
  return regularItems.filter(item => !isCollected(item.id)).length;
};

// 計算週年紀念分類的飾品數量
const getAnniversaryCount = () => {
  const anniversaryCategories = [
    'first-anniversary-snack',
    '3rd-anniversary-cupcake',
    '4th-anniversary-flower-box',
    '4th-anniversary-snack'
  ];
  
  const definitions = getDecorDefinitions();
  let count = 0;
  
  anniversaryCategories.forEach(catId => {
    const def = definitions.find(d => d.category.id === catId);
    if (def) {
      // 計算此分類下所有 variants 的飾品數量
      def.variants.forEach(variant => {
        const variantImageUrls = (variant as any).imageUrls;
        if (variantImageUrls && typeof variantImageUrls === 'object') {
          count += Object.keys(variantImageUrls).length;
        } else {
          count += def.availablePikminTypes?.length || 7;
        }
      });
    }
  });
  
  return count;
};

const selectedInfo = computed(() => {
  if (!props.selected) return null;
  
  // 自定義篩選的說明
  if (props.selected === 'uncollected-regular') {
    return {
      id: 'uncollected-regular',
      name: '待收集（一般）',
      description: '尚未收集的一般飾品，幫助你補齊收藏'
    };
  }
  
  if (props.selected === 'anniversary') {
    return {
      id: 'anniversary',
      name: '週年紀念',
      description: 'Pikmin Bloom 週年紀念活動限定飾品'
    };
  }
  
  // 原有的類型說明
  const typeInfo = DECOR_CATEGORY_TYPES.find(t => t.id === props.selected);
  if (typeInfo) {
    // 更新說明文字
    if (props.selected === 'regular') {
      return {
        ...typeInfo,
        description: '從特定地點（如餐廳、公園、車站等）獲得的裝飾'
      };
    }
    if (props.selected === 'special') {
      return {
        ...typeInfo,
        description: '透過活動、節日慶典、特殊任務等限定方式獲得'
      };
    }
  }
  
  return typeInfo;
});
</script>


<style scoped>
.filter-chip {
  @apply inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border-2;
  /* Allow text wrapping on mobile, prevent on larger screens */
  @apply break-words;
  min-width: fit-content;
}

.filter-chip-active {
  @apply bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200;
}

.filter-chip-inactive {
  @apply bg-white/80 text-gray-600 border-white/80 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700;
}
</style>
