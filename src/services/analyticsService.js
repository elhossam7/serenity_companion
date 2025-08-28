import { supabase } from '../lib/supabase';

export const analyticsService = {
  async recordSatisfaction({ userId, resourceId, rating, minutes, satisfaction }) {
    try {
      const { data, error } = await supabase
        ?.from('satisfaction_logs')
        ?.insert({ user_id: userId, resource_id: resourceId, rating, minutes, satisfaction })
        ?.select()
        ?.single();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to record satisfaction' };
    }
  }
};
