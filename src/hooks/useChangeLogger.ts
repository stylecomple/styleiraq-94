
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useChangeLogger = () => {
  const { user } = useAuth();

  const logChange = async (
    actionType: string,
    entityType: string,
    entityId?: string,
    details?: any
  ) => {
    if (!user) return;

    try {
      // Get admin name from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      await supabase
        .from('changes_log')
        .insert({
          admin_id: user.id,
          admin_name: profile?.full_name || user.email || 'Unknown',
          action_type: actionType,
          entity_type: entityType,
          entity_id: entityId,
          details: details
        });
    } catch (error) {
      console.error('Error logging change:', error);
    }
  };

  return { logChange };
};
