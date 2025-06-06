
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationSound } from './useNotificationSound';
import { useToast } from './use-toast';

export const useOrderNotifications = () => {
  const { isAdmin } = useAuth();
  const { playNotificationSound } = useNotificationSound();
  const { toast } = useToast();
  const lastOrderCountRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    // جلب عدد الطلبات الحالي
    const fetchInitialOrderCount = async () => {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      lastOrderCountRef.current = count || 0;
    };

    fetchInitialOrderCount();

    // الاستماع للطلبات الجديدة
    const channel = supabase
      .channel('new-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          console.log('New order detected:', payload);
          
          // تشغيل صوت التنبيه
          playNotificationSound();
          
          // عرض إشعار
          toast({
            title: "طلب جديد!",
            description: `تم استلام طلب جديد برقم: ${payload.new.id.slice(0, 8)}...`,
            duration: 5000,
          });
          
          // إرسال إشعار Telegram
          try {
            await supabase.functions.invoke('send-telegram-notification', {
              body: { orderId: payload.new.id }
            });
          } catch (error) {
            console.error('Error sending telegram notification:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, playNotificationSound, toast]);
};
