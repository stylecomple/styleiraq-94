
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, CategoryType } from '@/types';
import ProductCard from '@/components/ProductCard';
import CategorySection from '@/components/CategorySection';
import SubCategorySection from '@/components/SubCategorySection';
import SearchBar from '@/components/SearchBar';
import { useAuth } from '@/contexts/AuthContext';

interface ProductsData {
  products: Product[];
  totalCount: number;
}

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading: authLoading } = useAuth();

  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const { data: productsData, isLoading: productsLoading, isError, error } = useQuery<ProductsData>({
    queryKey: ['products', selectedCategory, selectedSubcategory, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      if (selectedCategory !== 'all') {
        query = query.contains('categories', [selectedCategory]);
      }

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      let filteredProducts = data || [];

      // Filter by subcategory if selected
      if (selectedSubcategory && filteredProducts.length > 0) {
        console.log('Filtering by subcategory:', selectedSubcategory);
        filteredProducts = filteredProducts.filter(product => {
          const hasSubcategory = product.subcategories && 
            Array.isArray(product.subcategories) && 
            product.subcategories.includes(selectedSubcategory);
          console.log(`Product ${product.name} has subcategory ${selectedSubcategory}:`, hasSubcategory);
          return hasSubcategory;
        });
      }

      return {
        products: filteredProducts,
        totalCount: filteredProducts.length,
      };
    },
    enabled: !authLoading, // Only run query when auth is not loading
  });

  const handleCategorySelect = (categoryId: CategoryType) => {
    console.log('Category selected:', categoryId);
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null); // Reset subcategory when changing main category
  };

  const handleSubcategoriesChange = (subcategories: string[]) => {
    console.log('Subcategories changed:', subcategories);
    setAvailableSubcategories(subcategories);
    setSelectedSubcategory(null); // Reset selected subcategory
  };

  const handleSubcategorySelect = (subcategory: string | null) => {
    console.log('Subcategory selected:', subcategory);
    setSelectedSubcategory(subcategory);
  };

  const filteredProducts = productsData?.products || [];
  const isLoading = authLoading || productsLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        </div>
        
        <CategorySection 
          selectedCategory={selectedCategory} 
          onCategorySelect={handleCategorySelect}
          onSubcategoriesChange={handleSubcategoriesChange}
        />

        <SubCategorySection
          subcategories={availableSubcategories}
          selectedSubcategory={selectedSubcategory}
          onSubcategorySelect={handleSubcategorySelect}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 text-center py-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                <span className="mr-2">جاري التحميل...</span>
              </div>
            </div>
          ) : isError ? (
            <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 text-center text-red-500 py-8">
              خطأ في تحميل المنتجات: {(error as Error).message}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 text-center py-8">
              لا توجد منتجات في هذه الفئة.
            </div>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
