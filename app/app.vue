<template>
  <div class="min-h-screen">
    <div v-if="isInitializing" class="fixed inset-0 flex items-center justify-center bg-gray-50 z-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto"></div>
        <p class="mt-4 text-gray-600 font-medium">載入資料中...</p>
      </div>
    </div>
    
    <div v-else>
      <AppHeader />
      <main class="max-w-7xl mx-auto px-4 py-6">
        <NuxtPage />
      </main>
      
      <!-- Footer -->
      <footer class="mt-12 py-6 text-center text-sm text-gray-500 border-t border-gray-200">
        <p>資料來源：<a href="https://www.pikminwiki.com/Decor_Pikmin" target="_blank" class="text-primary-600 hover:underline">Pikmin Wiki</a></p>
        <p class="mt-1">僅供私人學術研究使用</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
// Load collection from localStorage and cloud
const { loadCollection, loadFromCloud } = useCollection();
const isInitializing = ref(true);

onMounted(async () => {
  try {
    // First load from localStorage (fast, offline available)
    loadCollection();
    
    // Then sync from cloud if logged in (may update with newer data)
    await loadFromCloud();
  } finally {
    isInitializing.value = false;
  }
});
</script>

