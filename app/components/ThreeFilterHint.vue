<template>
  <div v-if="isVisible" class="absolute -top-14 right-2 w-max pointer-events-none z-50 flex flex-col items-center animate-fade-in-up">
    
    <!-- Tooltip Bubble -->
    <div class="relative bg-emerald-600/95 backdrop-blur-md text-white text-xs font-bold pl-3 pr-1 py-1.5 rounded-full shadow-lg border border-emerald-400/30 flex items-center gap-2 pointer-events-auto transform transition-transform hover:scale-105 shadow-emerald-600/20">
      <span class="tracking-wide">展開進階篩選</span>
      <button 
        @click.stop="dismissHint" 
        class="w-5 h-5 flex items-center justify-center bg-emerald-700/50 hover:bg-emerald-800 text-emerald-100 rounded-full transition-colors active:scale-90"
        title="關閉提示"
      >
        <Icon name="lucide:x" class="w-3 h-3" />
      </button>
    </div>

    <!-- Connecting Straight Line -->
    <div class="w-px h-6 bg-gradient-to-b from-emerald-500/80 to-emerald-500/0 mt-0.5"></div>
    
    <!-- Connecting Dot -->
    <div class="w-1.5 h-1.5 rounded-full bg-emerald-500/60 -mt-1 animate-pulse"></div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const isVisible = ref(false);
const HINT_KEY = 'pikmin-filter-hint-dismissed-v2';
let revealTimer: ReturnType<typeof setTimeout> | null = null;

const dismissHint = () => {
  isVisible.value = false;
  localStorage.setItem(HINT_KEY, 'true');
};

onMounted(() => {
  const dismissed = localStorage.getItem(HINT_KEY);
  if (!dismissed) {
    // Slight delay to ensure it renders smoothly after page load
    revealTimer = setTimeout(() => {
      isVisible.value = true;
      revealTimer = null;
    }, 500);
  }
});

onBeforeUnmount(() => {
  if (revealTimer) {
    clearTimeout(revealTimer);
    revealTimer = null;
  }
});
</script>

<style scoped>
@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes float-gentle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* We apply the gentle float to the whole container so the line and dot move with the bubble */
.animate-fade-in-up {
  animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards, float-gentle 3s ease-in-out infinite 0.5s;
}
</style>
