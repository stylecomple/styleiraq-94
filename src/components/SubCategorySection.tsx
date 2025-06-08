
import React from 'react';
import { Button } from '@/components/ui/button';

interface SubCategorySectionProps {
  subcategories: string[];
  selectedSubcategory: string | null;
  onSubcategorySelect: (subcategory: string | null) => void;
}

const SubCategorySection = ({ subcategories, selectedSubcategory, onSubcategorySelect }: SubCategorySectionProps) => {
  if (!subcategories || subcategories.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">الفئات الفرعية</h3>
      </div>
      
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          variant={selectedSubcategory === null ? "default" : "outline"}
          className={`transition-all duration-200 ${
            selectedSubcategory === null 
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
              : 'hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 hover:border-pink-300'
          }`}
          onClick={() => onSubcategorySelect(null)}
        >
          جميع الفئات الفرعية
        </Button>
        
        {subcategories.map((subcategory) => (
          <Button
            key={subcategory}
            variant={selectedSubcategory === subcategory ? "default" : "outline"}
            className={`transition-all duration-200 ${
              selectedSubcategory === subcategory 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                : 'hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 hover:border-pink-300'
            }`}
            onClick={() => onSubcategorySelect(subcategory)}
          >
            {subcategory}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SubCategorySection;
