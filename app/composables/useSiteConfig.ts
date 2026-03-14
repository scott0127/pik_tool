export const useSiteConfig = () => {
  const supabase = useSupabaseClient<any>();
  const heroFeaturedConfig = useState<{row1: string, row2: string} | null>('heroFeaturedConfig', () => null);
  const isConfigLoading = useState('isConfigLoading', () => false);

  const fetchHeroConfig = async () => {
    isConfigLoading.value = true;
    try {
      // @ts-ignore: site_configs table not available in Supabase types yet
      const { data, error } = await supabase
        .from('site_configs')
        .select('value')
        .eq('id', 'hero_featured_pikmin')
        .maybeSingle();
      
      if (data && !error && data.value) {
        heroFeaturedConfig.value = data.value as any;
      } else {
        heroFeaturedConfig.value = {
          row1: 'reverse-valentine-sticker',
          row2: '彩色粉末-世界節慶'
        };
      }
    } catch (e) {
      console.error('[useAppConfig] Error fetching config:', e);
      heroFeaturedConfig.value = {
        row1: 'reverse-valentine-sticker',
        row2: '彩色粉末-世界節慶'
      };
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
