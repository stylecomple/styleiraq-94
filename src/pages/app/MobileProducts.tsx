import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MobileAppLayout from '@/components/MobileAppLayout';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { Product } from '@/types';
import { useCache } from '@/contexts/CacheContext';
import { useNavigate } from 'react-router-dom';
const MobileProducts = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentDiscountIndex, setCurrentDiscountIndex] = useState(0);
  const {
    cachedData,
    cacheStatus
  } = useCache();
  const navigate = useNavigate();

  // Use cached data if available, otherwise fetch from database
  const {
    data: products,
    isLoading
  } = useQuery({
    queryKey: ['mobile-products'],
    queryFn: async (): Promise<Product[]> => {
      // If we have cached data and it's complete, use it
      if (cachedData && cacheStatus === 'complete') {
        console.log('Using cached products data');
        return cachedData.products.map((rawProduct: any) => {
          const options = rawProduct.options || (rawProduct.colors ? rawProduct.colors.map((color: string) => ({
            name: color,
            price: undefined
          })) : []);
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
      const {
        data,
        error
      } = await supabase.from('products').select('*').eq('is_active', true).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      return (data || []).map(rawProduct => {
        const options = (rawProduct as any).options || ((rawProduct as any).colors ? (rawProduct as any).colors.map((color: string) => ({
          name: color,
          price: undefined
        })) : []);
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
  const {
    data: categories
  } = useQuery({
    queryKey: ['mobile-categories-filter'],
    queryFn: async () => {
      // Use cached categories if available
      if (cachedData && cacheStatus === 'complete') {
        console.log('Using cached categories data');
        return cachedData.categories;
      }

      // Fallback to database query
      console.log('Fetching categories from database');
      const {
        data,
        error
      } = await supabase.from('categories').select('*');
      if (error) throw error;
      return data;
    },
    enabled: !cachedData || cacheStatus === 'complete'
  });

  // Filter products based on category
  const filteredProducts = products?.filter(product => {
    const matchesCategory = !selectedCategory || product.categories && product.categories.includes(selectedCategory);
    return matchesCategory;
  }) || [];

  // Get discounted products with full details including images
  const discountedProducts = React.useMemo(() => {
    // First try to get from cached discount data and match with full product data
    if (cachedData?.discounts?.discountedProducts && products) {
      return cachedData.discounts.discountedProducts.map((discountProduct: any) => {
        const fullProduct = products.find(p => p.id === discountProduct.id);
        return fullProduct || discountProduct;
      }).filter(product => product.discount_percentage > 0);
    }

    // Fallback to filtering current products
    return products?.filter(product => product.discount_percentage && product.discount_percentage > 0) || [];
  }, [cachedData?.discounts?.discountedProducts, products]);

  // Auto-rotate discount carousel
  useEffect(() => {
    if (discountedProducts.length > 1) {
      const interval = setInterval(() => {
        setCurrentDiscountIndex(prev => (prev + 1) % discountedProducts.length);
      }, 3000); // Change every 3 seconds

      return () => clearInterval(interval);
    }
  }, [discountedProducts.length]);
  const handleClearFilters = () => {
    setSelectedCategory('');
  };
  const handleDiscountProductClick = (productId: string) => {
    navigate(`/app/product/${productId}`);
  };
  const showLoading = isLoading || cachedData && cacheStatus !== 'complete';
  return <MobileAppLayout title="المنتجات" showBackButton={false}>
      <div className="space-y-4 p-4">
        {/* Enhanced Discount Products Carousel with full product details */}
        {discountedProducts.length > 0 && <div className="relative h-32 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-black/20"></div>
            
            {/* Real-time discount indicator */}
            <div className="absolute top-2 right-2 z-10">
              
            </div>
            
            {discountedProducts.map((product, index) => <div key={product.id} className={`absolute inset-0 transition-all duration-700 ease-in-out cursor-pointer ${index === currentDiscountIndex ? 'opacity-100 translate-x-0' : index < currentDiscountIndex ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full'}`} onClick={() => handleDiscountProductClick(product.id)}>
                <div className="flex items-center h-full p-4 text-white">
                  <div className="flex-shrink-0 w-20 h-20 mr-4">
                    <img src={product.cover_image || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover rounded-lg border-2 border-white/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm line-through opacity-75">
                        {product.price} د.ع
                      </span>
                      <span className="text-lg font-bold text-yellow-300">
                        {Math.round(product.price * (1 - (product.discount_percentage || 0) / 100))} د.ع
                      </span>
                    </div>
                    <div className="bg-yellow-400 text-red-800 px-2 py-1 rounded-full text-xs font-bold inline-block mt-1">
                      خصم {product.discount_percentage}%
                    </div>
                  </div>
                </div>
              </div>)}
            
            {/* Indicators */}
            {discountedProducts.length > 1 && <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                {discountedProducts.map((_, index) => <button key={index} className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentDiscountIndex ? 'bg-white' : 'bg-white/50'}`} onClick={() => setCurrentDiscountIndex(index)} />)}
              </div>}
          </div>}

        {/* Category Filter */}
        {categories && categories.length > 0 && <div className="flex gap-2 overflow-x-auto pb-2">
            <Button variant={selectedCategory === '' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory('')} className="whitespace-nowrap rounded-full">
              الكل
            </Button>
            {categories.map((category: any) => <Button key={category.id} variant={selectedCategory === category.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(category.id)} className="whitespace-nowrap rounded-full">
                {category.icon} {category.name}
              </Button>)}
          </div>}

        {/* Active Filters */}
        {selectedCategory && <div className="flex items-center justify-between bg-blue-50 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                الفئة: {categories && categories.find((c: any) => c.id === selectedCategory)?.name}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-blue-600 hover:text-blue-800">
              مسح
            </Button>
          </div>}

        {/* Enhanced Cache Status Indicator */}
        {cachedData && cacheStatus !== 'complete' && <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm text-blue-800">
                {cacheStatus === 'updating' ? 'جاري تحديث العروض والمنتجات...' : 'جاري التحقق من التحديثات...'}
              </span>
            </div>
          </div>}

        {/* Products Grid */}
        {showLoading ? <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, index) => <div key={index} className="bg-gray-200 animate-pulse rounded-xl h-80" style={{
          animationDelay: `${index * 100}ms`
        }} />)}
          </div> : filteredProducts.length > 0 ? <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product, index) => <div key={product.id} className="animate-fade-in-up" style={{
          animationDelay: `${index * 50}ms`
        }}>
                <ProductCard product={product} />
              </div>)}
          </div> : <div className="text-center py-16 animate-fade-in">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-500 mb-4">
              {selectedCategory ? 'لم يتم العثور على منتجات في هذه الفئة' : 'لا توجد منتجات متاحة حالياً'}
            </p>
            {selectedCategory && <Button onClick={handleClearFilters} variant="outline" className="mx-auto">
                مسح جميع المرشحات
              </Button>}
          </div>}
      </div>
    </MobileAppLayout>;
};
export default MobileProducts;