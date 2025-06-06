
import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import CategorySection from '@/components/CategorySection';
import SearchBar from '@/components/SearchBar';
import { supabase } from '@/integrations/supabase/client';

type CategoryType = 'all' | 'makeup' | 'perfumes' | 'flowers' | 'home' | 'personal_care' | 'exclusive_offers';

const Products = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', selectedCategory, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // تطبيق فلتر الفئة
      if (selectedCategory !== 'all') {
        query = query.contains('categories', [selectedCategory]);
      }

      const { data, error } = await query;
      if (error) throw error;

      // تطبيق البحث على النتائج
      if (searchQuery && data) {
        return data.filter(product => 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      return data;
    }
  });

  const categories = [
    { id: 'all' as const, name: 'جميع المنتجات', icon: '🛍️' },
    { id: 'makeup' as const, name: 'مكياج', icon: '💄' },
    { id: 'perfumes' as const, name: 'عطور', icon: '🧴' },
    { id: 'flowers' as const, name: 'ورد', icon: '🌹' },
    { id: 'home' as const, name: 'مستلزمات منزلية', icon: '🏠' },
    { id: 'personal_care' as const, name: 'عناية شخصية', icon: '🧴' },
    { id: 'exclusive_offers' as const, name: 'العروض الحصرية', icon: '🎁' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
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

        {/* شريط البحث */}
        <div className="mb-8">
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        <CategorySection 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {searchQuery 
                ? `نتائج البحث عن "${searchQuery}"` 
                : selectedCategory === 'all' 
                  ? 'جميع المنتجات' 
                  : categories.find(c => c.id === selectedCategory)?.name
              }
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
              <p className="text-xl text-gray-500">
                {searchQuery 
                  ? `لا توجد منتجات تحتوي على "${searchQuery}"` 
                  : 'لا توجد منتجات في هذه الفئة حالياً'
                }
              </p>
              <p className="text-gray-400 mt-2">
                {searchQuery ? 'جرب البحث بكلمات أخرى' : 'تحقق مرة أخرى قريباً!'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Products;
