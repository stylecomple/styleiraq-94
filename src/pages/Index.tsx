
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Hero from '@/components/Hero';
import FeaturesSection from '@/components/FeaturesSection';
import CategorySection from '@/components/CategorySection';
import ProductCard from '@/components/ProductCard';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';
import DiscountBanner from '@/components/DiscountBanner';
import { Product } from '@/types';
import { useNavigate } from 'react-router-dom';

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

  // Fetch featured products
  const { data: featuredProducts } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .limit(8);
      
      if (error) throw error;
      
      return (data || []).map(rawProduct => {
        const options = (rawProduct as any).options || 
          ((rawProduct as any).colors ? (rawProduct as any).colors.map((color: string) => ({ name: color, price: undefined })) : []);
        
        return {
          ...rawProduct,
          options,
          subcategories: (rawProduct as any).subcategories || []
        } as Product;
      });
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
      <CategorySection selectedCategory="all" onCategorySelect={() => {}} />
      
      {/* Featured Products Section */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              المنتجات المميزة
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
      
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Index;
