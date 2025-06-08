
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

type CategoryType = 'all' | string;

interface Category {
  id: CategoryType;
  name: string;
  icon: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  icon: string;
  category_id: string;
}

interface CategorySectionProps {
  selectedCategory: CategoryType;
  onCategorySelect: (categoryId: CategoryType) => void;
  onSubcategoriesChange?: (subcategories: string[]) => void;
}

const CategorySection = ({ selectedCategory, onCategorySelect, onSubcategoriesChange }: CategorySectionProps) => {
  // Fetch categories from database
  const { data: dbCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          subcategories (*)
        `);
      
      if (error) throw error;
      return data;
    }
  });

  const [categories, setCategories] = useState<Category[]>([
    { id: 'all', name: 'جميع المنتجات', icon: '🛍️' }
  ]);

  // Update categories when database data loads
  useEffect(() => {
    if (dbCategories) {
      const formattedCategories = dbCategories.map(cat => ({
        ...cat,
        subcategories: cat.subcategories || []
      }));
      
      setCategories([
        { id: 'all', name: 'جميع المنتجات', icon: '🛍️' },
        ...formattedCategories
      ]);
    }
  }, [dbCategories]);

  const handleCategorySelect = (categoryId: CategoryType) => {
    console.log('Category selected:', categoryId);
    onCategorySelect(categoryId);
    
    // Find selected category and pass its subcategories
    const selectedCategoryData = categories.find(cat => cat.id === categoryId);
    console.log('Selected category data:', selectedCategoryData);
    
    if (onSubcategoriesChange) {
      const subcategories = selectedCategoryData?.subcategories || [];
      const subcategoryNames = subcategories.map(sub => sub.name);
      console.log('Passing subcategories:', subcategoryNames);
      onSubcategoriesChange(subcategoryNames);
    }
  };

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
          تصفح حسب الفئة
        </h2>
        <p className="text-lg text-gray-600 mb-6">اختر الفئة التي تناسبك</p>
        <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            className={`group relative h-auto p-6 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 ${
              selectedCategory === category.id 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg border-0' 
                : 'bg-white hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 border-gray-200 hover:border-pink-300 text-gray-700 hover:text-purple-700 shadow-md hover:shadow-lg'
            }`}
            onClick={() => handleCategorySelect(category.id)}
          >
            <div className="flex flex-col items-center gap-3">
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                {category.icon}
              </span>
              <span className="text-sm font-medium text-center leading-tight">
                {category.name}
              </span>
            </div>
            
            {selectedCategory === category.id && (
              <div className="absolute inset-0 bg-white/10 rounded-2xl"></div>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
