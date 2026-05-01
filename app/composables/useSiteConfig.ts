export const useSiteConfig = () => {
  const supabase = useSupabaseClient<any>();
  const heroFeaturedConfig = useState<{row1: string, row2: string} | null>('heroFeaturedConfig', () => null);
  const isConfigLoading = useState('isConfigLoading', () => false);
  const CONFIG_CACHE_KEY = 'pikmin-hero-config-cache-v1';
  const CONFIG_CACHE_TTL = 60 * 60 * 1000;

  const defaultConfig = {
    row1: 'reverse-valentine-sticker',
    row2: '彩色粉末-世界節慶'
  };

  const readCache = () => {
    if (!import.meta.client) return null;
    try {
      const raw = localStorage.getItem(CONFIG_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { value: { row1: string; row2: string }; ts: number };
      if (!parsed?.value?.row1 || !parsed?.value?.row2 || typeof parsed.ts !== 'number') return null;
      if (Date.now() - parsed.ts > CONFIG_CACHE_TTL) return null;
      return parsed.value;
    } catch {
      return null;
    }
  };

  const writeCache = (value: { row1: string; row2: string }) => {
    if (!import.meta.client) return;
    try {
      localStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify({ value, ts: Date.now() }));
    } catch {
      // noop
    }
  };

  const fetchHeroConfig = async () => {
    const cached = readCache();
    if (cached) {
      heroFeaturedConfig.value = cached;
      return;
    }

    isConfigLoading.value = true;
    try {
      // @ts-ignore: site_configs table not available in Supabase types yet
      const { data, error } = await supabase
        .from('site_configs')
        .select('value')
        .eq('id', 'hero_featured_pikmin')
        .maybeSingle();
      
      if (data && !error && data.value) {
        const nextConfig = data.value as { row1: string; row2: string };
        heroFeaturedConfig.value = nextConfig;
        writeCache(nextConfig);
      } else {
        heroFeaturedConfig.value = defaultConfig;
      }
    } catch (e) {
      console.error('[useAppConfig] Error fetching config:', e);
      heroFeaturedConfig.value = defaultConfig;
    } finally {
      isConfigLoading.value = false;
    }
  };

  const updateHeroConfig = async (row1: string, row2: string) => {
    isConfigLoading.value = true;
    try {
      // @ts-ignore: site_configs table not available in Supabase types yet
      const { error } = await supabase
        .from('site_configs')
        .upsert({
          id: 'hero_featured_pikmin',
          value: { row1, row2 },
          updated_at: new Date().toISOString()
        });
      
      if (!error) {
        heroFeaturedConfig.value = { row1, row2 };
        writeCache(heroFeaturedConfig.value);
        return true;
      } else {
        console.error('[useAppConfig] Error updating config:', error);
      }
    } catch (e) {
      console.error('[useSiteConfig] Error updating config exception:', e);
    } finally {
      isConfigLoading.value = false;
    }
    return false;
  };

  return {
    heroFeaturedConfig,
    isConfigLoading,
    fetchHeroConfig,
    updateHeroConfig
  };
};
