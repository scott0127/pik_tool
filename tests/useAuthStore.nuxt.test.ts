// @vitest-environment nuxt
/**
 * useAuthStore。
 * user / session / isInitialized 都在 module scope，initialize() 只有第一次有效，
 * 所以初始化測試放最前面，之後的狀態變化改用 onAuthStateChange callback 驅動。
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

const mocks = vi.hoisted(() => ({
  session: { value: null as any },
  adminRow: { value: null as any },
  authCb: { value: null as ((event: string, session: any) => void) | null },
  errors: { value: {} as Record<string, any> },
  calls: { value: [] as string[] },
  args: { value: [] as any[] },
}));

const authFn = (name: string) => (payload?: any) => {
  mocks.calls.value.push(name);
  mocks.args.value.push(payload);
  return Promise.resolve({ data: {}, error: mocks.errors.value[name] ?? null });
};

mockNuxtImport('useSupabaseClient', () => () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: mocks.session.value } }),
    onAuthStateChange: (cb: any) => {
      mocks.authCb.value = cb;
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithPassword: authFn('signInWithPassword'),
    signInWithOAuth: authFn('signInWithOAuth'),
    signUp: authFn('signUp'),
    signOut: authFn('signOut'),
    updateUser: authFn('updateUser'),
    resetPasswordForEmail: authFn('resetPasswordForEmail'),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        maybeSingle: () => {
          mocks.calls.value.push('adminLookup');
          return Promise.resolve({ data: mocks.adminRow.value, error: null });
        },
      }),
    }),
  }),
}));

// 不要 mock useRouter：Nuxt 與 @nuxt/test-utils 自己會呼叫 beforeEach/afterEach，
// 換掉會讓整個 app 初始化失敗。useAuthStore 只是拿著 router，沒有真的用。

const { useAuthStore } = await import('~/composables/useAuthStore');

const userWith = (over: Record<string, any> = {}) => ({
  id: 'u-1',
  email: 'alwyn@example.com',
  user_metadata: {},
  ...over,
});

/** 透過 onAuthStateChange 改變登入狀態 */
const setUser = (user: any) => {
  mocks.authCb.value?.(user ? 'SIGNED_IN' : 'SIGNED_OUT', user ? { user } : null);
};

let consoleSpies: ReturnType<typeof vi.spyOn>[] = [];

beforeEach(() => {
  consoleSpies = [
    vi.spyOn(console, 'log').mockImplementation(() => {}),
    vi.spyOn(console, 'warn').mockImplementation(() => {}),
    vi.spyOn(console, 'error').mockImplementation(() => {}),
  ];
  mocks.adminRow.value = null;
  mocks.errors.value = {};
  mocks.calls.value = [];
  mocks.args.value = [];
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  consoleSpies.forEach(s => s.mockRestore());
});

// ---- 這一段必須跑在最前面：initialize() 只有第一次會真的執行 ----
describe('initialize', () => {
  it('會從既有 session 帶出使用者，並標記為已初始化', async () => {
    mocks.session.value = { user: userWith() };
    const auth = useAuthStore();

    await auth.initialize();

    expect(auth.isInitialized.value).toBe(true);
    expect(auth.user.value?.email).toBe('alwyn@example.com');
    expect(auth.isAuthenticated.value).toBe(true);
  });

  it('重複呼叫不會再查一次管理者身分', async () => {
    const auth = useAuthStore();
    mocks.calls.value = [];

    await auth.initialize();
    await auth.waitForInit();

    expect(mocks.calls.value).not.toContain('adminLookup');
  });

  it('initialize 之後 isLoading 回到 false', () => {
    expect(useAuthStore().isLoading.value).toBe(false);
  });
});

describe('登入狀態的衍生值', () => {
  it('有 username 時以 username 為顯示名稱', () => {
    setUser(userWith({ user_metadata: { username: 'AlwynP' } }));
    const auth = useAuthStore();

    expect(auth.userDisplayName.value).toBe('AlwynP');
    expect(auth.userInitial.value).toBe('A');
  });

  it('沒有 username 時退回 email 前半段', () => {
    setUser(userWith({ user_metadata: {} }));
    const auth = useAuthStore();

    expect(auth.userDisplayName.value).toBe('alwyn');
    expect(auth.userInitial.value).toBe('A');
  });

  it('userInitial 一律大寫', () => {
    setUser(userWith({ user_metadata: { username: 'zoe' } }));
    expect(useAuthStore().userInitial.value).toBe('Z');
  });

  it('userEmail 反映目前使用者', () => {
    setUser(userWith({ email: 'other@example.com' }));
    expect(useAuthStore().userEmail.value).toBe('other@example.com');
  });

  it('登出後衍生值全部清空', () => {
    setUser(null);
    const auth = useAuthStore();

    expect(auth.isAuthenticated.value).toBe(false);
    expect(auth.userEmail.value).toBe('');
    expect(auth.userDisplayName.value).toBe('');
    expect(auth.userInitial.value).toBe('');
  });

  it('沒有 email 也沒有 username 時不會爆掉', () => {
    setUser({ id: 'u-2', user_metadata: {} });
    const auth = useAuthStore();

    expect(auth.userDisplayName.value).toBe('');
    expect(auth.userInitial.value).toBe('');
  });
});

describe('管理者身分', () => {
  it('admins 有資料時 isAdmin 為 true', async () => {
    mocks.adminRow.value = { user_id: 'u-1' };
    setUser(userWith());
    await vi.waitFor(() => expect(useAuthStore().isAdmin.value).toBe(true));
  });

  it('admins 沒資料時 isAdmin 為 false', async () => {
    mocks.adminRow.value = null;
    setUser(userWith());
    await vi.waitFor(() => expect(useAuthStore().isAdmin.value).toBe(false));
  });

  it('登出後 isAdmin 立刻變回 false', () => {
    setUser(null);
    expect(useAuthStore().isAdmin.value).toBe(false);
  });
});

describe('email 登入 / 註冊', () => {
  it('signInWithEmail 會帶上帳密', async () => {
    await useAuthStore().signInWithEmail('a@b.com', 'pw');

    expect(mocks.calls.value).toContain('signInWithPassword');
    expect(mocks.args.value[0]).toMatchObject({ email: 'a@b.com', password: 'pw' });
  });

  it('signInWithEmail 失敗時往外丟', async () => {
    mocks.errors.value.signInWithPassword = new Error('bad credentials');
    await expect(useAuthStore().signInWithEmail('a@b.com', 'pw')).rejects.toThrow('bad credentials');
  });

  it('signInWithEmail 失敗後 isLoading 仍要回到 false', async () => {
    mocks.errors.value.signInWithPassword = new Error('nope');
    const auth = useAuthStore();

    await expect(auth.signInWithEmail('a@b.com', 'pw')).rejects.toThrow();
    expect(auth.isLoading.value).toBe(false);
  });

  it('signUp 會帶上帳密', async () => {
    await useAuthStore().signUp('new@b.com', 'pw');
    expect(mocks.args.value[0]).toMatchObject({ email: 'new@b.com', password: 'pw' });
  });

  it('signUp 失敗時往外丟', async () => {
    mocks.errors.value.signUp = new Error('already registered');
    await expect(useAuthStore().signUp('a@b.com', 'pw')).rejects.toThrow('already registered');
  });
});

describe('Google 登入', () => {
  it('會指定 provider 與 callback 網址', async () => {
    await useAuthStore().signInWithGoogle();

    expect(mocks.calls.value).toContain('signInWithOAuth');
    expect(mocks.args.value[0].provider).toBe('google');
    expect(mocks.args.value[0].options.redirectTo).toContain('/auth/callback');
  });

  it('失敗時往外丟並解除 loading', async () => {
    mocks.errors.value.signInWithOAuth = new Error('popup blocked');
    const auth = useAuthStore();

    await expect(auth.signInWithGoogle()).rejects.toThrow('popup blocked');
    expect(auth.isLoading.value).toBe(false);
  });
});

describe('密碼重設與更新', () => {
  it('resetPassword 會帶 email', async () => {
    await useAuthStore().resetPassword('a@b.com');

    expect(mocks.calls.value).toContain('resetPasswordForEmail');
    expect(mocks.args.value[0]).toBe('a@b.com');
  });

  it('resetPassword 失敗時往外丟', async () => {
    mocks.errors.value.resetPasswordForEmail = new Error('unknown email');
    await expect(useAuthStore().resetPassword('a@b.com')).rejects.toThrow('unknown email');
  });

  it('updatePassword 會送出新密碼', async () => {
    await useAuthStore().updatePassword('new-secret');
    expect(mocks.args.value[0]).toMatchObject({ password: 'new-secret' });
  });

  it('updatePassword 失敗時往外丟並解除 loading', async () => {
    mocks.errors.value.updateUser = new Error('weak password');
    const auth = useAuthStore();

    await expect(auth.updatePassword('123')).rejects.toThrow('weak password');
    expect(auth.isLoading.value).toBe(false);
  });
});
