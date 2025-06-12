
import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MobileAppLayout from '@/components/MobileAppLayout';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';

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

const MobileCategoryDetail = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const category = location.state?.category as Category;
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['category-products', categoryId, selectedSubcategory],
    queryFn: async (): Promise<Product[]> => {
      if (!categoryId) return [];
      
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category_id', categoryId);

      if (selectedSubcategory) {
        query = query.eq('subcategory_id', selectedSubcategory);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match Product interface
      return (data || []).map(item => ({
        ...item,
        options: item.options || (item.colors ? item.colors.map((color: string) => ({ name: color, price: undefined })) : []),
        subcategories: item.subcategories || []
      })) as Product[];
    },
    enabled: !!categoryId
  });

  const handleSubcategorySelect = (subcategoryId: string | null) => {
    setSelectedSubcategory(subcategoryId);
  };

  return (
    <MobileAppLayout title={category?.name || 'الفئة'} backPath="/app/categories">
      <div className="p-4 space-y-4">
        {/* Subcategories */}
        {category?.subcategories && category.subcategories.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">الفئات الفرعية</h3>
            
            <Button
              variant={selectedSubcategory === null ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => handleSubcategorySelect(null)}
            >
              جميع المنتجات
            </Button>

            {category.subcategories.map((subcategory) => (
              <Button
                key={subcategory.id}
                variant={selectedSubcategory === subcategory.id ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleSubcategorySelect(subcategory.id)}
              >
                <span className="text-lg ml-2">{subcategory.icon}</span>
                {subcategory.name}
              </Button>
            ))}
          </div>
        )}

        {/* Products */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">المنتجات</h3>
          
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد منتجات</h3>
              <p className="text-gray-500">لا توجد منتجات في هذه الفئة حالياً.</p>
            </div>
          )}
        </div>
      </div>
    </MobileAppLayout>
  );
};

export default MobileCategoryDetail;
