<template>
  <div class="min-h-screen bg-gradient-to-br from-leaf-50 via-white to-primary-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 mx-auto bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
          <span class="text-4xl">🌸</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">Pikmin Bloom 飾品圖鑑</h1>
        <p class="text-gray-500 mt-2">登入以同步您的收藏進度</p>
      </div>

      <!-- Auth Card -->
      <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
        <!-- Tabs -->
        <div class="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            @click="mode = 'login'"
            class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all"
            :class="mode === 'login' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'"
          >
            登入
          </button>
          <button
            @click="mode = 'register'"
            class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all"
            :class="mode === 'register' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'"
          >
            註冊
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {{ error }}
        </div>

        <!-- Success Message -->
        <div v-if="success" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
          {{ success }}
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Username (Register only) -->
          <div v-if="mode === 'register'">
            <label class="block text-sm font-medium text-gray-700 mb-1">用戶名</label>
            <input
              v-model="username"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="Pikmin_Player"
            >
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="player@example.com"
            >
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">密碼</label>
            <input
              v-model="password"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            >
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="loading" class="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ loading ? '處理中...' : (mode === 'login' ? '登入' : '註冊') }}
          </button>
        </form>

        <!-- Divider -->
        <div class="my-6 flex items-center">
          <div class="flex-1 border-t border-gray-200"></div>
          <span class="px-4 text-sm text-gray-400">或</span>
          <div class="flex-1 border-t border-gray-200"></div>
        </div>

        <!-- Continue as Guest -->
        <NuxtLink
          to="/"
          class="block w-full py-3 text-center text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
        >
          以訪客身份繼續
        </NuxtLink>
      </div>

      <!-- Footer -->
      <p class="text-center text-sm text-gray-400 mt-6">
        登入後可同步收藏進度到雲端，並在留言板分享好友代碼
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient();
const router = useRouter();

const mode = ref<'login' | 'register'>('login');
const email = ref('');
const password = ref('');
const username = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    if (mode.value === 'register') {
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
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      });

      if (signInError) throw signInError;
      
      // Redirect to home on successful login
      router.push('/');
    }
  } catch (e: any) {
    error.value = e.message || '發生錯誤，請稍後再試';
  } finally {
    loading.value = false;
  }
};

// Redirect if already logged in (on mount only, not on logout -> login)
const user = useSupabaseUser();
const hasCheckedAuth = ref(false);

onMounted(() => {
  // Only redirect if user is already logged in when first visiting page
  if (user.value) {
    router.push('/');
  }
  hasCheckedAuth.value = true;
});

// Watch for login success (user was null, now has value)
watch(user, (newUser, oldUser) => {
  // Only redirect if user just logged in (was null before)
  if (newUser && !oldUser && hasCheckedAuth.value) {
    router.push('/');
  }
});
</script>
