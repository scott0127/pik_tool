<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Background -->
    <div class="fixed inset-0 pointer-events-none -z-10">
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50"></div>
      <div class="absolute top-0 right-0 w-96 h-96 bg-emerald-200 rounded-full blur-3xl opacity-30"></div>
      <div class="absolute bottom-0 left-0 w-80 h-80 bg-teal-200 rounded-full blur-3xl opacity-30"></div>
    </div>

    <div class="text-center animate-slide-up">
      <!-- Loading State -->
      <div v-if="!error" class="glass rounded-3xl p-12 shadow-2xl">
        <div class="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-200">
          <svg class="animate-spin h-12 w-12 text-white" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <h1 class="text-2xl font-extrabold gradient-text mb-2">登入中...</h1>
        <p class="text-gray-500">請稍候，正在確認您的帳號</p>
        
        <!-- Animated Dots -->
        <div class="flex justify-center gap-1.5 mt-6">
          <div class="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
          <div class="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce" style="animation-delay: 0.1s;"></div>
          <div class="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="glass rounded-3xl p-12 shadow-2xl max-w-md">
        <div class="w-24 h-24 mx-auto bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-red-200">
          <span class="text-5xl">❌</span>
        </div>
        <h1 class="text-2xl font-extrabold text-gray-800 mb-2">登入失敗</h1>
        <p class="text-gray-500 mb-6">{{ error }}</p>
        <NuxtLink
          to="/auth"
          class="btn-primary inline-flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          返回登入
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();
const authStore = useAuthStore();
const error = ref('');

onMounted(async () => {
  console.log('[Callback] OAuth callback page mounted');
  
  try {
    // 检查 URL 是否有错误参数
    const url = new URL(window.location.href);
    const errorParam = url.searchParams.get('error_description') || url.searchParams.get('error');
    
    if (errorParam) {
      console.log('[Callback] Error in URL:', errorParam);
      error.value = errorParam;
      return;
    }

    // 等待 Supabase 处理 hash 中的 token
    // 这是关键：给 Supabase 足够时间完成 token exchange
    console.log('[Callback] Waiting for Supabase to process token...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 重新初始化 AuthStore（确保获取最新 session）
    console.log('[Callback] Initializing AuthStore...');
    await authStore.initialize();

    // 检查是否成功登入
    if (authStore.isAuthenticated.value) {
      console.log('[Callback] Successfully authenticated, redirecting to home...');
      router.push('/');
    } else {
      // 再等一会儿再试一次
      console.log('[Callback] Not authenticated yet, waiting...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 最后检查一次
      const supabase = useSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('[Callback] Found session on retry, redirecting...');
        router.push('/');
      } else {
        console.log('[Callback] No session found, showing error');
        error.value = '登入驗證失敗，請重新嘗試';
      }
    }
  } catch (e: any) {
    console.error('[Callback] Error:', e);
    error.value = e.message || '發生錯誤，請重新嘗試';
  }
});
</script>
