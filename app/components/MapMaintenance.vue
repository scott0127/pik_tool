<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
    <div class="max-w-lg w-full">
      <!-- 主要卡片 -->
      <div class="bg-white rounded-3xl shadow-2xl p-8 text-center border border-emerald-100">
        
        <!-- 圖示 -->
        <div class="mb-6">
          <div class="w-24 h-24 mx-auto bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        <!-- 標題 -->
        <h1 class="text-2xl font-bold text-gray-800 mb-3">
          🗺️ 地圖服務暫停中
        </h1>

        <!-- 說明文字 -->
        <div class="text-gray-600 leading-relaxed mb-6 space-y-3">
          <p>
            親愛的皮克敏玩家們，您好！
          </p>
          <p>
            非常抱歉，由於本月伺服器流量即將達到上限，為了確保網站其他功能（圖鑑、收藏追蹤等）能持續正常運作，我們不得不<span class="text-amber-600 font-semibold">暫時關閉地圖服務</span>。
          </p>
          <p class="text-sm text-gray-500">
            這是一個非營利的個人專案，目前的伺服器資源有限，感謝您的理解與包容。
          </p>
        </div>

        <!-- 重新開放時間 -->
        <div class="bg-emerald-50 rounded-2xl p-4 mb-6 border border-emerald-200">
          <p class="text-sm text-emerald-700 mb-1">預計重新開放時間</p>
          <p class="text-2xl font-bold text-emerald-600">2025年2月1日</p>
          <p class="text-xs text-emerald-500 mt-1">屆時流量額度將重置，地圖服務將恢復正常</p>
        </div>

        <!-- CTA 按鈕 -->
        <div class="space-y-3">
          <NuxtLink 
            to="/collection" 
            class="block w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            📚 前往圖鑑頁面
          </NuxtLink>
          <NuxtLink 
            to="/" 
            class="block w-full py-3 px-6 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            🏠 返回首頁
          </NuxtLink>
        </div>
      </div>

      <!-- 底部訊息 -->
      <p class="text-center text-gray-400 text-sm mt-6">
        感謝您一直以來的支持！🌱
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// SEO
useSeoMeta({
  title: '地圖服務暫停中 - Pikmin Bloom 飾品圖鑑',
  description: '地圖服務暫時關閉，預計 2/1 重新開放。',
});
</script>
