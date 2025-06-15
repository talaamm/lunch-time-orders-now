
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminSettings } from '@/types/menu';

export const useAdminSettings = () => {
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    isOpen: true,
    message: "Welcome to the University Cafeteria!",
    authorizedIPs: []
  });
  const [loading, setLoading] = useState(true);

  // Notify service worker about settings changes
  const notifyServiceWorker = useCallback((settings: AdminSettings) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      console.log('Notifying service worker of settings change:', settings);
      navigator.serviceWorker.controller.postMessage({
        type: 'ADMIN_SETTINGS_CHANGED',
        settings: settings
      });
    }
  }, []);

  // Update admin settings state and notify service worker
  const updateSettingsState = useCallback((newSettings: AdminSettings) => {
    console.log('Updating admin settings state:', newSettings);
    setAdminSettings(newSettings);
    notifyServiceWorker(newSettings);
  }, [notifyServiceWorker]);

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
        updateSettingsState(newSettings);
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

      // Update local state and notify service worker
      const updatedSettings = { ...adminSettings, ...newSettings };
      updateSettingsState(updatedSettings);
    } catch (error) {
      console.error('Error updating admin settings:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchAdminSettings();

    // Listen for messages from service worker
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      console.log('Received message from service worker:', event.data);
      if (event.data && event.data.type === 'ADMIN_SETTINGS_UPDATE') {
        console.log('Applying admin settings update from service worker:', event.data.data);
        setAdminSettings(event.data.data);
      }
    };

    // Register service worker message listener
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
          console.log('Real-time admin settings change detected:', payload);
          // Type guard to ensure payload.new exists and has the expected properties
          if (payload.new && typeof payload.new === 'object' && 'status' in payload.new) {
            const newData = payload.new as { status: boolean; message?: string };
            const newSettings = {
              isOpen: newData.status,
              message: newData.message || "Welcome to the University Cafeteria!",
              authorizedIPs: []
            };
            updateSettingsState(newSettings);
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
  }, [updateSettingsState]);

  return {
    adminSettings,
    loading,
    updateAdminSettings,
    refreshSettings: fetchAdminSettings
  };
};
