import { supabase } from '../lib/supabase';
import type { Profile } from '../types/auth.types';

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, parent:parent_id(*)')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  async getSubordinates(userId: string): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_subordinates', { user_id: userId });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subordinates:', error);
      return [];
    }
  }
};