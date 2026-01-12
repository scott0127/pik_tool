export const usePageViews = () => {
  const supabase = useSupabaseClient();
  const pageViews = ref<number | null>(null);

  // Increment page views counter
  const incrementPageViews = async () => {
    try {
      const { data, error } = await supabase.rpc('increment_page_views');
      
      if (error) {
        console.error('Failed to increment page views:', error);
        return null;
      }
      
      pageViews.value = data;
      return data;
    } catch (err) {
      console.error('Error incrementing page views:', err);
      return null;
    }
  };

  // Get current page views count
  const getPageViews = async () => {
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
