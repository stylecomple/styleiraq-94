
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MobileAppLayout from '@/components/MobileAppLayout';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { useAppLogo } from '@/hooks/useAppLogo';

const MobileProducts = () => {
  const { logoUrl } = useAppLogo();

  const { data: products, isLoading } = useQuery({
    queryKey: ['mobile-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform raw database data to match Product interface
      return (data || []).map(rawProduct => {
        const options = (rawProduct as any).options || 
          ((rawProduct as any).colors ? (rawProduct as any).colors.map((color: string) => ({ name: color, price: undefined })) : []);
        
        const subcategories = (rawProduct as any).subcategories || [];

        return {
          ...rawProduct,
          options,
          subcategories
        } as Product;
      });
    }
  });

  return (
    <MobileAppLayout title="جميع المنتجات" showBackButton={false}>
      <div className="space-y-6 animate-fade-in">
        {/* App Logo Section */}
        {logoUrl && (
          <div className="flex justify-center py-4 animate-slide-down">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
              <div className="relative bg-white rounded-full p-3 shadow-lg transform transition-all duration-300 hover:scale-105">
                <img 
                  src={logoUrl} 
                  alt="متجر الجمال والأناقة" 
                  className="w-16 h-16 object-cover rounded-full"
                />
              </div>
            </div>
          </div>
        )}

        <div className="p-4 space-y-4">
          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, index) => (
                <div 
                  key={index} 
                  className="bg-gray-200 animate-pulse rounded-lg h-64"
                  style={{ animationDelay: `${index * 100}ms` }}
                />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {products.map((product, index) => (
                <div 
                  key={product.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 animate-fade-in">
              <div className="text-6xl mb-4 animate-bounce">📦</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد منتجات</h3>
              <p className="text-gray-500">لا توجد منتجات متاحة حالياً.</p>
            </div>
          )}
        </div>
      </div>
    </MobileAppLayout>
  );
};

export default MobileProducts;
