
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CategoryType } from '@/types';
import ProductCard from '@/components/ProductCard';
import CategorySection from '@/components/CategorySection';
import SubCategorySection from '@/components/SubCategorySection';
import SearchBar from '@/components/SearchBar';
import { useAuth } from '@/contexts/AuthContext';
import { useProductSearch } from '@/hooks/useProductSearch';

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [availableSubcategories, setAvailableSubcategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading: authLoading } = useAuth();

  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  useEffect(() => {
    if (categoryParam && categoryParam !== selectedCategory) {
      console.log('URL category param changed:', categoryParam);
      setSelectedCategory(categoryParam);
      setSelectedSubcategory(null);
    }
  }, [categoryParam, selectedCategory]);

  // Fetch categories and subcategories to auto-load subcategories when category changes
  const { data: categoryData } = useQuery({
    queryKey: ['category-with-subcategories', selectedCategory],
    queryFn: async () => {
      if (selectedCategory === 'all') return null;
      
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          subcategories (*)
        `)
        .eq('id', selectedCategory)
        .single();
      
      if (error) {
        console.error('Error fetching category:', error);
        return null;
      }
      
      return data;
    },
    enabled: selectedCategory !== 'all'
  });

  // Update subcategories when category data loads
  useEffect(() => {
    if (categoryData?.subcategories) {
      console.log('Auto-loading subcategories for category:', selectedCategory, categoryData.subcategories);
      setAvailableSubcategories(categoryData.subcategories);
    } else if (selectedCategory === 'all') {
      setAvailableSubcategories([]);
    }
  }, [categoryData, selectedCategory]);

  // Use the new search hook
  const { data: productsData, isLoading: productsLoading, isError, error } = useProductSearch({
    searchQuery,
    selectedCategory: selectedCategory === 'all' ? null : selectedCategory,
    selectedSubcategory
  });

  const handleCategorySelect = (categoryId: CategoryType) => {
    console.log('Category selected:', categoryId);
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
  };

  const handleSubcategoriesChange = (subcategories: any[]) => {
    console.log('Subcategories changed:', subcategories);
    setAvailableSubcategories(subcategories);
    setSelectedSubcategory(null);
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
              {searchQuery ? 'لم يتم العثور على منتجات تطابق البحث.' : 'لا توجد منتجات في هذه الفئة.'}
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
