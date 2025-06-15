
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
  const [settingsVersion, setSettingsVersion] = useState(0);

  // Update admin settings state and notify service worker
  const updateSettingsState = useCallback((newSettings: AdminSettings) => {
    console.log('Updating admin settings state:', newSettings);
    setAdminSettings(newSettings);
    setSettingsVersion(prev => prev + 1);
    console.log('Settings version updated to:', settingsVersion + 1);
    
    // Notify service worker about settings changes
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      console.log('Notifying service worker of settings change:', newSettings);
      navigator.serviceWorker.controller.postMessage({
        type: 'ADMIN_SETTINGS_CHANGED',
        settings: newSettings
      });
    }
  }, [settingsVersion]);

  // Fetch admin settings from Supabase
  const fetchAdminSettings = useCallback(async () => {
    console.log('Fetching admin settings from Supabase...');
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
        console.log('Fetched admin settings data:', data);
        const newSettings = {
          isOpen: data.status,
          message: data.message || "Welcome to the University Cafeteria!",
          authorizedIPs: []
        };
        console.log('Converted settings:', newSettings);
        updateSettingsState(newSettings);
      }
    } catch (error) {
      console.error('Error fetching admin settings:', error);
    } finally {
      setLoading(false);
    }
  }, [updateSettingsState]);

  // Update admin settings in Supabase
  const updateAdminSettings = async (newSettings: Partial<AdminSettings>) => {
    console.log('Updating admin settings in Supabase:', newSettings);
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

      console.log('Successfully updated admin settings in Supabase');

      // Update local state immediately
      const updatedSettings = { ...adminSettings, ...newSettings };
      updateSettingsState(updatedSettings);
    } catch (error) {
      console.error('Error updating admin settings:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('useAdminSettings hook initializing...');
    fetchAdminSettings();

    // Listen for messages from service worker
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      console.log('Received message from service worker:', event.data);
      if (event.data && event.data.type === 'ADMIN_SETTINGS_UPDATE') {
        console.log('Applying admin settings update from service worker:', event.data.data);
        setAdminSettings(event.data.data);
        setSettingsVersion(prev => prev + 1);
      }
    };

    // Register service worker message listener
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    // Set up real-time subscription to listen for changes
    console.log('Setting up real-time subscription for admin settings...');
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
          console.log('🔥 Real-time admin settings change detected:', payload);
          console.log('Event type:', payload.eventType);
          console.log('New data:', payload.new);
          console.log('Old data:', payload.old);
          
          // Type guard to ensure payload.new exists and has the expected properties
          if (payload.new && typeof payload.new === 'object' && 'status' in payload.new) {
            const newData = payload.new as { status: boolean; message?: string };
            const newSettings = {
              isOpen: newData.status,
              message: newData.message || "Welcome to the University Cafeteria!",
              authorizedIPs: []
            };
            console.log('🔄 Forcing immediate state update from real-time subscription:', newSettings);
            setAdminSettings(newSettings);
            setSettingsVersion(prev => {
              const newVersion = prev + 1;
              console.log('🔢 Settings version updated to:', newVersion);
              return newVersion;
            });
            
            // Still notify service worker for PWA users
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
              console.log('📡 Notifying service worker from real-time update');
              navigator.serviceWorker.controller.postMessage({
                type: 'ADMIN_SETTINGS_CHANGED',
                settings: newSettings
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up useAdminSettings hook...');
      supabase.removeChannel(channel);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, [fetchAdminSettings]);

  return {
    adminSettings,
    loading,
    updateAdminSettings,
    refreshSettings: fetchAdminSettings,
    settingsVersion
  };
};
