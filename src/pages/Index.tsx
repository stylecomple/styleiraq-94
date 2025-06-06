
import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import Hero from '@/components/Hero';
import CategorySection from '@/components/CategorySection';
import FeaturesSection from '@/components/FeaturesSection';
import Newsletter from '@/components/Newsletter';
import { supabase } from '@/integrations/supabase/client';

type CategoryType = 'all' | 'makeup' | 'perfumes' | 'flowers' | 'home' | 'personal_care';

const Index = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const productsRef = useRef<HTMLDivElement>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory as 'makeup' | 'perfumes' | 'flowers' | 'home' | 'personal_care');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const categories = [
    { id: 'all' as const, name: 'جميع المنتجات', icon: '🛍️' },
    { id: 'makeup' as const, name: 'مكياج', icon: '💄' },
    { id: 'perfumes' as const, name: 'عطور', icon: '🌸' },
    { id: 'flowers' as const, name: 'ورد', icon: '🌹' },
    { id: 'home' as const, name: 'مستلزمات منزلية', icon: '🏠' },
    { id: 'personal_care' as const, name: 'عناية شخصية', icon: '🧴' }
  ];

  const handleStartShopping = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBrowseCollections = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      
      <Hero onStartShopping={handleStartShopping} onBrowseCollections={handleBrowseCollections} />
      
      <FeaturesSection />

      <main className="container mx-auto px-4 py-16" ref={productsRef}>
        {user && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full px-6 py-3">
              <span className="text-lg text-gray-700">
                مرحباً <span className="font-semibold text-purple-700">{user.user_metadata?.full_name || user.email}</span>
              </span>
              <span className="text-2xl">👋</span>
            </div>
          </div>
        )}

        <CategorySection 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {selectedCategory === 'all' ? 'جميع المنتجات' : categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full"></div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-xl mb-6"></div>
                  <div className="space-y-3">
                    <div className="bg-gray-200 h-4 rounded-full"></div>
                    <div className="bg-gray-200 h-4 rounded-full w-2/3"></div>
                    <div className="bg-gray-200 h-6 rounded-full w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          {!isLoading && (!products || products.length === 0) && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl text-gray-500">لا توجد منتجات في هذه الفئة حالياً</p>
              <p className="text-gray-400 mt-2">تحقق مرة أخرى قريباً!</p>
            </div>
          )}
        </div>
      </main>

      <Newsletter />
    </div>
  );
};

export default Index;
