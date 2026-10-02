<template>
  <header v-bind="$attrs" class="sticky top-0 z-50">
    <!-- Decorative top bar -->
    <div class="app-top-bar h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400"></div>
    
    <div
      class="glass border-t-0 border-x-0"
      :class="{ 'mobile-menu-shell-open': showMobileMenu }"
    >
      <div class="app-header-inner max-w-8xl mx-auto px-4 py-3">
        <div class="app-header-row flex items-center justify-between">
          <!-- Logo and Title -->
          <NuxtLink to="/" class="app-header-brand flex items-center gap-3 group" :aria-label="$t('app.title')">
            <div class="relative">
              <div class="app-header-logo w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <img class="app-header-logo-mark" src="/images/brand/seedling.png" width="256" height="256" alt="" draggable="false" />
              </div>
            </div>
            <div>
              <h1 class="app-header-title text-xl font-extrabold text-gradient group-hover:opacity-80 transition-opacity">
                <span class="app-brand-name">Pikmin Bloom</span><span class="app-brand-description">{{ $t('app.short_title') }}</span>
              </h1>
              <p class="app-header-subtitle text-xs text-gray-500 font-medium">{{ $t('app.subtitle') }}</p>
            </div>
          </NuxtLink>

          <!-- Desktop Navigation -->
          <nav class="app-desktop-nav hidden md:flex items-center gap-1 bg-white/50 rounded-2xl p-1">
            <NuxtLink 
              v-for="link in navLinks" 
              :key="link.to"
              :to="link.to"
              :aria-label="link.name"
              :title="link.name"
              class="nav-item"
              :class="[
                $route.path === link.to ? 'nav-item-active' : 'nav-item-inactive'
              ]"
            >
              <Icon :name="link.icon" class="text-2xl" />
              <span class="hidden lg:inline">{{ link.name }}</span>
            </NuxtLink>
          </nav>

          <!-- Right Section -->
          <div class="app-header-actions flex items-center gap-3">
            <!-- PWA Install Button (iOS) -->
            <button 
              v-if="canInstallIos"
              @click="triggerIosPrompt"
              class="flex items-center gap-1.5 px-3 sm:px-4 h-10 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
              title="安裝 App 到主畫面 (iOS)"
            >
              <Icon name="lucide:apple" class="text-lg group-hover:scale-110 transition-transform" />
              <span class="text-sm font-bold hidden sm:inline">iOS 捷徑</span>
            </button>

            <!-- PWA Install Button (Android Mobile) -->
            <button 
              v-if="canInstallAndroid"
              @click="triggerAndroidPrompt"
              class="md:hidden flex items-center gap-1.5 px-3 sm:px-4 h-10 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
              title="安裝 App 到主畫面 (Android)"
            >
              <Icon name="lucide:download" class="text-lg group-hover:scale-110 transition-transform" />
              <span class="text-sm font-bold hidden sm:inline">下載 App</span>
            </button>

            <!-- Progress Ring (Desktop) -->
            <div class="app-header-progress hidden sm:flex items-center gap-3 bg-white/50 rounded-2xl px-4 py-2">
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

            <HeaderSupportAction v-for="kind in supportKinds" :key="kind" :kind="kind" compact @activate="activateSupport(kind)" />

            <!-- Search Button (Desktop) -->
            <button 
              @click="showSearch = !showSearch"
              class="hidden md:flex w-10 h-10 items-center justify-center rounded-xl bg-white/60 hover:bg-white text-gray-500 hover:text-emerald-600 transition-all"
            >
              🔍
            </button>
            
            <!-- Language Switcher (Desktop) -->
            <LanguageSwitcher class="hidden md:flex" />

            <!-- User Menu -->
            <div class="app-header-user hidden sm:block">
              <template v-if="user">
                <div class="flex items-center gap-2">
                  <div 
                    class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm cursor-default"
                    :title="user.email || ''"
                  >
                    {{ userInitial }}
                  </div>
                  <button
                    @click="handleLogout"
                    class="text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    {{ $t('auth.logout') }}
                  </button>
                </div>
              </template>
              <NuxtLink
                v-else
                to="/auth"
                class="btn-primary text-sm !py-2 !px-4 whitespace-nowrap shrink-0"
              >
                {{ $t('auth.login') }}
              </NuxtLink>
            </div>

            <!-- Two paper strokes fold into the close mark. -->
            <button
              ref="menuButton"
              type="button"
              @click="toggleMobileMenu"
              @keydown.esc.stop="showMobileMenu = false"
              class="app-mobile-menu-button md:hidden"
              :class="{ 'is-open': showMobileMenu }"
              :aria-expanded="showMobileMenu"
              aria-controls="mobile-navigation-panel"
              :aria-label="$t(showMobileMenu ? 'header.close_menu' : 'header.open_menu')"
            >
              <span class="app-menu-strokes" aria-hidden="true"><span></span><span></span></span>
              <span class="app-menu-caption" aria-hidden="true">{{ $t(showMobileMenu ? 'header.close' : 'header.menu') }}</span>
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
              :placeholder="$t('header.search')"
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
        <Transition name="mobile-menu">
          <div
            v-if="showMobileMenu"
            id="mobile-navigation-panel"
            class="mobile-menu-panel md:hidden space-y-4"
            @keydown.esc.stop="closeMobileMenu"
          >
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
                </div>
                <div>
                  <p class="font-bold text-gray-700">{{ $t('header.mobile_progress') }}</p>
                  <p class="text-sm text-gray-500">{{ $t('header.mobile_progress_count', { collected: stats.collected, total: stats.total }) }}</p>
                  <p v-if="user" class="text-xs text-gray-400 truncate max-w-[150px]" :title="user.email">{{ user.email }}</p>
                </div>
              </div>
              <template v-if="user">
                <button @click="handleLogout" class="text-sm text-red-500">{{ $t('auth.logout') }}</button>
              </template>
              <NuxtLink v-else to="/auth" @click="showMobileMenu = false" class="btn-primary text-sm !py-2">
                {{ $t('auth.login') }}
              </NuxtLink>
            </div>

            <div class="mobile-support-actions">
              <HeaderSupportAction v-for="kind in supportKinds" :key="kind" :kind="kind" @activate="activateSupport(kind)" />
            </div>

            <!-- Mobile Search & Language -->
            <div class="flex gap-2 items-center">
              <div class="relative flex-1">
                <input 
                  v-model="searchQuery"
                  @keyup.enter="handleSearch"
                  type="text"
                  :placeholder="$t('header.search')"
                  class="input-field pl-12"
                />
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
              </div>
              
              <!-- Mobile Language Switcher -->
              <LanguageSwitcher class="!w-[52px] !h-[52px] !rounded-2xl !bg-white/80 border-2 !border-gray-200" />
            </div>

            <!-- Mobile Nav -->
            <div class="grid grid-cols-5 gap-1.5">
              <NuxtLink
                v-for="(link, index) in navLinks"
                :key="link.to"
                :to="link.to"
                @click="showMobileMenu = false"
                class="mobile-nav-link flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
                :style="{ animationDelay: `${40 + index * 55}ms` }"
                :class="[
                  $route.path === link.to 
                    ? 'mobile-nav-link-active bg-emerald-500 text-white shadow-lg' 
                    : 'bg-white/60 text-gray-600 hover:bg-white'
                ]"
              >
                <Icon
                  :name="link.icon"
                  class="mobile-nav-icon text-3xl mb-1"
                  :style="{ animationDelay: `${80 + index * 70}ms` }"
                />
                <span class="text-xs font-semibold">{{ link.name }}</span>
              </NuxtLink>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>

  <!-- Coffee Support Modal -->
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div 
      v-if="showCoffeeModal" 
      class="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      @click.self="showCoffeeModal = false"
    >
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="scale-95 opacity-0"
        enter-to-class="scale-100 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="scale-100 opacity-100"
        leave-to-class="scale-95 opacity-0"
      >
        <div 
          v-if="showCoffeeModal"
          class="coffee-support-dialog bg-white rounded-3xl shadow-2xl max-w-md w-full"
        >
          <!-- Header -->
          <div class="coffee-support-heading p-6 text-center">
            <SupportActionArt kind="coffee" hero />
            <h3 class="text-2xl font-bold">{{ $t('coffee.title') }}</h3>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-4">
            <p class="text-gray-700 text-center">
              {{ $t('coffee.redirect') }}
            </p>

            <!-- Important Notice -->
            <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <div class="flex items-start gap-3">
                <span class="text-2xl">⚖️</span>
                <div class="flex-1">
                  <h4 class="font-bold text-amber-900 mb-2">{{ $t('coffee.notice.title') }}</h4>
                  <ul class="space-y-1.5 text-sm text-amber-800">
                    <li class="flex items-start gap-2">
                      <span class="text-green-600 mt-0.5">✓</span>
                      <span>{{ $t('coffee.notice.point1') }}</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-green-600 mt-0.5">✓</span>
                      <span>{{ $t('coffee.notice.point2') }}</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-green-600 mt-0.5">✓</span>
                      <span>{{ $t('coffee.notice.point3') }}</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-green-600 mt-0.5">✓</span>
                      <span>{{ $t('coffee.notice.point4') }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <p class="text-center text-gray-600 text-sm">
              {{ $t('coffee.footer') }}
            </p>
          </div>

          <!-- Actions -->
          <div class="p-6 pt-0 flex gap-3">
            <button
              @click="showCoffeeModal = false"
              class="flex-1 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all"
            >
              {{ $t('coffee.cancel') }}
            </button>
            <button
              @click="confirmCoffee"
              class="coffee-support-confirm flex-1 px-6 py-3 rounded-xl font-semibold transition-all"
            >
              {{ $t('coffee.confirm') }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>

  <!-- Feedback Modal -->
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div 
      v-if="showFeedbackModal" 
      class="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      @click.self="showFeedbackModal = false"
    >
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="scale-95 opacity-0"
        enter-to-class="scale-100 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="scale-100 opacity-100"
        leave-to-class="scale-95 opacity-0"
      >
        <div 
          v-if="showFeedbackModal"
          class="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          <!-- Header -->
          <div class="bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-center">
            <div class="text-5xl mb-3">💬</div>
            <h3 class="text-xl font-bold text-white">{{ $t('feedback.title') }}</h3>
            <p class="text-violet-100 text-sm mt-1">{{ $t('feedback.subtitle') }}</p>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-4">
            <!-- Feedback Type -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">回饋類型</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="type in feedbackTypes"
                  :key="type.id"
                  type="button"
                  @click="feedbackForm.type = type.id"
                  class="flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-sm"
                  :class="[
                    feedbackForm.type === type.id 
                      ? 'border-violet-400 bg-violet-50 text-violet-700' 
                      : 'border-gray-200 bg-white/60 text-gray-600 hover:border-violet-200 hover:bg-violet-50/50'
                  ]"
                >
                  <span class="text-lg">{{ type.icon }}</span>
                  <span class="font-medium">{{ $t(`feedback.types.${type.id}`) }}</span>
                </button>
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <span class="flex items-center gap-2">
                  <span>📧</span>
                  {{ $t('feedback.email_label') }}
                </span>
              </label>
              <input
                v-model="feedbackForm.email"
                type="email"
                class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                :placeholder="$t('feedback.placeholders.email')"
              >
            </div>

            <!-- Message -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <span class="flex items-center gap-2">
                  <span>📝</span>
                  {{ $t('feedback.message_label') }}
                  <span class="text-red-500">*</span>
                </span>
              </label>
              <textarea
                v-model="feedbackForm.message"
                rows="4"
                class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition-all resize-none"
                :placeholder="feedbackPlaceholder"
              ></textarea>
              <p class="text-xs text-gray-400 mt-1">{{ feedbackForm.message.length }} / 1000 字</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="p-6 pt-0 flex gap-3">
            <button
              @click="showFeedbackModal = false"
              class="flex-1 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all"
            >
              {{ $t('feedback.buttons.cancel') }}
            </button>
            <button
              @click="submitFeedback"
              :disabled="feedbackSubmitting || !feedbackForm.message.trim()"
              class="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg v-if="feedbackSubmitting" class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{{ feedbackSubmitting ? $t('feedback.buttons.submitting') : feedbackButtonText }}</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>

  <!-- Feedback Success Modal -->
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div 
      v-if="showFeedbackSuccess" 
      class="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      @click.self="showFeedbackSuccess = false"
    >
      <div class="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden text-center p-8">
        <div class="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mb-4 shadow-xl">
          <span class="text-4xl">✅</span>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">{{ $t('feedback.success.title') }}</h3>
        <p class="text-gray-500 mb-6">{{ $t('feedback.success.desc') }}</p>
        <button
          @click="showFeedbackSuccess = false"
          class="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-semibold transition-all hover:shadow-lg"
        >
          {{ $t('feedback.success.ok') }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });
const authStore = useAuthStore();
const router = useRouter();
const supabase = useSupabaseClient<any>();
const { getStats } = useCollection();
const { canInstallIos, canInstallAndroid, triggerIosPrompt, triggerAndroidPrompt } = usePwaInstall();

const supportKinds = ['coffee', 'star', 'feedback'] as const;
const activateSupport = (kind: typeof supportKinds[number]) => {
  showMobileMenu.value = false;
  if (kind === 'coffee') handleCoffeeClick();
  if (kind === 'feedback') showFeedbackModal.value = true;
};
const showMobileMenu = ref(false);
const menuButton = ref<HTMLButtonElement | null>(null);
const showSearch = ref(false);
const searchQuery = ref('');
const showCoffeeModal = ref(false);
const showFeedbackModal = ref(false);
const showFeedbackSuccess = ref(false);
const feedbackSubmitting = ref(false);

const feedbackTypes = [
  { id: 'suggestion', icon: '💡', label: '功能建議' },
  { id: 'bug', icon: '🐛', label: '問題回報' },
  { id: 'dev', icon: '💼', label: '開發合作' },
];

const feedbackForm = ref({
  type: 'suggestion',
  email: '',
  message: '',
});

const { t } = useI18n();

const feedbackPlaceholder = computed(() => {
  switch (feedbackForm.value.type) {
    case 'suggestion':
      return t('feedback.placeholders.suggestion');
    case 'bug':
      return t('feedback.placeholders.bug');
    case 'dev':
      return t('feedback.placeholders.dev');
    default:
      return t('feedback.placeholders.default');
  }
});

const feedbackButtonText = computed(() => {
  switch (feedbackForm.value.type) {
    case 'suggestion':
      return t('feedback.buttons.suggestion');
    case 'bug':
      return t('feedback.buttons.bug');
    case 'dev':
      return t('feedback.buttons.dev');
    default:
      return t('feedback.buttons.default');
  }
});

const submitFeedback = async () => {
  if (!feedbackForm.value.message.trim()) return;
  
  feedbackSubmitting.value = true;
  
  try {
    const insertData = {
      type: feedbackForm.value.type,
      message: feedbackForm.value.message,
      ...(feedbackForm.value.email ? { email: feedbackForm.value.email } : {}),
      ...(user.value?.id ? { user_id: user.value.id } : {})
    };

    const { error } = await supabase.from('feedbacks').insert(insertData);

    if (error) throw error;
    
    // 關閉表單並顯示成功訊息
    showFeedbackModal.value = false;
    showFeedbackSuccess.value = true;
    
    // 重置表單
    feedbackForm.value = {
      type: 'suggestion',
      email: '',
      message: '',
    };
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    alert('提交失敗，請稍後再試');
  } finally {
    feedbackSubmitting.value = false;
  }
};

const stats = computed(() => getStats());

// 使用 AuthStore 的计算属性
const user = computed(() => authStore.user.value);
const userInitial = computed(() => authStore.userInitial.value);

const navLinks = computed(() => [
  { to: '/', name: t('nav.home'), icon: 'line-md:home-md' },
  { to: '/collection', name: t('nav.collection'), icon: 'line-md:text-box' },
  { to: '/map', name: t('nav.map'), icon: 'line-md:map-marker' },
  { to: '/friends', name: t('nav.friends'), icon: 'line-md:account' },
  { to: '/released', name: t('nav.released'), icon: 'line-md:cloud-off-outline-loop' },
]);

const isLoggingOut = ref(false);

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};

const closeMobileMenu = () => {
  showMobileMenu.value = false;
  nextTick(() => menuButton.value?.focus({ preventScroll: true }));
};

const handleLogout = async () => {
  if (isLoggingOut.value) return;
  isLoggingOut.value = true;
  showMobileMenu.value = false;
  
  // 使用 AuthStore 登出
  await authStore.signOut();
};

const handleCoffeeClick = () => {
  showMobileMenu.value = false;
  showCoffeeModal.value = true;
};

const confirmCoffee = () => {
  showCoffeeModal.value = false;
  window.open('https://buymeacoffee.com/scott5497', '_blank', 'noopener,noreferrer');
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

watch(showMobileMenu, (isOpen) => {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('mobile-menu-open', isOpen);
});

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('mobile-menu-open');
  }
});
</script>

<style scoped>
.coffee-support-heading { background: linear-gradient(135deg, #fff0df, #f7d6c1); color: #744a36; }
.coffee-support-dialog { max-height: calc(100dvh - 32px); overflow-y: auto; overscroll-behavior: contain; }
.coffee-support-confirm { background: #f7d6c1; color: #744a36; box-shadow: 0 3px 0 #d4a88c; }
.coffee-support-confirm:hover { background: #f3c9ad; }
.coffee-support-confirm:focus-visible { outline: 2px solid #744a36; outline-offset: 3px; }
.mobile-support-actions { display: grid; gap: 12px; padding-bottom: 4px; }
.app-header-logo-mark { width: 76%; height: 76%; object-fit: contain; }
.app-brand-name { white-space: nowrap; }
.app-brand-description::before { content: ' '; white-space: pre; }

@media (min-width: 768px) and (max-width: 1360px) {
  .app-header-inner {
    padding-inline: 0.875rem;
  }

  .app-header-actions {
    gap: 0.5rem;
  }

  .app-header-actions > button,
  .app-header-actions > a {
    min-width: 2.75rem;
  }

  .app-header-actions .btn-primary {
    padding-inline: 0.875rem !important;
  }


}

@media (max-width: 767px) {
  .app-top-bar { height: 4px; }
  .app-header-inner {
    padding: calc(12px + env(safe-area-inset-top, 0px)) max(14px, env(safe-area-inset-right, 0px)) 12px max(14px, env(safe-area-inset-left, 0px));
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }
  .app-header-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px; }
  .app-header-brand { min-width: 0; gap: 11px; }
  .app-header-brand > .relative { flex-shrink: 0; }
  .app-header-brand > div:last-child { min-width: 0; }
  .app-header-logo {
    width: 46px; height: 46px; border-radius: 16px 18px 16px 10px;
    box-shadow: 0 2px 0 rgb(5 150 105 / 16%), 0 7px 15px rgb(5 150 105 / 13%);
  }
  .app-header-title {
    display: flex; flex-direction: column; gap: 3px;
    font-family: 'Nunito', 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', system-ui, sans-serif;
    font-size: 19px; font-weight: 800; line-height: 1.15; letter-spacing: -0.025em;
    color: #059669; background: none; -webkit-text-fill-color: currentColor;
  }
  .app-brand-description { font-size: 12px; font-weight: 600; line-height: 1.4; letter-spacing: 0.06em; }
  .app-brand-description::before { content: none; }
  .app-header-subtitle { display: none; }
  .app-header-actions { gap: 8px; flex-shrink: 0; }
  .app-header-progress, .app-header-user { display: none; }
  .app-header-actions > button { flex-shrink: 0; min-width: 44px; min-height: 44px; padding-inline: 10px; }
  .app-mobile-menu-button {
    display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 6px;
    width: 48px; height: 48px; padding: 0 !important; border-radius: 15px;
    color: #047857; background: rgb(255 255 255 / 76%); border: 1px solid rgb(16 185 129 / 13%);
    box-shadow: 0 2px 0 rgb(5 150 105 / 9%); -webkit-tap-highlight-color: transparent;
    transition: background 220ms, color 220ms, box-shadow 220ms, transform 220ms;
  }
  .app-mobile-menu-button.is-open { color: #fff; background: var(--brand-green); border-color: var(--brand-green); box-shadow: 0 3px 10px rgb(16 185 129 / 18%); }
  .app-mobile-menu-button:active { transform: translateY(1px) scale(0.97); }
  .app-mobile-menu-button:focus-visible, .app-header-brand:focus-visible { outline: 2px solid #059669; outline-offset: 3px; }
  .app-menu-strokes { position: relative; width: 20px; height: 12px; }
  .app-menu-strokes > span { position: absolute; left: 0; height: 2px; border-radius: 2px; background: currentColor; transition: transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1), width 220ms; }
  .app-menu-strokes > span:first-child { top: 2px; width: 20px; }
  .app-menu-strokes > span:last-child { top: 9px; width: 14px; }
  .is-open .app-menu-strokes > span:first-child { transform: translateY(3.5px) rotate(45deg); }
  .is-open .app-menu-strokes > span:last-child { width: 20px; transform: translateY(-3.5px) rotate(-45deg); }
  .app-menu-caption { font-size: 10px; font-weight: 700; line-height: 1; letter-spacing: 0.08em; }

  .mobile-menu-shell-open {
    background: #f5fcf8;
  }

  /* A stable opaque surface avoids swapping blur compositors on every toggle. */
  header > .glass {
    background: #f5fcf8;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .mobile-menu-panel {
    position: absolute;
    top: 100%; left: 0; right: 0;
    max-height: calc(100dvh - 88px - env(safe-area-inset-top, 0px));
    /* Entry transforms may extend beyond the panel for a frame. Keep only vertical scrolling. */
    overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain;
    padding: 12px 16px max(20px, env(safe-area-inset-bottom, 0px));
    background: #f5fcf8;
    border-bottom: 1px solid #d9e9df;
    box-shadow: 0 14px 24px #173e3220;
    contain: layout paint;
    isolation: isolate;
  }
  .mobile-menu-enter-active, .mobile-menu-leave-active { transition: transform 220ms cubic-bezier(.2,.8,.2,1); }
  .mobile-menu-enter-from, .mobile-menu-leave-to { transform: translateY(-8px); }
  :global(html.mobile-menu-open) { overflow: hidden; }

  .mobile-menu-panel .mobile-nav-link {
    min-width: 0;
    padding-inline: 4px;
    animation: mobile-nav-tile-in 520ms cubic-bezier(0.2, 0.9, 0.22, 1.2) both;
    transform-origin: 50% 80%;
  }

  .mobile-menu-panel .mobile-nav-icon {
    display: inline-block;
    animation: mobile-nav-icon-pop 680ms cubic-bezier(0.18, 0.95, 0.22, 1.28) both;
    transform-origin: center;
    will-change: transform, opacity;
  }
  .mobile-nav-link > span:not(.iconify) { white-space: nowrap; }
}

@keyframes mobile-nav-tile-in {
  0% {
    opacity: 0;
    transform: translateY(14px) scale(0.94);
  }
  62% {
    opacity: 1;
    transform: translateY(-3px) scale(1.035);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes mobile-nav-icon-pop {
  0% {
    opacity: 0;
    transform: translateY(9px) scale(0.72) rotate(-8deg);
  }
  56% {
    opacity: 1;
    transform: translateY(-5px) scale(1.18) rotate(5deg);
  }
  78% {
    transform: translateY(1px) scale(0.96) rotate(-2deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(0);
  }
}

.mobile-nav-link-active,
.mobile-nav-link-active :deep(*) {
  color: #fff !important;
  paint-order: normal !important;
  text-shadow: none !important;
}

@media (min-width: 768px) {
  .app-header-inner {
    max-width: 1440px;
    padding: 0.85rem 1.5rem;
  }

  .app-header-inner > div {
    gap: 1.25rem;
  }

  .app-header-brand {
    flex: 0 1 17rem;
    min-width: 0;
  }

  .app-header-brand > .relative,
  .app-header-actions,
  .app-desktop-nav {
    flex-shrink: 0;
  }

  .app-header-title {
    font-size: 1rem;
    line-height: 1.4;
    text-wrap: balance;
  }

  .app-desktop-nav .nav-item {
    gap: 0.4rem;
    padding: 0.65rem 0.8rem;
    white-space: nowrap;
    font-size: 0.9rem;
  }

  .app-desktop-nav .nav-item:focus-visible {
    outline: 2px solid #047857;
    outline-offset: 3px;
  }

  .app-header-actions {
    gap: 0.5rem;
  }

  .app-header-actions > button,
  .app-header-actions > a {
    flex-shrink: 0;
    white-space: nowrap;
  }

  .app-header-progress {
    padding: 0.35rem 0.65rem;
    gap: 0.5rem;
    font-variant-numeric: tabular-nums;
  }


}

@media (min-width: 768px) and (max-width: 1279px) {
  .app-header-progress {
    display: none;
  }
}

@media (min-width: 768px) and (max-width: 1100px) {
  .app-header-inner {
    padding-inline: 1rem;
  }

  .app-header-inner > div {
    gap: 0.75rem;
  }

  .app-desktop-nav .nav-item > span:not(.iconify) {
    display: none;
  }
}

@media (min-width: 768px) and (max-width: 1439px) {
  .app-header-actions > button > .text-sm,
  .app-header-actions > a > .text-sm {
    display: none;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .app-header-inner > div {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .app-desktop-nav {
    grid-column: 1 / -1;
    order: 3;
    justify-content: space-between;
  }

  .app-desktop-nav .nav-item {
    flex: 1;
    justify-content: center;
  }

  .app-desktop-nav .nav-item > span:not(.iconify) {
    display: inline;
  }
}
@media (max-width: 350px) {
  .app-header-row { gap: 8px; }
  .app-header-brand { gap: 8px; }
  .app-header-logo { width: 40px; height: 40px; }
  .app-header-title { font-size: 17px; }
  .app-brand-description { font-size: 11px; letter-spacing: 0.025em; }
  .app-header-actions { gap: 5px; }
  .app-mobile-menu-button { width: 44px; height: 46px; }
}
@media (prefers-reduced-motion: reduce) {
  .mobile-menu-enter-active, .mobile-menu-leave-active { transition: none; }
  .app-menu-strokes > span, .app-mobile-menu-button { transition: none; }
  .mobile-menu-panel .mobile-nav-link, .mobile-menu-panel .mobile-nav-icon { animation: none; }
}
</style>
