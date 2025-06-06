
import { useCallback } from 'react';

export const useNotificationSound = () => {
  const playNotificationSound = useCallback(() => {
    try {
      // إنشاء صوت تنبيه باستخدام Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // تردد الصوت (Hz)
      const frequency = 800;
      const duration = 0.3; // مدة الصوت بالثواني
      
      // إنشاء oscillator للصوت
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // ربط العقد
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // تكوين الصوت
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      // تكوين مستوى الصوت
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      // تشغيل الصوت
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
      
      // تكرار الصوت 3 مرات
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        oscillator2.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator2.type = 'sine';
        gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + duration);
      }, 400);
      
      setTimeout(() => {
        const oscillator3 = audioContext.createOscillator();
        const gainNode3 = audioContext.createGain();
        oscillator3.connect(gainNode3);
        gainNode3.connect(audioContext.destination);
        oscillator3.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator3.type = 'sine';
        gainNode3.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        oscillator3.start(audioContext.currentTime);
        oscillator3.stop(audioContext.currentTime + duration);
      }, 800);
      
    } catch (error) {
      console.error('Error playing notification sound:', error);
      // fallback: استخدام صوت النظام
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmIaAyjE8N2QQAoUXrPl76RQDwQ+ltryxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg=');
        audio.play();
      } catch (fallbackError) {
        console.error('Fallback audio failed:', fallbackError);
      }
    }
  }, []);

  return { playNotificationSound };
};
