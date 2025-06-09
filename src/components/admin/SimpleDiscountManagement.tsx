
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useChangeLogger } from '@/hooks/useChangeLogger';
import { Percent, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SimpleDiscountManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { logChange } = useChangeLogger();
  
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Apply discount to all products mutation
  const applyGlobalDiscountMutation = useMutation({
    mutationFn: async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('المستخدم غير مسجل الدخول');
      }

      console.log(`Applying ${discountPercentage}% discount to all products globally...`);

      // Update all products with proper WHERE clause to avoid "update requires a where clause" error
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          discount_percentage: discountPercentage,
          updated_at: new Date().toISOString()
        })
        .gte('id', '00000000-0000-0000-0000-000000000000'); // This ensures we have a WHERE clause that matches all records

      if (updateError) {
        console.error('Error applying global discount:', updateError);
        throw updateError;
      }

      // Log the global discount application
      await logChange(
        'global_discount_applied',
        'products',
        'all_products',
        {
          discount_percentage: discountPercentage,
          operation: 'global_discount_update',
          affected_products: 'all'
        }
      );

      console.log(`Successfully applied ${discountPercentage}% discount to all products`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      
      setDiscountPercentage(0);
      setIsConfirmed(false);
      
      toast({
        title: 'تم تطبيق الخصم العام',
        description: `تم تطبيق خصم ${discountPercentage}% على جميع المنتجات في قاعدة البيانات`,
      });
    },
    onError: (error: any) => {
      console.error('Global discount application failed:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تطبيق الخصم العام',
        variant: 'destructive',
      });
    }
  });

  const handleApplyGlobalDiscount = () => {
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

    applyGlobalDiscountMutation.mutate();
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Percent className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">تطبيق خصم عام على جميع المنتجات</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              تحذير: هذه العملية ستطبق الخصم على جميع المنتجات في قاعدة البيانات بدون استثناء. 
              تأكد من نسبة الخصم قبل المتابعة.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="global-discount-percentage" className="text-sm md:text-base">
                نسبة الخصم العام (%)
              </Label>
              <Input
                id="global-discount-percentage"
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
                <span className="text-sm">أؤكد أنني أريد تطبيق هذا الخصم على جميع المنتجات</span>
              </label>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">معاينة العملية:</h4>
            <p className="text-sm text-gray-600">
              {discountPercentage > 0 
                ? `سيتم تطبيق خصم ${discountPercentage}% على جميع المنتجات في قاعدة البيانات`
                : 'سيتم إزالة جميع الخصومات من المنتجات (0% خصم)'
              }
            </p>
          </div>

          <Button 
            onClick={handleApplyGlobalDiscount}
            disabled={applyGlobalDiscountMutation.isPending || !isConfirmed}
            className="w-full bg-orange-600 hover:bg-orange-700 text-sm md:text-base"
            size="lg"
          >
            {applyGlobalDiscountMutation.isPending 
              ? 'جاري التطبيق...' 
              : `تطبيق خصم ${discountPercentage}% على جميع المنتجات`
            }
          </Button>

          {applyGlobalDiscountMutation.isPending && (
            <div className="text-center text-sm text-gray-600">
              يرجى الانتظار، جاري تحديث جميع المنتجات...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleDiscountManagement;
