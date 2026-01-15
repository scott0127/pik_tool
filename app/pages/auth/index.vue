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
          <span class="text-5xl">🌸</span>
        </div>
        <h1 class="text-3xl font-extrabold gradient-text mb-2">Pikmin Bloom 飾品圖鑑</h1>
        <p class="text-gray-500">登入以同步您的收藏進度</p>
      </div>

      <!-- Auth Card -->
      <div class="glass rounded-3xl p-8 shadow-2xl">
        <!-- Tabs -->
        <div class="flex mb-8 bg-gray-100/80 rounded-2xl p-1.5">
          <button
            @click="mode = 'login'"
            class="flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300"
            :class="mode === 'login' 
              ? 'bg-white shadow-lg text-emerald-600' 
              : 'text-gray-500 hover:text-gray-700'"
          >
            登入
          </button>
          <button
            @click="mode = 'register'"
            class="flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300"
            :class="mode === 'register' 
              ? 'bg-white shadow-lg text-emerald-600' 
              : 'text-gray-500 hover:text-gray-700'"
          >
            註冊
          </button>
        </div>

        <!-- Forgot Password Mode Header -->
        <div v-if="mode === 'forgot'" class="mb-6 text-center">
          <h2 class="text-xl font-bold text-gray-800 mb-2">重置密碼</h2>
          <p class="text-gray-500 text-sm">輸入您的 Email，我們會發送重置連結給您</p>
        </div>

        <!-- Error Message -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm flex items-start gap-3">
            <span class="text-lg">⚠️</span>
            <span>{{ error }}</span>
          </div>
        </Transition>

        <!-- Success Message -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="success" class="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-600 text-sm flex items-start gap-3">
            <span class="text-lg">✅</span>
            <span>{{ success }}</span>
          </div>
        </Transition>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Username (Register only) -->
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-4"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-4"
          >
            <div v-if="mode === 'register'">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <span class="flex items-center gap-2">
                  <span>👤</span>
                  用戶名
                </span>
              </label>
              <input
                v-model="username"
                type="text"
                required
                class="input-field"
                placeholder="Pikmin_Player"
              >
            </div>
          </Transition>

          <!-- Email -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="flex items-center gap-2">
                <span>📧</span>
                Email
              </span>
            </label>
            <input
              v-model="email"
              type="email"
              required
              class="input-field"
              placeholder="player@example.com"
            >
          </div>

          <!-- Password -->
          <div v-if="mode !== 'forgot'">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="flex items-center gap-2">
                <span>🔐</span>
                密碼
              </span>
            </label>
            <PasswordInput
              v-model="password"
              :required="true"
              :minlength="6"
              placeholder="••••••••"
            />
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
          >
            <svg v-if="loading" class="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>{{ loading ? '處理中...' : submitButtonText }}</span>
          </button>

          <!-- Forgot Password Link -->
          <div v-if="mode === 'login'" class="text-center">
            <button
              type="button"
              @click="mode = 'forgot'"
              class="text-sm text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
            >
              忘記密碼？
            </button>
          </div>

          <!-- Back to Login Link -->
          <div v-if="mode === 'forgot'" class="text-center">
            <button
              type="button"
              @click="mode = 'login'"
              class="text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors flex items-center justify-center gap-1"
            >
              <span>←</span>
              <span>返回登入</span>
            </button>
          </div>
        </form>

        <!-- Divider -->
        <div class="my-8 flex items-center gap-4">
          <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          <span class="text-sm text-gray-400 font-medium">或</span>
          <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>
        <p class="text-center text-sm text-gray-400 mt-4 px-4 leading-relaxed">
          ⚠️ 登入後仍需在圖鑑中手動點擊收藏。<br>
          <span class="text-gray-500">登入功能僅將本網站的收藏資料儲存至雲端，並不會與 Pikmin Bloom 遊戲資料連動。</span>
        </p>
        <!-- Google Sign In -->
        <button
          @click="signInWithGoogle"
          :disabled="loading"
          class="w-full py-4 px-6 bg-white border-2 border-gray-200 rounded-2xl font-bold text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>使用 Google 登入</span>
        </button>

        <!-- Continue as Guest -->
        <NuxtLink
          to="/"
          class="btn-secondary w-full py-4 text-base flex items-center justify-center gap-2"
        >
          <span>🌱</span>
          <span>以訪客身份繼續</span>
        </NuxtLink>
      </div>

      <!-- Footer -->
      <p class="text-center text-sm text-gray-400 mt-8 px-4">
        登入後可同步收藏進度到雲端，並在留言板分享好友代碼
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();
const authStore = useAuthStore();

const mode = ref<'login' | 'register' | 'forgot'>('login');
const email = ref('');
const password = ref('');
const username = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');

const submitButtonText = computed(() => {
  switch (mode.value) {
    case 'login': return '登入';
    case 'register': return '註冊';
    case 'forgot': return '發送重置連結';
  }
});

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    if (mode.value === 'forgot') {
      // 密碼重置
      await authStore.resetPassword(email.value);
      success.value = '重置連結已發送！請檢查您的 Email 信箱。';
    } else if (mode.value === 'register') {
      // 注册需要额外的 username，直接用 Supabase
      const supabase = useSupabaseClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          data: {
            username: username.value,
          },
        },
      });

      if (signUpError) throw signUpError;
      
      success.value = '註冊成功！請檢查您的 Email 確認帳號。';
    } else {
      // 使用 AuthStore 登入
      await authStore.signInWithEmail(email.value, password.value);
      router.push('/');
    }
  } catch (e: any) {
    error.value = e.message || '發生錯誤，請稍後再試';
  } finally {
    loading.value = false;
  }
};

const signInWithGoogle = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    await authStore.signInWithGoogle();
  } catch (e: any) {
    error.value = e.message || '無法使用 Google 登入，請確認已在 Supabase 啟用 Google Provider';
    loading.value = false;
  }
};

// 已登入则跳转首页（但排除密碼更新頁面）
const route = useRoute();
const isUpdatePasswordPage = computed(() => route.path === '/auth/update-password');

onMounted(async () => {
  await authStore.waitForInit();
  if (authStore.isAuthenticated.value && !isUpdatePasswordPage.value) {
    router.push('/');
  }
});

// 监听登入成功（但排除密碼更新頁面）
watch(() => authStore.isAuthenticated.value, (isAuth) => {
  if (isAuth && !isUpdatePasswordPage.value) {
    router.push('/');
  }
});
</script>
