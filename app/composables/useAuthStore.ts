/**
 * useAuthStore - 集中管理认证状态
 * 
 * 解决的问题：
 * 1. 组件间 auth 状态不同步
 * 2. OAuth 回调时序问题
 * 3. 多处监听导致的复杂性
 */

// 全局状态
const user = ref<any>(null);
const session = ref<any>(null);
const isLoading = ref(false);
const isInitialized = ref(false);

// 防止重复初始化
let initPromise: Promise<void> | null = null;

export const useAuthStore = () => {
  const supabase = useSupabaseClient();
  const router = useRouter();

  /**
   * 初始化 Auth 状态
   * 应该在 app.vue 中调用一次
   */
  const initialize = async (): Promise<void> => {
    // 如果已经初始化，直接返回
    if (isInitialized.value) return;
    
    // 如果正在初始化，等待完成
    if (initPromise) return initPromise;

    initPromise = (async () => {
      console.log('[AuthStore] Initializing...');
      isLoading.value = true;

      try {
        // 获取当前 session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        session.value = currentSession;
        user.value = currentSession?.user ?? null;
        
        console.log('[AuthStore] Initial session:', !!currentSession);

        // 监听后续 auth 变化
        supabase.auth.onAuthStateChange((event: string, newSession: any) => {
          console.log('[AuthStore] Auth state changed:', event);
          
          session.value = newSession;
          user.value = newSession?.user ?? null;
        });

      } catch (error) {
        console.error('[AuthStore] Initialization error:', error);
      } finally {
        isLoading.value = false;
        isInitialized.value = true;
        console.log('[AuthStore] Initialized, user:', !!user.value);
      }
    })();

    return initPromise;
  };

  /**
   * 等待初始化完成
   * 用于需要确保 auth 状态已加载的场景
   */
  const waitForInit = async (): Promise<void> => {
    if (isInitialized.value) return;
    await initialize();
  };

  /**
   * Google OAuth 登入
   */
  const signInWithGoogle = async (): Promise<void> => {
    isLoading.value = true;
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) throw error;
      // 用户会被重定向到 Google
    } catch (error) {
      isLoading.value = false;
      throw error;
    }
  };

  /**
   * Email/Password 登入
   */
  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    isLoading.value = true;
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Email/Password 注册
   */
  const signUp = async (email: string, password: string): Promise<void> => {
    isLoading.value = true;
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 登出
   */
  const signOut = async (): Promise<void> => {
    isLoading.value = true;
    
    try {
      // 清除 Supabase cookies
      const supabaseCookieName = 'sb-lfhldxtbzqagqcofseom-auth-token';
      document.cookie = `${supabaseCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${supabaseCookieName}=; max-age=0; path=/;`;
      
      // 清除所有 sb- 开头的 cookies
      document.cookie.split(";").forEach((c) => {
        const cookieName = c.split("=")[0].trim();
        if (cookieName.startsWith('sb-')) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${cookieName}=; max-age=0; path=/;`;
        }
      });
      
      // 清除 localStorage 中的 Supabase 数据
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
      
      // 清除 sessionStorage
      sessionStorage.clear();
      
      // 调用 signOut
      await supabase.auth.signOut();
      
      // 清除本地状态
      user.value = null;
      session.value = null;
      
      // 跳转到登入页
      window.location.href = '/auth';
    } catch (error) {
      console.error('[AuthStore] Sign out error:', error);
      // 即使出错也跳转
      window.location.href = '/auth';
    }
  };

  return {
    // 状态（只读）
    user: readonly(user),
    session: readonly(session),
    isLoading: readonly(isLoading),
    isInitialized: readonly(isInitialized),
    
    // 计算属性
    isAuthenticated: computed(() => !!user.value),
    userEmail: computed(() => user.value?.email ?? ''),
    userDisplayName: computed(() => {
      if (!user.value) return '';
      return user.value?.user_metadata?.username || 
             user.value?.email?.split('@')[0] || 
             '';
    }),
    userInitial: computed(() => {
      if (!user.value) return '';
      const name = user.value.user_metadata?.username || 
                   user.value.email?.split('@')[0] || 
                   '';
      return name.charAt(0).toUpperCase();
    }),
    
    // 方法
    initialize,
    waitForInit,
    signInWithGoogle,
    signInWithEmail,
    signUp,
    signOut,
  };
};
