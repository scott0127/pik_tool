import type { GeocodingResult } from '~/types/map';

export function useGeocoding() {
  const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
  const MIN_REQUEST_INTERVAL = 1000; // Nominatim 要求最少 1 秒間隔
  
  let lastRequestTime = 0;
  
  const isSearching = ref(false);
  const searchError = ref<string | null>(null);

  /**
   * 搜尋地點（使用 Nominatim Geocoding）
   */
  async function searchLocation(query: string): Promise<GeocodingResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    // 速率限制：確保請求間隔足夠
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    lastRequestTime = Date.now();

    isSearching.value = true;
    searchError.value = null;

    try {
      // 建立查詢參數
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        limit: '5', // 限制返回 5 個結果
        'accept-language': 'zh-TW,zh,en', // 優先顯示中文名稱
      });

      const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
        headers: {
          'User-Agent': 'PikminBloomDecorMap/1.0', // Nominatim 要求提供 User-Agent
        },
      });

      if (!response.ok) {
        throw new Error(`Nominatim API 錯誤: ${response.status}`);
      }

      const data = await response.json();
      
      // 轉換為我們的 GeocodingResult 格式
      const results: GeocodingResult[] = data.map((item: any) => ({
        place_id: item.place_id.toString(),
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
        boundingbox: item.boundingbox,
        type: item.type,
        importance: item.importance || 0,
      }));

      console.log(`[Geocoding] Found ${results.length} results for "${query}"`);
      return results;
    } catch (err) {
      const message = err instanceof Error ? err.message : '搜尋失敗';
      searchError.value = message;
      console.error('[Geocoding] Search failed:', err);
      return [];
    } finally {
      isSearching.value = false;
    }
  }

  return {
    searchLocation,
    isSearching: readonly(isSearching),
    searchError: readonly(searchError),
  };
}
