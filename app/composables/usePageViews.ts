export const usePageViews = () => {
  const supabase = useSupabaseClient<any>();
  const pageViews = ref<number | null>(null);
  const PAGE_VIEW_CACHE_KEY = 'pikmin-page-views-cache-v1';
  const PAGE_VIEW_CACHE_TTL =  60 * 60 * 1000; // 1 hour

  const readCachedViews = (): number | null => {
    if (!import.meta.client) return null;
    try {
      const raw = localStorage.getItem(PAGE_VIEW_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { count: number; ts: number };
      if (typeof parsed?.count !== 'number' || typeof parsed?.ts !== 'number') return null;
      if (Date.now() - parsed.ts > PAGE_VIEW_CACHE_TTL) return null;
      return parsed.count;
    } catch {
      return null;
    }
  };

  /**
   * The function `writeCachedViews` stores the count of views in local storage along with a timestamp
   * if the environment is a client-side browser.
   * @param {number} count - The `count` parameter in the `writeCachedViews` function represents the
   * number of views to be cached.
   * @returns If the `import.meta.client` condition is not met, the function will return nothing as
   * there is no explicit return statement in that case.
   */
  const writeCachedViews = (count: number) => {
    if (!import.meta.client) return;
    try {
      localStorage.setItem(PAGE_VIEW_CACHE_KEY, JSON.stringify({ count, ts: Date.now() }));
    } catch {
      // noop
    }
  };

  // Increment page views counter
  const incrementPageViews = async () => {
    // Check if already incremented in this session to save egress
    if (import.meta.client && sessionStorage.getItem('has_incremented_views')) {
      const cached = readCachedViews();
      if (cached !== null) {
        pageViews.value = cached;
        return cached;
      }
      return getPageViews();
    }

    try {
      const { data, error } = await supabase.rpc('increment_page_views');
      
      if (error) {
        console.error('Failed to increment page views:', error);
        return null;
      }
      
      // Mark as incremented for this browser session
      if (import.meta.client) {
        sessionStorage.setItem('has_incremented_views', 'true');
      }

      pageViews.value = data;
      if (typeof data === 'number') {
        writeCachedViews(data);
      }
      return data;
    } catch (err) {
      console.error('Error incrementing page views:', err);
      return null;
    }
  };

  // Get current page views count
  const getPageViews = async () => {
    const cached = readCachedViews();
    if (cached !== null) {
      pageViews.value = cached;
      return cached;
    }

    try {
      const { data, error } = await supabase
        .from('page_views')
        .select('count')
        .eq('id', 'global')
        .single();
      
      if (error) {
        console.error('Failed to get page views:', error);
        return null;
      }
      
      pageViews.value = data?.count || null;
      if (typeof data?.count === 'number') {
        writeCachedViews(data.count);
      }
      return data?.count;
    } catch (err) {
      console.error('Error getting page views:', err);
      return null;
    }
  };

  return {
    pageViews,
    incrementPageViews,
    getPageViews
  };
};
