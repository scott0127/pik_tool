<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <!-- Page Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">👥 好友代碼</h1>
      <p class="text-gray-500">分享您的 Pikmin Bloom 好友代碼，與其他玩家一起遊玩！</p>
    </div>

    <!-- Post Form (登入用戶) -->
    <div v-if="user" class="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">發布您的好友代碼</h2>
      
      <form @submit.prevent="submitPost" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">顯示名稱</label>
            <input
              v-model="newPost.username"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="您的暱稱"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">好友代碼</label>
            <input
              v-model="newPost.friendCode"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="1234 5678 9012"
            >
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">留言（可選）</label>
          <textarea
            v-model="newPost.message"
            rows="2"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            placeholder="例如：每天上線，歡迎加好友！"
          ></textarea>
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="submitting"
            class="px-6 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-all disabled:opacity-50"
          >
            {{ submitting ? '發布中...' : '發布' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Login Prompt -->
    <div v-else class="bg-gradient-to-r from-primary-50 to-leaf-50 rounded-2xl p-6 mb-8 text-center">
      <p class="text-gray-600 mb-3">登入後即可發布您的好友代碼</p>
      <NuxtLink
        to="/auth"
        class="inline-block px-6 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-all"
      >
        登入 / 註冊
      </NuxtLink>
    </div>

    <!-- Posts List -->
    <div class="space-y-4">
      <h2 class="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <span>🌍</span>
        所有玩家 ({{ posts.length }})
      </h2>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="w-12 h-12 mx-auto border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
        <p class="text-gray-500 mt-4">載入中...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="posts.length === 0" class="text-center py-12 bg-white rounded-2xl">
        <span class="text-6xl">🌱</span>
        <p class="text-gray-500 mt-4">還沒有人發布好友代碼，成為第一個吧！</p>
      </div>

      <!-- Posts Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="post in posts"
          :key="post.id"
          class="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all"
        >
          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-semibold text-gray-800">{{ post.username }}</h3>
              <p class="text-lg font-mono text-primary-600 mt-1">{{ post.friend_code }}</p>
            </div>
            <button
              @click="copyCode(post.friend_code)"
              class="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all"
              title="複製代碼"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            </button>
          </div>
          
          <p v-if="post.message" class="text-gray-500 text-sm mt-2">{{ post.message }}</p>
          
          <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <span class="text-xs text-gray-400">{{ formatDate(post.created_at) }}</span>
            <button
              v-if="user && post.user_id === user.id"
              @click="deletePost(post.id)"
              class="text-xs text-red-400 hover:text-red-600"
            >
              刪除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Copy Toast -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="showCopyToast"
        class="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-800 text-white rounded-lg shadow-lg"
      >
        ✓ 已複製到剪貼簿
      </div>
    </Transition>
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
