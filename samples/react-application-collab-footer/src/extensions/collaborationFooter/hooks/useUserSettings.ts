import { useState, useEffect, useCallback, useRef } from 'react';
import { BaseComponentContext } from '@microsoft/sp-component-base';
import { IUserSettings, DEFAULT_USER_SETTINGS } from '../types/UserSettings';
import { UserSettingsService } from '../services/UserSettingsService';

export interface IUseUserSettingsResult {
  settings: IUserSettings;
  isLoading: boolean;
  error: string | null;
  updateSettings: (newSettings: IUserSettings) => Promise<boolean>;
  resetSettings: () => Promise<boolean>;
  refreshSettings: () => Promise<void>;
}

/**
 * Custom hook for managing user settings
 */
export const useUserSettings = (context: BaseComponentContext): IUseUserSettingsResult => {
  const [settings, setSettings] = useState<IUserSettings>(DEFAULT_USER_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsService] = useState(() => new UserSettingsService(context));

  // Store settingsService in a ref to avoid dependency issues
  const settingsServiceRef = useRef(settingsService);
  
  // Update the ref when settingsService changes
  useEffect(() => {
    settingsServiceRef.current = settingsService;
  }, [settingsService]);

  const refreshSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userSettings = await settingsServiceRef.current.getSettings();
      setSettings({ ...userSettings }); // Force new object reference
    } catch (err) {
      setError('Failed to load user settings');
      console.error('Error loading user settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []); // ✅ FIXED: No dependencies needed

  // Load settings on mount
  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const updateSettings = useCallback(async (newSettings: IUserSettings): Promise<boolean> => {
    setError(null);
    try {
      // Immediately update local state for instant UI feedback
      setSettings({ ...newSettings }); 
      
      const success = await settingsServiceRef.current.saveSettings(newSettings);
      if (success) {
        // Force another update to ensure rendering with timestamp for guaranteed change detection
        setSettings({ ...newSettings, version: newSettings.version + '-' + Date.now() });
        return true;
      } else {
        // Revert on failure
        await refreshSettings();
        setError('Failed to save settings');
        return false;
      }
    } catch (err) {
      // Revert on error
      await refreshSettings();
      setError('Error saving settings');
      console.error('Error saving user settings:', err);
      return false;
    }
  }, [refreshSettings]); // ✅ FIXED: Only depend on refreshSettings

  const resetSettings = useCallback(async (): Promise<boolean> => {
    setError(null);
    try {
      const success = await settingsServiceRef.current.resetToDefaults();
      if (success) {
        setSettings({ ...DEFAULT_USER_SETTINGS }); // Already creates new reference
        return true;
      } else {
        setError('Failed to reset settings');
        return false;
      }
    } catch (err) {
      setError('Error resetting settings');
      console.error('Error resetting user settings:', err);
      return false;
    }
  }, []); // ✅ FIXED: No dependencies needed

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    resetSettings,
    refreshSettings
  };
};