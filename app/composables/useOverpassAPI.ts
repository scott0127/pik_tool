import type { DecorRule, MapBounds, OverpassResponse, POIPoint } from '~/types/map';

export function useOverpassAPI() {
  // 多個 Overpass API 伺服器（用於故障切換）
  const OVERPASS_SERVERS = [
    'https://overpass-api.de/api/interpreter', // 官方伺服器（最穩定，支援 CORS）
    'https://overpass.kumi.systems/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  ];
  let currentServerIndex = 0;
  let lastRequestTime = 0;
  const MIN_REQUEST_INTERVAL = 2000; // 最少間隔 2 秒
  
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * 建立 Overpass QL 查詢語句
   */
  function buildOverpassQuery(bounds: MapBounds, selectedRules: DecorRule[]): string {
    const { south, west, north, east } = bounds;
    const bbox = `${south},${west},${north},${east}`;

    // 收集所有要查詢的條件
    const queries: string[] = [];

    for (const rule of selectedRules) {
      for (const tag of rule.tags) {
        // 解析 "key=value" 格式
        const [key, value] = tag.split('=');
        if (key && value) {
          // 查詢 node 和 way 兩種類型
          queries.push(`  node["${key}"="${value}"](${bbox});`);
          queries.push(`  way["${key}"="${value}"](${bbox});`);
        }
      }
    }

    if (queries.length === 0) {
      return '';
    }

    // 組合完整的 Overpass QL
    return `
[out:json][timeout:90];
(
${queries.join('\n')}
);
out center;
    `.trim();
  }

  /**
   * 轉換 Overpass 回應為 POI 點位
   * 優化：只保留必要的屬性，不儲存完整的 tags 物件
   */
  function transformToPOIPoints(
    response: OverpassResponse,
    decorRulesMap: Map<string, DecorRule>,
    maxResults: number = 500 // 限制最大結果數量
  ): POIPoint[] {
    const points: POIPoint[] = [];

    for (const element of response.elements) {
      // 達到最大數量限制就停止
      if (points.length >= maxResults) break;
      
      if (!element.tags) continue;

      // 取得座標
      let lat: number | undefined;
      let lon: number | undefined;

      if (element.type === 'node') {
        lat = element.lat;
        lon = element.lon;
      } else if (element.center) {
        lat = element.center.lat;
        lon = element.center.lon;
      }

      if (lat === undefined || lon === undefined) continue;

      // 判斷這個點屬於哪個飾品類型
      let matchedRule: DecorRule | null = null;
      
      // [NEW] Rough bounding box for Taiwan Main Island + Islands to exclude JP-only content
      // Taiwan is roughly Lat 21-26, Lon 119-122
      // Japan is roughly Lat 24-46, Lon 122-154 (Okinawa starts around 122.5E)
      // We assume if we are scanning Taiwan, we exclude JP-only rules.
      const isTaiwan = (lat >= 21 && lat <= 26.5 && lon >= 118 && lon <= 122.5);

      for (const [ruleId, rule] of decorRulesMap) {
        // [NEW] Region Check
        if (rule.region === 'JP' && isTaiwan) {
             continue; // Skip JP-only rules if in Taiwan
        }

        for (const tag of rule.tags) {
          const [key, value] = tag.split('=');
          if (key && value && element.tags[key] === value) {
            matchedRule = rule;
            break;
          }
        }
        if (matchedRule) break;
      }

      if (!matchedRule) continue;

      // 提取名稱（優先使用中文名稱）
      const name =
        element.tags.name ||
        element.tags['name:zh'] ||
        element.tags['name:zh-TW'] ||
        element.tags['name:en'] ||
        `未命名${matchedRule.name}`;

      // 只保留必要的屬性，不儲存完整的 tags 物件以節省記憶體
      points.push({
        id: `${element.type}-${element.id}`,
        lat,
        lon,
        name,
        decorType: matchedRule.id,
        decorName: matchedRule.name,
        decorIcon: matchedRule.icon,
        iconUrl: matchedRule.iconUrl,
        tags: {}, // 不儲存完整 tags，減少記憶體使用
      });
    }

    return points;
  }

  /**
   * 查詢 POI 資料（支援多伺服器故障切換和速率限制）
   */
  async function fetchPOIs(
    bounds: MapBounds,
    selectedRules: DecorRule[],
    abortSignal?: AbortSignal,
    onProgress?: (attempt: number) => void
  ): Promise<POIPoint[]> {
    if (selectedRules.length === 0) {
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

    isLoading.value = true;
    error.value = null;

    try {
      const query = buildOverpassQuery(bounds, selectedRules);
      
      if (!query) {
        return [];
      }

      // 嘗試不同的伺服器，共兩輪 (6 次嘗試)
      let lastError: Error | null = null;
      const maxAttempts = OVERPASS_SERVERS.length * 2;
      
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // 更新進度
        if (onProgress) {
          onProgress(attempt + 1);
        }

        const serverUrl = OVERPASS_SERVERS[(currentServerIndex + attempt) % OVERPASS_SERVERS.length]!;
        
        try {
          console.log(`[Overpass] Trying server (${attempt + 1}/${maxAttempts}): ${serverUrl}`);
          
          const response = await fetch(serverUrl, {
            method: 'POST',
            body: query,
            headers: {
              'Content-Type': 'text/plain',
            },
            signal: abortSignal,
          });

          if (response.status === 429) {
            console.warn(`[Overpass] Server ${serverUrl} returned 429, trying next...`);
            // 切換到下一個伺服器
            currentServerIndex = (currentServerIndex + 1) % OVERPASS_SERVERS.length;
            continue;
          }

          if (!response.ok) {
            throw new Error(`Overpass API 錯誤: ${response.status}`);
          }

          const data: OverpassResponse = await response.json();

          // 建立 decorRules Map 以便快速查找
          const decorRulesMap = new Map(selectedRules.map(rule => [rule.id, rule]));

          const points = transformToPOIPoints(data, decorRulesMap);
          
          console.log(`[Overpass] Success! Got ${points.length} points from ${serverUrl}`);
          return points;
        } catch (err) {
          // 如果是 AbortError，直接拋出，不再重試
          if (err instanceof Error && err.name === 'AbortError') {
            throw err;
          }
          
          lastError = err as Error;
          console.warn(`[Overpass] Server ${serverUrl} failed:`, err);
        }
      }

      // 所有伺服器都失敗
      throw lastError || new Error('所有 Overpass 伺服器都無法連線');
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw err; // 讓外層處理 AbortError
      }
      const message = err instanceof Error ? err.message : '未知錯誤';
      error.value = message;
      console.error('Overpass API 查詢失敗:', err);
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  return {
    fetchPOIs,
    isLoading: readonly(isLoading),
    error: readonly(error),
  };
}
