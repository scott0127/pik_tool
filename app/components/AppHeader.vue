<template>
  <header class="sticky top-0 z-50">
    <!-- Decorative top bar -->
    <div class="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400"></div>
    
    <div class="glass border-t-0 border-x-0">
      <div class="max-w-8xl mx-auto px-4 py-3">
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
                {{ $t('app.title') }}
              </h1>
              <p class="text-xs text-gray-500 font-medium">{{ $t('app.subtitle') }}</p>
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
              <Icon :name="link.icon" class="text-2xl" />
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

            <!-- Buy Me a Coffee Button (Desktop) -->
            <button 
              @click="handleCoffeeClick"
              class="hidden md:flex items-center gap-2 px-4 h-10 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white transition-all hover:shadow-lg group"
              :title="$t('header.coffee_mobile')"
            >
              <span class="text-lg group-hover:scale-110 transition-transform">☕</span>
              <span class="text-sm font-semibold hidden lg:inline">{{ $t('header.coffee') }}</span>
            </button>

            <!-- GitHub Star Button (Desktop) -->
            <a 
              href="https://github.com/scott0127/pik_tool"
              target="_blank"
              rel="noopener noreferrer"
              class="hidden md:flex items-center gap-2 px-4 h-10 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white transition-all hover:shadow-lg group"
              :title="$t('header.star_mobile')"
            >
              <span class="text-lg group-hover:scale-110 transition-transform">⭐</span>
              <span class="text-sm font-semibold hidden lg:inline">{{ $t('header.star') }}</span>
            </a>

            <!-- Feedback Button (Desktop) -->
            <button 
              @click="showFeedbackModal = true"
              class="hidden md:flex items-center gap-2 px-4 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white transition-all hover:shadow-lg group overflow-hidden"
              :title="$t('header.feedback')"
            >
              <div class="hidden lg:block w-24 overflow-hidden">
                <span class="inline-block whitespace-nowrap animate-marquee text-sm font-semibold">
                  {{ $t('header.feedback') }}&nbsp;&nbsp;&nbsp;&nbsp;{{ $t('header.feedback') }}&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </div>
            </button>

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
            <div class="hidden sm:block">
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
                class="btn-primary text-sm !py-2 !px-4"
              >
                {{ $t('auth.login') }}
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

            <!-- Buy Me a Coffee Button (Mobile) -->
            <button 
              @click="handleCoffeeClick"
              class="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-2xl p-4 transition-all w-full max-w-[200px]"
            >
              <span class="text-2xl flex-shrink-0">☕</span>
              <span class="font-semibold">{{ $t('header.coffee_mobile') }}</span>
            </button>

            <!-- GitHub Star Button (Mobile) -->
            <a 
              href="https://github.com/scott0127/pik_tool"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl p-4 hover:from-gray-700 hover:to-gray-800 transition-all w-full max-w-[200px] overflow-hidden"
            >
              <span class="text-2xl flex-shrink-0">⭐</span>
              <div class="overflow-hidden">
                <span class="inline-block whitespace-nowrap animate-marquee font-semibold">
                  {{ $t('header.star_mobile') }}&nbsp;&nbsp;&nbsp;&nbsp;{{ $t('header.star_mobile') }}&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </div>
            </a>

            <!-- Feedback Button (Mobile) -->
            <button 
              @click="showFeedbackModal = true; showMobileMenu = false"
              class="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl p-4 hover:from-violet-600 hover:to-purple-700 transition-all w-full max-w-[200px] overflow-hidden"
            >
              <span class="text-2xl flex-shrink-0">💬</span>
              <div class="overflow-hidden">
                <span class="inline-block whitespace-nowrap animate-marquee font-semibold">
                  {{ $t('header.feedback') }}&nbsp;&nbsp;&nbsp;&nbsp;{{ $t('header.feedback') }}&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </div>
            </button>

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
                <Icon :name="link.icon" class="text-3xl mb-1" />
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
          class="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          <!-- Header -->
          <div class="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-center">
            <div class="text-5xl mb-3">☕</div>
            <h3 class="text-2xl font-bold text-white">{{ $t('coffee.title') }}</h3>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-4">
            <p class="text-gray-700 text-center" v-html="$t('coffee.redirect')">
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
              class="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold transition-all shadow-lg hover:shadow-xl"
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
const authStore = useAuthStore();
const router = useRouter();
const { getStats } = useCollection();

const showMobileMenu = ref(false);
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
    // 模擬 API 請求
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 將回饋資料記錄到 console（開發環境）
    console.log('Feedback submitted:', {
      type: feedbackForm.value.type,
      email: feedbackForm.value.email,
      message: feedbackForm.value.message,
      timestamp: new Date().toISOString(),
    });
    
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
]);

const isLoggingOut = ref(false);

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
  window.open('https://buymeacoffee.com/scott5497', '_blank');
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
