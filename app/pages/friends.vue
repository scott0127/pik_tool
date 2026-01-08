<template>
  <div class="min-h-screen py-8 px-4">
    <!-- Background Decorations -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div class="absolute top-32 right-10 text-6xl opacity-10 animate-float">🤝</div>
      <div class="absolute bottom-40 left-20 text-5xl opacity-10 animate-float" style="animation-delay: 1.5s;">🌸</div>
    </div>

    <div class="max-w-4xl mx-auto">
      <!-- Page Header -->
      <header class="text-center mb-10 animate-slide-up">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-400 to-rose-500 shadow-xl shadow-pink-200 mb-4">
          <span class="text-4xl">🤝</span>
        </div>
        <h1 class="text-3xl font-extrabold gradient-text mb-2">好友交流區</h1>
        <p class="text-gray-500">分享您的 Pikmin Bloom 好友代碼，結交新朋友！</p>
      </header>

      <!-- Info Banner -->
      <div class="glass rounded-2xl p-4 mb-6 animate-slide-up flex items-start gap-3" style="animation-delay: 0.05s;">
        <span class="text-xl flex-shrink-0">💡</span>
        <div class="text-sm text-gray-600">
          <p class="font-medium text-gray-700 mb-1">使用提示</p>
          <ul class="space-y-1 text-gray-500">
            <li>• 好友代碼可在 Pikmin Bloom App 的個人頁面找到</li>
            <li>• 請勿發布不當內容，違規者將被封鎖</li>
            <li>• 每人每日最多發布 3 則留言</li>
          </ul>
        </div>
      </div>

      <!-- Post Form (登入用戶) -->
      <div v-if="user" class="glass rounded-3xl p-6 mb-8 animate-slide-up" style="animation-delay: 0.1s;">
        <h2 class="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
            <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
          </svg>
          發布您的好友代碼
        </h2>
        
        <form @submit.prevent="submitPost" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <span class="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                  </svg>
                  顯示名稱
                </span>
              </label>
              <input
                v-model="newPost.username"
                type="text"
                required
                maxlength="20"
                class="input-field"
                placeholder="您的暱稱"
              >
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <span class="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  好友代碼
                </span>
              </label>
              <input
                v-model="newPost.friendCode"
                type="text"
                required
                class="input-field font-mono tracking-wider"
                placeholder="1234 5678 9012"
                @input="formatFriendCode"
              >
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clip-rule="evenodd" />
                </svg>
                自我介紹（選填）
              </span>
            </label>
            <textarea
              v-model="newPost.message"
              rows="2"
              maxlength="100"
              class="input-field resize-none"
              placeholder="例如：每天上線，歡迎一起散步！"
            ></textarea>
            <p class="text-xs text-gray-400 mt-1 text-right">{{ newPost.message.length }} / 100</p>
          </div>

          <div class="flex justify-end">
            <button
              type="button"
              @click="submitPost"
              :disabled="submitting || !isValidFriendCode"
              class="btn-primary flex items-center gap-2"
            >
              <svg v-if="submitting" class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
              </svg>
              <span>{{ submitting ? '發布中...' : '發布' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Login Prompt -->
      <div v-else class="glass rounded-3xl p-8 mb-8 text-center animate-slide-up" style="animation-delay: 0.1s;">
        <div class="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
          </svg>
        </div>
        <p class="text-gray-600 mb-4">登入後即可發布您的好友代碼</p>
        <NuxtLink
          to="/auth"
          class="btn-primary inline-flex items-center gap-2"
        >
          <span>登入 / 註冊</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </NuxtLink>
      </div>

      <!-- Posts Section -->
      <section class="animate-slide-up" style="animation-delay: 0.2s;">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-800 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            所有玩家
            <span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
              {{ posts.length }}
            </span>
          </h2>
          
          <!-- Refresh Button -->
          <button
            @click="fetchPosts"
            :disabled="loading"
            class="p-2 rounded-xl hover:bg-white/60 transition-colors text-gray-500 hover:text-emerald-600"
            title="重新整理"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="{ 'animate-spin': loading }" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading && posts.length === 0" class="glass rounded-3xl p-12 text-center">
          <div class="w-16 h-16 mx-auto border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
          <p class="text-gray-500">載入中...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="posts.length === 0" class="glass rounded-3xl p-12 text-center">
          <div class="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mb-4">
            <span class="text-4xl">🌱</span>
          </div>
          <p class="text-gray-500">還沒有人發布好友代碼</p>
          <p class="text-emerald-600 font-medium mt-1">成為第一個吧！</p>
        </div>

        <!-- Posts Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="(post, index) in posts"
            :key="post.id"
            class="glass rounded-2xl p-5 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] animate-pop-in"
            :style="{ animationDelay: `${index * 0.05}s` }"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold shadow-lg text-lg">
                  {{ post.username.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h3 class="font-bold text-gray-800">{{ post.username }}</h3>
                  <p class="text-xs text-gray-400 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                    </svg>
                    {{ formatDate(post.created_at) }}
                  </p>
                </div>
              </div>
              <button
                @click="copyCode(post.friend_code)"
                class="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all duration-200"
                title="複製代碼"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                  <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                </svg>
              </button>
            </div>
            
            <!-- Friend Code Display -->
            <div class="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl px-4 py-3 mb-3 border border-emerald-100">
              <p class="text-lg font-mono font-bold text-emerald-600 tracking-widest text-center select-all">
                {{ formatDisplayCode(post.friend_code) }}
              </p>
            </div>
            
            <p v-if="post.message" class="text-gray-600 text-sm leading-relaxed bg-white/50 rounded-lg p-3">
              {{ post.message }}
            </p>
            
            <!-- Delete Button -->
            <div v-if="user && post.user_id === user.id" class="mt-3 pt-3 border-t border-gray-100">
              <button
                @click="deletePost(post.id)"
                class="text-xs text-red-400 hover:text-red-600 flex items-center gap-1.5 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                刪除我的留言
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Copy Toast -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-4 scale-95"
      >
        <div
          v-if="showCopyToast"
          class="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-gray-900 text-white rounded-2xl shadow-2xl flex items-center gap-2 z-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          好友代碼已複製！
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface FriendPost {
  id: string;
  user_id: string;
  username: string;
  friend_code: string;
  message: string | null;
  created_at: string;
}

const supabase = useSupabaseClient();
const user = useSupabaseUser();

const posts = ref<FriendPost[]>([]);
const loading = ref(true);
const submitting = ref(false);
const showCopyToast = ref(false);

const newPost = ref({
  username: '',
  friendCode: '',
  message: '',
});

// 驗證好友代碼格式 (12位數字)
const isValidFriendCode = computed(() => {
  const digits = newPost.value.friendCode.replace(/\D/g, '');
  return digits.length === 12;
});

// 格式化輸入的好友代碼
const formatFriendCode = (e: Event) => {
  const input = e.target as HTMLInputElement;
  let value = input.value.replace(/\D/g, ''); // 只保留數字
  if (value.length > 12) value = value.slice(0, 12);
  
  // 格式化為 XXXX XXXX XXXX
  const parts = [];
  for (let i = 0; i < value.length; i += 4) {
    parts.push(value.slice(i, i + 4));
  }
  newPost.value.friendCode = parts.join(' ');
};

// 顯示格式化的代碼
const formatDisplayCode = (code: string) => {
  const digits = code.replace(/\D/g, '');
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
};

// Load posts on mount
onMounted(async () => {
  await fetchPosts();
  
  // Pre-fill username from user metadata
  if (user.value) {
    // user 可能是 JWT payload，結構可能不同
    const metadata = user.value.user_metadata || user.value;
    const email = user.value.email || metadata?.email || '';
    newPost.value.username = metadata?.username || metadata?.name || email.split('@')[0] || '';
    console.log('[Friends] Pre-filled username:', newPost.value.username);
  }
});

const fetchPosts = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('friend_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    posts.value = data || [];
  } catch (e) {
    console.error('Failed to fetch posts:', e);
  } finally {
    loading.value = false;
  }
};

const submitPost = async () => {
  // user 可能是 JWT payload，id 在 sub 或 id 欄位
  const userId = user.value?.id || user.value?.sub;
  
  if (!userId) {
    alert('請先登入');
    return;
  }
  if (!isValidFriendCode.value) {
    alert('好友代碼必須是 12 位數字');
    return;
  }
  if (!newPost.value.username.trim()) {
    alert('請輸入顯示名稱');
    return;
  }
  
  submitting.value = true;
  
  try {
    // 儲存時移除空格
    const cleanCode = newPost.value.friendCode.replace(/\s/g, '');
    
    // 使用 session 中的 user id
    const { data: sessionData } = await supabase.auth.getSession();
    const actualUserId = sessionData?.session?.user?.id;
    if (!actualUserId) {
      throw new Error('No authenticated session found');
    }
    
    const { data, error } = await supabase.from('friend_posts').insert({
      user_id: actualUserId,
      username: newPost.value.username.trim(),
      friend_code: cleanCode,
      message: newPost.value.message.trim() || null,
    }).select();
    
    if (error) {
      throw error;
    }
    
    // Reset form and refresh
    newPost.value.message = '';
    await fetchPosts();
  } catch (e: any) {
    console.error('Failed to submit post:', e);
    alert(`發布失敗：${e.message || '請稍後再試'}`);
  } finally {
    submitting.value = false;
    console.log('[Friends] Done, submitting set to false');
  }
};

const deletePost = async (postId: string) => {
  if (!confirm('確定要刪除這則留言?')) return;
  
  try {
    const { error } = await supabase
      .from('friend_posts')
      .delete()
      .eq('id', postId);
    
    if (error) throw error;
    await fetchPosts();
  } catch (e) {
    console.error('Failed to delete post:', e);
  }
};

const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code.replace(/\s/g, ''));
    showCopyToast.value = true;
    setTimeout(() => {
      showCopyToast.value = false;
    }, 2000);
  } catch (e) {
    console.error('Failed to copy:', e);
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '剛剛';
  if (minutes < 60) return `${minutes} 分鐘前`;
  if (hours < 24) return `${hours} 小時前`;
  if (days < 7) return `${days} 天前`;
  
  return date.toLocaleDateString('zh-TW');
};
</script>
