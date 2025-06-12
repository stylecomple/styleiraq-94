
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import MobileAppLayout from '@/components/MobileAppLayout';
import { Button } from '@/components/ui/button';
import { ChevronRight, Grid3X3, Package } from 'lucide-react';

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
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

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
    if (category.subcategories && category.subcategories.length > 0) {
      setExpandedCategory(expandedCategory === category.id ? null : category.id);
    } else {
      navigate(`/app/products?category=${category.id}`);
    }
  };

  const handleSubcategoryClick = (subcategory: Subcategory) => {
    navigate(`/app/products?category=${subcategory.category_id}&subcategory=${subcategory.id}`);
  };

  const handleViewAllInCategory = (categoryId: string) => {
    navigate(`/app/products?category=${categoryId}`);
  };

  return (
    <MobileAppLayout title="الفئات" showBackButton={false}>
      <div className="p-4 space-y-4">
        {/* Header Stats */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">تصفح الفئات</h2>
              <p className="text-pink-100">اكتشف جميع منتجاتنا المميزة</p>
            </div>
            <div className="bg-white/20 rounded-full p-4">
              <Grid3X3 className="w-8 h-8 text-white" />
            </div>
          </div>
          {categories && (
            <div className="mt-4 flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{categories.length}</div>
                <div className="text-sm text-pink-100">فئة رئيسية</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {categories.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0)}
                </div>
                <div className="text-sm text-pink-100">فئة فرعية</div>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div 
                key={index} 
                className="bg-gray-200 animate-pulse rounded-2xl h-20"
                style={{ animationDelay: `${index * 100}ms` }}
              />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="space-y-3">
            {categories.map((category, index) => (
              <div 
                key={category.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Main Category Card */}
                <div
                  className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 ${
                    expandedCategory === category.id ? 'shadow-xl' : 'hover:shadow-xl'
                  }`}
                >
                  <Button
                    variant="ghost"
                    className="w-full h-auto p-6 justify-between hover:bg-gray-50 rounded-2xl"
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                        {category.icon}
                      </div>
                      <div className="flex-1 text-right">
                        <div className="font-bold text-lg text-gray-800 mb-1">{category.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          {category.subcategories && category.subcategories.length > 0 ? (
                            <span>{category.subcategories.length} فئة فرعية</span>
                          ) : (
                            <span>فئة رئيسية</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight 
                      className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${
                        expandedCategory === category.id ? 'rotate-90' : ''
                      }`} 
                    />
                  </Button>

                  {/* Subcategories - Expandable */}
                  {expandedCategory === category.id && category.subcategories && category.subcategories.length > 0 && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-4 animate-fade-in">
                      {/* View All Button */}
                      <Button
                        onClick={() => handleViewAllInCategory(category.id)}
                        className="w-full mb-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl py-3 font-medium"
                      >
                        عرض جميع منتجات {category.name}
                      </Button>
                      
                      {/* Subcategories Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {category.subcategories.map((subcategory, subIndex) => (
                          <Button
                            key={subcategory.id}
                            variant="outline"
                            className="h-auto p-4 bg-white hover:bg-pink-50 border-gray-200 hover:border-pink-300 rounded-xl transition-all duration-200 animate-fade-in-up"
                            style={{ animationDelay: `${subIndex * 50}ms` }}
                            onClick={() => handleSubcategoryClick(subcategory)}
                          >
                            <div className="flex flex-col items-center gap-2 text-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center text-lg">
                                {subcategory.icon}
                              </div>
                              <span className="text-sm font-medium text-gray-700 leading-tight">
                                {subcategory.name}
                              </span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Grid3X3 className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد فئات</h3>
            <p className="text-gray-500">لا توجد فئات متاحة حالياً.</p>
          </div>
        )}
      </div>
    </MobileAppLayout>
  );
};

export default MobileCategories;
