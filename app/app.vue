<template>
  <div class="min-h-screen relative">
    <!-- Background decorations -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <!-- Floating leaves -->
      <div class="absolute top-20 left-[5%] text-6xl opacity-10 sway">🍃</div>
      <div class="absolute top-40 right-[8%] text-5xl opacity-10 sway" style="animation-delay: 1s">🌿</div>
      <div class="absolute bottom-32 left-[12%] text-4xl opacity-10 float">🌱</div>
      <div class="absolute bottom-20 right-[15%] text-5xl opacity-10 float-delayed">🍀</div>
      
      <!-- Gradient orbs -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Loading State -->
    <Transition
      enter-active-class="transition duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-500"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isInitializing" class="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 z-50">
        <div class="text-center">
          <div class="relative inline-block mb-6">
            <div class="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center shadow-xl float glow-emerald">
              <span class="text-4xl">🌱</span>
            </div>
            <span class="absolute -top-1 -right-1 text-xl sparkle">✨</span>
          </div>
          <div class="flex items-center justify-center gap-2 mb-2">
            <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
          </div>
          <p class="text-emerald-700 font-semibold">載入圖鑑資料中...</p>
        </div>
      </div>
    </Transition>
    
    <!-- Main Content -->
    <div v-show="!isInitializing" class="relative z-10">
      <AppHeader />
      
      <main class="max-w-7xl mx-auto px-4 py-6">
        <NuxtPage />
      </main>
      
      <!-- Footer -->
      <footer class="relative z-10 mt-12 py-8 text-center border-t border-white/30 bg-white/30 backdrop-blur-sm">
        <div class="max-w-7xl mx-auto px-4">
          <div class="flex items-center justify-center gap-2 mb-3">
            <span class="text-2xl">🌱</span>
            <span class="font-bold text-emerald-700">Pikmin Bloom 圖鑑</span>
          </div>
          <p class="text-sm text-gray-600 mb-2">
            資料來源：<a href="https://www.pikminwiki.com/Decor_Pikmin" target="_blank" class="text-emerald-600 hover:text-emerald-700 underline underline-offset-2">Pikmin Wiki</a>
          </p>
          <p class="text-xs text-gray-500">僅供私人學術研究使用 • Made with 💚</p>
        </div>
      </footer>
    </div>

    <!-- Toast notifications area -->
    <div id="toast-container" class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"></div>
  </div>
</template>

<script setup lang="ts">
const { loadCollection, loadFromCloud } = useCollection();
const isInitializing = ref(true);

onMounted(async () => {
  try {
    // First load from localStorage (fast, offline available)
    loadCollection();
    
    // Then sync from cloud if logged in (may update with newer data)
    await loadFromCloud();
  } finally {
    // Small delay for smooth transition
    setTimeout(() => {
      isInitializing.value = false;
    }, 500);
  }
});
</script>
