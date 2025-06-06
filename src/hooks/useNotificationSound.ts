
import { useCallback } from 'react';
import useSound from 'use-sound';
import { supabase } from '@/integrations/supabase/client';

export const useNotificationSound = () => {
  // Default notification sound as a data URL
  const defaultSoundUrl = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmIaAyjE8N2QQAoUXrPl76RQDwQ+ltryxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg=";
  
  // Initialize useSound with default sound
  const [playDefaultSound] = useSound(defaultSoundUrl, {
    volume: 0.8,
  });

  const playNotificationSound = useCallback(async () => {
    console.log('Playing notification sound...');
    
    try {
      // Get settings from database to check for custom sound
      const { data: settings } = await (supabase as any)
        .from('admin_settings')
        .select('notification_sound_url')
        .single();
      
      if (settings?.notification_sound_url) {
        console.log('Using custom notification sound:', settings.notification_sound_url);
        // For custom sounds, we'll create a new audio instance
        const audio = new Audio(settings.notification_sound_url);
        audio.volume = 0.8;
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          return playPromise
            .then(() => {
              console.log('Custom notification sound played successfully');
              return true;
            })
            .catch(error => {
              console.log('Custom audio play failed, using default sound:', error);
              playDefaultSound();
              return true;
            });
        }
      } else {
        console.log('Using default notification sound');
        playDefaultSound();
        return Promise.resolve(true);
      }
      
      return Promise.resolve(true);
    } catch (error) {
      console.error('Error with notification sound, using default:', error);
      playDefaultSound();
      return Promise.resolve(true);
    }
  }, [playDefaultSound]);

  return { playNotificationSound };
};
