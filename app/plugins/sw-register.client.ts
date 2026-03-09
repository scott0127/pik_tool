// Service Worker Registration Plugin
// 註冊 Service Worker 以啟用離線快取
// 包含自動更新檢查 & 平滑版本切換

export default defineNuxtPlugin(() => {
  // 只在客戶端且支援 Service Worker 時註冊
  if (import.meta.client && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[App] Service Worker registered:', registration.scope);

          // 如果發現有新的 Service Worker 正在等待，發送 skipWaiting 叫它立刻接管
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                // 當新版本安裝好且處於等待階段 (installed)
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[App] New App Version available! Forcing update...');
                  // 強制啟動新的 SW
                  newWorker.postMessage('SKIP_WAITING');
                }
              });
            }
          });

          // 定期檢查 SW 更新（每 60 秒）
          // 確保即使使用者沒有導航，也能及時收到新版本
          setInterval(() => {
            registration.update().catch(() => {
              // 忽略更新檢查失敗（離線的情境）
            });
          }, 60 * 1000);
        })
        .catch((error) => {
          console.warn('[App] Service Worker registration failed:', error);
        });

      // 監聽 Controller 改變事件（表示新的 SW 已接管），立刻重新整理網頁
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          console.log('[App] Refreshing page to load new version...');
          window.location.reload();
        }
      });

      // 監聽來自 SW 的訊息
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SW_UPDATED') {
          console.log('[App] Received SW_UPDATED message, new version is active.');
          // controllerchange 事件會自動觸發 reload，這裡不需要重複 reload
        }
      });
    });
  }
});
