<template>
  <div 
    @click="handleClick"
    class="relative group cursor-pointer pop-in"
    :style="{ animationDelay: `${animationDelay}ms` }"
  >
    <div 
      class="relative bg-white/80 backdrop-blur rounded-2xl overflow-hidden transition-all duration-300 shadow-lg"
      :class="[
        isCollected 
          ? 'ring-4 ring-emerald-400 ring-offset-2 shadow-emerald-100' 
          : 'grayscale-[40%] opacity-70 hover:grayscale-0 hover:opacity-100'
      ]"
    >
      <!-- Image Container -->
      <div class="relative aspect-square bg-gradient-to-br from-gray-50 via-white to-gray-100 p-3 overflow-hidden">
        <!-- Background pattern -->
        <div class="absolute inset-0 opacity-5">
          <div class="absolute inset-0" style="background-image: radial-gradient(circle, #22c55e 1px, transparent 1px); background-size: 20px 20px;"></div>
        </div>

        <!-- Image -->
        <img 
          v-if="imageUrl && !hasError"
          :src="imageUrl"
          :alt="`${variant?.nameEn} ${pikminType} Pikmin`"
          class="relative w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
          referrerpolicy="no-referrer"
          @error="handleImageError"
        >
        <div 
          v-else 
          class="w-full h-full flex items-center justify-center text-5xl"
        >
          {{ category?.icon || '🌸' }}
        </div>

        <!-- Pikmin Type Badge -->
        <div 
          class="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shadow-lg transform group-hover:scale-110 transition-transform"
          :class="pikminBadgeClass"
        >
          {{ pikminTypeShort }}
        </div>

        <!-- Rare Sparkle -->
        <div 
          v-if="variant?.isRare"
          class="absolute top-2 left-2 text-yellow-400 text-lg sparkle"
        >
          ✨
        </div>

        <!-- Collected Checkmark -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="scale-0 rotate-180 opacity-0"
          enter-to-class="scale-100 rotate-0 opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="scale-100 rotate-0 opacity-100"
          leave-to-class="scale-0 rotate-180 opacity-0"
        >
          <div 
            v-if="isCollected"
            class="absolute bottom-2 right-2 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </Transition>

        <!-- Hover overlay -->
        <div class="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors duration-300 rounded-lg pointer-events-none"></div>
      </div>

      <!-- Info Section -->
      <div class="p-3 text-center border-t border-gray-100">
        <p class="text-sm font-bold text-gray-700 truncate" :title="variant?.name">
          {{ variant?.name || 'Unknown' }}
        </p>
        <p class="text-xs text-gray-400 truncate mt-0.5" :title="variant?.nameEn">
          {{ variant?.nameEn || '' }}
        </p>
      </div>
    </div>

    <!-- Click ripple effect -->
    <Transition
      enter-active-class="transition duration-500"
      enter-from-class="scale-0 opacity-100"
      enter-to-class="scale-150 opacity-0"
      leave-active-class="transition duration-0"
    >
      <div 
        v-if="showRipple"
        class="absolute inset-0 bg-emerald-400/30 rounded-2xl pointer-events-none"
      ></div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { PikminType } from '~/types/decor';
import { PIKMIN_TYPE_COLORS } from '~/types/decor';

const props = withDefaults(defineProps<{
  itemId: string;
  categoryId: string;
  variantId: string;
  pikminType: PikminType;
  animationDelay?: number;
}>(), {
  animationDelay: 0
});

const emit = defineEmits<{
  toggle: [itemId: string];
}>();

const { isCollected: checkCollected, toggleCollected } = useCollection();
const { getVariant, getCategory, getImageUrl } = useDecorData();
const toast = useToast();

const variant = computed(() => getVariant(props.categoryId, props.variantId));
const category = computed(() => getCategory(props.categoryId));
const isCollected = computed(() => checkCollected(props.itemId));
const imageUrl = computed(() => getImageUrl(props.categoryId, props.variantId, props.pikminType));
const hasError = ref(false);
const showRipple = ref(false);

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
  // Trigger ripple effect
  showRipple.value = true;
  setTimeout(() => {
    showRipple.value = false;
  }, 500);
  
  // Toggle and get new state
  const isNowCollected = toggleCollected(props.itemId);
  
  // Show toast notification
  if (isNowCollected) {
    toast.success('已儲存 ✓', 1200);
  } else {
    toast.info('已移除', 1200);
  }
  
  emit('toggle', props.itemId);
};

const handleImageError = () => {
  hasError.value = true;
};
</script>
