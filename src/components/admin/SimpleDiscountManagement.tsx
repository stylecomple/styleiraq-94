
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useChangeLogger } from '@/hooks/useChangeLogger';
import { useAuth } from '@/contexts/AuthContext';
import { Percent, Trash2 } from 'lucide-react';

const SimpleDiscountManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { logChange } = useChangeLogger();
  const queryClient = useQueryClient();
  
  const [discountType, setDiscountType] = useState('all_products');
  const [targetValue, setTargetValue] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);

  // Fetch categories for dropdown
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  // Fetch subcategories for dropdown
  const { data: subcategories } = useQuery({
    queryKey: ['subcategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*');
      if (error) throw error;
      return data;
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
      return data;
    }
  });

  const applyDiscountMutation = useMutation({
    mutationFn: async ({ discountType, targetValue, discountPercentage }: {
      discountType: string;
      targetValue: string;
      discountPercentage: number;
    }) => {
      console.log('Applying discount:', { discountType, targetValue, discountPercentage });
      
      if (!user) throw new Error('User not authenticated');

      // Create discount record
      const discountData = {
        discount_type: discountType,
        target_value: discountType === 'all_products' ? null : targetValue,
        discount_percentage: discountPercentage,
        created_by: user.id,
        is_active: true
      };

      console.log('Creating discount record:', discountData);
      
      const { data: discountRecord, error: discountError } = await supabase
        .from('active_discounts')
        .insert(discountData)
        .select()
        .single();

      if (discountError) {
        console.error('Error creating discount record:', discountError);
        throw discountError;
      }

      // Apply discounts using the database function
      const { error: applyError } = await supabase.rpc('apply_active_discounts');
      
      if (applyError) {
        console.error('Error applying active discounts:', applyError);
        throw applyError;
      }

      return discountRecord;
    },
    onSuccess: async (discountRecord) => {
      console.log('Discount applied successfully:', discountRecord);
      
      // Log the change
      await logChange('discount_applied', 'discount', discountRecord.id, {
        discount_type: discountRecord.discount_type,
        target_value: discountRecord.target_value,
        discount_percentage: discountRecord.discount_percentage
      });

      queryClient.invalidateQueries({ queryKey: ['active-discounts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      toast({
        title: 'تم تطبيق الخصم',
        description: `تم تطبيق خصم ${discountRecord.discount_percentage}% بنجاح`,
      });

      // Reset form
      setDiscountType('all_products');
      setTargetValue('');
      setDiscountPercentage(0);
    },
    onError: (error) => {
      console.error('Discount application failed:', error);
      toast({
        title: 'خطأ في تطبيق الخصم',
        description: 'فشل في تطبيق الخصم. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    }
  });

  const removeDiscountMutation = useMutation({
    mutationFn: async (discountId: string) => {
      const { error } = await supabase
        .from('active_discounts')
        .update({ is_active: false })
        .eq('id', discountId);

      if (error) throw error;

      // Apply remaining active discounts
      const { error: applyError } = await supabase.rpc('apply_active_discounts');
      if (applyError) throw applyError;

      return discountId;
    },
    onSuccess: async (discountId) => {
      await logChange('discount_removed', 'discount', discountId, {});
      
      queryClient.invalidateQueries({ queryKey: ['active-discounts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      toast({
        title: 'تم إزالة الخصم',
        description: 'تم إزالة الخصم بنجاح',
      });
    },
    onError: () => {
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
        description: 'يرجى تحديد القيمة المستهدفة',
        variant: 'destructive',
      });
      return;
    }

    applyDiscountMutation.mutate({
      discountType,
      targetValue,
      discountPercentage
    });
  };

  const getDiscountDescription = (discount: any) => {
    switch (discount.discount_type) {
      case 'all_products':
        return 'جميع المنتجات';
      case 'category':
        const category = categories?.find(c => c.id === discount.target_value);
        return `فئة: ${category?.name || discount.target_value}`;
      case 'subcategory':
        const subcategory = subcategories?.find(s => s.id === discount.target_value);
        return `فئة فرعية: ${subcategory?.name || discount.target_value}`;
      default:
        return discount.target_value || 'غير محدد';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Apply New Discount */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5" />
            تطبيق خصم جديد
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>نوع الخصم</Label>
              <Select value={discountType} onValueChange={setDiscountType}>
                <SelectTrigger>
                  <SelectValue />
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
                <Label>الفئة</Label>
                <Select value={targetValue} onValueChange={setTargetValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {discountType === 'subcategory' && (
              <div>
                <Label>الفئة الفرعية</Label>
                <Select value={targetValue} onValueChange={setTargetValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة الفرعية" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories?.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>نسبة الخصم (%)</Label>
              <Input
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
            onClick={handleApplyDiscount}
            disabled={applyDiscountMutation.isPending}
            className="w-full"
          >
            {applyDiscountMutation.isPending ? 'جاري التطبيق...' : 'تطبيق الخصم'}
          </Button>
        </CardContent>
      </Card>

      {/* Active Discounts */}
      <Card>
        <CardHeader>
          <CardTitle>الخصومات النشطة</CardTitle>
        </CardHeader>
        <CardContent>
          {activeDiscounts && activeDiscounts.length > 0 ? (
            <div className="space-y-3">
              {activeDiscounts.map((discount) => (
                <div
                  key={discount.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {getDiscountDescription(discount)}
                    </div>
                    <div className="text-sm text-gray-600">
                      خصم {discount.discount_percentage}%
                    </div>
                    <div className="text-xs text-gray-500">
                      تم الإنشاء: {new Date(discount.created_at).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeDiscountMutation.mutate(discount.id)}
                    disabled={removeDiscountMutation.isPending}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              لا توجد خصومات نشطة حالياً
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleDiscountManagement;
