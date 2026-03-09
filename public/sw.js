// Service Worker for Pikmin Bloom Decor Tracker
// 離線快取大型靜態資源，減少重複下載
// ⚠️ 不預快取 HTML 導航路由，避免部署後舊 HTML 引用不存在的 chunk 檔

const CACHE_NAME = 'pikmin-decor-v6';
const STATIC_CACHE_NAME = 'pikmin-static-v6';
const DATA_CACHE_NAME = 'pikmin-data-v6';

// 需要快取的數據 URL 模式
const DATA_URL_PATTERNS = [
    /\/data\/regions\/.*\.json$/,
];

// 安裝事件 - 立即接管（不再預快取 HTML）
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    self.skipWaiting();
});

// 啟用事件 - 清理舊快取 & 通知所有客戶端
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE_NAME && name !== DATA_CACHE_NAME)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
        .then(() => self.clients.claim())
        .then(() => {
            // 通知所有開啟中的頁面：新版本已啟用
            self.clients.matchAll({ type: 'window' }).then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({ type: 'SW_UPDATED' });
                });
            });
        })
    );
});

// Fetch 事件 - 快取策略
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 只處理 GET 請求
    if (event.request.method !== 'GET') return;

    // 跳過非同源請求 (除非您有快取跨域圖片的需求)
    if (url.origin !== self.location.origin) return;

    // 開發者模式與 Vite HMR 繞過：絕對不要快取 Vite 的 websocket 和任何帶有 HMR 標記 (t= / v= / vite) 的模組
    if (
        url.pathname.includes('/@vite/') ||
        url.pathname.includes('/@fs/') ||
        url.search.includes('?v=') ||
        url.search.includes('?t=') ||
        url.search.includes('?import') ||
        url.search.includes('?type=') ||
        url.search.includes('?direct')
    ) {
        return event.respondWith(fetch(event.request));
    }

    // 判斷是否為數據文件
    const isDataRequest = DATA_URL_PATTERNS.some(pattern => pattern.test(url.pathname));

    if (isDataRequest) {
        // 數據文件: Network First 策略 (確保取得最新版)
        // 優先嘗試網路請求，成功後更新快取；失敗則使用快取
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    // 如果網路請求成功，更新快取
                    if (networkResponse.ok) {
                        const responseClone = networkResponse.clone();
                        caches.open(DATA_CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    console.log('[SW] Network failed, serving from cache:', url.pathname);
                    return caches.match(event.request);
                })
        );
    } else if (url.pathname.startsWith('/_nuxt/')) {
        // Nuxt 靜態資源: Cache First
        event.respondWith(
            caches.open(STATIC_CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return fetch(event.request).then((networkResponse) => {
                        if (networkResponse.ok) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    });
                });
            })
        );
    } else if (event.request.mode === 'navigate') {
        // HTML 導航請求: 必須 Network First，確保抓到最新的 index.html 和新的 js 檔名
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(DATA_CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
    } else {
        // 其他請求 (圖片、字體等): Network First, fallback to cache
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(STATIC_CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
    }
});

// 接收訊息 - 用於手動清除快取
self.addEventListener('message', (event) => {
    if (event.data === 'CLEAR_CACHE') {
        console.log('[SW] Clearing all caches...');
        caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name));
        });
    } else if (event.data === 'SKIP_WAITING') {
        console.log('[SW] Skipping waiting...');
        self.skipWaiting();
    }
});
