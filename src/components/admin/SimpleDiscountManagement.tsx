
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
import { Percent, Square } from 'lucide-react';

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

  const applyDiscountMutation = useMutation({
    mutationFn: async (discount: number) => {
      console.log('Applying discount to all products:', discount);
      
      if (!user) throw new Error('User not authenticated');

      // Call the database function to update all products
      const { error } = await supabase.rpc('update_all_products_discount', {
        new_discount: discount
      });

      if (error) {
        console.error('Error applying discount:', error);
        throw new Error(`فشل في تطبيق الخصم: ${error.message}`);
      }

      console.log('Discount applied successfully to all products');
      return discount;
    },
    onSuccess: async (discount) => {
      console.log('Discount applied successfully:', discount);
      
      // Log the change
      try {
        await logChange('global_discount_applied', 'products', 'all_products', {
          discount_percentage: discount,
          operation: 'update_all_products'
        });
      } catch (logError) {
        console.error('Error logging change:', logError);
      }

      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['has-active-discount'] });
      queryClient.invalidateQueries({ queryKey: ['current-discount'] });
      
      toast({
        title: 'تم تطبيق الخصم',
        description: `تم تطبيق خصم ${discount}% على جميع المنتجات بنجاح`,
      });

      // Reset form
      setDiscountPercentage(0);
    },
    onError: (error: any) => {
      console.error('Discount application failed:', error);
      toast({
        title: 'خطأ في تطبيق الخصم',
        description: error.message || 'فشل في تطبيق الخصم. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    }
  });

  const stopDiscountMutation = useMutation({
    mutationFn: async () => {
      console.log('Stopping all discounts');
      
      if (!user) throw new Error('User not authenticated');

      // Call the database function to reset all products to 0 discount
      const { error } = await supabase.rpc('reset_all_product_discounts');

      if (error) {
        console.error('Error stopping discount:', error);
        throw new Error(`فشل في إيقاف الخصم: ${error.message}`);
      }

      console.log('All discounts stopped successfully');
      return true;
    },
    onSuccess: async () => {
      console.log('Discounts stopped successfully');
      
      // Log the change
      try {
        await logChange('global_discount_stopped', 'products', 'all_products', {
          operation: 'reset_all_discounts'
        });
      } catch (logError) {
        console.error('Error logging change:', logError);
      }

      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['has-active-discount'] });
      queryClient.invalidateQueries({ queryKey: ['current-discount'] });
      
      toast({
        title: 'تم إيقاف الخصم',
        description: 'تم إيقاف جميع الخصومات بنجاح',
      });
    },
    onError: (error: any) => {
      console.error('Error stopping discount:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إيقاف الخصم',
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

    console.log('Starting discount application with:', discountPercentage);
    applyDiscountMutation.mutate(discountPercentage);
  };

  const handleStopDiscount = () => {
    console.log('Starting discount stop');
    stopDiscountMutation.mutate();
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Apply Global Discount */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5" />
            تطبيق خصم على جميع المنتجات
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
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleApplyDiscount}
              disabled={applyDiscountMutation.isPending}
              className="flex-1"
            >
              {applyDiscountMutation.isPending ? 'جاري التطبيق...' : 'تطبيق الخصم على جميع المنتجات'}
            </Button>
            
            {hasActiveDiscount && (
              <Button
                variant="outline"
                onClick={handleStopDiscount}
                disabled={stopDiscountMutation.isPending}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Square className="w-4 h-4 mr-2" />
                {stopDiscountMutation.isPending ? 'جاري الإيقاف...' : 'إيقاف الخصم'}
              </Button>
            )}
          </div>

          {hasActiveDiscount && currentDiscountPercentage && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-800 font-medium">
                يوجد حالياً خصم {currentDiscountPercentage}% مطبق على جميع المنتجات
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleDiscountManagement;
