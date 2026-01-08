<template>
  <div 
    @click="handleClick"
    class="relative group cursor-pointer transition-all duration-300"
    :class="[
      isCollected ? 'ring-2 ring-primary-500 ring-offset-2' : 'grayscale opacity-70 hover:grayscale-0 hover:opacity-100'
    ]"
  >
    <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
      <!-- Image Container -->
      <div class="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 p-2">
        <img 
          v-if="imageUrl && !hasError"
          :src="imageUrl"
          :alt="`${variant?.nameEn} ${pikminType} Pikmin`"
          class="w-full h-full object-contain"
          loading="lazy"
            referrerpolicy="no-referrer"
          @error="handleImageError"
        >
        <div 
          v-else 
          class="w-full h-full flex items-center justify-center text-4xl"
        >
          {{ category?.icon || '🌸' }}
        </div>

        <!-- Pikmin Type Badge -->
        <div 
          class="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md"
          :class="pikminBadgeClass"
        >
          {{ pikminTypeShort }}
        </div>

        <!-- Collected Checkmark -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="scale-0 opacity-0"
          enter-to-class="scale-100 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="scale-100 opacity-100"
          leave-to-class="scale-0 opacity-0"
        >
          <div 
            v-if="isCollected"
            class="absolute bottom-1 right-1 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </Transition>

        <!-- Rare Sparkle -->
        <div 
          v-if="variant?.isRare"
          class="absolute top-1 left-1 text-yellow-400 animate-pulse"
        >
          ✨
        </div>
      </div>

      <!-- Info Section -->
      <div class="p-2 text-center">
        <p class="text-xs font-medium text-gray-700 truncate" :title="variant?.name">
          {{ variant?.name || 'Unknown' }}
        </p>
        <p class="text-[10px] text-gray-400 truncate" :title="variant?.nameEn">
          {{ variant?.nameEn || '' }}
        </p>
      </div>
    </div>

    <!-- Hover Overlay -->
    <div class="absolute inset-0 bg-primary-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
  </div>
</template>

<script setup lang="ts">
import type { PikminType } from '~/types/decor';
import { PIKMIN_TYPE_COLORS } from '~/types/decor';

const props = defineProps<{
  itemId: string;
  categoryId: string;
  variantId: string;
  pikminType: PikminType;
}>();

const emit = defineEmits<{
  toggle: [itemId: string];
}>();

const { isCollected: checkCollected, toggleCollected } = useCollection();
const { getVariant, getCategory, getImageUrl } = useDecorData();

const variant = computed(() => getVariant(props.categoryId, props.variantId));
const category = computed(() => getCategory(props.categoryId));
const isCollected = computed(() => checkCollected(props.itemId));
const imageUrl = computed(() => getImageUrl(props.categoryId, props.variantId, props.pikminType));
const hasError = ref(false);

const pikminTypeShort = computed(() => {
  const shorts: Record<PikminType, string> = {
    red: 'R',
    yellow: 'Y',
    blue: 'B',
    purple: 'P',
    white: 'W',
    rock: '岩',
    winged: '翼',
    ice: '冰',
  };
  return shorts[props.pikminType];
});

const pikminBadgeClass = computed(() => {
  const baseClass = PIKMIN_TYPE_COLORS[props.pikminType];
  const textClass = props.pikminType === 'white' || props.pikminType === 'yellow' ? 'text-gray-800' : 'text-white';
  return `${baseClass} ${textClass}`;
});

const handleClick = () => {
  toggleCollected(props.itemId);
  emit('toggle', props.itemId);
};

const handleImageError = () => {
  hasError.value = true;
};
</script>
