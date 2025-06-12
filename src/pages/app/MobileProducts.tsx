
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MobileAppLayout from '@/components/MobileAppLayout';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import CategorySkeleton from '@/components/CategorySkeleton';
import DiscountCarouselSkeleton from '@/components/DiscountCarouselSkeleton';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { Product } from '@/types';
import { useCache } from '@/contexts/CacheContext';
import { useNavigate } from 'react-router-dom';

const MobileProducts = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentDiscountIndex, setCurrentDiscountIndex] = useState(0);
  const [refreshCount, setRefreshCount] = useState(0);
  const [hasAutoRefreshed, setHasAutoRefreshed] = useState(false);
  const {
    cachedData,
    cacheStatus
  } = useCache();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Auto-refresh logic after splash screen
  useEffect(() => {
    if (!hasAutoRefreshed && cacheStatus === 'complete') {
      console.log('Auto-refreshing discount data after splash...');
      queryClient.invalidateQueries({ queryKey: ['mobile-discounted-products'] });
      queryClient.invalidateQueries({ queryKey: ['mobile-products'] });
      setHasAutoRefreshed(true);
    }
  }, [cacheStatus, hasAutoRefreshed, queryClient]);

  // Optimized discount check query with NaN prevention
  const { data: discountedProducts, isLoading: isDiscountLoading, error: discountError } = useQuery({
    queryKey: ['mobile-discounted-products', refreshCount],
    queryFn: async () => {
      console.log('Fetching discounted products...');
      
      // Check cached data first for immediate response
      if (cachedData?.discounts?.discountedProducts && refreshCount === 0) {
        console.log('Using cached discounted products');
        return cachedData.discounts.discountedProducts.filter(product => 
          product.price && !isNaN(product.price) && product.discount_percentage > 0
        );
      }

      // Fallback to database query for fresh data
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, cover_image, discount_percentage')
        .gt('discount_percentage', 0)
        .eq('is_active', true)
        .not('price', 'is', null)
        .order('discount_percentage', { ascending: false });

      if (error) throw error;
      
      // Filter out products with invalid prices or discounts
      const validProducts = (data || []).filter(product => 
        product.price && 
        !isNaN(Number(product.price)) && 
        product.discount_percentage > 0 &&
        product.discount_percentage <= 100
      );

      console.log('Valid discounted products:', validProducts.length);
      return validProducts;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 3,
  });

  // NaN detection and auto-refresh logic
  useEffect(() => {
    if (discountedProducts && discountedProducts.length > 0 && refreshCount < 2) {
      const hasNaNPrices = discountedProducts.some(product => {
        if (!product.price || isNaN(Number(product.price))) {
          return true;
        }
        const discountedPrice = Math.round(Number(product.price) * (1 - (product.discount_percentage || 0) / 100));
        return isNaN(discountedPrice);
      });

      if (hasNaNPrices) {
        console.log('NaN detected in prices, refreshing discount swapper...');
        setTimeout(() => {
          setRefreshCount(prev => prev + 1);
          queryClient.invalidateQueries({ queryKey: ['mobile-discounted-products'] });
        }, 1000);
      }
    }
  }, [discountedProducts, refreshCount, queryClient]);

  // Check if discounts are still valid after multiple refresh attempts
  useEffect(() => {
    if (refreshCount >= 2 && discountedProducts) {
      const invalidProducts = discountedProducts.filter(product => {
        if (!product.price || isNaN(Number(product.price))) return true;
        const discountedPrice = Math.round(Number(product.price) * (1 - (product.discount_percentage || 0) / 100));
        return isNaN(discountedPrice);
      });

      if (invalidProducts.length > 0) {
        console.log('Some discounts appear to be invalid after refresh attempts:', invalidProducts);
        // Remove invalid products from active discounts
        invalidProducts.forEach(product => {
          console.log(`Product ${product.name} has invalid discount data`);
        });
      }
    }
  }, [refreshCount, discountedProducts]);

  // Use cached data if available, otherwise fetch from database
  const {
    data: products,
    isLoading: isProductsLoading
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
    enabled: !cachedData || cacheStatus === 'complete',
    staleTime: 60000,
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
    enabled: !cachedData || cacheStatus === 'complete',
    staleTime: 300000,
  });

  // Set up real-time updates for discounts
  useEffect(() => {
    const channel = supabase
      .channel('discount-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_discounts'
        },
        () => {
          console.log('Discount updated, refreshing...');
          setRefreshCount(0); // Reset refresh count
          queryClient.invalidateQueries({ queryKey: ['mobile-discounted-products'] });
          queryClient.invalidateQueries({ queryKey: ['mobile-products'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: 'discount_percentage.gt.0'
        },
        () => {
          console.log('Product discount updated, refreshing...');
          setRefreshCount(0); // Reset refresh count
          queryClient.invalidateQueries({ queryKey: ['mobile-discounted-products'] });
          queryClient.invalidateQueries({ queryKey: ['mobile-products'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Filter products based on category
  const filteredProducts = products?.filter(product => {
    const matchesCategory = !selectedCategory || product.categories && product.categories.includes(selectedCategory);
    return matchesCategory;
  }) || [];

  // Auto-rotate discount carousel
  useEffect(() => {
    if (discountedProducts && discountedProducts.length > 1) {
      const interval = setInterval(() => {
        setCurrentDiscountIndex(prev => (prev + 1) % discountedProducts.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [discountedProducts?.length]);

  const handleClearFilters = () => {
    setSelectedCategory('');
  };
  
  const handleDiscountProductClick = (productId: string) => {
    navigate(`/app/product/${productId}`);
  };

  // Safe price calculation function
  const calculateDiscountedPrice = (price: number, discountPercentage: number) => {
    if (!price || isNaN(price) || !discountPercentage || isNaN(discountPercentage)) {
      return price || 0;
    }
    return Math.round(price * (1 - discountPercentage / 100));
  };

  // Show loading skeletons while data is loading
  const showProductsLoading = isProductsLoading || (cachedData && cacheStatus !== 'complete');
  const showCategoriesLoading = !categories;

  return (
    <MobileAppLayout title="المنتجات" showBackButton={false}>
      <div className="space-y-4 p-4">
        {/* Enhanced Discount Products Carousel with skeleton while loading */}
        {isDiscountLoading ? (
          <DiscountCarouselSkeleton />
        ) : discountedProducts && discountedProducts.length > 0 ? (
          <div className="relative h-32 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-black/20"></div>
            
            {discountedProducts.map((product, index) => {
              const originalPrice = Number(product.price) || 0;
              const discountedPrice = calculateDiscountedPrice(originalPrice, product.discount_percentage || 0);
              
              return (
                <div 
                  key={product.id} 
                  className={`absolute inset-0 transition-all duration-700 ease-in-out cursor-pointer ${
                    index === currentDiscountIndex 
                      ? 'opacity-100 translate-x-0' 
                      : index < currentDiscountIndex 
                        ? 'opacity-0 -translate-x-full' 
                        : 'opacity-0 translate-x-full'
                  }`} 
                  onClick={() => handleDiscountProductClick(product.id)}
                >
                  <div className="flex items-center h-full p-4 text-white">
                    <div className="flex-shrink-0 w-20 h-20 mr-4">
                      <img 
                        src={product.cover_image || '/placeholder.svg'} 
                        alt={product.name} 
                        className="w-full h-full object-cover rounded-lg border-2 border-white/30" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm line-through opacity-75">
                          {originalPrice} د.ع
                        </span>
                        <span className="text-lg font-bold text-yellow-300">
                          {discountedPrice} د.ع
                        </span>
                      </div>
                      <div className="bg-yellow-400 text-red-800 px-2 py-1 rounded-full text-xs font-bold inline-block mt-1">
                        خصم {product.discount_percentage}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Indicators */}
            {discountedProducts.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                {discountedProducts.map((_, index) => (
                  <button 
                    key={index} 
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentDiscountIndex ? 'bg-white' : 'bg-white/50'
                    }`} 
                    onClick={() => setCurrentDiscountIndex(index)} 
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* Refresh indicator when auto-refreshing */}
        {refreshCount > 0 && refreshCount < 2 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-sm text-orange-800">
                جاري تحديث العروض... (محاولة {refreshCount}/2)
              </span>
            </div>
          </div>
        )}

        {/* Category Filter with skeleton */}
        {showCategoriesLoading ? (
          <CategorySkeleton />
        ) : categories && categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button variant={selectedCategory === '' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory('')} className="whitespace-nowrap rounded-full">
              الكل
            </Button>
            {categories.map((category: any) => (
              <Button key={category.id} variant={selectedCategory === category.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(category.id)} className="whitespace-nowrap rounded-full">
                {category.icon} {category.name}
              </Button>
            ))}
          </div>
        )}

        {/* Active Filters */}
        {selectedCategory && (
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                الفئة: {categories && categories.find((c: any) => c.id === selectedCategory)?.name}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-blue-600 hover:text-blue-800">
              مسح
            </Button>
          </div>
        )}

        {/* Enhanced Cache Status Indicator */}
        {cachedData && cacheStatus !== 'complete' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm text-blue-800">
                {cacheStatus === 'updating' ? 'جاري تحديث العروض والمنتجات...' : 'جاري التحقق من التحديثات...'}
              </span>
            </div>
          </div>
        )}

        {/* Products Grid with skeletons */}
        {showProductsLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
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
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-500 mb-4">
              {selectedCategory ? 'لم يتم العثور على منتجات في هذه الفئة' : 'لا توجد منتجات متاحة حالياً'}
            </p>
            {selectedCategory && (
              <Button onClick={handleClearFilters} variant="outline" className="mx-auto">
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
