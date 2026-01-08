<template>
  <div class="space-y-3">
    <!-- Quick Filter Chips -->
    <div class="overflow-x-auto scrollbar-hide -mx-4 px-4 py-1">
      <div class="flex gap-2">
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

        <!-- Obtainable: Regular location decors -->
        <button
          @click="$emit('select', 'regular')"
          class="filter-chip"
          :class="[selected === 'regular' ? 'filter-chip-active' : 'filter-chip-inactive']"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
          <span>地點飾品</span>
          <span class="text-xs opacity-70">({{ getCategoryCount('regular') }})</span>
        </button>

        <!-- Special Events -->
        <button
          @click="$emit('select', 'special')"
          class="filter-chip group"
          :class="[selected === 'special' ? 'filter-chip-active' : 'filter-chip-inactive']"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>活動限定</span>
          <span class="text-xs opacity-70">({{ getCategoryCount('special') }})</span>
        </button>

        <!-- Regional -->
        <button
          @click="$emit('select', 'regional')"
          class="filter-chip"
          :class="[selected === 'regional' ? 'filter-chip-active bg-amber-500 border-amber-500' : 'filter-chip-inactive']"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clip-rule="evenodd" />
          </svg>
          <span>地區限定</span>
          <span class="text-xs opacity-70">({{ getCategoryCount('regional') }})</span>
        </button>

        <!-- Roadside -->
        <button
          @click="$emit('select', 'roadside')"
          class="filter-chip"
          :class="[selected === 'roadside' ? 'filter-chip-active' : 'filter-chip-inactive']"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
          </svg>
          <span>路邊</span>
          <span class="text-xs opacity-70">({{ getCategoryCount('roadside') }})</span>
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
          <span v-if="selected === 'regional'" class="text-amber-600 font-medium ml-1">
            （可能無法在台灣取得）
          </span>
          <span v-if="selected === 'special'" class="text-orange-600 font-medium ml-1">
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
  selected: DecorCategoryType | null;
}>();

defineEmits<{
  select: [type: DecorCategoryType | null];
}>();

const { getAllDecorItems, getItemsByCategoryType } = useDecorData();

const totalCount = computed(() => getAllDecorItems().length);

const getCategoryCount = (type: DecorCategoryType) => {
  return getItemsByCategoryType(type).length;
};

const selectedInfo = computed(() => {
  if (!props.selected) return null;
  return DECOR_CATEGORY_TYPES.find(t => t.id === props.selected);
});
</script>

<style scoped>
.filter-chip {
  @apply inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap border-2;
}

.filter-chip-active {
  @apply bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200;
}

.filter-chip-inactive {
  @apply bg-white/80 text-gray-600 border-white/80 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700;
}
</style>
