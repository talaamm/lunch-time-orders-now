
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminSettings } from '@/types/menu';

export const useAdminSettings = () => {
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    isOpen: true,
    message: "Welcome to the University Cafeteria!",
    authorizedIPs: []
  });
  const [loading, setLoading] = useState(true);

  // Fetch admin settings from Supabase
  const fetchAdminSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('Admin')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('Error fetching admin settings:', error);
        return;
      }

      if (data) {
        setAdminSettings({
          isOpen: data.status,
          message: data.message || "Welcome to the University Cafeteria!",
          authorizedIPs: [] // Keep this as empty array since we're not using auth
        });
      }
    } catch (error) {
      console.error('Error fetching admin settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update admin settings in Supabase
  const updateAdminSettings = async (newSettings: Partial<AdminSettings>) => {
    try {
      const { error } = await supabase
        .from('Admin')
        .update({
          status: newSettings.isOpen,
          message: newSettings.message
        })
        .eq('id', 1);

      if (error) {
        console.error('Error updating admin settings:', error);
        throw error;
      }

      // Update local state
      setAdminSettings(prev => ({ ...prev, ...newSettings }));
    } catch (error) {
      console.error('Error updating admin settings:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchAdminSettings();

    // Set up real-time subscription to listen for changes
    const channel = supabase
      .channel('admin-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Admin',
          filter: 'id=eq.1'
        },
        (payload) => {
          console.log('Admin settings changed:', payload);
          if (payload.new) {
            setAdminSettings({
              isOpen: payload.new.status,
              message: payload.new.message || "Welcome to the University Cafeteria!",
              authorizedIPs: []
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    adminSettings,
    loading,
    updateAdminSettings,
    refreshSettings: fetchAdminSettings
  };
};
