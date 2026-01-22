// Service Worker for Pikmin Bloom Decor Tracker
// 離線快取大型靜態資源，減少重複下載

const CACHE_NAME = 'pikmin-decor-v1';
const STATIC_CACHE_NAME = 'pikmin-static-v1';
const DATA_CACHE_NAME = 'pikmin-data-v2';

// 立即快取的核心資源
const PRECACHE_URLS = [
    '/',
    '/collection',
    '/map',
];

// 需要快取的數據 URL 模式
const DATA_URL_PATTERNS = [
    /\/data\/regions\/.*\.json$/,
];

// 安裝事件 - 預快取核心資源
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Pre-caching core resources');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => self.skipWaiting())
    );
});

// 啟用事件 - 清理舊快取
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
        }).then(() => self.clients.claim())
    );
});

// Fetch 事件 - 快取策略
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 只處理 GET 請求
    if (event.request.method !== 'GET') return;

    // 跳過非同源請求
    if (url.origin !== self.location.origin) return;

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
    } else {
        // 其他請求: Network First, fallback to cache
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // 成功獲取，更新快取
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(STATIC_CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // 網路失敗，嘗試從快取獲取
                    return caches.match(event.request);
                })
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
    }
});
