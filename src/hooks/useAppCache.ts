
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CacheData {
  products: any[];
  categories: any[];
  lastUpdated: string;
  version: string;
}

const CACHE_KEY = 'style_app_cache';
const CACHE_VERSION = '1.0.0';

export const useAppCache = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [cacheStatus, setCacheStatus] = useState<'loading' | 'cached' | 'updating' | 'complete'>('loading');
  const [cachedData, setCachedData] = useState<CacheData | null>(null);

  const getCachedData = (): CacheData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        // Check if cache version matches
        if (data.version === CACHE_VERSION) {
          return data;
        }
      }
    } catch (error) {
      console.error('Error reading cache:', error);
    }
    return null;
  };

  const setCacheData = (data: CacheData) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  };

  const checkForUpdates = async (lastUpdated: string) => {
    try {
      // Check if products have been updated
      const { data: productUpdates } = await supabase
        .from('products')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1);

      // Check if categories have been updated
      const { data: categoryUpdates } = await supabase
        .from('categories')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1);

      const latestProductUpdate = productUpdates?.[0]?.updated_at;
      const latestCategoryUpdate = categoryUpdates?.[0]?.updated_at;

      // Compare with cached timestamp
      const lastUpdate = new Date(lastUpdated).getTime();
      const productUpdate = latestProductUpdate ? new Date(latestProductUpdate).getTime() : 0;
      const categoryUpdate = latestCategoryUpdate ? new Date(latestCategoryUpdate).getTime() : 0;

      return Math.max(productUpdate, categoryUpdate) > lastUpdate;
    } catch (error) {
      console.error('Error checking updates:', error);
      return true; // If we can't check, assume update needed
    }
  };

  const fetchFreshData = async (): Promise<CacheData> => {
    console.log('Fetching fresh data...');
    
    // Fetch products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (productsError) throw productsError;

    // Fetch categories with subcategories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select(`
        *,
        subcategories (*)
      `);

    if (categoriesError) throw categoriesError;

    const cacheData: CacheData = {
      products: products || [],
      categories: categories || [],
      lastUpdated: new Date().toISOString(),
      version: CACHE_VERSION
    };

    return cacheData;
  };

  const initializeCache = async () => {
    setIsLoading(true);
    setCacheStatus('loading');

    try {
      const cached = getCachedData();
      
      if (cached) {
        console.log('Found cached data, checking for updates...');
        setCachedData(cached);
        setCacheStatus('cached');
        
        // Check if updates are needed in the background
        const needsUpdate = await checkForUpdates(cached.lastUpdated);
        
        if (needsUpdate) {
          console.log('Updates found, refreshing cache...');
          setCacheStatus('updating');
          
          const freshData = await fetchFreshData();
          setCacheData(freshData);
          setCachedData(freshData);
          setCacheStatus('complete');
        } else {
          console.log('Cache is up to date');
          setCacheStatus('complete');
        }
      } else {
        console.log('No cache found, fetching initial data...');
        setCacheStatus('updating');
        
        const freshData = await fetchFreshData();
        setCacheData(freshData);
        setCachedData(freshData);
        setCacheStatus('complete');
      }
    } catch (error) {
      console.error('Error initializing cache:', error);
      setCacheStatus('complete');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    setCachedData(null);
  };

  useEffect(() => {
    initializeCache();
  }, []);

  return {
    isLoading,
    cacheStatus,
    cachedData,
    clearCache,
    refreshCache: initializeCache
  };
};
