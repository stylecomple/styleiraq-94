
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

interface ProductSearchOptions {
  searchQuery: string;
  selectedCategory?: string | null;
  selectedSubcategory?: string | null;
}

export const useProductSearch = ({ searchQuery, selectedCategory, selectedSubcategory }: ProductSearchOptions) => {
  return useQuery({
    queryKey: ['product-search', searchQuery, selectedCategory, selectedSubcategory],
    queryFn: async () => {
      console.log('Fetching products with filters:', { searchQuery, selectedCategory, selectedSubcategory });
      
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);
      
      // Apply category filter
      if (selectedCategory && selectedCategory !== 'all') {
        if (selectedCategory === 'discounts') {
          // Filter for products with actual discounts greater than 0
          query = query.gt('discount_percentage', 0);
        } else {
          query = query.contains('categories', [selectedCategory]);
        }
      }
      
      // Apply subcategory filter
      if (selectedSubcategory) {
        query = query.contains('subcategories', [selectedSubcategory]);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      
      console.log('Raw products fetched:', data?.length || 0);
      
      // Transform raw database data to match Product interface
      let products = (data || []).map(rawProduct => {
        const options = (rawProduct as any).options || 
          ((rawProduct as any).colors ? (rawProduct as any).colors.map((color: string) => ({ name: color, price: undefined })) : []);
        
        const subcategories = (rawProduct as any).subcategories || [];

        // Ensure discount_percentage is properly handled
        const discount_percentage = (rawProduct as any).discount_percentage || 0;

        return {
          ...rawProduct,
          options,
          subcategories,
          discount_percentage
        } as Product;
      });

      // Enhanced search functionality
      if (searchQuery.trim()) {
        const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
        
        products = products.filter(product => {
          const searchableText = [
            product.name || '',
            product.description || '',
            ...(product.categories || []),
            ...(product.options?.map(opt => opt.name) || [])
          ].join(' ').toLowerCase();
          
          // Check if ALL search terms are found in the searchable text
          return searchTerms.every(term => searchableText.includes(term));
        });
      }

      // If filtering by discounts, only show products with actual discounts
      if (selectedCategory === 'discounts') {
        products = products.filter(product => product.discount_percentage && product.discount_percentage > 0);
        products = products.sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0));
      } else {
        products = products.sort(() => Math.random() - 0.5);
      }

      console.log('Final filtered products:', products.length);
      
      return {
        products,
        totalCount: products.length,
      };
    },
    enabled: true,
    refetchInterval: 30000, // Refresh every 30 seconds to get updated discount data
  });
};
