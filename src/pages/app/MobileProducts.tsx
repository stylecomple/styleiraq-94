
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MobileAppLayout from '@/components/MobileAppLayout';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import { Product } from '@/types';

const MobileProducts = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: products, isLoading } = useQuery({
    queryKey: ['mobile-products', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Product[];
    }
  });

  return (
    <MobileAppLayout title="جميع المنتجات" showBackButton={false}>
      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <SearchBar 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery}
        />

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-500">
              {searchQuery 
                ? 'لم نجد أي منتجات تطابق بحثك.' 
                : 'لا توجد منتجات متاحة حالياً.'}
            </p>
          </div>
        )}
      </div>
    </MobileAppLayout>
  );
};

export default MobileProducts;
