
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MobileAppLayout from '@/components/MobileAppLayout';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Product } from '@/types';
import { useCache } from '@/contexts/CacheContext';

const MobileProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { cachedData, cacheStatus } = useCache();

  // Use cached data if available, otherwise fetch from database
  const { data: products, isLoading } = useQuery({
    queryKey: ['mobile-products'],
    queryFn: async (): Promise<Product[]> => {
      // If we have cached data and it's complete, use it
      if (cachedData && cacheStatus === 'complete') {
        console.log('Using cached products data');
        return cachedData.products.map((rawProduct: any) => {
          const options = rawProduct.options || 
            (rawProduct.colors ? rawProduct.colors.map((color: string) => ({ name: color, price: undefined })) : []);
          
          const subcategories = rawProduct.subcategories || [];

          return {
            ...rawProduct,
            options,
            subcategories,
            discount_percentage: rawProduct.discount_percentage || 0
          } as Product;
        });
      }

      // Fallback to database query
      console.log('Fetching products from database');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(rawProduct => {
        const options = (rawProduct as any).options || 
          ((rawProduct as any).colors ? (rawProduct as any).colors.map((color: string) => ({ name: color, price: undefined })) : []);
        
        const subcategories = (rawProduct as any).subcategories || [];

        return {
          ...rawProduct,
          options,
          subcategories,
          discount_percentage: rawProduct.discount_percentage || 0
        } as Product;
      });
    },
    enabled: !cachedData || cacheStatus === 'complete'
  });

  const { data: categories } = useQuery({
    queryKey: ['mobile-categories-filter'],
    queryFn: async () => {
      // Use cached categories if available
      if (cachedData && cacheStatus === 'complete') {
        console.log('Using cached categories data');
        return cachedData.categories;
      }

      // Fallback to database query
      console.log('Fetching categories from database');
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (error) throw error;
      return data;
    },
    enabled: !cachedData || cacheStatus === 'complete'
  });

  // Filter products based on search term and category
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || 
                           (product.categories && product.categories.includes(selectedCategory));
    
    return matchesSearch && matchesCategory;
  }) || [];

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };

  const showLoading = isLoading || (cachedData && cacheStatus !== 'complete');

  return (
    <MobileAppLayout title="المنتجات" showBackButton={false}>
      <div className="space-y-4 p-4">
        {/* Search and Filter Section */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="ابحث عن منتج..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 bg-white border-gray-200 rounded-xl"
            />
          </div>

          {/* Category Filter */}
          {categories && categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('')}
                className="whitespace-nowrap rounded-full"
              >
                الكل
              </Button>
              {categories.map((category: any) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap rounded-full"
                >
                  {category.icon} {category.name}
                </Button>
              ))}
            </div>
          )}

          {/* Active Filters */}
          {(searchTerm || selectedCategory) && (
            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  {searchTerm && `البحث: "${searchTerm}"`}
                  {searchTerm && selectedCategory && ' • '}
                  {selectedCategory && categories && 
                    `الفئة: ${categories.find((c: any) => c.id === selectedCategory)?.name}`
                  }
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-blue-600 hover:text-blue-800"
              >
                مسح
              </Button>
            </div>
          )}
        </div>

        {/* Cache Status Indicator */}
        {cachedData && cacheStatus !== 'complete' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-sm text-amber-800">
                {cacheStatus === 'updating' ? 'جاري تحديث البيانات...' : 'جاري التحقق من التحديثات...'}
              </span>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {showLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, index) => (
              <div 
                key={index} 
                className="bg-gray-200 animate-pulse rounded-xl h-80"
                style={{ animationDelay: `${index * 100}ms` }}
              />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                {filteredProducts.length} منتج
              </h2>
              {cachedData && (
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  محفوظ محلياً
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map((product, index) => (
                <div 
                  key={product.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory 
                ? 'لم يتم العثور على منتجات تطابق معايير البحث'
                : 'لا توجد منتجات متاحة حالياً'
              }
            </p>
            {(searchTerm || selectedCategory) && (
              <Button 
                onClick={handleClearFilters}
                variant="outline"
                className="mx-auto"
              >
                مسح جميع المرشحات
              </Button>
            )}
          </div>
        )}
      </div>
    </MobileAppLayout>
  );
};

export default MobileProducts;
