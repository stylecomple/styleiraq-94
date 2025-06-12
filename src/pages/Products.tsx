
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import ProductDiscountTicker from '@/components/ProductDiscountTicker';
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

  // Get all products for discount ticker
  const { data: allProductsData } = useQuery({
    queryKey: ['all-products-for-discounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, discount_percentage')
        .eq('is_active', true)
        .gt('discount_percentage', 0);
      
      if (error) throw error;
      return data || [];
    }
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
  const discountedProducts = allProductsData || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Logo Section - improved design with better proportions */}
      <div className="flex justify-center mb-8">
        <div className="relative group">
          {/* Animated background gradient */}
          <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-all duration-500 animate-pulse" />
          
          {/* Main logo container */}
          <div className="relative bg-white rounded-2xl p-6 shadow-xl transform transition-all duration-300 hover:scale-105 border border-pink-100">
            <div className="w-32 h-32 mx-auto flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
              <img 
                src="/lovable-uploads/44d2a604-8d2c-498a-9c37-e89e541a86cb.png" 
                alt="Style متجر الجمال والأناقة" 
                className="w-24 h-24 object-contain filter drop-shadow-lg"
              />
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>

      {/* Discount Ticker - only show if there are discounted products */}
      {discountedProducts.length > 0 && (
        <div className="mb-8">
          <ProductDiscountTicker products={discountedProducts} />
        </div>
      )}

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
