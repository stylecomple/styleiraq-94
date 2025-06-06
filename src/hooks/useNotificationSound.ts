
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useNotificationSound = () => {
  const playNotificationSound = useCallback(async () => {
    console.log('Playing notification sound...');
    
    try {
      // جلب الإعدادات من قاعدة البيانات مباشرة
      const { data: settings } = await (supabase as any)
        .from('admin_settings')
        .select('notification_sound_url')
        .single();
      
      // Use custom sound if available, otherwise use default
      const audio = new Audio();
      
      if (settings?.notification_sound_url) {
        console.log('Using custom notification sound:', settings.notification_sound_url);
        audio.src = settings.notification_sound_url;
      } else {
        console.log('Using default notification sound');
        audio.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmIaAyjE8N2QQAoUXrPl76RQDwQ+ltryxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg=";
      }
      
      audio.volume = 0.8;
      
      // تشغيل الصوت مع معالجة الأخطاء
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        return playPromise
          .then(() => {
            console.log('Notification sound played successfully');
            return true;
          })
          .catch(error => {
            console.log('Audio play failed, trying Web Audio API fallback:', error);
            // استخدام Web Audio API كبديل
            return playWebAudioNotification();
          });
      }
      
      return Promise.resolve(true);
    } catch (error) {
      console.error('Error with audio playback, using Web Audio API:', error);
      return playWebAudioNotification();
    }
  }, []);

  const playWebAudioNotification = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // إنشاء ثلاث نغمات متتالية
      const playBeep = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      const currentTime = audioContext.currentTime;
      playBeep(800, currentTime, 0.2);
      playBeep(1000, currentTime + 0.3, 0.2);
      playBeep(800, currentTime + 0.6, 0.2);
      
      console.log('Web Audio notification played');
      return Promise.resolve(true);
    } catch (error) {
      console.error('Web Audio API failed:', error);
      return Promise.resolve(false);
    }
  };

  return { playNotificationSound };
};
