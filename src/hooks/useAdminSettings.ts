
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';

export interface AdminSettings {
  id?: string;
  notification_sound_url?: string;
  is_store_open: boolean;
  email_receiver?: string;
  created_at?: string;
  updated_at?: string;
}

export const useAdminSettings = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<AdminSettings>({
    is_store_open: true,
    notification_sound_url: undefined,
    email_receiver: 'mujtabadrop@gmail.com'
  });
  const [loading, setLoading] = useState(false);

  // Fetch current settings
  const fetchSettings = async () => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      // Use type assertion since the types haven't been regenerated yet
      const { data, error } = await (supabase as any)
        .from('admin_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching admin settings:', error);
        return;
      }

      if (data) {
        setSettings(data as AdminSettings);
      }
    } catch (error) {
      console.error('Error fetching admin settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save settings
  const saveSettings = async (newSettings: Partial<AdminSettings>) => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      
      // Use type assertion since the types haven't been regenerated yet
      const { data, error } = await (supabase as any)
        .from('admin_settings')
        .upsert({
          ...settings,
          ...newSettings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving admin settings:', error);
        toast({
          title: "خطأ",
          description: "حدث خطأ في حفظ الإعدادات",
          variant: "destructive",
        });
        return;
      }

      setSettings(data as AdminSettings);
      toast({
        title: "تم الحفظ",
        description: "تم حفظ الإعدادات بنجاح",
      });
    } catch (error) {
      console.error('Error saving admin settings:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ الإعدادات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [isAdmin]);

  return {
    settings,
    loading,
    saveSettings,
    fetchSettings
  };
};
