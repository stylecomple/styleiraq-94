
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
import { useChangeLogger } from '@/hooks/useChangeLogger';
import { Trash2, Percent, Package } from 'lucide-react';

interface Discount {
  id: string;
  discount_type: 'all_products' | 'category' | 'subcategory';
  target_value: string | null;
  discount_percentage: number;
  is_active: boolean;
  created_at: string;
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

const SimpleDiscountManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { logChange } = useChangeLogger();
  
  const [discountType, setDiscountType] = useState<'all_products' | 'category' | 'subcategory'>('all_products');
  const [targetValue, setTargetValue] = useState<string>('');
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);

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

  // Fetch active discounts
  const { data: activeDiscounts, isLoading } = useQuery({
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

  // Apply discount mutation
  const applyDiscountMutation = useMutation({
    mutationFn: async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('المستخدم غير مسجل الدخول');
      }

      console.log('Applying discount:', {
        discount_type: discountType,
        target_value: discountType === 'all_products' ? null : targetValue,
        discount_percentage: discountPercentage
      });

      // Create discount record
      const { data: discountData, error: discountError } = await supabase
        .from('active_discounts')
        .insert({
          discount_type: discountType,
          target_value: discountType === 'all_products' ? null : targetValue,
          discount_percentage: discountPercentage,
          created_by: userData.user.id,
          is_active: true
        })
        .select()
        .single();
      
      if (discountError) throw discountError;

      // Apply discount to products using proper WHERE clauses
      if (discountType === 'all_products') {
        console.log(`Applying ${discountPercentage}% discount to all products...`);
        const { error } = await supabase
          .from('products')
          .update({ discount_percentage: discountPercentage })
          .neq('id', '00000000-0000-0000-0000-000000000000'); // WHERE clause to avoid update error
      } else if (discountType === 'category') {
        console.log(`Applying ${discountPercentage}% discount to category ${targetValue}...`);
        const { error } = await supabase
          .from('products')
          .update({ discount_percentage: discountPercentage })
          .contains('categories', [targetValue]); // WHERE clause for specific category
      } else if (discountType === 'subcategory') {
        console.log(`Applying ${discountPercentage}% discount to subcategory ${targetValue}...`);
        const { error } = await supabase
          .from('products')
          .update({ discount_percentage: discountPercentage })
          .contains('subcategories', [targetValue]); // WHERE clause for specific subcategory
      }

      const targetName = discountType === 'all_products' 
        ? 'جميع المنتجات'
        : discountType === 'category' 
          ? categories?.find(c => c.id === targetValue)?.name 
          : subcategories?.find(s => s.id === targetValue)?.name;

      await logChange(
        'discount_applied',
        'active_discounts',
        discountData.id,
        {
          discount_type: discountType,
          target_value: targetValue,
          discount_percentage: discountPercentage,
          target_name: targetName
        }
      );

      return discountData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-discounts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      
      setDiscountType('all_products');
      setTargetValue('');
      setDiscountPercentage(0);
      
      toast({
        title: 'تم تطبيق الخصم',
        description: 'تم تطبيق الخصم على المنتجات بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تطبيق الخصم',
        variant: 'destructive',
      });
    }
  });

  // Remove discount mutation
  const removeDiscountMutation = useMutation({
    mutationFn: async (discountId: string) => {
      const discount = activeDiscounts?.find(d => d.id === discountId);
      if (!discount) throw new Error('الخصم غير موجود');

      // Deactivate discount record
      const { error: deactivateError } = await supabase
        .from('active_discounts')
        .update({ is_active: false })
        .eq('id', discountId);
      
      if (deactivateError) throw deactivateError;

      // Remove discount from products using proper WHERE clauses
      if (discount.discount_type === 'all_products') {
        console.log('Removing discount from all products...');
        const { error } = await supabase
          .from('products')
          .update({ discount_percentage: 0 })
          .neq('id', '00000000-0000-0000-0000-000000000000'); // WHERE clause to avoid update error
      } else if (discount.discount_type === 'category') {
        console.log(`Removing discount from category ${discount.target_value}...`);
        const { error } = await supabase
          .from('products')
          .update({ discount_percentage: 0 })
          .contains('categories', [discount.target_value]); // WHERE clause for specific category
      } else if (discount.discount_type === 'subcategory') {
        console.log(`Removing discount from subcategory ${discount.target_value}...`);
        const { error } = await supabase
          .from('products')
          .update({ discount_percentage: 0 })
          .contains('subcategories', [discount.target_value]); // WHERE clause for specific subcategory
      }

      await logChange(
        'discount_removed',
        'active_discounts',
        discountId,
        {
          operation: 'discount_removal'
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-discounts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      
      toast({
        title: 'تم إزالة الخصم',
        description: 'تم إزالة الخصم من المنتجات',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: 'فشل في إزالة الخصم',
        variant: 'destructive',
      });
    }
  });

  const handleApplyDiscount = () => {
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

    applyDiscountMutation.mutate();
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

  if (isLoading) {
    return <div className="text-center">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Active Discounts */}
      {activeDiscounts && activeDiscounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Package className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">الخصومات النشطة</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeDiscounts.map((discount) => (
                <div key={discount.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border rounded-lg bg-green-50 gap-3">
                  <div>
                    <p className="font-semibold text-green-800 text-sm md:text-base">
                      {getDiscountDisplayText(discount)} - خصم {discount.discount_percentage}%
                    </p>
                    <p className="text-xs md:text-sm text-green-600">
                      نشط على المنتجات
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 text-xs">نشط</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeDiscountMutation.mutate(discount.id)}
                      disabled={removeDiscountMutation.isPending}
                    >
                      <Trash2 className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Apply New Discount */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Percent className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">تطبيق خصم جديد</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="discount-type" className="text-sm md:text-base">نوع الخصم</Label>
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
                <Label htmlFor="category" className="text-sm md:text-base">الفئة</Label>
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
                <Label htmlFor="subcategory" className="text-sm md:text-base">الفئة الفرعية</Label>
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
              <Label htmlFor="discount-percentage" className="text-sm md:text-base">نسبة الخصم (%)</Label>
              <Input
                id="discount-percentage"
                type="number"
                min="1"
                max="100"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                placeholder="أدخل نسبة الخصم (1-100)"
              />
            </div>
          </div>

          <Button 
            onClick={handleApplyDiscount}
            disabled={applyDiscountMutation.isPending || (discountType !== 'all_products' && !targetValue) || !discountPercentage}
            className="w-full bg-green-600 hover:bg-green-700 text-sm md:text-base"
          >
            {applyDiscountMutation.isPending ? 'جاري التطبيق...' : `تطبيق خصم ${discountPercentage}%`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleDiscountManagement;
