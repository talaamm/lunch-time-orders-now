
import React, { useState, useEffect } from 'react';
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
        const newSettings = {
          isOpen: data.status,
          message: data.message || "Welcome to the University Cafeteria!",
          authorizedIPs: []
        };
        setAdminSettings(newSettings);
        
        // Notify service worker about settings change
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'ADMIN_SETTINGS_CHANGED',
            settings: newSettings
          });
        }
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
      const updatedSettings = { ...adminSettings, ...newSettings };
      setAdminSettings(updatedSettings);
      
      // Notify service worker about settings change
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'ADMIN_SETTINGS_CHANGED',
          settings: updatedSettings
        });
      }
    } catch (error) {
      console.error('Error updating admin settings:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchAdminSettings();

    // Listen for messages from service worker
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'ADMIN_SETTINGS_UPDATE') {
        console.log('Received admin settings update from service worker:', event.data.data);
        setAdminSettings(event.data.data);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

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
          // Type guard to ensure payload.new exists and has the expected properties
          if (payload.new && typeof payload.new === 'object' && 'status' in payload.new) {
            const newData = payload.new as { status: boolean; message?: string };
            const newSettings = {
              isOpen: newData.status,
              message: newData.message || "Welcome to the University Cafeteria!",
              authorizedIPs: []
            };
            setAdminSettings(newSettings);
            
            // Notify service worker about settings change
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'ADMIN_SETTINGS_CHANGED',
                settings: newSettings
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);

  return {
    adminSettings,
    loading,
    updateAdminSettings,
    refreshSettings: fetchAdminSettings
  };
};
