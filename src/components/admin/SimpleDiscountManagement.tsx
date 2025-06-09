
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useChangeLogger } from '@/hooks/useChangeLogger';
import { useAuth } from '@/contexts/AuthContext';
import { Percent, Square, AlertTriangle } from 'lucide-react';

const SimpleDiscountManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { logChange } = useChangeLogger();
  const queryClient = useQueryClient();
  
  const [discountPercentage, setDiscountPercentage] = useState(0);

  // Check if there are any active discounts
  const { data: hasActiveDiscount, isLoading } = useQuery({
    queryKey: ['has-active-discount'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('discount_percentage')
        .gt('discount_percentage', 0)
        .limit(1);
      
      if (error) throw error;
      return data && data.length > 0;
    }
  });

  // Get current discount percentage if any
  const { data: currentDiscountPercentage } = useQuery({
    queryKey: ['current-discount'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('discount_percentage')
        .gt('discount_percentage', 0)
        .limit(1);
      
      if (error) throw error;
      return data && data.length > 0 ? data[0].discount_percentage : 0;
    },
    enabled: !!hasActiveDiscount
  });

  // Get total products count for confirmation
  const { data: totalProducts } = useQuery({
    queryKey: ['total-products'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  const applyDiscountMutation = useMutation({
    mutationFn: async (discount: number) => {
      console.log('Applying global discount to ALL products:', discount);
      
      if (!user) throw new Error('User not authenticated');

      // Call the database function to update ALL products (unsafe update)
      const { error } = await supabase.rpc('update_all_products_discount', {
        new_discount: discount
      });

      if (error) {
        console.error('Error applying global discount:', error);
        throw new Error(`فشل في تطبيق الخصم العام: ${error.message}`);
      }

      console.log(`Global discount ${discount}% applied successfully to ALL products`);
      return discount;
    },
    onSuccess: async (discount) => {
      console.log('Global discount applied successfully:', discount);
      
      // Log the unsafe operation
      try {
        await logChange('unsafe_global_discount_applied', 'products', 'ALL_PRODUCTS', {
          discount_percentage: discount,
          operation: 'update_all_products_without_where_clause',
          affected_products: totalProducts,
          timestamp: new Date().toISOString()
        });
      } catch (logError) {
        console.error('Error logging unsafe operation:', logError);
      }

      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['has-active-discount'] });
      queryClient.invalidateQueries({ queryKey: ['current-discount'] });
      
      toast({
        title: 'تم تطبيق الخصم العام',
        description: `تم تطبيق خصم ${discount}% على جميع المنتجات (${totalProducts} منتج) بنجاح`,
      });

      setDiscountPercentage(0);
    },
    onError: (error: any) => {
      console.error('Global discount application failed:', error);
      toast({
        title: 'خطأ في تطبيق الخصم العام',
        description: error.message || 'فشل في تطبيق الخصم على جميع المنتجات',
        variant: 'destructive',
      });
    }
  });

  const stopDiscountMutation = useMutation({
    mutationFn: async () => {
      console.log('Stopping ALL discounts (unsafe operation)');
      
      if (!user) throw new Error('User not authenticated');

      // Call the database function to reset ALL products to 0 discount
      const { error } = await supabase.rpc('reset_all_product_discounts');

      if (error) {
        console.error('Error stopping all discounts:', error);
        throw new Error(`فشل في إيقاف جميع الخصومات: ${error.message}`);
      }

      console.log('All discounts stopped successfully');
      return true;
    },
    onSuccess: async () => {
      console.log('All discounts stopped successfully');
      
      // Log the unsafe operation
      try {
        await logChange('unsafe_global_discount_stopped', 'products', 'ALL_PRODUCTS', {
          operation: 'reset_all_discounts_without_where_clause',
          affected_products: totalProducts,
          timestamp: new Date().toISOString()
        });
      } catch (logError) {
        console.error('Error logging unsafe operation:', logError);
      }

      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['has-active-discount'] });
      queryClient.invalidateQueries({ queryKey: ['current-discount'] });
      
      toast({
        title: 'تم إيقاف جميع الخصومات',
        description: `تم إيقاف جميع الخصومات من ${totalProducts} منتج بنجاح`,
      });
    },
    onError: (error: any) => {
      console.error('Error stopping discounts:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إيقاف جميع الخصومات',
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

    console.log('Starting unsafe global discount application with:', discountPercentage);
    applyDiscountMutation.mutate(discountPercentage);
  };

  const handleStopDiscount = () => {
    console.log('Starting unsafe global discount removal');
    stopDiscountMutation.mutate();
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Global Discount Warning */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="w-5 h-5" />
            تحذير: عملية خصم عامة على جميع المنتجات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700 text-sm">
            هذه العملية ستقوم بتحديث جميع المنتجات في قاعدة البيانات ({totalProducts} منتج) بدون استثناء. 
            هذه عملية غير آمنة ولا يمكن التراجع عنها بسهولة.
          </p>
        </CardContent>
      </Card>

      {/* Apply Global Discount */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5" />
            تطبيق خصم عام على جميع المنتجات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <p className="text-sm text-gray-600 mt-1">
                سيتم تطبيق هذا الخصم على جميع المنتجات ({totalProducts} منتج)
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleApplyDiscount}
              disabled={applyDiscountMutation.isPending}
              className="flex-1"
            >
              {applyDiscountMutation.isPending ? 'جاري التطبيق...' : `تطبيق خصم ${discountPercentage}% على جميع المنتجات`}
            </Button>
            
            {hasActiveDiscount && (
              <Button
                variant="outline"
                onClick={handleStopDiscount}
                disabled={stopDiscountMutation.isPending}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Square className="w-4 h-4 mr-2" />
                {stopDiscountMutation.isPending ? 'جاري الإيقاف...' : 'إيقاف جميع الخصومات'}
              </Button>
            )}
          </div>

          {hasActiveDiscount && currentDiscountPercentage && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-800 font-medium">
                يوجد حالياً خصم {currentDiscountPercentage}% مطبق على جميع المنتجات ({totalProducts} منتج)
              </p>
            </div>
          )}

          {/* Operation Log Info */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm">
              <strong>معلومات العملية:</strong> جميع العمليات يتم تسجيلها في سجل التغييرات مع تفاصيل المنتجات المتأثرة والتوقيت.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleDiscountManagement;
