
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminSettings {
  is_store_open: boolean;
  visa_card_config: {
    enabled: boolean;
    merchant_id?: string;
    api_key?: string;
    secret_key?: string;
  };
  zain_cash_config: {
    enabled: boolean;
    merchant_id?: string;
    api_key?: string;
    secret_key?: string;
  };
}

export const useAdminSettings = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No settings exist, create default ones
          const defaultSettings = {
            is_store_open: true,
            visa_card_config: { enabled: false },
            zain_cash_config: { enabled: false }
          };
          
          const { data: newSettings, error: insertError } = await supabase
            .from('admin_settings')
            .insert(defaultSettings)
            .select()
            .single();
          
          if (insertError) throw insertError;
          return newSettings;
        }
        throw error;
      }
      
      return data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (newSettings: Partial<AdminSettings>) => {
      const { data, error } = await supabase
        .from('admin_settings')
        .upsert({
          ...newSettings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    }
  });

  return {
    data,
    isLoading,
    error,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending
  };
};
