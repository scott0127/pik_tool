<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Background Decorations -->
    <div class="fixed inset-0 pointer-events-none -z-10">
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50"></div>
      <div class="absolute top-20 left-10 text-8xl opacity-10 animate-float">🌸</div>
      <div class="absolute bottom-20 right-10 text-7xl opacity-10 animate-float" style="animation-delay: 1s;">🍃</div>
      <div class="absolute top-1/2 left-1/4 text-6xl opacity-5 animate-float" style="animation-delay: 2s;">🌱</div>
      
      <!-- Gradient Orbs -->
      <div class="absolute top-0 right-0 w-96 h-96 bg-emerald-200 rounded-full blur-3xl opacity-30"></div>
      <div class="absolute bottom-0 left-0 w-80 h-80 bg-teal-200 rounded-full blur-3xl opacity-30"></div>
    </div>

    <div class="w-full max-w-md animate-slide-up">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-200 mb-6 animate-float">
          <span class="text-5xl">🔐</span>
        </div>
        <h1 class="text-3xl font-extrabold gradient-text mb-2">設定新密碼</h1>
        <p class="text-gray-500">請輸入您的新密碼</p>
      </div>

      <!-- Card -->
      <div class="glass rounded-3xl p-8 shadow-2xl">
        <!-- Loading State (驗證中) -->
        <div v-if="pageState === 'loading'" class="text-center py-8">
          <div class="flex items-center justify-center gap-2 mb-4">
            <div class="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
          </div>
          <p class="text-gray-600">正在驗證重置連結...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="pageState === 'error'" class="text-center py-4">
          <div class="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span class="text-4xl">❌</span>
          </div>
          <h2 class="text-xl font-bold text-gray-800 mb-2">驗證失敗</h2>
          <p class="text-gray-500 mb-6">{{ error }}</p>
          <NuxtLink to="/auth" class="btn-primary inline-flex items-center gap-2">
            <span>←</span>
            <span>返回登入頁面重新申請</span>
          </NuxtLink>
        </div>

        <!-- Form State (驗證成功，可以輸入新密碼) -->
        <template v-else-if="pageState === 'ready'">
          <!-- Form Error -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div v-if="formError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm flex items-start gap-3">
              <span class="text-lg">⚠️</span>
              <span>{{ formError }}</span>
            </div>
          </Transition>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <!-- New Password -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <span class="flex items-center gap-2">
                  <span>🔑</span>
                  新密碼
                </span>
              </label>
              <input
                v-model="newPassword"
                type="password"
                required
                minlength="6"
                class="input-field"
                placeholder="請輸入至少 6 個字元"
              >
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <span class="flex items-center gap-2">
                  <span>🔐</span>
                  確認密碼
                </span>
              </label>
              <input
                v-model="confirmPassword"
                type="password"
                required
                minlength="6"
                class="input-field"
                placeholder="再次輸入新密碼"
              >
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="submitting"
              class="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
            >
              <svg v-if="submitting" class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{{ submitting ? '更新中...' : '更新密碼' }}</span>
            </button>
          </form>
        </template>

        <!-- Success State -->
        <div v-else-if="pageState === 'success'" class="text-center py-4">
          <div class="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <span class="text-4xl">✅</span>
          </div>
          <h2 class="text-xl font-bold text-gray-800 mb-2">密碼已更新！</h2>
          <p class="text-gray-500 mb-6">您的密碼已成功更新，請使用新密碼登入。</p>
          <NuxtLink to="/auth" class="btn-primary inline-flex items-center gap-2">
            <span>🚀</span>
            <span>前往登入</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-sm text-gray-400 mt-8 px-4">
        設定完成後，請使用新密碼登入
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient();

// 頁面狀態: loading -> ready/error -> success
const pageState = ref<'loading' | 'ready' | 'error' | 'success'>('loading');
const error = ref('');
const formError = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const submitting = ref(false);

// 處理表單提交
const handleSubmit = async () => {
  // 驗證密碼
  if (newPassword.value !== confirmPassword.value) {
    formError.value = '兩次輸入的密碼不一致';
    return;
  }

  if (newPassword.value.length < 6) {
    formError.value = '密碼至少需要 6 個字元';
    return;
  }

  submitting.value = true;
  formError.value = '';

  try {
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword.value,
    });
    
    if (updateError) throw updateError;
    
    // 更新成功，登出並顯示成功訊息
    await supabase.auth.signOut();
    pageState.value = 'success';
  } catch (e: any) {
    formError.value = e.message || '更新密碼時發生錯誤，請稍後再試';
  } finally {
    submitting.value = false;
  }
};

// 頁面載入時處理 auth token
onMounted(async () => {
  console.log('[UpdatePassword] Page mounted');
  console.log('[UpdatePassword] URL:', window.location.href);
  console.log('[UpdatePassword] Hash:', window.location.hash);
  
  // Implicit Flow: token 在 URL hash 中 (例如 #access_token=xxx&type=recovery)
  // Supabase client 會自動從 hash 中提取並建立 session
  // 我們只需要等待一下讓它處理完成
  
  try {
    // 等待 Supabase 處理 URL hash 中的 token
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 檢查是否有 session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[UpdatePassword] Session error:', sessionError);
      error.value = sessionError.message;
      pageState.value = 'error';
      return;
    }
    
    if (session) {
      console.log('[UpdatePassword] Session found, ready to update password');
      
      // 清除 URL hash（避免 token 暴露在 URL 中）
      if (window.location.hash) {
        window.history.replaceState({}, '', window.location.pathname);
      }
      
      pageState.value = 'ready';
    } else {
      console.log('[UpdatePassword] No session found');
      error.value = '請透過重置密碼郵件中的連結訪問此頁面';
      pageState.value = 'error';
    }
  } catch (e: any) {
    console.error('[UpdatePassword] Error:', e);
    error.value = e.message || '發生錯誤，請重新申請密碼重置';
    pageState.value = 'error';
  }
});
</script>
