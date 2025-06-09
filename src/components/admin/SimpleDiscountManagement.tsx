
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useChangeLogger } from '@/hooks/useChangeLogger';
import { Trash2, Percent, Package, ShoppingCart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GlobalDiscount {
  id: string;
  discount_percentage: number;
  is_active: boolean;
  created_at: string;
}

const SimpleDiscountManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { logChange } = useChangeLogger();
  
  const [cartDiscountPercentage, setCartDiscountPercentage] = useState<number>(0);
  const [productDiscountPercentage, setProductDiscountPercentage] = useState<number>(0);

  // Fetch current global cart discount
  const { data: globalDiscount, isLoading } = useQuery({
    queryKey: ['global-discount'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('active_discounts')
        .select('*')
        .eq('discount_type', 'all_products')
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      return data as GlobalDiscount | null;
    }
  });

  // Apply cart-level discount mutation
  const applyCartDiscountMutation = useMutation({
    mutationFn: async (percentage: number) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('المستخدم غير مسجل الدخول');
      }

      // First, deactivate any existing global discounts
      await supabase
        .from('active_discounts')
        .update({ is_active: false })
        .eq('discount_type', 'all_products');

      // Create new global discount
      const { data, error } = await supabase
        .from('active_discounts')
        .insert({
          discount_type: 'all_products',
          target_value: null,
          discount_percentage: percentage,
          created_by: userData.user.id,
          is_active: true
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-discount'] });
      queryClient.invalidateQueries({ queryKey: ['active-discounts'] });
      
      setCartDiscountPercentage(0);
      
      toast({
        title: 'تم تطبيق خصم سلة التسوق',
        description: 'سيظهر الخصم في سلة التسوق للعملاء',
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

  // Apply direct product discount mutation
  const applyProductDiscountMutation = useMutation({
    mutationFn: async (percentage: number) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('المستخدم غير مسجل الدخول');
      }

      console.log(`Applying ${percentage}% discount to all products...`);

      // Update all products with the discount percentage
      const { data, error } = await supabase
        .from('products')
        .update({ discount_percentage: percentage })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // This ensures we update all products

      if (error) {
        console.error('Error updating product discounts:', error);
        throw new Error('فشل في تطبيق الخصم على المنتجات');
      }

      // Log the change
      await logChange(
        'bulk_product_discount_applied',
        'products',
        'all',
        {
          discount_percentage: percentage,
          operation: 'bulk_discount_update',
          affected_products: 'all'
        }
      );

      console.log('Successfully applied discount to all products');
      return { discount_percentage: percentage };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      
      setProductDiscountPercentage(0);
      
      toast({
        title: 'تم تطبيق الخصم على المنتجات',
        description: `تم تطبيق خصم ${data.discount_percentage}% على جميع المنتجات في قاعدة البيانات`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تطبيق الخصم على المنتجات',
        variant: 'destructive',
      });
    }
  });

  // Remove all product discounts mutation
  const removeProductDiscountsMutation = useMutation({
    mutationFn: async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('المستخدم غير مسجل الدخول');
      }

      console.log('Removing all product discounts...');

      // Reset all products to 0% discount
      const { error } = await supabase
        .from('products')
        .update({ discount_percentage: 0 })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // This ensures we update all products

      if (error) {
        console.error('Error removing product discounts:', error);
        throw new Error('فشل في إزالة الخصومات من المنتجات');
      }

      // Log the change
      await logChange(
        'bulk_product_discount_removed',
        'products',
        'all',
        {
          operation: 'bulk_discount_removal',
          affected_products: 'all'
        }
      );

      console.log('Successfully removed all product discounts');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      
      toast({
        title: 'تم إزالة الخصومات',
        description: 'تم إزالة جميع الخصومات من المنتجات',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إزالة الخصومات',
        variant: 'destructive',
      });
    }
  });

  // Remove cart discount mutation
  const removeCartDiscountMutation = useMutation({
    mutationFn: async () => {
      // Deactivate global discount
      const { error } = await supabase
        .from('active_discounts')
        .update({ is_active: false })
        .eq('discount_type', 'all_products')
        .eq('is_active', true);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-discount'] });
      queryClient.invalidateQueries({ queryKey: ['active-discounts'] });
      
      toast({
        title: 'تم إزالة خصم سلة التسوق',
        description: 'لن يظهر الخصم في سلة التسوق بعد الآن',
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

  const handleApplyCartDiscount = () => {
    if (cartDiscountPercentage <= 0 || cartDiscountPercentage > 100) {
      toast({
        title: 'خطأ',
        description: 'يجب أن تكون نسبة الخصم بين 1 و 100',
        variant: 'destructive',
      });
      return;
    }

    applyCartDiscountMutation.mutate(cartDiscountPercentage);
  };

  const handleApplyProductDiscount = () => {
    if (productDiscountPercentage < 0 || productDiscountPercentage > 100) {
      toast({
        title: 'خطأ',
        description: 'يجب أن تكون نسبة الخصم بين 0 و 100',
        variant: 'destructive',
      });
      return;
    }

    applyProductDiscountMutation.mutate(productDiscountPercentage);
  };

  const handleRemoveCartDiscount = () => {
    removeCartDiscountMutation.mutate();
  };

  const handleRemoveProductDiscounts = () => {
    removeProductDiscountsMutation.mutate();
  };

  if (isLoading) {
    return <div className="text-center">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="cart-discount" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cart-discount" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            خصم سلة التسوق
          </TabsTrigger>
          <TabsTrigger value="product-discount" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            خصم المنتجات المباشر
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cart-discount" className="space-y-6">
          {/* Current Cart Discount Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                حالة خصم سلة التسوق الحالية
              </CardTitle>
            </CardHeader>
            <CardContent>
              {globalDiscount ? (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div>
                    <p className="font-semibold text-green-800">
                      خصم سلة التسوق نشط: {globalDiscount.discount_percentage}%
                    </p>
                    <p className="text-sm text-green-600">
                      سيظهر في سلة التسوق للعملاء
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">نشط</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveCartDiscount}
                      disabled={removeCartDiscountMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">لا يوجد خصم سلة تسوق نشط حالياً</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Apply New Cart Discount */}
          <Card>
            <CardHeader>
              <CardTitle>تطبيق خصم على سلة التسوق</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cart-discount-percentage">نسبة الخصم (%)</Label>
                <Input
                  id="cart-discount-percentage"
                  type="number"
                  min="1"
                  max="100"
                  value={cartDiscountPercentage}
                  onChange={(e) => setCartDiscountPercentage(Number(e.target.value))}
                  placeholder="أدخل نسبة الخصم (1-100)"
                />
                <p className="text-sm text-gray-600 mt-1">
                  سيظهر هذا الخصم في سلة التسوق للعملاء
                </p>
              </div>

              <Button 
                onClick={handleApplyCartDiscount}
                disabled={applyCartDiscountMutation.isPending || !cartDiscountPercentage}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {applyCartDiscountMutation.isPending ? 'جاري التطبيق...' : `تطبيق خصم سلة ${cartDiscountPercentage}%`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="product-discount" className="space-y-6">
          {/* Direct Product Discount */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                تطبيق خصم مباشر على جميع المنتجات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-yellow-50">
                <p className="text-yellow-800 font-medium mb-2">⚠️ تحذير هام</p>
                <p className="text-sm text-yellow-700">
                  سيتم تطبيق هذا الخصم مباشرة على جميع المنتجات في قاعدة البيانات. 
                  هذا سيغير أسعار المنتجات نفسها وليس فقط في سلة التسوق.
                </p>
              </div>

              <div>
                <Label htmlFor="product-discount-percentage">نسبة الخصم (%)</Label>
                <Input
                  id="product-discount-percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={productDiscountPercentage}
                  onChange={(e) => setProductDiscountPercentage(Number(e.target.value))}
                  placeholder="أدخل نسبة الخصم (0-100)"
                />
                <p className="text-sm text-gray-600 mt-1">
                  سيتم تحديث جميع المنتجات بهذه النسبة (0 = إزالة جميع الخصومات)
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleApplyProductDiscount}
                  disabled={applyProductDiscountMutation.isPending}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  {applyProductDiscountMutation.isPending ? 'جاري التطبيق...' : `تطبيق خصم ${productDiscountPercentage}% على جميع المنتجات`}
                </Button>
                
                <Button 
                  onClick={handleRemoveProductDiscounts}
                  disabled={removeProductDiscountsMutation.isPending}
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  {removeProductDiscountsMutation.isPending ? 'جاري الإزالة...' : 'إزالة جميع الخصومات'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimpleDiscountManagement;
