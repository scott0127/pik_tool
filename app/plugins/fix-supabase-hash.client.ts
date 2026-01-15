/**
 * Fix Supabase Auth Hash Plugin
 * 
 * Supabase 在認證錯誤時會返回帶有 hash 的 URL，例如：
 * /auth/callback?error=...#error=...
 * 
 * Vue Router 會嘗試將這個 hash 當作滾動位置選擇器處理，
 * 但複雜的 hash（包含 = 和 &）會導致選擇器語法錯誤。
 * 
 * 此插件在 Vue Router 初始化前清理這些 hash。
 */

// 立即執行的 IIFE - 在任何 Vue 代碼運行之前
if (typeof window !== 'undefined') {
  const hash = window.location.hash;
  const hasAuthTokens = hash.includes('access_token=') || hash.includes('refresh_token=');
  const isRecoveryFlow = hash.includes('type=recovery');
  
  // 僅針對錯誤情境處理 hash，避免破壞包含 token 的恢復/登入流程
  if (hash && (hash.includes('error=') || hash.includes('type=')) && !hasAuthTokens && !isRecoveryFlow) {
    console.log('[FixHashPlugin:IIFE] Detected problematic hash, processing immediately...');
    
    try {
      const hashParams = new URLSearchParams(hash.substring(1));
      const url = new URL(window.location.href);
      
      // 將 hash 參數合併到 query 參數
      hashParams.forEach((value, key) => {
        if (!url.searchParams.has(key)) {
          url.searchParams.set(key, value);
        }
      });
      
      // 清除 hash
      url.hash = '';
      
      // 更新 URL（不刷新頁面）
      window.history.replaceState(null, '', url.toString());
      console.log('[FixHashPlugin:IIFE] URL fixed:', url.toString());
    } catch (e) {
      console.error('[FixHashPlugin:IIFE] Failed to fix hash:', e);
    }
  }
}

export default defineNuxtPlugin({
  name: 'fix-supabase-hash',
  enforce: 'pre',
  setup() {
    // Plugin setup - IIFE above already handled the hash fix
    console.log('[FixHashPlugin] Plugin registered');
  }
});

