<template>
  <div class="min-h-screen py-8 px-4">
    <!-- Background Decorations -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div class="absolute top-32 right-10 text-6xl opacity-10 animate-float">💬</div>
      <div class="absolute bottom-40 left-20 text-5xl opacity-10 animate-float" style="animation-delay: 1.5s;">📝</div>
    </div>

    <div class="max-w-2xl mx-auto">
      <!-- Page Header -->
      <header class="text-center mb-10 animate-slide-up">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-400 to-purple-500 shadow-xl shadow-violet-200 mb-4">
          <span class="text-4xl">💬</span>
        </div>
        <h1 class="text-3xl font-extrabold gradient-text mb-2">意見回饋</h1>
        <p class="text-gray-500">您的意見對我們非常重要！</p>
      </header>

      <!-- Feedback Form -->
      <div class="glass rounded-3xl p-8 animate-slide-up" style="animation-delay: 0.1s;">
        <form @submit.prevent="submitFeedback" class="space-y-6">
          <!-- Feedback Type -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3">回饋類型</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                v-for="type in feedbackTypes"
                :key="type.id"
                type="button"
                @click="form.type = type.id"
                class="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200"
                :class="[
                  form.type === type.id 
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-700' 
                    : 'border-gray-200 bg-white/60 text-gray-600 hover:border-emerald-200 hover:bg-emerald-50/50'
                ]"
              >
                <span class="text-2xl">{{ type.icon }}</span>
                <span class="text-sm font-medium">{{ type.label }}</span>
              </button>
            </div>
          </div>

          <!-- Email (Optional) -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="flex items-center gap-2">
                <span>📧</span>
                Email（選填）
              </span>
            </label>
            <input
              v-model="form.email"
              type="email"
              class="input-field"
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
              v-model="form.message"
              required
              rows="5"
              class="input-field resize-none"
              placeholder="請詳細描述您的建議、問題或發現的錯誤..."
            ></textarea>
            <p class="text-xs text-gray-400 mt-1">{{ form.message.length }} / 1000 字</p>
          </div>

          <!-- Device Info (Auto-filled) -->
          <div class="bg-gray-50/80 rounded-xl p-4">
            <p class="text-xs text-gray-500 mb-2">📱 裝置資訊（自動收集，用於問題診斷）</p>
            <p class="text-xs text-gray-400 font-mono">{{ deviceInfo }}</p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="submitting || !form.message.trim()"
            class="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
          >
            <svg v-if="submitting" class="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>{{ submitting ? '提交中...' : '送出回饋' }}</span>
          </button>
        </form>
      </div>

      <!-- Alternative Contact Methods -->
      <div class="glass rounded-3xl p-6 mt-6 animate-slide-up" style="animation-delay: 0.2s;">
        <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>🔗</span>
          其他聯繫方式
        </h3>
        <div class="space-y-3">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            class="flex items-center gap-3 p-3 rounded-xl bg-white/60 hover:bg-white transition-colors"
          >
            <div class="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-800">GitHub Issues</p>
              <p class="text-xs text-gray-500">回報 Bug 或提出功能建議</p>
            </div>
          </a>
        </div>
      </div>

      <!-- Success Message -->
      <Teleport to="body">
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div 
            v-if="showSuccess"
            class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            @click.self="showSuccess = false"
          >
            <div class="glass rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
              <div class="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mb-4 shadow-xl">
                <span class="text-4xl">✅</span>
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">感謝您的回饋！</h3>
              <p class="text-gray-500 mb-6">我們已收到您的意見，將會認真參考。</p>
              <button
                @click="showSuccess = false"
                class="btn-primary"
              >
                好的
              </button>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
const feedbackTypes = [
  { id: 'suggestion', icon: '💡', label: '功能建議' },
  { id: 'bug', icon: '🐛', label: '回報錯誤' },
  { id: 'data', icon: '📊', label: '資料問題' },
  { id: 'other', icon: '💭', label: '其他' },
];

const form = ref({
  type: 'suggestion',
  email: '',
  message: '',
});

const submitting = ref(false);
const showSuccess = ref(false);

const deviceInfo = computed(() => {
  if (import.meta.client) {
    const ua = navigator.userAgent;
    const width = window.innerWidth;
    const height = window.innerHeight;
    return `${width}x${height} • ${ua.substring(0, 80)}...`;
  }
  return 'Loading...';
});

const submitFeedback = async () => {
  if (!form.value.message.trim()) return;
  
  submitting.value = true;
  
  try {
    // 這裡可以整合實際的回饋提交邏輯
    // 例如發送到 Supabase、Google Forms、或其他後端服務
    
    // 模擬 API 請求
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 將回饋資料記錄到 console（開發環境）
    console.log('Feedback submitted:', {
      type: form.value.type,
      email: form.value.email,
      message: form.value.message,
      deviceInfo: deviceInfo.value,
      timestamp: new Date().toISOString(),
    });
    
    // 顯示成功訊息
    showSuccess.value = true;
    
    // 重置表單
    form.value = {
      type: 'suggestion',
      email: '',
      message: '',
    };
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    alert('提交失敗，請稍後再試');
  } finally {
    submitting.value = false;
  }
};
</script>
