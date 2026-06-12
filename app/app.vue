<template>
  <div class="min-h-screen relative">
    <AppAmbientBackground v-if="!isStandalonePage" />

    <!-- Updating Version State -->
    <Transition
      enter-active-class="transition duration-300"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-300"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="isUpdatingVersion" class="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-[9999]">
        <div class="text-center bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-700 max-w-sm mx-4">
          <div class="relative inline-block mb-6">
            <div class="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
              <Icon name="line-md:cloud-download-outline-loop" class="w-10 h-10 text-white" />
            </div>
            <span class="absolute -top-2 -right-2 text-2xl animate-bounce">✨</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">更新載入中</h2>
          <p class="text-gray-500 dark:text-gray-400 font-medium mb-6">發現了新的遊戲資料，正在為您同步...</p>
          
          <div class="flex items-center justify-center gap-2">
            <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Loading State -->
    <Transition
      enter-active-class="transition duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-500"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="!isAppReady && !isStandalonePage && !isUpdatingVersion" class="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 z-50">
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
    <div v-show="isAppReady || isStandalonePage" class="relative z-10">
      <AppHeader v-if="!isStandalonePage" />
      
      <main :class="mainClass">
        <NuxtPage />
      </main>
      
      <AppFooter v-if="!isStandalonePage" />
    </div>

    <!-- Global Components -->
    <GlobalAnnouncement v-if="!isStandalonePage" />
    <PwaInstallPrompt v-if="!isStandalonePage" />
    <Toast 
      v-if="currentToast && isShowingToast"
      :message="currentToast.message"
      :type="currentToast.type"
      :duration="currentToast.duration"
    />

    <!-- Toast notifications area (legacy) -->
    <div id="toast-container" class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"></div>

    <div class="portrait-only-guard" role="alert" aria-live="assertive">
      <div class="portrait-only-panel">
        <div class="portrait-only-icon">
          <Icon name="lucide:rotate-ccw" class="h-7 w-7" />
        </div>
        <h2>請旋轉為直向使用</h2>
        <p>手機版介面目前以直向操作設計，轉回直向後就可以繼續使用。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 使用新的 AuthStore
const authStore = useAuthStore();
const { loadCollection, loadFromCloud } = useCollection();
const isInitializing = ref(true);
const isUpdatingVersion = useState('isUpdatingVersion', () => false);
const isCheckingVersion = useState('isCheckingVersion', () => true);
const isAppReady = computed(() => !isInitializing.value && !isCheckingVersion.value);
const route = useRoute();
const isStandalonePage = computed(() => route.meta.standalone === true);
let appInitStarted = false;
const mainClass = computed(() => {
  if (isStandalonePage.value) return 'w-full px-0 py-0';
  return route.path === '/map' ? 'w-full px-0 py-0' : 'max-w-7xl mx-auto px-4 py-6';
});

const { t, locale } = useI18n();

// Toast system
const { currentToast, isShowing: isShowingToast } = useToast();

// 動態 SEO 設定 (支援多語系)
useHead(() => ({
  titleTemplate: (titleChunk) => {
    if (isStandalonePage.value) return titleChunk || 'Forza Music Overlay';
    return titleChunk ? `${titleChunk} - ${t('app.title')}` : t('app.title');
  },
  htmlAttrs: {
    lang: locale.value === 'en' ? 'en' : 'zh-TW',
  },
  meta: [
    { name: 'keywords', content: t('app.keywords') }
  ],
  link: [
    {
      rel: 'preload',
      as: 'image',
      href: '/img/pc_background_extended.png',
      media: '(min-width: 768px)'
    }
  ]
}));

useSeoMeta({
  title: () => t('app.title'),
  ogTitle: () => t('app.og_title'),
  description: () => t('app.description'),
  ogDescription: () => t('app.og_desc'),
  twitterTitle: () => t('app.og_title'),
  twitterDescription: () => t('app.og_desc'),
  ogSiteName: () => t('app.title'),
});

const initializeAppShell = async () => {
  if (appInitStarted) return;
  appInitStarted = true;
  isInitializing.value = true;
  console.log('[App] Starting initialization...');
  
  try {
    // 1. 先载入本地收藏资料（快速）
    loadCollection();
    
    // 2. 初始化 AuthStore（会获取 session 并监听变化）
    await authStore.initialize();
    
    // 3. 如果已登入，从云端同步
    if (authStore.isAuthenticated.value) {
      console.log('[App] User logged in, syncing from cloud...');
      try {
        await loadFromCloud();
      } catch (e) {
        console.warn('[App] Cloud sync failed:', e);
      }
    }
  } catch (e) {
    console.error('[App] Initialization error:', e);
  } finally {
    console.log('[App] Finishing initialization...');
    // 快速显示页面
    setTimeout(() => {
      isInitializing.value = false;
    }, 300);
  }
};

onMounted(async () => {
  if (isStandalonePage.value) {
    isInitializing.value = false;
    return;
  }

  await initializeAppShell();
});

watch(isStandalonePage, async (standalone) => {
  if (!standalone) {
    await initializeAppShell();
  } else {
    isInitializing.value = false;
  }
});

// 监听登入状态变化，自动同步云端数据
watch(() => authStore.isAuthenticated.value, async (isAuth, wasAuth) => {
  if (isAuth && !wasAuth) {
    // 刚刚登入，同步云端数据
    console.log('[App] User just signed in, syncing from cloud...');
    try {
      await loadFromCloud();
    } catch (e) {
      console.warn('[App] Cloud sync on login failed:', e);
    }
  }
});
</script>

<style scoped>
.portrait-only-guard {
  display: none;
}

@media (max-width: 767px) and (orientation: landscape) {
  .portrait-only-guard {
    position: fixed;
    inset: 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right)) max(1rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));
    background:
      radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.9), transparent 42%),
      linear-gradient(160deg, rgba(209, 250, 229, 0.96), rgba(240, 253, 244, 0.98));
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }

  .portrait-only-panel {
    width: min(26rem, 92vw);
    padding: 1.35rem;
    text-align: center;
    color: rgb(15, 23, 42);
    border: 1px solid rgba(255, 255, 255, 0.86);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.72);
    box-shadow:
      0 20px 48px rgba(6, 78, 59, 0.18),
      0 1px 12px rgba(255, 255, 255, 0.82) inset;
  }

  .portrait-only-icon {
    display: inline-flex;
    width: 3.25rem;
    height: 3.25rem;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.75rem;
    color: white;
    border-radius: 1.2rem;
    background: linear-gradient(135deg, #00b92f, #008523);
    box-shadow: 0 12px 24px rgba(0, 133, 35, 0.2);
  }

  .portrait-only-panel h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 900;
    line-height: 1.25;
  }

  .portrait-only-panel p {
    margin: 0.55rem auto 0;
    max-width: 20rem;
    color: rgb(71, 85, 105);
    font-size: 0.9rem;
    font-weight: 800;
    line-height: 1.65;
  }
}
</style>
