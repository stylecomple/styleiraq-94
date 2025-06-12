
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Hero from '@/components/Hero';
import FeaturesSection from '@/components/FeaturesSection';
import DiscountBanner from '@/components/DiscountBanner';
import GlobalDiscountAlert from '@/components/GlobalDiscountAlert';
import ProductDiscountTicker from '@/components/ProductDiscountTicker';
import { useNavigate } from 'react-router-dom';
import { useCache } from '@/contexts/CacheContext';

interface Discount {
  id: string;
  discount_type: 'all_products' | 'category' | 'subcategory';
  target_value: string | null;
  discount_percentage: number;
}

const Index = () => {
  const navigate = useNavigate();
  const { cachedData } = useCache();

  // Fetch active discounts - use cache first, then database
  const { data: activeDiscounts } = useQuery({
    queryKey: ['active-discounts-banner'],
    queryFn: async () => {
      // Use cached discount data if available
      if (cachedData?.discounts?.activeDiscounts) {
        console.log('Using cached discount data');
        return cachedData.discounts.activeDiscounts.map((discount: any) => ({
          id: discount.id,
          discount_type: discount.discount_type as 'all_products' | 'category' | 'subcategory',
          target_value: discount.target_value,
          discount_percentage: discount.discount_percentage
        }));
      }

      // Fallback to database query
      console.log('Fetching discounts from database');
      const { data, error } = await supabase
        .from('active_discounts')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      
      return (data || []).map(discount => ({
        id: discount.id,
        discount_type: discount.discount_type as 'all_products' | 'category' | 'subcategory',
        target_value: discount.target_value,
        discount_percentage: discount.discount_percentage
      }));
    }
  });

  // Fetch products with individual discounts - use cache first
  const { data: discountedProducts } = useQuery({
    queryKey: ['discounted-products'],
    queryFn: async () => {
      // Use cached discount products if available
      if (cachedData?.discounts?.discountedProducts) {
        console.log('Using cached discounted products data');
        return cachedData.discounts.discountedProducts;
      }

      // Fallback to database query
      console.log('Fetching discounted products from database');
      const { data, error } = await supabase
        .from('products')
        .select('id, name, discount_percentage')
        .gt('discount_percentage', 0)
        .eq('is_active', true)
        .limit(10);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Get total product count - use cache first
  const { data: productCount } = useQuery({
    queryKey: ['product-count'],
    queryFn: async () => {
      // Use cached products count if available
      if (cachedData?.products) {
        console.log('Using cached products count');
        return cachedData.products.length;
      }

      // Fallback to database query
      console.log('Fetching product count from database');
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      if (error) throw error;
      return count || 0;
    }
  });

  const handleStartShopping = () => {
    navigate('/products');
  };

  const handleBrowseCollections = () => {
    navigate('/products');
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/products?category=${categoryId}`);
  };

  // Check if there's a site-wide discount (all products) from active_discounts table
  const hasSiteWideDiscount = activeDiscounts?.some(discount => 
    discount.discount_type === 'all_products'
  );

  // Show individual product discounts only if there's no site-wide discount
  const shouldShowProductTicker = !hasSiteWideDiscount && discountedProducts && discountedProducts.length > 0;

  return (
    <div className="min-h-screen">
      {/* Big Discount Banner - Only for site-wide discounts */}
      {activeDiscounts && activeDiscounts.length > 0 && hasSiteWideDiscount && (
        <DiscountBanner discounts={activeDiscounts.filter(d => d.discount_type === 'all_products')} />
      )}
      
      {/* Global Discount Alert - Cool effects for site-wide discounts */}
      {hasSiteWideDiscount && (
        <GlobalDiscountAlert discountPercentage={activeDiscounts?.find(d => d.discount_type === 'all_products')?.discount_percentage || 0} />
      )}

      {/* Small Moving Ticker - Only for individual product discounts */}
      {shouldShowProductTicker && (
        <ProductDiscountTicker products={discountedProducts} />
      )}
      
      <Hero 
        onStartShopping={handleStartShopping}
        onBrowseCollections={handleBrowseCollections}
        onCategoryClick={handleCategoryClick}
        productCount={productCount}
      />
      <FeaturesSection />
    </div>
  );
};

export default Index;
