
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useChangeLogger } from '@/hooks/useChangeLogger';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import OrdersManagement from './OrdersManagement';

const EnhancedOrdersManagement = () => {
  const { isOwner } = useAuth();
  const { logChange } = useChangeLogger();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteOrderMutation = useMutation({
    mutationFn: async (order: any) => {
      // First delete order items
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', order.id);
      
      if (orderItemsError) throw orderItemsError;

      // Then delete the order
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);
      
      if (error) throw error;

      // Log the change
      await logChange('order_deleted', 'order', order.id, {
        order_total: order.total_amount,
        order_status: order.status
      });

      return order;
    },
    onSuccess: (deletedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({
        title: 'تم حذف الطلب',
        description: 'تم حذف الطلب بنجاح',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل في حذف الطلب',
        variant: 'destructive',
      });
    }
  });

  // This component wraps the original OrdersManagement
  // For now, we'll just use the original component
  // You can enhance it later to show delete buttons for owners
  return <OrdersManagement />;
};

export default EnhancedOrdersManagement;
