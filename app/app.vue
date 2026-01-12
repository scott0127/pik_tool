<template>
  <div class="min-h-screen relative">
    <!-- Background decorations -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <!-- Floating leaves -->
      <div class="absolute top-20 left-[5%] text-6xl opacity-10 sway">🍃</div>
      <div class="absolute top-40 right-[8%] text-5xl opacity-10 sway" style="animation-delay: 1s">🌿</div>
      <div class="absolute bottom-32 left-[12%] text-4xl opacity-10 float">🌱</div>
      <div class="absolute bottom-20 right-[15%] text-5xl opacity-10 float-delayed">🍀</div>
      
      <!-- Gradient orbs -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Loading State -->
    <Transition
      enter-active-class="transition duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-500"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isInitializing" class="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 z-50">
        <div class="text-center">
          <div class="relative inline-block mb-6">
            <div class="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center shadow-xl float glow-emerald">
              <span class="text-4xl">🌱</span>
            </div>
            <span class="absolute -top-1 -right-1 text-xl sparkle">✨</span>
          </div>
          <div class="flex items-center justify-center gap-2 mb-2">
            <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
          </div>
          <p class="text-emerald-700 font-semibold">載入圖鑑資料中...</p>
        </div>
      </div>
    </Transition>
    
    <!-- Main Content -->
    <div v-show="!isInitializing" class="relative z-10">
      <AppHeader />
      
      <main :class="$route.path === '/map' ? 'w-full px-0 py-0' : 'max-w-7xl mx-auto px-4 py-6'">
        <NuxtPage />
      </main>
      
      <AppFooter />
    </div>

    <!-- Toast notifications area -->
    <div id="toast-container" class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"></div>
  </div>
</template>

<script setup lang="ts">
const { loadCollection, loadFromCloud, clearLocalData } = useCollection();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const isInitializing = ref(true);

onMounted(async () => {
  console.log('[App] Starting initialization...');
  try {
    // 先嘗試載入本地資料（快速）
    loadCollection();
    
    // 檢查是否有登入（不阻塞）
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('[App] Session check - session:', !!session);
      if (session?.user) {
        // 已登入：從雲端同步
        console.log('[App] User logged in, syncing from cloud...');
        try {
          await loadFromCloud();
        } catch (e) {
          console.warn('[App] Cloud sync failed:', e);
        }
      }
    }).catch(e => {
      console.warn('[App] Session check failed:', e);
    });
  } catch (e) {
    console.error('[App] Initialization error:', e);
  } finally {
    // 快速顯示頁面
    console.log('[App] Finishing initialization...');
    setTimeout(() => {
      isInitializing.value = false;
    }, 300);
  }
});

// 監聽 auth 狀態變化
onMounted(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('[Auth] State changed:', event);
    
    if (event === 'SIGNED_OUT') {
      // 登出時清除所有本地資料
      clearLocalData();
    } else if (event === 'SIGNED_IN' && session?.user) {
      // 登入時從雲端載入資料
      await loadFromCloud();
    }
  });

  // 清理監聽器
  onUnmounted(() => {
    subscription.unsubscribe();
  });
});
</script>
