<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-95"
    >
      <div
        v-if="visible"
        class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
      >
        <div 
          class="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md"
          :class="toastClasses"
        >
          <!-- Icon -->
          <div class="text-xl flex-shrink-0">{{ icon }}</div>
          
          <!-- Message -->
          <p class="font-semibold text-sm">{{ message }}</p>
          
          <!-- Success checkmark animation -->
          <div v-if="type === 'success'" class="flex-shrink-0">
            <svg 
              class="w-5 h-5 text-white animate-scale-in" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="3" 
                d="M5 13l4 4L19 7"
                class="animate-draw"
              />
            </svg>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { ToastType } from '~/composables/useToast';

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
}

const props = withDefaults(defineProps<ToastProps>(), {
  type: 'info',
  duration: 1500
});

const visible = ref(false);
let timer: NodeJS.Timeout | null = null;

const icon = computed(() => {
  const icons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };
  return icons[props.type];
});

const toastClasses = computed(() => {
  const classes: Record<ToastType, string> = {
    success: 'bg-emerald-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    warning: 'bg-amber-500 text-white'
  };
  return classes[props.type];
});

// Auto show when message changes
watch(() => props.message, (newMessage) => {
  if (newMessage) {
    if (timer) {
      clearTimeout(timer);
    }
    
    visible.value = true;
    
    timer = setTimeout(() => {
      visible.value = false;
      timer = null;
    }, props.duration);
  }
}, { immediate: true });

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer);
  }
});
</script>

<style scoped>
@keyframes scale-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes draw {
  0% {
    stroke-dasharray: 0 100;
  }
  100% {
    stroke-dasharray: 100 0;
  }
}

.animate-scale-in {
  animation: scale-in 0.4s ease-out;
}

.animate-draw {
  animation: draw 0.4s ease-out;
}
</style>
