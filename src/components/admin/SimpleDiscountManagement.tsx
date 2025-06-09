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
import { Percent, AlertTriangle, Trash2, Tag, Package } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface Discount {
  id: string;
  discount_type: 'all_products' | 'category' | 'subcategory';
  target_value: string | null;
  discount_percentage: number;
  created_at: string;
  is_active: boolean;
}

const SimpleDiscountManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { logChange } = useChangeLogger();
  
  const [discountType, setDiscountType] = useState<'all_products' | 'category' | 'subcategory'>('all_products');
  const [targetValue, setTargetValue] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [isConfirmed, setIsConfirmed] = useState(false);

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

  // Apply discount mutation
  const applyDiscountMutation = useMutation({
    mutationFn: async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('المستخدم غير مسجل الدخول');
      }

      // First, create the discount record in active_discounts table
      const discountData = {
        discount_type: discountType,
        target_value: discountType === 'all_products' ? null : targetValue,
        discount_percentage: discountPercentage,
        created_by: userData.user.id,
        is_active: true
      };

      console.log('Creating discount record:', discountData);

      const { data: discountRecord, error: insertError } = await supabase
        .from('active_discounts')
        .insert([discountData])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating discount record:', insertError);
        throw insertError;
      }

      console.log('Discount record created:', discountRecord);

      // Now apply the discount to products
      if (discountType === 'all_products') {
        console.log(`Applying ${discountPercentage}% discount to all products globally...`);

        // Get all product IDs first, then update them
        const { data: allProducts, error: fetchError } = await supabase
          .from('products')
          .select('id')
          .eq('is_active', true);

        if (fetchError) {
          console.error('Error fetching products:', fetchError);
          throw fetchError;
        }

        if (allProducts && allProducts.length > 0) {
          const productIds = allProducts.map(p => p.id);
          
          const { error: updateError } = await supabase
            .from('products')
            .update({ 
              discount_percentage: discountPercentage,
              updated_at: new Date().toISOString()
            })
            .in('id', productIds);

          if (updateError) {
            console.error('Error applying global discount:', updateError);
            throw updateError;
          }
        }

        await logChange(
          'global_discount_applied',
          'products',
          'all_products',
          {
            discount_percentage: discountPercentage,
            operation: 'global_discount_update',
            affected_products: allProducts?.length || 0
          }
        );
      } else if (discountType === 'category') {
        console.log(`Applying ${discountPercentage}% discount to category: ${targetValue}`);
        
        // Get all products that belong to this category
        const { data: productsInCategory, error: fetchError } = await supabase
          .from('products')
          .select('id')
          .contains('categories', [targetValue])
          .eq('is_active', true);

        if (fetchError) {
          console.error('Error fetching products in category:', fetchError);
          throw fetchError;
        }

        console.log(`Found ${productsInCategory?.length || 0} products in category`);

        if (productsInCategory && productsInCategory.length > 0) {
          const productIds = productsInCategory.map(p => p.id);
          
          const { error: updateError } = await supabase
            .from('products')
            .update({ 
              discount_percentage: discountPercentage,
              updated_at: new Date().toISOString()
            })
            .in('id', productIds);

          if (updateError) {
            console.error('Error applying category discount:', updateError);
            throw updateError;
          }
        }

        await logChange(
          'category_discount_applied',
          'products',
          targetValue,
          {
            discount_percentage: discountPercentage,
            discount_type: discountType,
            target_value: targetValue,
            affected_products: productsInCategory?.length || 0
          }
        );
      } else if (discountType === 'subcategory') {
        console.log(`Applying ${discountPercentage}% discount to subcategory: ${targetValue}`);
        
        // Get all products that belong to this subcategory
        const { data: productsInSubcategory, error: fetchError } = await supabase
          .from('products')
          .select('id')
          .contains('subcategories', [targetValue])
          .eq('is_active', true);

        if (fetchError) {
          console.error('Error fetching products in subcategory:', fetchError);
          throw fetchError;
        }

        console.log(`Found ${productsInSubcategory?.length || 0} products in subcategory`);

        if (productsInSubcategory && productsInSubcategory.length > 0) {
          const productIds = productsInSubcategory.map(p => p.id);
          
          const { error: updateError } = await supabase
            .from('products')
            .update({ 
              discount_percentage: discountPercentage,
              updated_at: new Date().toISOString()
            })
            .in('id', productIds);

          if (updateError) {
            console.error('Error applying subcategory discount:', updateError);
            throw updateError;
          }
        }

        await logChange(
          'subcategory_discount_applied',
          'products',
          targetValue,
          {
            discount_percentage: discountPercentage,
            discount_type: discountType,
            target_value: targetValue,
            affected_products: productsInSubcategory?.length || 0
          }
        );
      }

      console.log(`Successfully applied ${discountPercentage}% discount`);
      return discountRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      queryClient.invalidateQueries({ queryKey: ['active-discounts'] });
      
      setDiscountPercentage(0);
      setIsConfirmed(false);
      setTargetValue('');
      
      toast({
        title: 'تم تطبيق الخصم',
        description: `تم تطبيق خصم ${discountPercentage}% بنجاح`,
      });
    },
    onError: (error: any) => {
      console.error('Discount application failed:', error);
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
      console.log('Removing discount:', discountId);
      
      // Get discount details before removing
      const { data: discount, error: fetchError } = await supabase
        .from('active_discounts')
        .select('*')
        .eq('id', discountId)
        .single();

      if (fetchError) {
        console.error('Error fetching discount:', fetchError);
        throw fetchError;
      }

      // Deactivate the discount rule
      const { error: deactivateError } = await supabase
        .from('active_discounts')
        .update({ is_active: false })
        .eq('id', discountId);
      
      if (deactivateError) {
        console.error('Error deactivating discount:', deactivateError);
        throw deactivateError;
      }

      // Reset products affected by this discount back to 0
      if (discount) {
        if (discount.discount_type === 'all_products') {
          console.log('Resetting all products discount to 0');
          
          // Get all product IDs first, then reset them
          const { data: allProducts, error: fetchError } = await supabase
            .from('products')
            .select('id')
            .eq('is_active', true);

          if (fetchError) {
            console.error('Error fetching products for reset:', fetchError);
            throw fetchError;
          }

          if (allProducts && allProducts.length > 0) {
            const productIds = allProducts.map(p => p.id);
            
            const { error: resetError } = await supabase
              .from('products')
              .update({ 
                discount_percentage: 0,
                updated_at: new Date().toISOString()
              })
              .in('id', productIds);
            
            if (resetError) {
              console.error('Error resetting all products:', resetError);
              throw resetError;
            }
          }
        } else if (discount.discount_type === 'category') {
          console.log('Resetting category products discount to 0');
          const { data: productsInCategory } = await supabase
            .from('products')
            .select('id')
            .contains('categories', [discount.target_value])
            .eq('is_active', true);

          if (productsInCategory && productsInCategory.length > 0) {
            const productIds = productsInCategory.map(p => p.id);
            
            const { error: resetError } = await supabase
              .from('products')
              .update({ 
                discount_percentage: 0,
                updated_at: new Date().toISOString()
              })
              .in('id', productIds);
            
            if (resetError) {
              console.error('Error resetting category products:', resetError);
              throw resetError;
            }
          }
        } else if (discount.discount_type === 'subcategory') {
          console.log('Resetting subcategory products discount to 0');
          const { data: productsInSubcategory } = await supabase
            .from('products')
            .select('id')
            .contains('subcategories', [discount.target_value])
            .eq('is_active', true);

          if (productsInSubcategory && productsInSubcategory.length > 0) {
            const productIds = productsInSubcategory.map(p => p.id);
            
            const { error: resetError } = await supabase
              .from('products')
              .update({ 
                discount_percentage: 0,
                updated_at: new Date().toISOString()
              })
              .in('id', productIds);
            
            if (resetError) {
              console.error('Error resetting subcategory products:', resetError);
              throw resetError;
            }
          }
        }
      }

      await logChange(
        'discount_removed',
        'active_discounts',
        discountId,
        { discount_id: discountId, discount_type: discount?.discount_type }
      );

      return discount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-discounts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      
      toast({
        title: 'تم إيقاف الخصم',
        description: 'تم إيقاف الخصم وإعادة تعيين الأسعار',
      });
    },
    onError: (error: any) => {
      console.error('Error removing discount:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إيقاف الخصم',
        variant: 'destructive',
      });
    }
  });

  const handleApplyDiscount = () => {
    if (discountPercentage < 0 || discountPercentage > 100) {
      toast({
        title: 'خطأ',
        description: 'يجب أن تكون نسبة الخصم بين 0 و 100',
        variant: 'destructive',
      });
      return;
    }

    if (!isConfirmed) {
      toast({
        title: 'تأكيد مطلوب',
        description: 'يرجى تأكيد العملية قبل المتابعة',
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

    console.log('Applying discount:', { discountType, targetValue, discountPercentage });
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

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Apply Discount Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Percent className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">تطبيق خصم على المنتجات</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              تحذير: تأكد من نسبة الخصم ونوع التطبيق قبل المتابعة.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discount-type" className="text-sm md:text-base">
                نوع الخصم
              </Label>
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
              <Label htmlFor="discount-percentage" className="text-sm md:text-base">
                نسبة الخصم (%)
              </Label>
              <Input
                id="discount-percentage"
                type="number"
                min="0"
                max="100"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                placeholder="أدخل نسبة الخصم (0-100)"
                className="text-center"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">أؤكد أنني أريد تطبيق هذا الخصم</span>
              </label>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">معاينة العملية:</h4>
            <p className="text-sm text-gray-600">
              {discountPercentage > 0 
                ? `سيتم تطبيق خصم ${discountPercentage}% على ${
                    discountType === 'all_products' ? 'جميع المنتجات' :
                    discountType === 'category' ? 'منتجات الفئة المحددة' :
                    'منتجات الفئة الفرعية المحددة'
                  }`
                : 'سيتم إزالة الخصومات (0% خصم)'
              }
            </p>
          </div>

          <Button 
            onClick={handleApplyDiscount}
            disabled={applyDiscountMutation.isPending || !isConfirmed}
            className="w-full bg-orange-600 hover:bg-orange-700 text-sm md:text-base"
            size="lg"
          >
            {applyDiscountMutation.isPending 
              ? 'جاري التطبيق...' 
              : `تطبيق خصم ${discountPercentage}%`
            }
          </Button>

          {applyDiscountMutation.isPending && (
            <div className="text-center text-sm text-gray-600">
              يرجى الانتظار، جاري تحديث المنتجات...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Discounts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Tag className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">الخصومات النشطة</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {discountsLoading ? (
            <div className="text-center text-sm text-gray-600">جاري التحميل...</div>
          ) : discounts && discounts.length > 0 ? (
            <div className="space-y-3">
              {discounts.map((discount) => (
                <div key={discount.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm md:text-base">{getDiscountDisplayText(discount)}</p>
                      <p className="text-xs md:text-sm text-gray-600">
                        خصم {discount.discount_percentage}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                      نشط
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeDiscountMutation.mutate(discount.id)}
                      disabled={removeDiscountMutation.isPending}
                      className="text-xs md:text-sm"
                    >
                      <Trash2 className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8 text-sm md:text-base">لا توجد خصومات نشطة حالياً</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleDiscountManagement;
