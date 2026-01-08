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
        <h1 class="text-2xl font-extrabold gradient-text mb-2">確認中...</h1>
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
        <h1 class="text-2xl font-extrabold text-gray-800 mb-2">確認失敗</h1>
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
const error = ref('');

// The Supabase module handles the token exchange automatically
// We just need to wait and redirect
onMounted(async () => {
  // Wait a moment for Supabase to process
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const user = useSupabaseUser();
  if (user.value) {
    router.push('/');
  } else {
    // Check URL for error
    const url = new URL(window.location.href);
    const errorParam = url.searchParams.get('error_description');
    if (errorParam) {
      error.value = errorParam;
    } else {
      // Wait more for processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (!user.value) {
        router.push('/');
      }
    }
  }
});
</script>
