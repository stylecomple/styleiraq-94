
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Hero from '@/components/Hero';
import FeaturesSection from '@/components/FeaturesSection';
import DiscountBanner from '@/components/DiscountBanner';
import GlobalDiscountAlert from '@/components/GlobalDiscountAlert';
import ProductDiscountTicker from '@/components/ProductDiscountTicker';
import { useNavigate } from 'react-router-dom';

interface Discount {
  id: string;
  discount_type: 'all_products' | 'category' | 'subcategory';
  target_value: string | null;
  discount_percentage: number;
}

const Index = () => {
  const navigate = useNavigate();

  // Fetch active discounts for banner
  const { data: activeDiscounts } = useQuery({
    queryKey: ['active-discounts-banner'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('active_discounts')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      
      // Type the data correctly for the DiscountBanner component
      return (data || []).map(discount => ({
        id: discount.id,
        discount_type: discount.discount_type as 'all_products' | 'category' | 'subcategory',
        target_value: discount.target_value,
        discount_percentage: discount.discount_percentage
      }));
    }
  });

  // Fetch products with individual discounts for the ticker
  const { data: discountedProducts } = useQuery({
    queryKey: ['discounted-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('name, discount_percentage')
        .gt('discount_percentage', 0)
        .eq('is_active', true)
        .limit(10);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Get total product count for Hero component
  const { data: productCount } = useQuery({
    queryKey: ['product-count'],
    queryFn: async () => {
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
