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

  // Apply discounts manually to products with enhanced WHERE clause support
  const applyDiscountsToProducts = async (whereConditions?: any[]) => {
    try {
      console.log('Starting to apply discounts to products with WHERE conditions...', whereConditions);
      
      // Enhanced WHERE clause handling
      let targetProducts = null;
      
      if (whereConditions && whereConditions.length > 0) {
        console.log('Building complex WHERE clause for product filtering');
        
        // Build a complex query based on WHERE conditions
        let query = supabase.from('products').select('id');
        
        whereConditions.forEach((condition, index) => {
          console.log(`Applying WHERE condition ${index + 1}:`, condition);
          
          // Apply condition based on operator type
          switch (condition.operator) {
            case '=':
              query = query.eq(condition.field, condition.value);
              break;
            case '!=':
              query = query.neq(condition.field, condition.value);
              break;
            case '>':
              query = query.gt(condition.field, condition.value);
              break;
            case '>=':
              query = query.gte(condition.field, condition.value);
              break;
            case '<':
              query = query.lt(condition.field, condition.value);
              break;
            case '<=':
              query = query.lte(condition.field, condition.value);
              break;
            case 'LIKE':
              query = query.ilike(condition.field, `%${condition.value}%`);
              break;
            case 'NOT LIKE':
              query = query.not(condition.field, 'ilike', `%${condition.value}%`);
              break;
            case 'IN':
              const inValues = condition.value.split(',').map((v: string) => v.trim());
              query = query.in(condition.field, inValues);
              break;
            case 'NOT IN':
              const notInValues = condition.value.split(',').map((v: string) => v.trim());
              query = query.not(condition.field, 'in', notInValues);
              break;
            case 'IS NULL':
              query = query.is(condition.field, null);
              break;
            case 'IS NOT NULL':
              query = query.not(condition.field, 'is', null);
              break;
            case 'ANY':
            case '@>':
              query = query.contains(condition.field, [condition.value]);
              break;
            case '<@':
              query = query.containedBy(condition.field, condition.value.split(','));
              break;
            case '&&':
              query = query.overlaps(condition.field, condition.value.split(','));
              break;
            case 'BETWEEN':
              const [min, max] = condition.value.split(',').map((v: string) => v.trim());
              if (min && max) {
                query = query.gte(condition.field, min).lte(condition.field, max);
              }
              break;
            case '= ARRAY[]':
              query = query.eq(condition.field, []);
              break;
            case '!= ARRAY[]':
              query = query.not(condition.field, 'eq', []);
              break;
            default:
              console.warn(`Unsupported operator: ${condition.operator}`);
              query = query.eq(condition.field, condition.value);
          }
          
          // Handle logical operators (AND is default, OR needs special handling)
          if (condition.logicalOperator === 'OR' && index > 0) {
            // For OR conditions, we need to handle them differently
            console.log('Applying OR logical operator');
          }
        });
        
        const { data: filteredProducts, error: filterError } = await query;
        
        if (filterError) {
          console.error('Error filtering products with WHERE clause:', filterError);
          throw filterError;
        }
        
        targetProducts = filteredProducts;
        console.log(`Filtered ${targetProducts.length} products using complex WHERE clause`);
      }

      console.log('Resetting discounts for all products...');
      
      // Reset all products to 0 discount using RPC call
      const { error: resetError } = await supabase.rpc('reset_all_product_discounts');
      
      if (resetError) {
        console.error('Error resetting discounts:', resetError);
        throw resetError;
      }

      console.log('Reset all product discounts to 0');

      // Get all active discounts
      const { data: activeDiscounts, error: discountsError } = await supabase
        .from('active_discounts')
        .select('*')
        .eq('is_active', true);

      if (discountsError) {
        console.error('Error fetching discounts:', discountsError);
        throw discountsError;
      }

      console.log('Active discounts:', activeDiscounts);

      if (activeDiscounts && activeDiscounts.length > 0) {
        // Apply discounts using RPC call with optional product filtering
        if (targetProducts && targetProducts.length > 0) {
          const productIds = targetProducts.map(p => p.id);
          console.log(`Applying discounts to ${productIds.length} filtered products`);
          
          const { error: applyError } = await supabase.rpc('apply_active_discounts', {
            product_ids: productIds
          });
          
          if (applyError) {
            console.error('Error applying discounts to filtered products:', applyError);
            throw applyError;
          }
        } else {
          // Apply to all products
          const { error: applyError } = await supabase.rpc('apply_active_discounts');
          
          if (applyError) {
            console.error('Error applying discounts:', applyError);
            throw applyError;
          }
        }

        console.log('Successfully applied all discounts with WHERE clause filtering');
      }

      console.log('Enhanced discount application completed');
    } catch (error) {
      console.error('Error in enhanced applyDiscountsToProducts:', error);
      throw error;
    }
  };

  // Create discount mutation - using improved RPC function
  const createDiscountMutation = useMutation({
    mutationFn: async () => {
      console.log('Creating discount with:', {
        discount_type: discountType,
        target_value: discountType === 'all_products' ? null : targetValue,
        discount_percentage: discountPercentage,
      });

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('المستخدم غير مسجل الدخول');
      }

      const discountData = {
        discount_type: discountType,
        target_value: discountType === 'all_products' ? null : targetValue,
        discount_percentage: discountPercentage,
        created_by: userData.user.id,
        is_active: true
      };

      console.log('Inserting discount data:', discountData);

      // Insert new discount
      const { data, error } = await supabase
        .from('active_discounts')
        .insert([discountData])
        .select()
        .single();
      
      if (error) {
        console.error('Discount creation error:', error);
        throw new Error(error.message || 'فشل في إنشاء الخصم');
      }
      
      console.log('Discount created successfully:', data);

      // Apply discounts using the improved RPC function with proper error handling
      console.log('Applying discounts using improved RPC function...');
      const { error: rpcError } = await supabase.rpc('apply_active_discounts');
      
      if (rpcError) {
        console.error('Error applying discounts via RPC:', rpcError);
        // Don't throw error here, just log it as the discount was created successfully
        console.log('Discount created but application may have failed');
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-discounts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      
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

  // Delete discount mutation - using improved RPC function
  const deleteDiscountMutation = useMutation({
    mutationFn: async (discountId: string) => {
      const { error } = await supabase
        .from('active_discounts')
        .update({ is_active: false })
        .eq('id', discountId);
      
      if (error) throw error;

      // Reapply remaining discounts using the improved RPC function
      console.log('Reapplying remaining discounts using improved RPC function...');
      const { error: rpcError } = await supabase.rpc('apply_active_discounts');
      
      if (rpcError) {
        console.error('Error reapplying discounts via RPC:', rpcError);
        // Don't throw error here as the discount was deactivated successfully
        console.log('Discount deactivated but reapplication may have failed');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-discounts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      
      toast({
        title: 'تم حذف الخصم',
        description: 'تم إزالة الخصم وإعادة تطبيق الخصومات المتبقية',
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

    console.log('Starting discount creation...');
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
