<template>
  <div class="min-h-screen py-8 px-4">
    <!-- Background Decorations -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div class="absolute top-32 right-10 text-6xl opacity-10 animate-float">👥</div>
      <div class="absolute bottom-40 left-20 text-5xl opacity-10 animate-float" style="animation-delay: 1.5s;">🌸</div>
    </div>

    <div class="max-w-4xl mx-auto">
      <!-- Page Header -->
      <header class="text-center mb-10 animate-slide-up">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-400 to-rose-500 shadow-xl shadow-pink-200 mb-4">
          <span class="text-4xl">👥</span>
        </div>
        <h1 class="text-3xl font-extrabold gradient-text mb-2">好友代碼</h1>
        <p class="text-gray-500">分享您的 Pikmin Bloom 好友代碼，與其他玩家一起遊玩！</p>
      </header>

      <!-- Post Form (登入用戶) -->
      <div v-if="user" class="glass rounded-3xl p-8 mb-8 animate-slide-up" style="animation-delay: 0.1s;">
        <h2 class="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span class="text-xl">✏️</span>
          發布您的好友代碼
        </h2>
        
        <form @submit.prevent="submitPost" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">顯示名稱</label>
              <input
                v-model="newPost.username"
                type="text"
                required
                class="input-field"
                placeholder="您的暱稱"
              >
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">好友代碼</label>
              <input
                v-model="newPost.friendCode"
                type="text"
                required
                class="input-field font-mono"
                placeholder="1234 5678 9012"
              >
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">留言（可選）</label>
            <textarea
              v-model="newPost.message"
              rows="2"
              class="input-field resize-none"
              placeholder="例如：每天上線，歡迎加好友！"
            ></textarea>
          </div>

          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="submitting"
              class="btn-primary flex items-center gap-2"
            >
              <svg v-if="submitting" class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{{ submitting ? '發布中...' : '發布' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Login Prompt -->
      <div v-else class="glass rounded-3xl p-8 mb-8 text-center animate-slide-up" style="animation-delay: 0.1s;">
        <div class="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mb-4">
          <span class="text-3xl">🔐</span>
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
        <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <span class="text-2xl">🌍</span>
          所有玩家
          <span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
            {{ posts.length }}
          </span>
        </h2>

        <!-- Loading -->
        <div v-if="loading" class="glass rounded-3xl p-12 text-center">
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
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div
            v-for="(post, index) in posts"
            :key="post.id"
            class="glass rounded-2xl p-5 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] animate-pop-in"
            :style="{ animationDelay: `${index * 0.05}s` }"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold shadow-lg">
                  {{ post.username.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h3 class="font-bold text-gray-800">{{ post.username }}</h3>
                  <p class="text-xs text-gray-400">{{ formatDate(post.created_at) }}</p>
                </div>
              </div>
              <button
                @click="copyCode(post.friend_code)"
                class="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all duration-200"
                title="複製代碼"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              </button>
            </div>
            
            <!-- Friend Code Display -->
            <div class="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl px-4 py-3 mb-3">
              <p class="text-lg font-mono font-bold text-emerald-600 tracking-wider text-center">
                {{ post.friend_code }}
              </p>
            </div>
            
            <p v-if="post.message" class="text-gray-600 text-sm leading-relaxed">
              {{ post.message }}
            </p>
            
            <!-- Delete Button -->
            <div v-if="user && post.user_id === user.id" class="mt-3 pt-3 border-t border-gray-100">
              <button
                @click="deletePost(post.id)"
                class="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                刪除
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
          已複製到剪貼簿
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

// Load posts on mount
onMounted(async () => {
  await fetchPosts();
  
  // Pre-fill username from user metadata
  if (user.value) {
    newPost.value.username = user.value.user_metadata?.username || user.value.email?.split('@')[0] || '';
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
  if (!user.value) return;
  
  submitting.value = true;
  try {
    const { error } = await supabase.from('friend_posts').insert({
      user_id: user.value.id,
      username: newPost.value.username,
      friend_code: newPost.value.friendCode,
      message: newPost.value.message || null,
    });
    
    if (error) throw error;
    
    // Reset form and refresh
    newPost.value.message = '';
    await fetchPosts();
  } catch (e) {
    console.error('Failed to submit post:', e);
    alert('發布失敗，請稍後再試');
  } finally {
    submitting.value = false;
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
