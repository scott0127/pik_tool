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

            <!-- Buy Me a Coffee Button (Desktop) -->
            <button 
              @click="handleCoffeeClick"
              class="hidden md:flex items-center gap-2 px-4 h-10 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white transition-all hover:shadow-lg group"
              title="請我喝杯咖啡"
            >
              <span class="text-lg group-hover:scale-110 transition-transform">☕</span>
              <span class="text-sm font-semibold hidden lg:inline">支持</span>
            </button>

            <!-- GitHub Star Button (Desktop) -->
            <a 
              href="https://github.com/scott0127/pik_tool"
              target="_blank"
              rel="noopener noreferrer"
              class="hidden md:flex items-center gap-2 px-4 h-10 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white transition-all hover:shadow-lg group"
              title="github幫我按星星"
            >
              <span class="text-lg group-hover:scale-110 transition-transform">⭐</span>
              <span class="text-sm font-semibold hidden lg:inline">Star</span>
            </a>

            <!-- Feedback Button (Desktop) -->
            <button 
              @click="showFeedbackModal = true"
              class="hidden md:flex items-center gap-2 px-4 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white transition-all hover:shadow-lg group overflow-hidden"
              title="BUG、建議回報/合作諮詢"
            >
              <div class="hidden lg:block w-24 overflow-hidden">
                <span class="inline-block whitespace-nowrap animate-marquee text-sm font-semibold">
                  BUG、建議回報/合作諮詢&nbsp;&nbsp;&nbsp;&nbsp;BUG、建議回報/合作諮詢&nbsp;&nbsp;&nbsp;&nbsp;
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
                  <p v-if="user" class="text-xs text-gray-400 truncate max-w-[150px]" :title="user.email">{{ user.email }}</p>
                </div>
              </div>
              <template v-if="user">
                <button @click="handleLogout" class="text-sm text-red-500">登出</button>
              </template>
              <NuxtLink v-else to="/auth" @click="showMobileMenu = false" class="btn-primary text-sm !py-2">
                登入
              </NuxtLink>
            </div>

            <!-- Buy Me a Coffee Button (Mobile) -->
            <button 
              @click="handleCoffeeClick"
              class="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-2xl p-4 transition-all w-full max-w-[200px]"
            >
              <span class="text-2xl flex-shrink-0">☕</span>
              <span class="font-semibold">請我喝杯咖啡</span>
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
                  github幫我按星星&nbsp;&nbsp;&nbsp;&nbsp;github幫我按星星&nbsp;&nbsp;&nbsp;&nbsp;
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
                  BUG、建議回報/合作諮詢&nbsp;&nbsp;&nbsp;&nbsp;BUG、建議回報/合作諮詢&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </div>
            </button>

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
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
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
            <h3 class="text-2xl font-bold text-white">感謝你的支持！</h3>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-4">
            <p class="text-gray-700 text-center">
              即將前往 <strong>Buy Me a Coffee</strong> 贊助頁面
            </p>

            <!-- Important Notice -->
            <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <div class="flex items-start gap-3">
                <span class="text-2xl">⚖️</span>
                <div class="flex-1">
                  <h4 class="font-bold text-amber-900 mb-2">重要聲明</h4>
                  <ul class="space-y-1.5 text-sm text-amber-800">
                    <li class="flex items-start gap-2">
                      <span class="text-green-600 mt-0.5">✓</span>
                      <span>你的贊助是支持「開發者」而非購買遊戲內容</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-green-600 mt-0.5">✓</span>
                      <span>本工具是非官方粉絲專案，完全免費使用</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-green-600 mt-0.5">✓</span>
                      <span>所有遊戲素材版權歸任天堂所有</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-green-600 mt-0.5">✓</span>
                      <span>贊助是對開發工作的支持，不涉及遊戲內容買賣</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <p class="text-center text-gray-600 text-sm">
              你的每一杯咖啡都是我繼續改進這個工具的最大動力！💪
            </p>
          </div>

          <!-- Actions -->
          <div class="p-6 pt-0 flex gap-3">
            <button
              @click="showCoffeeModal = false"
              class="flex-1 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all"
            >
              取消
            </button>
            <button
              @click="confirmCoffee"
              class="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              前往贊助 ☕
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
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
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
            <h3 class="text-xl font-bold text-white">BUG、建議回報/合作諮詢</h3>
            <p class="text-violet-100 text-sm mt-1">您的意見對我們非常重要！</p>
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
                  <span class="font-medium">{{ type.label }}</span>
                </button>
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <span class="flex items-center gap-2">
                  <span>📧</span>
                  Email（選填）
                </span>
              </label>
              <input
                v-model="feedbackForm.email"
                type="email"
                class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                placeholder="如需回覆請留下您的 Email"
              >
            </div>

            <!-- Message -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <span class="flex items-center gap-2">
                  <span>📝</span>
                  詳細內容
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
              取消
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
              <span>{{ feedbackSubmitting ? '提交中...' : feedbackButtonText }}</span>
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
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      @click.self="showFeedbackSuccess = false"
    >
      <div class="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden text-center p-8">
        <div class="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mb-4 shadow-xl">
          <span class="text-4xl">✅</span>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">感謝您的回饋！</h3>
        <p class="text-gray-500 mb-6">我們已收到您的意見，將會認真參考。</p>
        <button
          @click="showFeedbackSuccess = false"
          class="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-semibold transition-all hover:shadow-lg"
        >
          好的
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

const feedbackPlaceholder = computed(() => {
  switch (feedbackForm.value.type) {
    case 'suggestion':
      return '請描述您希望新增的功能或改進建議...';
    case 'bug':
      return '請描述您遇到的問題，包括操作步驟和錯誤訊息...';
    case 'dev':
      return '【重要聲明】\n此諮詢與 Pikmin 遊戲及任天堂 (Nintendo) 完全無關。\n\n本網頁為非營利粉絲專案，與任天堂 (Nintendo) 無任何關聯、隸屬、贊助或背書關係。網站內出現的所有遊戲截圖、官方美術圖、遊戲角色名稱與商標，其版權均歸 Nintendo 所有。(CC BY-SA 4.0)\n\n---\n此為開發者個人接案服務，如有網頁、APP 或程式開發需求，歡迎留下您的聯絡方式與需求描述！';
    default:
      return '請輸入您的意見...';
  }
});

const feedbackButtonText = computed(() => {
  switch (feedbackForm.value.type) {
    case 'suggestion':
      return '送出建議 💡';
    case 'bug':
      return '送出回報 🐛';
    case 'dev':
      return '送出諮詢 💼';
    default:
      return '送出';
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

const navLinks = [
  { to: '/', name: '首頁', icon: '🏠' },
  { to: '/collection', name: '圖鑑', icon: '📖' },
  { to: '/map', name: '地圖', icon: '🗺️' },
  { to: '/friends', name: '好友', icon: '🤝' },
];

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
