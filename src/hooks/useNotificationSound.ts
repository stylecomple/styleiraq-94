
import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useNotificationSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio with a more reliable approach
  const initializeAudio = useCallback(() => {
    if (!audioRef.current) {
      // Create audio element with a simple beep sound as fallback
      const audio = new Audio();
      
      // Create a simple beep sound using Web Audio API as fallback
      const createBeepSound = () => {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = 800; // 800 Hz beep
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
          
          return true;
        } catch (error) {
          console.error('Web Audio API not supported:', error);
          return false;
        }
      };
      
      audioRef.current = {
        play: createBeepSound
      } as any;
    }
  }, []);

  const playNotificationSound = useCallback(async () => {
    console.log('🔊 Attempting to play notification sound...');
    
    try {
      // Initialize audio if not already done
      initializeAudio();
      
      // First, try to get custom sound from settings
      const { data: settings } = await (supabase as any)
        .from('admin_settings')
        .select('notification_sound_url')
        .single();
      
      let soundPlayed = false;
      
      // Try custom sound first
      if (settings?.notification_sound_url) {
        console.log('🎵 Trying custom notification sound:', settings.notification_sound_url);
        try {
          const customAudio = new Audio(settings.notification_sound_url);
          customAudio.volume = 0.8;
          customAudio.crossOrigin = 'anonymous';
          
          // Create a promise that resolves when audio plays or fails
          const playPromise = new Promise((resolve) => {
            const timeoutId = setTimeout(() => {
              console.log('❌ Custom sound timeout');
              resolve(false);
            }, 2000);
            
            customAudio.addEventListener('canplaythrough', () => {
              clearTimeout(timeoutId);
              customAudio.play()
                .then(() => {
                  console.log('✅ Custom sound played successfully');
                  resolve(true);
                })
                .catch(() => {
                  console.log('❌ Custom sound play failed');
                  resolve(false);
                });
            }, { once: true });
            
            customAudio.addEventListener('error', () => {
              clearTimeout(timeoutId);
              console.log('❌ Custom sound load error');
              resolve(false);
            }, { once: true });
          });
          
          soundPlayed = await playPromise as boolean;
        } catch (error) {
          console.error('Custom sound error:', error);
        }
      }
      
      // If custom sound failed, try Web Audio API beep
      if (!soundPlayed) {
        console.log('🔔 Playing fallback beep sound...');
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          
          // Resume audio context if suspended (required by some browsers)
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }
          
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          // Create a pleasant notification sound (two-tone beep)
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.15);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.4);
          
          console.log('✅ Beep sound played successfully');
          soundPlayed = true;
        } catch (error) {
          console.error('Web Audio API error:', error);
        }
      }
      
      // Last resort: try system notification sound
      if (!soundPlayed) {
        console.log('📢 Trying system notification...');
        try {
          // Create a simple data URL beep
          const beepSound = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmIaAyjE8N2QQAoUXrPl76RQDwQ+ltryxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg=';
          const audio = new Audio(beepSound);
          audio.volume = 0.8;
          await audio.play();
          console.log('✅ System beep played successfully');
          soundPlayed = true;
        } catch (error) {
          console.error('System beep error:', error);
        }
      }
      
      if (!soundPlayed) {
        console.error('❌ All sound methods failed');
        // Show a visual alert as last resort
        alert('🔔 New Order Received!');
      }
      
      return soundPlayed;
    } catch (error) {
      console.error('❌ Notification sound error:', error);
      // Show visual alert as fallback
      alert('🔔 New Order Received!');
      return false;
    }
  }, [initializeAudio]);

  // Pre-initialize audio on user interaction
  const enableAudio = useCallback(() => {
    initializeAudio();
    // Try to unlock audio context
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
    } catch (error) {
      console.log('Audio context initialization failed:', error);
    }
  }, [initializeAudio]);

  return { playNotificationSound, enableAudio };
};
