<template>
  <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 py-3">
      <div class="flex items-center justify-between">
        <!-- Logo and Title -->
        <NuxtLink to="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-leaf-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <span class="text-xl">🌸</span>
          </div>
          <div>
            <h1 class="text-lg font-bold text-gray-800 group-hover:text-primary-600 transition-colors">
              Pikmin Bloom 圖鑑
            </h1>
            <p class="text-xs text-gray-500">飾品蒐集追蹤器</p>
          </div>
        </NuxtLink>

        <!-- Quick Stats -->
        <div class="hidden sm:flex items-center gap-4">
          <div class="text-right">
            <p class="text-xs text-gray-500">蒐集進度</p>
            <p class="text-lg font-bold text-primary-600">{{ stats.percentage }}%</p>
          </div>
          <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-primary-500 to-leaf-500 transition-all duration-500"
              :style="{ width: `${stats.percentage}%` }"
            ></div>
          </div>
          <p class="text-sm text-gray-600">
            <span class="font-bold text-primary-600">{{ stats.collected }}</span>
            <span class="text-gray-400">/</span>
            <span>{{ stats.total }}</span>
          </p>
        </div>

        <!-- User Menu -->
        <div class="hidden sm:flex items-center gap-2">
          <template v-if="user">
            <span class="text-sm text-gray-600">{{ userDisplayName }}</span>
            <button
              @click="handleLogout"
              class="px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              登出
            </button>
          </template>
          <NuxtLink
            v-else
            to="/auth"
            class="px-4 py-1.5 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-all"
          >
            登入
          </NuxtLink>
        </div>

        <!-- Mobile Menu Button -->
        <button 
          @click="showMobileMenu = !showMobileMenu"
          class="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="hidden sm:flex items-center gap-1 mt-3">
        <NuxtLink 
          v-for="link in navLinks" 
          :key="link.to"
          :to="link.to"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          :class="[
            $route.path === link.to 
              ? 'bg-primary-100 text-primary-700' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
          ]"
        >
          <span class="mr-1.5">{{ link.icon }}</span>
          {{ link.name }}
        </NuxtLink>
      </nav>

      <!-- Mobile Menu -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="showMobileMenu" class="sm:hidden mt-3 pt-3 border-t border-gray-100">
          <!-- Mobile User -->
          <div class="flex items-center justify-between mb-3 px-2">
            <template v-if="user">
              <span class="text-sm text-gray-600">{{ userDisplayName }}</span>
              <button
                @click="handleLogout"
                class="text-sm text-red-500 hover:text-red-600"
              >
                登出
              </button>
            </template>
            <NuxtLink
              v-else
              to="/auth"
              @click="showMobileMenu = false"
              class="text-sm text-primary-600 font-medium"
            >
              登入 / 註冊
            </NuxtLink>
          </div>

          <!-- Mobile Stats -->
          <div class="flex items-center justify-between mb-3 px-2">
            <p class="text-sm text-gray-600">
              進度: <span class="font-bold text-primary-600">{{ stats.collected }}/{{ stats.total }}</span>
            </p>
            <p class="text-lg font-bold text-primary-600">{{ stats.percentage }}%</p>
          </div>
          <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
            <div 
              class="h-full bg-gradient-to-r from-primary-500 to-leaf-500"
              :style="{ width: `${stats.percentage}%` }"
            ></div>
          </div>

          <!-- Mobile Nav -->
          <div class="grid grid-cols-4 gap-2">
            <NuxtLink 
              v-for="link in navLinks" 
              :key="link.to"
              :to="link.to"
              @click="showMobileMenu = false"
              class="flex flex-col items-center gap-1 p-3 rounded-lg text-sm font-medium transition-all"
              :class="[
                $route.path === link.to 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              ]"
            >
              <span class="text-xl">{{ link.icon }}</span>
              {{ link.name }}
            </NuxtLink>
          </div>
        </div>
      </Transition>
    </div>
  </header>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { getStats } = useCollection();

const showMobileMenu = ref(false);

const stats = computed(() => getStats());

const userDisplayName = computed(() => {
  if (!user.value) return '';
  return user.value.user_metadata?.username || user.value.email?.split('@')[0] || '用戶';
});

const navLinks = [
  { to: '/', name: '首頁', icon: '🏠' },
  { to: '/collection', name: '圖鑑', icon: '📖' },
  { to: '/progress', name: '統計', icon: '📊' },
  { to: '/friends', name: '好友', icon: '👥' },
];
const router = useRouter();

const handleLogout = async () => {
  showMobileMenu.value = false;
  await supabase.auth.signOut({ scope: 'global' });
  // Navigate to auth page after logout
  router.push('/auth');
};
</script>

