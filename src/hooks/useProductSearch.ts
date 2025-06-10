
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
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      // Apply category filter
      if (selectedCategory && selectedCategory !== 'all') {
        query = query.contains('categories', [selectedCategory]);
      }
      
      // Apply subcategory filter
      if (selectedSubcategory) {
        query = query.contains('subcategories', [selectedSubcategory]);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform raw database data to match Product interface
      let products = (data || []).map(rawProduct => {
        const options = (rawProduct as any).options || 
          ((rawProduct as any).colors ? (rawProduct as any).colors.map((color: string) => ({ name: color, price: undefined })) : []);
        
        const subcategories = (rawProduct as any).subcategories || [];

        return {
          ...rawProduct,
          options,
          subcategories
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

      return {
        products,
        totalCount: products.length,
      };
    },
    enabled: true,
  });
};
