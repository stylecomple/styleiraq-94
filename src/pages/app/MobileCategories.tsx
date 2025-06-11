
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import MobileAppLayout from '@/components/MobileAppLayout';
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
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

const MobileCategories = () => {
  const navigate = useNavigate();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['mobile-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          subcategories (*)
        `);
      
      if (error) throw error;
      return data as Category[];
    }
  });

  const handleCategoryClick = (category: Category) => {
    navigate(`/app/category/${category.id}`, { state: { category } });
  };

  return (
    <MobileAppLayout title="الفئات" showBackButton={false}>
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-16"></div>
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="space-y-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                className="w-full h-16 p-4 justify-start bg-white hover:bg-pink-50 border-gray-200"
                onClick={() => handleCategoryClick(category)}
              >
                <span className="text-2xl ml-3">{category.icon}</span>
                <div className="flex-1 text-right">
                  <div className="font-medium text-gray-800">{category.name}</div>
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="text-sm text-gray-500">
                      {category.subcategories.length} فئة فرعية
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد فئات</h3>
            <p className="text-gray-500">لا توجد فئات متاحة حالياً.</p>
          </div>
        )}
      </div>
    </MobileAppLayout>
  );
};

export default MobileCategories;
