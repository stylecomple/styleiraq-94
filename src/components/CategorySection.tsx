
import React from 'react';
import { Button } from '@/components/ui/button';

type CategoryType = 'all' | 'makeup' | 'perfumes' | 'flowers' | 'home' | 'personal_care';

interface Category {
  id: CategoryType;
  name: string;
  icon: string;
}

interface CategorySectionProps {
  categories: Category[];
  selectedCategory: CategoryType;
  onCategorySelect: (categoryId: CategoryType) => void;
}

const CategorySection = ({ categories, selectedCategory, onCategorySelect }: CategorySectionProps) => {
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
            onClick={() => onCategorySelect(category.id)}
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
