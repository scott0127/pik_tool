<template>
  <div class="min-h-screen">
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
</template>

<script setup lang="ts">
// Load collection from localStorage on client side
const { loadCollection } = useCollection();

onMounted(() => {
  loadCollection();
});
</script>
