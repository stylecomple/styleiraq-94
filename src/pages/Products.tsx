
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import CategorySection from '@/components/CategorySection';
import SubCategorySection from '@/components/SubCategorySection';
import { useProductSearch } from '@/hooks/useProductSearch';
import { useSearchParams } from 'react-router-dom';

interface Subcategory {
  id: string;
  name: string;
  icon: string;
  category_id: string;
}

const Products = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { data: searchResults, isLoading } = useProductSearch({
    searchQuery,
    selectedCategory: selectedCategory === 'all' ? null : selectedCategory,
    selectedSubcategory,
  });

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
  };

  const handleSubcategoriesChange = (newSubcategories: Subcategory[]) => {
    setSubcategories(newSubcategories);
  };

  const handleSubcategorySelect = (subcategoryId: string | null) => {
    setSelectedSubcategory(subcategoryId);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };

  const products = searchResults?.products || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Logo Section - bigger and circular */}
      <div className="flex justify-center mb-8">
        <div className="relative group">
          <div className="absolute -inset-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
          <div className="relative bg-white rounded-full p-5 shadow-lg transform transition-all duration-300 hover:scale-105">
            <img 
              src="/lovable-uploads/44d2a604-8d2c-498a-9c37-e89e541a86cb.png" 
              alt="Style متجر الجمال والأناقة" 
              className="w-28 h-28 object-contain rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-8">
        <SearchBar 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
        />
      </div>

      {/* Categories Section with smooth transition */}
      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isSearchFocused 
            ? 'max-h-0 opacity-0 -translate-y-4 mb-0' 
            : 'max-h-[1000px] opacity-100 translate-y-0 mb-8'
        }`}
      >
        <CategorySection
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          onSubcategoriesChange={handleSubcategoriesChange}
        />

        {/* Subcategories Section */}
        {subcategories.length > 0 && (
          <SubCategorySection
            subcategories={subcategories}
            selectedSubcategory={selectedSubcategory}
            onSubcategorySelect={handleSubcategorySelect}
          />
        )}
      </div>

      {/* Products Section with dynamic spacing */}
      <div 
        className={`transition-all duration-500 ease-in-out ${
          isSearchFocused ? '-mt-4' : 'mt-0'
        }`}
      >
        {/* Results Summary */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {searchQuery ? `نتائج البحث عن "${searchQuery}"` : 'جميع المنتجات'}
          </h2>
          <p className="text-gray-600">
            {isLoading ? 'جاري التحميل...' : `عدد المنتجات: ${products.length}`}
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-96"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-500">
              {searchQuery 
                ? 'لم نجد أي منتجات تطابق بحثك. جرب كلمات مختلفة.' 
                : 'لا توجد منتجات في هذه الفئة حالياً.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
