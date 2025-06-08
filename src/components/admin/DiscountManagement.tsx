
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Percent, Tag, Package } from 'lucide-react';

interface Discount {
  id: string;
  discount_type: 'all_products' | 'category' | 'subcategory';
  target_value: string | null;
  discount_percentage: number;
  created_at: string;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Subcategory {
  id: string;
  name: string;
  icon: string;
  category_id: string;
}

const DiscountManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [discountType, setDiscountType] = useState<'all_products' | 'category' | 'subcategory'>('all_products');
  const [targetValue, setTargetValue] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);

  // Fetch active discounts
  const { data: discounts, isLoading: discountsLoading } = useQuery({
    queryKey: ['active-discounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('active_discounts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Discount[];
    }
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (error) throw error;
      return data as Category[];
    }
  });

  // Fetch subcategories
  const { data: subcategories } = useQuery({
    queryKey: ['subcategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*');
      
      if (error) throw error;
      return data as Subcategory[];
    }
  });

  // Create discount mutation
  const createDiscountMutation = useMutation({
    mutationFn: async () => {
      console.log('Creating discount with:', {
        discount_type: discountType,
        target_value: discountType === 'all_products' ? null : targetValue,
        discount_percentage: discountPercentage,
      });

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const discountData = {
        discount_type: discountType,
        target_value: discountType === 'all_products' ? null : targetValue,
        discount_percentage: discountPercentage,
        created_by: userData.user.id
      };

      const { data, error } = await supabase
        .from('active_discounts')
        .insert([discountData])
        .select()
        .single();
      
      if (error) {
        console.error('Discount creation error:', error);
        throw error;
      }
      
      console.log('Discount created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-discounts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      
      // Reset form
      setDiscountType('all_products');
      setTargetValue('');
      setDiscountPercentage(0);
      
      toast({
        title: 'تم إنشاء الخصم',
        description: 'تم تطبيق الخصم على المنتجات بنجاح',
      });
    },
    onError: (error: any) => {
      console.error('Discount creation failed:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إنشاء الخصم',
        variant: 'destructive',
      });
    }
  });

  // Delete discount mutation
  const deleteDiscountMutation = useMutation({
    mutationFn: async (discountId: string) => {
      const { error } = await supabase
        .from('active_discounts')
        .update({ is_active: false })
        .eq('id', discountId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-discounts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      
      toast({
        title: 'تم حذف الخصم',
        description: 'تم إزالة الخصم من المنتجات',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: 'فشل في حذف الخصم',
        variant: 'destructive',
      });
    }
  });

  const handleCreateDiscount = () => {
    if (discountPercentage <= 0 || discountPercentage > 100) {
      toast({
        title: 'خطأ',
        description: 'يجب أن تكون نسبة الخصم بين 1 و 100',
        variant: 'destructive',
      });
      return;
    }

    if (discountType !== 'all_products' && !targetValue) {
      toast({
        title: 'خطأ',
        description: 'يجب اختيار الفئة أو الفئة الفرعية',
        variant: 'destructive',
      });
      return;
    }

    createDiscountMutation.mutate();
  };

  const getDiscountDisplayText = (discount: Discount) => {
    if (discount.discount_type === 'all_products') {
      return 'جميع المنتجات';
    } else if (discount.discount_type === 'category') {
      const category = categories?.find(c => c.id === discount.target_value);
      return `فئة: ${category?.name || discount.target_value}`;
    } else {
      const subcategory = subcategories?.find(s => s.id === discount.target_value);
      return `فئة فرعية: ${subcategory?.name || discount.target_value}`;
    }
  };

  if (discountsLoading) {
    return <div className="text-center">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create New Discount */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5" />
            إنشاء خصم جديد
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="discount-type">نوع الخصم</Label>
              <Select value={discountType} onValueChange={(value: any) => setDiscountType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الخصم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_products">جميع المنتجات</SelectItem>
                  <SelectItem value="category">فئة محددة</SelectItem>
                  <SelectItem value="subcategory">فئة فرعية محددة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {discountType === 'category' && (
              <div>
                <Label htmlFor="category">الفئة</Label>
                <Select value={targetValue} onValueChange={setTargetValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {discountType === 'subcategory' && (
              <div>
                <Label htmlFor="subcategory">الفئة الفرعية</Label>
                <Select value={targetValue} onValueChange={setTargetValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة الفرعية" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories?.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.icon} {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="discount-percentage">نسبة الخصم (%)</Label>
              <Input
                id="discount-percentage"
                type="number"
                min="1"
                max="100"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                placeholder="أدخل نسبة الخصم"
              />
            </div>
          </div>

          <Button 
            onClick={handleCreateDiscount}
            disabled={createDiscountMutation.isPending}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {createDiscountMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء الخصم'}
          </Button>
        </CardContent>
      </Card>

      {/* Active Discounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            الخصومات النشطة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {discounts && discounts.length > 0 ? (
            <div className="space-y-3">
              {discounts.map((discount) => (
                <div key={discount.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{getDiscountDisplayText(discount)}</p>
                      <p className="text-sm text-gray-600">
                        خصم {discount.discount_percentage}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      نشط
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteDiscountMutation.mutate(discount.id)}
                      disabled={deleteDiscountMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">لا توجد خصومات نشطة حالياً</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscountManagement;
