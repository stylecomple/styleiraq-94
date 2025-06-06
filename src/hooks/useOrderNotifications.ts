
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
  const channelRef = useRef<any>(null);

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

    console.log('🔔 Setting up order notifications for admin...');

    // Cleanup existing channel if any
    if (channelRef.current) {
      console.log('🧹 Cleaning up existing channel...');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Fetch initial order count
    const fetchInitialOrderCount = async () => {
      try {
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
        
        lastOrderCountRef.current = count || 0;
        console.log('📊 Initial order count:', count);
      } catch (error) {
        console.error('❌ Error fetching initial order count:', error);
      }
    };

    fetchInitialOrderCount();

    // Set up real-time subscription with better error handling
    const setupChannel = () => {
      const channel = supabase
        .channel('orders-realtime', {
          config: {
            presence: {
              key: 'admin-notifications'
            }
          }
        })
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'orders'
          },
          async (payload) => {
            console.log('🆕 NEW ORDER DETECTED!', payload);
            
            // Check store status
            try {
              const { data: settings } = await (supabase as any)
                .from('admin_settings')
                .select('is_store_open')
                .single();
              
              if (settings && !settings.is_store_open) {
                console.log('🏪 Store is closed, skipping notification');
                return;
              }
            } catch (error) {
              console.error('⚠️ Error checking store status:', error);
            }
            
            // Play notification sound immediately
            console.log('🔔 Playing notification sound for new order...');
            try {
              const soundPlayed = await playNotificationSound();
              if (soundPlayed) {
                console.log('✅ Notification sound played successfully');
              } else {
                console.log('⚠️ Sound failed to play');
              }
            } catch (error) {
              console.error('❌ Error playing notification sound:', error);
            }
            
            // Show toast notification
            toast({
              title: "🔔 طلب جديد!",
              description: `تم استلام طلب جديد برقم: ${payload.new.id.slice(0, 8)}...`,
              duration: 8000,
            });
            
            // Send Telegram notification (existing functionality)
            try {
              console.log('📱 Sending Telegram notification...');
              const { data, error } = await supabase.functions.invoke('send-telegram-notification', {
                body: { orderId: payload.new.id }
              });
              
              if (error) {
                console.error('❌ Error sending telegram notification:', error);
              } else {
                console.log('✅ Telegram notification sent successfully:', data);
              }
            } catch (error) {
              console.error('❌ Error invoking telegram function:', error);
            }
          }
        )
        .subscribe((status, err) => {
          console.log('📡 Subscription status:', status);
          if (err) {
            console.error('❌ Subscription error:', err);
          }
          
          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully subscribed to order notifications');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Channel error, attempting to reconnect...');
            // Attempt to reconnect after a delay
            setTimeout(() => {
              if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
              }
              setupChannel();
            }, 5000);
          } else if (status === 'TIMED_OUT') {
            console.error('⏰ Subscription timed out, attempting to reconnect...');
            // Attempt to reconnect after a delay
            setTimeout(() => {
              if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
              }
              setupChannel();
            }, 2000);
          }
        });

      channelRef.current = channel;
      return channel;
    };

    // Initial setup
    setupChannel();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up order notifications...');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isAdmin, playNotificationSound, toast, enableAudio]);

  // Return a manual trigger function for testing
  const triggerTestNotification = async () => {
    console.log('🧪 Manually triggering test notification...');
    
    try {
      const soundPlayed = await playNotificationSound();
      if (soundPlayed) {
        console.log('✅ Test notification sound played successfully');
      }
    } catch (error) {
      console.error('❌ Error playing test notification:', error);
    }
    
    toast({
      title: "🔔 اختبار الإشعار",
      description: "هذا اختبار لنظام الإشعارات",
      duration: 4000,
    });
  };

  return { triggerTestNotification };
};
