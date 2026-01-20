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
        })
        .catch((error) => {
          console.warn('[App] Service Worker registration failed:', error);
        });
    });
  }
});
