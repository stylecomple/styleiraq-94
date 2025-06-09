
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Percent } from 'lucide-react';

interface GlobalDiscount {
  id: string;
  discount_percentage: number;
  is_active: boolean;
  created_at: string;
}

const SimpleDiscountManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);

  // Fetch current global discount
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

  // Apply global discount mutation - only creates discount record, doesn't update products
  const applyDiscountMutation = useMutation({
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
      
      setDiscountPercentage(0);
      
      toast({
        title: 'تم تطبيق الخصم',
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

  // Remove discount mutation - only deactivates discount record
  const removeDiscountMutation = useMutation({
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
        title: 'تم إزالة الخصم',
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

  const handleApplyDiscount = () => {
    if (discountPercentage <= 0 || discountPercentage > 100) {
      toast({
        title: 'خطأ',
        description: 'يجب أن تكون نسبة الخصم بين 1 و 100',
        variant: 'destructive',
      });
      return;
    }

    applyDiscountMutation.mutate(discountPercentage);
  };

  const handleRemoveDiscount = () => {
    removeDiscountMutation.mutate();
  };

  if (isLoading) {
    return <div className="text-center">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Current Discount Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5" />
            حالة الخصم الحالية
          </CardTitle>
        </CardHeader>
        <CardContent>
          {globalDiscount ? (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
              <div>
                <p className="font-semibold text-green-800">
                  خصم عام نشط: {globalDiscount.discount_percentage}%
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
                  onClick={handleRemoveDiscount}
                  disabled={removeDiscountMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">لا يوجد خصم نشط حالياً</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apply New Discount */}
      <Card>
        <CardHeader>
          <CardTitle>تطبيق خصم على سلة التسوق</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="discount-percentage">نسبة الخصم (%)</Label>
            <Input
              id="discount-percentage"
              type="number"
              min="1"
              max="100"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(Number(e.target.value))}
              placeholder="أدخل نسبة الخصم (1-100)"
            />
            <p className="text-sm text-gray-600 mt-1">
              سيظهر هذا الخصم في سلة التسوق للعملاء
            </p>
          </div>

          <Button 
            onClick={handleApplyDiscount}
            disabled={applyDiscountMutation.isPending || !discountPercentage}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {applyDiscountMutation.isPending ? 'جاري التطبيق...' : `تطبيق خصم ${discountPercentage}%`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleDiscountManagement;
