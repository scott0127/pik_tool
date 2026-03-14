// Service Worker Registration Plugin
// 註冊 Service Worker 以啟用離線快取
// 包含自動更新檢查 & 平滑版本切換

export default defineNuxtPlugin(() => {
  if (import.meta.client && 'serviceWorker' in navigator) {
    if (import.meta.dev) {
      // 在開發環境中，停用並註銷 Service Worker，避免干擾 Vite HMR
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister();
          console.log('[App] Dev mode: Service Worker unregistered.');
        }
      });
      return;
    }

    // 只在生產環境註冊
    // 追蹤頁面是否已完成初始載入
    // 初始載入期間不需要 reload，因為 HTML 已經是從網路取得的最新版本
    let pageFullyLoaded = false;

    window.addEventListener('load', () => {
      // 等頁面完全載入並穩定後才允許自動 reload
      // 這段延遲確保初次 SW 更新不會觸發不必要的重新載入
      setTimeout(() => {
        pageFullyLoaded = true;
      }, 5000);

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

      // 監聽 Controller 改變事件（表示新的 SW 已接管）
      // 只有在頁面已完全載入後才 reload，避免初始載入時的 double-load
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing && pageFullyLoaded) {
          refreshing = true;
          console.log('[App] Refreshing page to load new version...');
          window.location.reload();
        } else if (!pageFullyLoaded) {
          console.log('[App] SW updated during initial load, skipping reload (page already has latest HTML).');
        }
      });
    });
  }
});
