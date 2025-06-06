
import { useCallback } from 'react';
import { useAdminSettings } from './useAdminSettings';

export const useNotificationSound = () => {
  const { settings } = useAdminSettings();

  const playNotificationSound = useCallback(() => {
    console.log('Playing notification sound...');
    
    try {
      // Use custom sound if available, otherwise use default
      const audio = new Audio();
      
      if (settings.notification_sound_url) {
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
        playPromise
          .then(() => {
            console.log('Notification sound played successfully');
          })
          .catch(error => {
            console.log('Audio play failed, trying Web Audio API fallback:', error);
            // استخدام Web Audio API كبديل
            playWebAudioNotification();
          });
      }
    } catch (error) {
      console.error('Error with audio playback, using Web Audio API:', error);
      playWebAudioNotification();
    }
  }, [settings.notification_sound_url]);

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
    } catch (error) {
      console.error('Web Audio API failed:', error);
    }
  };

  return { playNotificationSound };
};
