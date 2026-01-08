<template>
  <div class="min-h-screen bg-gradient-to-br from-leaf-50 via-white to-primary-50 flex items-center justify-center p-4">
    <div class="text-center">
      <div class="w-16 h-16 mx-auto bg-primary-500 rounded-full flex items-center justify-center mb-4">
        <svg v-if="!error" class="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span v-else class="text-2xl">❌</span>
      </div>
      <h1 class="text-xl font-semibold text-gray-800">
        {{ error ? '確認失敗' : '確認中...' }}
      </h1>
      <p class="text-gray-500 mt-2">
        {{ error || '請稍候，正在確認您的帳號...' }}
      </p>
      <NuxtLink
        v-if="error"
        to="/auth"
        class="inline-block mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all"
      >
        返回登入
      </NuxtLink>
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
