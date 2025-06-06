
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import Hero from '@/components/Hero';
import CategorySection from '@/components/CategorySection';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { user } = useAuth();
  const [cartItemsCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleCartClick = () => {
    console.log('Cart clicked');
  };

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const categories = [
    { id: 'all', name: 'جميع المنتجات', icon: '🛍️' },
    { id: 'makeup', name: 'مكياج', icon: '💄' },
    { id: 'perfumes', name: 'عطور', icon: '🌸' },
    { id: 'flowers', name: 'ورد', icon: '🌹' },
    { id: 'home', name: 'مستلزمات منزلية', icon: '🏠' },
    { id: 'personal_care', name: 'عناية شخصية', icon: '🧴' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemsCount={cartItemsCount} onCartClick={handleCartClick} />
      
      <Hero />
      
      <main className="container mx-auto px-4 py-12">
        {user && (
          <div className="text-center mb-8">
            <p className="text-lg text-primary">
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
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
            {selectedCategory === 'all' ? 'جميع المنتجات' : categories.find(c => c.id === selectedCategory)?.name}
          </h2>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg shadow-md p-4 animate-pulse">
                  <div className="bg-muted h-48 rounded mb-4"></div>
                  <div className="bg-muted h-4 rounded mb-2"></div>
                  <div className="bg-muted h-4 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          {!isLoading && (!products || products.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">لا توجد منتجات في هذه الفئة حالياً</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
