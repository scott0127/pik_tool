// Service Worker Registration Plugin
// 註冊 Service Worker 以啟用離線快取

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
                // 當新版本安裝好且處於發布階段 (installed)
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[App] New App Version available! Forcing update...');
                  // 強制啟動新的 SW
                  newWorker.postMessage('SKIP_WAITING');
                }
              });
            }
          });
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
    });
  }
});
