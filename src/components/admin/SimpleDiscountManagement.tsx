
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
import { Trash2, Percent, Package, Tag } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CategoryDiscount {
  id: string;
  discount_type: 'category' | 'subcategory';
  target_value: string;
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
  
  const [productDiscountPercentage, setProductDiscountPercentage] = useState<number>(0);
  const [specificDiscountType, setSpecificDiscountType] = useState<'category' | 'subcategory'>('category');
  const [specificTarget, setSpecificTarget] = useState<string>('');
  const [specificDiscountPercentage, setSpecificDiscountPercentage] = useState<number>(0);
  const [directCategory, setDirectCategory] = useState<string>('');
  const [directDiscountPercentage, setDirectDiscountPercentage] = useState<number>(0);

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

  // Fetch active category/subcategory discounts
  const { data: activeDiscounts, isLoading } = useQuery({
    queryKey: ['category-discounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('active_discounts')
        .select('*')
        .in('discount_type', ['category', 'subcategory'])
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CategoryDiscount[];
    }
  });

  // Apply specific discount mutation
  const applySpecificDiscountMutation = useMutation({
    mutationFn: async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('المستخدم غير مسجل الدخول');
      }

      const { data, error } = await supabase
        .from('active_discounts')
        .insert({
          discount_type: specificDiscountType,
          target_value: specificTarget,
          discount_percentage: specificDiscountPercentage,
          created_by: userData.user.id,
          is_active: true
        })
        .select()
        .single();
      
      if (error) throw error;

      const targetName = specificDiscountType === 'category' 
        ? categories?.find(c => c.id === specificTarget)?.name 
        : subcategories?.find(s => s.id === specificTarget)?.name;

      await logChange(
        'specific_discount_applied',
        'active_discounts',
        data.id,
        {
          discount_type: specificDiscountType,
          target_value: specificTarget,
          discount_percentage: specificDiscountPercentage,
          target_name: targetName
        }
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-discounts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      
      setSpecificDiscountType('category');
      setSpecificTarget('');
      setSpecificDiscountPercentage(0);
      
      toast({
        title: 'تم تطبيق الخصم',
        description: 'تم تطبيق الخصم على الفئة المحددة بنجاح',
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

  // Apply direct category discount mutation
  const applyDirectDiscountMutation = useMutation({
    mutationFn: async ({ categoryId, percentage }: { categoryId: string; percentage: number }) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('المستخدم غير مسجل الدخول');
      }

      console.log(`Applying ${percentage}% discount to category ${categoryId}...`);

      // Apply discount to products in specific category using WHERE clause
      const { data, error } = await supabase
        .from('products')
        .update({ discount_percentage: percentage })
        .contains('categories', [categoryId]);

      if (error) {
        console.error('Error updating category product discounts:', error);
        throw new Error('فشل في تطبيق الخصم على المنتجات');
      }

      const categoryName = categories?.find(c => c.id === categoryId)?.name || categoryId;

      await logChange(
        'direct_category_discount_applied',
        'products',
        categoryId,
        {
          discount_percentage: percentage,
          operation: 'category_discount_update',
          category_name: categoryName,
          affected_category: categoryId
        }
      );

      console.log(`Successfully applied discount to category ${categoryName}`);
      return { discount_percentage: percentage, category_name: categoryName };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      
      setDirectDiscountPercentage(0);
      setDirectCategory('');
      
      toast({
        title: 'تم تطبيق الخصم على الفئة',
        description: `تم تطبيق خصم ${data.discount_percentage}% على منتجات فئة ${data.category_name}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تطبيق الخصم على الفئة',
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

      const { data, error } = await supabase
        .from('products')
        .update({ discount_percentage: percentage })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        console.error('Error updating product discounts:', error);
        throw new Error('فشل في تطبيق الخصم على المنتجات');
      }

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

      const { error } = await supabase
        .from('products')
        .update({ discount_percentage: 0 })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        console.error('Error removing product discounts:', error);
        throw new Error('فشل في إزالة الخصومات من المنتجات');
      }

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

  // Remove specific discount mutation
  const removeSpecificDiscountMutation = useMutation({
    mutationFn: async (discountId: string) => {
      const { error } = await supabase
        .from('active_discounts')
        .update({ is_active: false })
        .eq('id', discountId);
      
      if (error) throw error;

      await logChange(
        'specific_discount_removed',
        'active_discounts',
        discountId,
        {
          operation: 'discount_removal'
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-discounts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      toast({
        title: 'تم إزالة الخصم',
        description: 'تم إزالة الخصم من الفئة',
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

  const handleApplySpecificDiscount = () => {
    if (specificDiscountPercentage <= 0 || specificDiscountPercentage > 100) {
      toast({
        title: 'خطأ',
        description: 'يجب أن تكون نسبة الخصم بين 1 و 100',
        variant: 'destructive',
      });
      return;
    }

    if (!specificTarget) {
      toast({
        title: 'خطأ',
        description: 'يجب اختيار الفئة أو الفئة الفرعية',
        variant: 'destructive',
      });
      return;
    }

    applySpecificDiscountMutation.mutate();
  };

  const handleApplyDirectDiscount = () => {
    if (directDiscountPercentage < 0 || directDiscountPercentage > 100) {
      toast({
        title: 'خطأ',
        description: 'يجب أن تكون نسبة الخصم بين 0 و 100',
        variant: 'destructive',
      });
      return;
    }

    if (!directCategory) {
      toast({
        title: 'خطأ',
        description: 'يجب اختيار الفئة',
        variant: 'destructive',
      });
      return;
    }

    applyDirectDiscountMutation.mutate({
      categoryId: directCategory,
      percentage: directDiscountPercentage
    });
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

  const handleRemoveProductDiscounts = () => {
    removeProductDiscountsMutation.mutate();
  };

  const getDiscountDisplayText = (discount: CategoryDiscount) => {
    if (discount.discount_type === 'category') {
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
      <Tabs defaultValue="specific-discount" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="specific-discount" className="flex items-center gap-2 text-xs md:text-sm">
            <Percent className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">خصم محدد</span>
            <span className="sm:hidden">محدد</span>
          </TabsTrigger>
          <TabsTrigger value="product-discount" className="flex items-center gap-2 text-xs md:text-sm">
            <Package className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">خصم المنتجات المباشر</span>
            <span className="sm:hidden">منتجات</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="specific-discount" className="space-y-4 md:space-y-6">
          {/* Active Discounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Tag className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">الخصومات النشطة</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeDiscounts && activeDiscounts.length > 0 ? (
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
                          onClick={() => removeSpecificDiscountMutation.mutate(discount.id)}
                          disabled={removeSpecificDiscountMutation.isPending}
                        >
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 md:py-8">
                  <p className="text-gray-500 mb-4 text-sm md:text-base">لا توجد خصومات نشطة حالياً</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Apply New Specific Discount */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">تطبيق خصم على فئة أو فئة فرعية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="specific-discount-type" className="text-sm md:text-base">نوع الخصم</Label>
                  <Select value={specificDiscountType} onValueChange={(value: any) => setSpecificDiscountType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الخصم" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="category">فئة</SelectItem>
                      <SelectItem value="subcategory">فئة فرعية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="specific-target" className="text-sm md:text-base">
                    {specificDiscountType === 'category' ? 'الفئة' : 'الفئة الفرعية'}
                  </Label>
                  <Select value={specificTarget} onValueChange={setSpecificTarget}>
                    <SelectTrigger>
                      <SelectValue placeholder={`اختر ${specificDiscountType === 'category' ? 'الفئة' : 'الفئة الفرعية'}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {specificDiscountType === 'category' 
                        ? categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.icon} {category.name}
                            </SelectItem>
                          ))
                        : subcategories?.map((subcategory) => (
                            <SelectItem key={subcategory.id} value={subcategory.id}>
                              {subcategory.icon} {subcategory.name}
                            </SelectItem>
                          ))
                      }
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="specific-discount-percentage" className="text-sm md:text-base">نسبة الخصم (%)</Label>
                  <Input
                    id="specific-discount-percentage"
                    type="number"
                    min="1"
                    max="100"
                    value={specificDiscountPercentage}
                    onChange={(e) => setSpecificDiscountPercentage(Number(e.target.value))}
                    placeholder="أدخل نسبة الخصم (1-100)"
                  />
                </div>
              </div>

              <Button 
                onClick={handleApplySpecificDiscount}
                disabled={applySpecificDiscountMutation.isPending || !specificTarget || !specificDiscountPercentage}
                className="w-full bg-green-600 hover:bg-green-700 text-sm md:text-base"
              >
                {applySpecificDiscountMutation.isPending ? 'جاري التطبيق...' : `تطبيق خصم ${specificDiscountPercentage}%`}
              </Button>
            </CardContent>
          </Card>

          {/* Direct Category Discount */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Percent className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">تطبيق خصم مباشر على فئة محددة</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 md:p-4 border rounded-lg bg-blue-50">
                <p className="text-blue-800 font-medium mb-2 text-sm md:text-base">💡 معلومة</p>
                <p className="text-xs md:text-sm text-blue-700">
                  سيتم تطبيق هذا الخصم مباشرة على منتجات الفئة المحددة فقط. 
                  يتم استخدام WHERE clause لضمان استهداف المنتجات الصحيحة.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="direct-category" className="text-sm md:text-base">الفئة</Label>
                  <Select value={directCategory} onValueChange={setDirectCategory}>
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

                <div>
                  <Label htmlFor="direct-discount-percentage" className="text-sm md:text-base">نسبة الخصم (%)</Label>
                  <Input
                    id="direct-discount-percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={directDiscountPercentage}
                    onChange={(e) => setDirectDiscountPercentage(Number(e.target.value))}
                    placeholder="أدخل نسبة الخصم (0-100)"
                  />
                </div>
              </div>

              <Button 
                onClick={handleApplyDirectDiscount}
                disabled={applyDirectDiscountMutation.isPending || !directCategory}
                className="w-full bg-blue-600 hover:bg-blue-700 text-sm md:text-base"
              >
                {applyDirectDiscountMutation.isPending ? 'جاري التطبيق...' : `تطبيق خصم ${directDiscountPercentage}% على الفئة المحددة`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="product-discount" className="space-y-4 md:space-y-6">
          {/* Direct Product Discount */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Package className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">تطبيق خصم مباشر على جميع المنتجات</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 md:p-4 border rounded-lg bg-yellow-50">
                <p className="text-yellow-800 font-medium mb-2 text-sm md:text-base">⚠️ تحذير هام</p>
                <p className="text-xs md:text-sm text-yellow-700">
                  سيتم تطبيق هذا الخصم مباشرة على جميع المنتجات في قاعدة البيانات. 
                  هذا سيغير أسعار المنتجات نفسها وليس فقط في سلة التسوق.
                </p>
              </div>

              <div>
                <Label htmlFor="product-discount-percentage" className="text-sm md:text-base">نسبة الخصم (%)</Label>
                <Input
                  id="product-discount-percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={productDiscountPercentage}
                  onChange={(e) => setProductDiscountPercentage(Number(e.target.value))}
                  placeholder="أدخل نسبة الخصم (0-100)"
                />
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  سيتم تحديث جميع المنتجات بهذه النسبة (0 = إزالة جميع الخصومات)
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={handleApplyProductDiscount}
                  disabled={applyProductDiscountMutation.isPending}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-sm md:text-base"
                >
                  {applyProductDiscountMutation.isPending ? 'جاري التطبيق...' : `تطبيق خصم ${productDiscountPercentage}% على جميع المنتجات`}
                </Button>
                
                <Button 
                  onClick={handleRemoveProductDiscounts}
                  disabled={removeProductDiscountsMutation.isPending}
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50 text-sm md:text-base"
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
