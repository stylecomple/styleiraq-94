
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Hero from '@/components/Hero';
import FeaturesSection from '@/components/FeaturesSection';
import DiscountBanner from '@/components/DiscountBanner';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch real-time product count
  const { data: productCount } = useQuery({
    queryKey: ['product-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch active discounts for banner display
  const { data: activeDiscounts } = useQuery({
    queryKey: ['active-discounts-banner'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('active_discounts')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000, // Refetch every minute
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Discount Banners */}
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

      {user && (
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full px-6 py-3">
              <span className="text-lg text-gray-700">
                مرحباً <span className="font-semibold text-purple-700">{user.user_metadata?.full_name || user.email}</span>
              </span>
              <span className="text-2xl">👋</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
