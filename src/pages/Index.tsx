
import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import Hero from '@/components/Hero';
import CategorySection from '@/components/CategorySection';
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <Header />
      
      <Hero onStartShopping={handleStartShopping} onBrowseCollections={handleBrowseCollections} />
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">توصيل سريع</h3>
              <p className="text-gray-600">توصيل مجاني لجميع أنحاء العراق خلال 24-48 ساعة</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💎</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">منتجات أصلية</h3>
              <p className="text-gray-600">جميع منتجاتنا أصلية ومضمونة الجودة</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎁</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">عروض حصرية</h3>
              <p className="text-gray-600">خصومات وعروض خاصة للعملاء المميزين</p>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12" ref={productsRef}>
        {user && (
          <div className="text-center mb-8">
            <p className="text-lg text-gray-700">
              مرحباً {user.user_metadata?.full_name || user.email}
            </p>
          </div>
        )}

        <CategorySection 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            {selectedCategory === 'all' ? 'جميع المنتجات' : categories.find(c => c.id === selectedCategory)?.name}
          </h2>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
                  <div className="bg-gray-200 h-56 rounded-lg mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          {!isLoading && (!products || products.length === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">لا توجد منتجات في هذه الفئة حالياً</p>
            </div>
          )}
        </div>
      </main>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-pink-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">اشترك في نشرتنا الإخبارية</h2>
          <p className="text-xl mb-8">احصل على آخر العروض والمنتجات الجديدة</p>
          <div className="max-w-md mx-auto flex gap-4">
            <input 
              type="email" 
              placeholder="أدخل بريدك الإلكتروني"
              className="flex-1 px-4 py-3 rounded-lg text-gray-800"
            />
            <button className="bg-white text-pink-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              اشتراك
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
