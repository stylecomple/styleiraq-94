
import React from 'react';
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategorySectionProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

const CategorySection = ({ categories, selectedCategory, onCategorySelect }: CategorySectionProps) => {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-center mb-8 text-foreground">تصفح حسب الفئة</h2>
      <div className="flex flex-wrap justify-center gap-4">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            className={`flex items-center gap-2 px-6 py-3 ${
              selectedCategory === category.id 
                ? 'bg-pink-600 hover:bg-pink-700 text-white' 
                : 'hover:bg-pink-50 hover:text-pink-600'
            }`}
            onClick={() => onCategorySelect(category.id)}
          >
            <span className="text-lg">{category.icon}</span>
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
