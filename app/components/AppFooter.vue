<template>
  <footer class="glass border-b-0 mt-auto">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="text-center space-y-4">
        <!-- Page Views Counter -->
        <div class="flex items-center justify-center gap-3">
          <span class="text-2xl">👀</span>
          <div>
            <p class="text-sm text-gray-500">總瀏覽次數</p>
            <p class="text-2xl font-bold text-gradient">
              {{ formattedViews }}
            </p>
          </div>
        </div>

        <!-- Divider -->
        <div class="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

        <!-- Links -->
        <div class="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
          <a 
            href="https://github.com/scott0127/pik_tool" 
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-emerald-600 transition-colors flex items-center gap-1"
          >
            <span>⭐</span>
            <span>GitHub</span>
          </a>
          <span class="text-gray-300">•</span>
          <a 
            href="https://buymeacoffee.com/scott5497" 
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-orange-500 transition-colors flex items-center gap-1"
          >
            <span>☕</span>
            <span>支持開發</span>
          </a>
          <span class="text-gray-300">•</span>
          <NuxtLink 
            to="/feedback"
            class="hover:text-emerald-600 transition-colors"
          >
            意見回饋
          </NuxtLink>
        </div>

        <!-- Copyright -->
        <div class="text-xs text-gray-400 space-y-1">
          <p>© 2026 Pikmin Bloom 飾品圖鑑收藏家</p>
          <p>非官方粉絲工具 • Pikmin Bloom 版權歸任天堂所有</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { pageViews, incrementPageViews } = usePageViews();

// Format number with thousands separator
const formattedViews = computed(() => {
  if (pageViews.value === null) return '---';
  return pageViews.value.toLocaleString('zh-TW');
});

// Increment page views on mount
onMounted(async () => {
  await incrementPageViews();
});
</script>
