
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Hero from '@/components/Hero';
import FeaturesSection from '@/components/FeaturesSection';
import Footer from '@/components/Footer';
import DiscountBanner from '@/components/DiscountBanner';
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

  return (
    <div className="min-h-screen">
      {/* Discount Banner */}
      {activeDiscounts && activeDiscounts.length > 0 && (
        <DiscountBanner discounts={activeDiscounts} />
      )}
      
      <Hero 
        onStartShopping={handleStartShopping}
        onBrowseCollections={handleBrowseCollections}
        onCategoryClick={handleCategoryClick}
        productCount={productCount}
      />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default Index;
