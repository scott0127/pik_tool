<template>
  <header class="sticky top-0 z-50">
    <!-- Decorative top bar -->
    <div class="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400"></div>
    
    <div class="glass border-t-0 border-x-0">
      <div class="max-w-7xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <!-- Logo and Title -->
          <NuxtLink to="/" class="flex items-center gap-3 group">
            <div class="relative">
              <div class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <span class="text-2xl">🌱</span>
              </div>
              <!-- Floating leaf decoration -->
              <span class="absolute -top-1 -right-1 text-sm sway">🍃</span>
            </div>
            <div>
              <h1 class="text-xl font-extrabold text-gradient group-hover:opacity-80 transition-opacity">
                Pikmin Bloom
              </h1>
              <p class="text-xs text-gray-500 font-medium">飾品圖鑑收藏家</p>
            </div>
          </NuxtLink>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center gap-1 bg-white/50 rounded-2xl p-1">
            <NuxtLink 
              v-for="link in navLinks" 
              :key="link.to"
              :to="link.to"
              class="nav-item"
              :class="[
                $route.path === link.to ? 'nav-item-active' : 'nav-item-inactive'
              ]"
            >
              <span class="text-lg">{{ link.icon }}</span>
              <span class="hidden lg:inline">{{ link.name }}</span>
            </NuxtLink>
          </nav>

          <!-- Right Section -->
          <div class="flex items-center gap-3">
            <!-- Progress Ring (Desktop) -->
            <div class="hidden sm:flex items-center gap-3 bg-white/50 rounded-2xl px-4 py-2">
              <div class="relative w-10 h-10">
                <svg class="w-10 h-10 progress-ring" viewBox="0 0 36 36">
                  <circle
                    class="text-gray-200"
                    stroke="currentColor"
                    stroke-width="3"
                    fill="transparent"
                    r="16"
                    cx="18"
                    cy="18"
                  />
                  <circle
                    class="text-emerald-500 progress-ring-circle"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    fill="transparent"
                    r="16"
                    cx="18"
                    cy="18"
                    :stroke-dasharray="100.53"
                    :stroke-dashoffset="100.53 - (stats.percentage / 100) * 100.53"
                  />
                </svg>
                <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-emerald-600">
                  {{ stats.percentage }}%
                </span>
              </div>
              <div class="text-right">
                <p class="text-sm font-bold text-gray-700">{{ stats.collected }}</p>
                <p class="text-xs text-gray-400">/ {{ stats.total }}</p>
              </div>
            </div>

            <!-- Search Button (Desktop) -->
            <button 
              @click="showSearch = !showSearch"
              class="hidden md:flex w-10 h-10 items-center justify-center rounded-xl bg-white/60 hover:bg-white text-gray-500 hover:text-emerald-600 transition-all"
            >
              🔍
            </button>

            <!-- User Menu -->
            <div class="hidden sm:block">
              <template v-if="user">
                <div class="flex items-center gap-2">
                  <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                    {{ userInitial }}
                  </div>
                  <button
                    @click="handleLogout"
                    class="text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    登出
                  </button>
                </div>
              </template>
              <NuxtLink
                v-else
                to="/auth"
                class="btn-primary text-sm !py-2 !px-4"
              >
                登入
              </NuxtLink>
            </div>

            <!-- Mobile Menu Button -->
            <button 
              @click="showMobileMenu = !showMobileMenu"
              class="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/60 hover:bg-white transition-all"
            >
              <Transition
                enter-active-class="transition duration-200"
                enter-from-class="rotate-90 opacity-0"
                enter-to-class="rotate-0 opacity-100"
                leave-active-class="transition duration-200"
                leave-from-class="rotate-0 opacity-100"
                leave-to-class="-rotate-90 opacity-0"
                mode="out-in"
              >
                <span v-if="showMobileMenu" class="text-xl">✕</span>
                <span v-else class="text-xl">☰</span>
              </Transition>
            </button>
          </div>
        </div>

        <!-- Search Bar (Expandable) -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-4 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 -translate-y-4 scale-95"
        >
          <div v-if="showSearch" class="mt-4 relative">
            <input 
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              type="text"
              placeholder="搜尋飾品名稱、分類..."
              class="input-field pl-12 pr-12"
              autofocus
            />
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
            <button 
              v-if="searchQuery"
              @click="searchQuery = ''; handleSearch()"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </Transition>

        <!-- Mobile Menu -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-4"
        >
          <div v-if="showMobileMenu" class="md:hidden mt-4 space-y-4">
            <!-- Mobile Progress -->
            <div class="flex items-center justify-between bg-white/50 rounded-2xl p-4">
              <div class="flex items-center gap-3">
                <div class="relative w-12 h-12">
                  <svg class="w-12 h-12 progress-ring" viewBox="0 0 36 36">
                    <circle class="text-gray-200" stroke="currentColor" stroke-width="3" fill="transparent" r="16" cx="18" cy="18"/>
                    <circle class="text-emerald-500 progress-ring-circle" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="transparent" r="16" cx="18" cy="18"
                      :stroke-dasharray="100.53"
                      :stroke-dashoffset="100.53 - (stats.percentage / 100) * 100.53"
                    />
                  </svg>
                  <span class="absolute inset-0 flex items-center justify-center text-sm font-bold text-emerald-600">
                    {{ stats.percentage }}%
                  </span>
                </div>
                <div>
                  <p class="font-bold text-gray-700">蒐集進度</p>
                  <p class="text-sm text-gray-500">{{ stats.collected }} / {{ stats.total }} 件</p>
                </div>
              </div>
              <template v-if="user">
                <button @click="handleLogout" class="text-sm text-red-500">登出</button>
              </template>
              <NuxtLink v-else to="/auth" @click="showMobileMenu = false" class="btn-primary text-sm !py-2">
                登入
              </NuxtLink>
            </div>

            <!-- Mobile Search -->
            <div class="relative">
              <input 
                v-model="searchQuery"
                @keyup.enter="handleSearch"
                type="text"
                placeholder="搜尋飾品..."
                class="input-field pl-12"
              />
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
            </div>

            <!-- Mobile Nav -->
            <div class="grid grid-cols-4 gap-2">
              <NuxtLink 
                v-for="link in navLinks" 
                :key="link.to"
                :to="link.to"
                @click="showMobileMenu = false"
                class="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
                :class="[
                  $route.path === link.to 
                    ? 'bg-emerald-500 text-white shadow-lg' 
                    : 'bg-white/60 text-gray-600 hover:bg-white'
                ]"
              >
                <span class="text-2xl">{{ link.icon }}</span>
                <span class="text-xs font-semibold">{{ link.name }}</span>
              </NuxtLink>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();
const { getStats } = useCollection();

const showMobileMenu = ref(false);
const showSearch = ref(false);
const searchQuery = ref('');

const stats = computed(() => getStats());

const userInitial = computed(() => {
  if (!user.value) return '';
  const name = user.value.user_metadata?.username || user.value.email?.split('@')[0] || '';
  return name.charAt(0).toUpperCase();
});

const navLinks = [
  { to: '/', name: '首頁', icon: '🏠' },
  { to: '/collection', name: '圖鑑', icon: '📖' },
  { to: '/map', name: '地圖', icon: '🗺️' },
  { to: '/progress', name: '統計', icon: '📊' },
  { to: '/friends', name: '好友', icon: '🤝' },
];

const isLoggingOut = ref(false);

const handleLogout = async () => {
  // 防止重複點擊
  if (isLoggingOut.value) return;
  
  isLoggingOut.value = true;
  showMobileMenu.value = false;
  
  // 清除 Supabase cookie
  const supabaseCookieName = 'sb-lfhldxtbzqagqcofseom-auth-token';
  document.cookie = `${supabaseCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  document.cookie = `${supabaseCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
  document.cookie = `${supabaseCookieName}=; max-age=0; path=/;`;
  
  // 清除所有 sb- 開頭的 cookies
  document.cookie.split(";").forEach((c) => {
    const cookieName = c.split("=")[0].trim();
    if (cookieName.startsWith('sb-')) {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; max-age=0; path=/;`;
    }
  });
  
  // 清除 localStorage 中的 Supabase 相關資料
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('sb-') || key.includes('supabase')) {
      localStorage.removeItem(key);
    }
  });
  
  // 清除 sessionStorage
  sessionStorage.clear();
  
  // 嘗試呼叫 signOut（不等待）
  supabase.auth.signOut().catch(() => {});
  
  // 重新載入頁面到登入頁
  window.location.href = '/auth';
};

const handleSearch = () => {
  showMobileMenu.value = false;
  showSearch.value = false;
  router.push({ 
    path: '/collection', 
    query: searchQuery.value ? { search: searchQuery.value } : {} 
  });
};

// Close menus on route change
watch(() => router.currentRoute.value.path, () => {
  showMobileMenu.value = false;
  showSearch.value = false;
});
</script>
