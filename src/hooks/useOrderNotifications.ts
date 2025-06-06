
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationSound } from './useNotificationSound';
import { useToast } from './use-toast';

export const useOrderNotifications = () => {
  const { isAdmin } = useAuth();
  const { playNotificationSound, enableAudio } = useNotificationSound();
  const { toast } = useToast();
  const lastOrderCountRef = useRef<number | null>(null);
  const audioEnabledRef = useRef(false);

  // Enable audio on first user interaction
  useEffect(() => {
    const enableAudioOnInteraction = () => {
      if (!audioEnabledRef.current) {
        enableAudio();
        audioEnabledRef.current = true;
        console.log('🔊 Audio enabled for notifications');
      }
    };

    // Add listeners for user interaction
    document.addEventListener('click', enableAudioOnInteraction, { once: true });
    document.addEventListener('keydown', enableAudioOnInteraction, { once: true });
    document.addEventListener('touchstart', enableAudioOnInteraction, { once: true });

    return () => {
      document.removeEventListener('click', enableAudioOnInteraction);
      document.removeEventListener('keydown', enableAudioOnInteraction);
      document.removeEventListener('touchstart', enableAudioOnInteraction);
    };
  }, [enableAudio]);

  useEffect(() => {
    if (!isAdmin) return;

    console.log('Setting up order notifications for admin...');

    // جلب عدد الطلبات الحالي
    const fetchInitialOrderCount = async () => {
      try {
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
        
        lastOrderCountRef.current = count || 0;
        console.log('Initial order count:', count);
      } catch (error) {
        console.error('Error fetching initial order count:', error);
      }
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
          console.log('🆕 New order detected:', payload);
          
          // التحقق من حالة المتجر من قاعدة البيانات مباشرة
          try {
            const { data: settings } = await (supabase as any)
              .from('admin_settings')
              .select('is_store_open')
              .single();
            
            if (settings && !settings.is_store_open) {
              console.log('Store is closed, not processing notification');
              return;
            }
          } catch (error) {
            console.error('Error checking store status:', error);
            // في حالة خطأ، نستمر بالإشعار
          }
          
          // تشغيل صوت التنبيه مع تأخير قصير للتأكد من أن العملية مكتملة
          setTimeout(async () => {
            try {
              console.log('🔔 Playing notification sound for new order...');
              const soundPlayed = await playNotificationSound();
              if (soundPlayed) {
                console.log('✅ Notification sound played successfully');
              } else {
                console.log('⚠️ Sound failed, but fallback should have been triggered');
              }
            } catch (error) {
              console.error('❌ Error playing notification sound:', error);
            }
          }, 500);
          
          // عرض إشعار
          toast({
            title: "🔔 طلب جديد!",
            description: `تم استلام طلب جديد برقم: ${payload.new.id.slice(0, 8)}...`,
            duration: 8000,
          });
          
          // إرسال إشعار Telegram
          try {
            console.log('Sending Telegram notification...');
            const { data, error } = await supabase.functions.invoke('send-telegram-notification', {
              body: { orderId: payload.new.id }
            });
            
            if (error) {
              console.error('Error sending telegram notification:', error);
            } else {
              console.log('Telegram notification sent successfully:', data);
            }
          } catch (error) {
            console.error('Error invoking telegram function:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up order notifications...');
      supabase.removeChannel(channel);
    };
  }, [isAdmin, playNotificationSound, toast, enableAudio]);
};
