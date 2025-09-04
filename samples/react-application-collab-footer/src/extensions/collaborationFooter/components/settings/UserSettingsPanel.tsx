import * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DefaultButton,
  Stack,
  Text,
  Separator,
  Pivot,
  PivotItem,
  Dropdown,
  IDropdownOption,
  Toggle,
  Slider,
  SpinButton,
  MessageBar,
  MessageBarType,
  TooltipHost,
  Icon
} from '@fluentui/react';
import { BaseComponentContext } from '@microsoft/sp-component-base';
import { UserSettingsService } from '../../services/UserSettingsService';
import { 
  IUserSettings, 
  DisplayMode, 
  PillStyle, 
  Density, 
  SortOrder, 
  ClickBehavior,
  DEFAULT_USER_SETTINGS 
} from '../../types/UserSettings';
import styles from './UserSettingsPanel.module.scss';

export interface IUserSettingsPanelProps {
  context: BaseComponentContext;
  isOpen: boolean;
  onDismiss: () => void;
  onSettingsChanged: (settings: IUserSettings) => void;
  currentSettings?: IUserSettings;
}

export const UserSettingsPanel: React.FC<IUserSettingsPanelProps> = ({
  context,
  isOpen,
  onDismiss,
  onSettingsChanged,
  currentSettings
}) => {
  const [settings, setSettings] = useState<IUserSettings>(currentSettings || DEFAULT_USER_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: MessageBarType } | null>(null);
  const [settingsService] = useState(() => new UserSettingsService(context));
  const [storageInfo, setStorageInfo] = useState<{
    oneDriveAvailable: boolean;
    primaryStorage: 'OneDrive' | 'Local';
    lastSync: Date | null;
  } | null>(null);
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  // Load settings on mount
  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  // Auto-update when currentSettings prop changes
  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
  }, [currentSettings]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutsRef.current.clear();
    };
  }, []);

  // Safe timeout helper
  const safeSetTimeout = useCallback((callback: () => void, delay: number) => {
    const timeoutId = setTimeout(() => {
      timeoutsRef.current.delete(timeoutId);
      callback();
    }, delay);
    timeoutsRef.current.add(timeoutId);
    return timeoutId;
  }, []);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const userSettings = await settingsService.getSettings();
      setSettings(userSettings);
      
      // Also load storage info
      const info = await settingsService.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      setMessage({ text: 'Failed to load settings', type: MessageBarType.error });
    } finally {
      setIsLoading(false);
    }
  }, [settingsService]);


  const handleResetSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const success = await settingsService.resetToDefaults();
      if (success) {
        const defaultSettings = { ...DEFAULT_USER_SETTINGS };
        setSettings(defaultSettings);
        onSettingsChanged(defaultSettings);
        setMessage({ text: 'Settings reset to defaults', type: MessageBarType.success });
        safeSetTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ text: 'Failed to reset settings', type: MessageBarType.error });
      }
    } catch (error) {
      setMessage({ text: 'Error resetting settings', type: MessageBarType.error });
    } finally {
      setIsLoading(false);
    }
  }, [settingsService, onSettingsChanged, safeSetTimeout]);

  const updateSetting = useCallback(<K extends keyof IUserSettings>(
    key: K,
    value: IUserSettings[K]
  ) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      // Auto-save settings when they change
      safeSetTimeout(() => {
        settingsService.saveSettings(newSettings).then(success => {
          if (success) {
            onSettingsChanged(newSettings);
            setMessage({ text: 'Settings saved automatically', type: MessageBarType.success });
            safeSetTimeout(() => setMessage(null), 2000);
          }
        });
      }, 500); // Debounce saves
      return newSettings;
    });
  }, [settingsService, onSettingsChanged, safeSetTimeout]);

  const handleSyncFromOneDrive = useCallback(async () => {
    setIsLoading(true);
    try {
      const success = await settingsService.syncFromOneDrive();
      if (success) {
        await loadSettings(); // Refresh settings
        setMessage({ text: 'Settings synced from OneDrive successfully!', type: MessageBarType.success });
      } else {
        setMessage({ text: 'Failed to sync from OneDrive', type: MessageBarType.error });
      }
    } catch (error) {
      setMessage({ text: 'Error syncing from OneDrive', type: MessageBarType.error });
    } finally {
      setIsLoading(false);
      safeSetTimeout(() => setMessage(null), 3000);
    }
  }, [settingsService, loadSettings]);

  const handleSyncToOneDrive = useCallback(async () => {
    setIsLoading(true);
    try {
      const success = await settingsService.syncToOneDrive();
      if (success) {
        setMessage({ text: 'Settings synced to OneDrive successfully!', type: MessageBarType.success });
      } else {
        setMessage({ text: 'Failed to sync to OneDrive', type: MessageBarType.error });
      }
    } catch (error) {
      setMessage({ text: 'Error syncing to OneDrive', type: MessageBarType.error });
    } finally {
      setIsLoading(false);
      safeSetTimeout(() => setMessage(null), 3000);
    }
  }, [settingsService]);

  // Dropdown options
  const displayModeOptions: IDropdownOption[] = [
    { key: DisplayMode.FlatPills, text: 'Flat Pills (Current Style)' },
    { key: DisplayMode.CategoryDropdowns, text: 'Category Dropdowns' },
    { key: DisplayMode.TypeBasedDropdowns, text: 'Organizational & Personal Dropdowns' }
  ];

  const pillStyleOptions: IDropdownOption[] = [
    { key: PillStyle.Rounded, text: 'Rounded (Current)' },
    { key: PillStyle.Square, text: 'Square' },
    { key: PillStyle.Minimal, text: 'Minimal' }
  ];

  const densityOptions: IDropdownOption[] = [
    { key: Density.Compact, text: 'Compact' },
    { key: Density.Normal, text: 'Normal (Current)' },
    { key: Density.Spacious, text: 'Spacious' }
  ];

  const sortOrderOptions: IDropdownOption[] = [
    { key: SortOrder.Alphabetical, text: 'Alphabetical' },
    { key: SortOrder.UsageFrequency, text: 'Most Used First' },
    { key: SortOrder.DateAdded, text: 'Recently Added First' },
    { key: SortOrder.Manual, text: 'Manual Order' }
  ];

  const clickBehaviorOptions: IDropdownOption[] = [
    { key: ClickBehavior.NewTab, text: 'Open in New Tab' },
    { key: ClickBehavior.SameTab, text: 'Open in Same Tab' },
    { key: ClickBehavior.Popup, text: 'Open in Popup' }
  ];

  const iconSizeOptions: IDropdownOption[] = [
    { key: 'small', text: 'Small' },
    { key: 'medium', text: 'Medium (Current)' },
    { key: 'large', text: 'Large' }
  ];

  const syncFrequencyOptions: IDropdownOption[] = [
    { key: 'realtime', text: 'Real-time' },
    { key: 'hourly', text: 'Every Hour' },
    { key: 'daily', text: 'Daily' },
    { key: 'manual', text: 'Manual Only' }
  ];

  const renderDisplayModePreview = (mode: DisplayMode, showIcons = true) => {
    const pillClasses = [
      styles.previewPill,
      settings.pillStyle === PillStyle.Square ? styles.square : '',
      settings.pillStyle === PillStyle.Minimal ? styles.minimal : '',
      settings.density === Density.Compact ? styles.compact : 
        settings.density === Density.Spacious ? styles.spacious : ''
    ].filter(Boolean).join(' ');

    const previewContent = (() => {
      switch (mode) {
        case DisplayMode.FlatPills:
          return (
            <div className={styles.previewContent}>
              <div className={pillClasses}>
                {showIcons && settings.showIcons && '📊 '}SharePoint
                {settings.showBadges && <span className={styles.previewBadge}>New</span>}
              </div>
              <div className={pillClasses}>
                {showIcons && settings.showIcons && '👥 '}Teams
                {settings.showBadges && <span className={styles.previewBadge}>Popular</span>}
              </div>
              <div className={pillClasses}>
                {showIcons && settings.showIcons && '📝 '}OneNote
              </div>
              {settings.maxVisibleItems < 5 && (
                <div className={`${pillClasses} ${styles.showMorePill}`}>
                  +{5 - settings.maxVisibleItems} more
                </div>
              )}
            </div>
          );
        case DisplayMode.CategoryDropdowns:
          return (
            <div className={styles.previewContent}>
              <div className={styles.previewDropdown}>
                {showIcons && settings.showIcons && '🏢 '}HR Tools
              </div>
              <div className={styles.previewDropdown}>
                {showIcons && settings.showIcons && '💻 '}IT Resources
              </div>
              <div className={styles.previewDropdown}>
                {showIcons && settings.showIcons && '📈 '}Business Apps
              </div>
            </div>
          );
        case DisplayMode.TypeBasedDropdowns:
          return (
            <div className={styles.previewContent}>
              <div className={styles.previewDropdown}>
                {showIcons && settings.showIcons && '🏢 '}Organization Links
              </div>
              <div className={styles.previewDropdown}>
                {showIcons && settings.showIcons && '👤 '}Personal Links
              </div>
            </div>
          );
        default:
          return null;
      }
    })();

    return (
      <div className={styles.displayModePreview}>
        <div className={styles.previewTitle}>Live Preview</div>
        {previewContent}
      </div>
    );
  };

  const renderFullFooterPreview = () => (
    <div className={styles.fullFooterPreview}>
      <div className={styles.previewTitle}>Full Footer Preview</div>
      <div className={styles.previewFooterContainer}>
        <div className={styles.previewLinksSection}>
          {renderDisplayModePreview(settings.displayMode, true).props.children[1]}
        </div>
        <div className={styles.previewActionsSection}>
          <div className={styles.previewActionButton}>🔍</div>
          <div className={styles.previewActionButton}>⚙️</div>
          <div className={styles.previewActionButton}>👤</div>
        </div>
      </div>
    </div>
  );

  const renderDisplaySettings = () => (
    <Stack tokens={{ childrenGap: 16 }}>
      <Text variant="mediumPlus" className={styles.sectionTitle}>Display & Layout</Text>
      
      <Dropdown
        label="Display Mode"
        options={displayModeOptions}
        selectedKey={settings.displayMode}
        onChange={(_, option) => option && updateSetting('displayMode', option.key as DisplayMode)}
      />
      <Text variant="small" className={styles.settingsDescription}>
        Choose how links are organized and displayed
      </Text>
      {renderDisplayModePreview(settings.displayMode)}

      <Dropdown
        label="Pill Style"
        options={pillStyleOptions}
        selectedKey={settings.pillStyle}
        onChange={(_, option) => option && updateSetting('pillStyle', option.key as PillStyle)}
      />
      <Text variant="small" className={styles.settingsDescription}>
        Visual appearance of link buttons (applies to flat pills mode)
      </Text>
      {settings.displayMode === DisplayMode.FlatPills && renderDisplayModePreview(settings.displayMode)}

      <Dropdown
        label="Spacing Density"
        options={densityOptions}
        selectedKey={settings.density}
        onChange={(_, option) => option && updateSetting('density', option.key as Density)}
      />
      <Text variant="small" className={styles.settingsDescription}>
        How much space between elements
      </Text>

      <Toggle
        label="Show Icons"
        checked={settings.showIcons}
        onChange={(_, checked) => updateSetting('showIcons', !!checked)}
      />
      <Text variant="small" className={styles.settingsDescription}>
        Display icons next to link text
      </Text>

      {settings.showIcons && (
        <Dropdown
          label="Icon Size"
          options={iconSizeOptions}
          selectedKey={settings.iconSize}
          onChange={(_, option) => option && updateSetting('iconSize', option.key as 'small' | 'medium' | 'large')}
        />
      )}

      <Toggle
        label="Show Badges"
        checked={settings.showBadges}
        onChange={(_, checked) => updateSetting('showBadges', !!checked)}
      />
      <Text variant="small" className={styles.settingsDescription}>
        Display badges like 'New', 'Popular', etc.
      </Text>
    </Stack>
  );

  const renderOrganizationSettings = () => (
    <Stack tokens={{ childrenGap: 16 }}>
      <Text variant="mediumPlus" className={styles.sectionTitle}>Organization & Sorting</Text>
      
      <Dropdown
        label="Sort Order"
        options={sortOrderOptions}
        selectedKey={settings.sortOrder}
        onChange={(_, option) => option && updateSetting('sortOrder', option.key as SortOrder)}
      />
      <Text variant="small" className={styles.settingsDescription}>
        How links should be ordered
      </Text>

      <SpinButton
        label="Maximum Visible Items"
        min={1}
        max={50}
        step={1}
        value={settings.maxVisibleItems.toString()}
        onChange={(_, value) => updateSetting('maxVisibleItems', parseInt(value || '10'))}
      />
      <Text variant="small" className={styles.settingsDescription}>
        Number of links to show before 'Show More'
      </Text>

      <Toggle
        label="Enable Auto-categorization"
        checked={settings.enableAutoCategories}
        onChange={(_, checked) => updateSetting('enableAutoCategories', !!checked)}
      />
      <Text variant="small" className={styles.settingsDescription}>
        Automatically suggest categories for new personal links
      </Text>

      <Toggle
        label="Enable Quick Add"
        checked={settings.enableQuickAdd}
        onChange={(_, checked) => updateSetting('enableQuickAdd', !!checked)}
      />
      <Text variant="small" className={styles.settingsDescription}>
        Show quick add button in the footer
      </Text>
    </Stack>
  );

  const renderBehaviorSettings = () => (
    <Stack tokens={{ childrenGap: 20 }}>
      <Text variant="mediumPlus" className={styles.sectionTitle}>Interaction & Behavior</Text>
      
      <Stack tokens={{ childrenGap: 16 }}>
        <Dropdown
          label="Click Behavior"
          options={clickBehaviorOptions}
          selectedKey={settings.clickBehavior}
          onChange={(_, option) => option && updateSetting('clickBehavior', option.key as ClickBehavior)}
        />
        <Text variant="small" className={styles.settingsDescription}>
          How links should open when clicked
        </Text>

        <Toggle
          label="Enable Global Search"
          checked={settings.enableGlobalSearch}
          onChange={(_, checked) => updateSetting('enableGlobalSearch', !!checked)}
        />
        <Text variant="small" className={styles.settingsDescription}>
          Search across all links instead of current category
        </Text>

        <Toggle
          label="Enable Hover Effects"
          checked={settings.enableHoverEffects}
          onChange={(_, checked) => updateSetting('enableHoverEffects', !!checked)}
        />
        <Text variant="small" className={styles.settingsDescription}>
          Show animations and previews on hover
        </Text>

        <Toggle
          label="Enable Keyboard Navigation"
          checked={settings.enableKeyboardNavigation}
          onChange={(_, checked) => updateSetting('enableKeyboardNavigation', !!checked)}
        />
        <Text variant="small" className={styles.settingsDescription}>
          Navigate footer using keyboard shortcuts
        </Text>
      </Stack>

      <Separator />
      
      <Text variant="mediumPlus" className={styles.sectionTitle}>Storage & Sync</Text>
      
      {/* Storage Information */}
      {storageInfo && (
        <div className={styles.storageInfoSection}>
          <div className={styles.storageStatus}>
            <Icon 
              iconName={storageInfo.oneDriveAvailable ? 'CloudDownload' : 'HardDriveGroup'} 
              className={storageInfo.oneDriveAvailable ? styles.oneDriveIcon : styles.localIcon}
            />
            <Text variant="small">
              Primary Storage: <strong>{storageInfo.primaryStorage}</strong>
              {storageInfo.oneDriveAvailable ? ' (Settings sync across devices)' : ' (Local browser only)'}
            </Text>
          </div>
          
          {storageInfo.oneDriveAvailable && (
            <Stack horizontal tokens={{ childrenGap: 8 }}>
              <DefaultButton
                text="Sync from OneDrive"
                iconProps={{ iconName: 'CloudDownload' }}
                onClick={handleSyncFromOneDrive}
                disabled={isLoading}
              />
              <DefaultButton
                text="Sync to OneDrive"
                iconProps={{ iconName: 'CloudUpload' }}
                onClick={handleSyncToOneDrive}
                disabled={isLoading}
              />
            </Stack>
          )}
          
          {!storageInfo.oneDriveAvailable && (
            <Text variant="small" className={styles.storageWarning}>
              <Icon iconName="Warning" /> OneDrive not available. Settings will only be saved locally in this browser.
            </Text>
          )}
        </div>
      )}

      <Stack tokens={{ childrenGap: 16 }}>
        <Dropdown
          label="OneDrive Sync Frequency"
          options={syncFrequencyOptions}
          selectedKey={settings.syncFrequency}
          onChange={(_, option) => option && updateSetting('syncFrequency', option.key as any)}
          disabled={!storageInfo?.oneDriveAvailable}
        />
        <Text variant="small" className={styles.settingsDescription}>
          How often to sync personal links with OneDrive {!storageInfo?.oneDriveAvailable ? '(OneDrive not available)' : ''}
        </Text>

        <div className={styles.sliderContainer}>
          <Text variant="medium">Cache Duration: {settings.cacheDuration} minutes</Text>
          <Slider
            min={5}
            max={1440}
            step={5}
            value={settings.cacheDuration}
            onChange={(value) => updateSetting('cacheDuration', value)}
            showValue={false}
          />
          <Text variant="small" className={styles.sliderDescription}>
            How long to store links in browser memory (5 minutes to 24 hours)
          </Text>
        </div>

        <SpinButton
          label="Recent Items Count"
          min={0}
          max={20}
          step={1}
          value={settings.recentItemsCount.toString()}
          onChange={(_, value) => updateSetting('recentItemsCount', parseInt(value || '5'))}
        />
        <Text variant="small" className={styles.settingsDescription}>
          Number of recently used links to track
        </Text>

        <Toggle
          label="Enable Analytics"
          checked={settings.enableAnalytics}
          onChange={(_, checked) => updateSetting('enableAnalytics', !!checked)}
        />
        <Text variant="small" className={styles.settingsDescription}>
          Help improve the footer by sharing anonymous usage data
        </Text>
      </Stack>
    </Stack>
  );

  // Footer removed - settings auto-save when changed

  return (
    <div className={styles.userSettingsPanel}>
      <Stack tokens={{ childrenGap: 16 }}>
        {message && (
          <MessageBar
            messageBarType={message.type}
            onDismiss={() => setMessage(null)}
            dismissButtonAriaLabel="Close message"
          >
            {message.text}
          </MessageBar>
        )}

        <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
          <Text variant="medium">
            Customize how the collaboration footer works for you. Settings are automatically saved.
          </Text>
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            <TooltipHost content="Reset all settings to defaults">
              <DefaultButton
                iconProps={{ iconName: 'Refresh' }}
                text="Reset"
                onClick={handleResetSettings}
                disabled={isLoading}
              />
            </TooltipHost>
            <TooltipHost content="Import settings from file">
              <DefaultButton
                iconProps={{ iconName: 'CloudImportExport' }}
                text="Import"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.json';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = async (e) => {
                        try {
                          const settingsJson = e.target?.result as string;
                          const success = await settingsService.importSettings(settingsJson);
                          if (success) {
                            await loadSettings();
                            setMessage({ text: 'Settings imported successfully!', type: MessageBarType.success });
                            safeSetTimeout(() => setMessage(null), 3000);
                          } else {
                            setMessage({ text: 'Failed to import settings', type: MessageBarType.error });
                          }
                        } catch (error) {
                          setMessage({ text: 'Invalid settings file', type: MessageBarType.error });
                        }
                      };
                      reader.readAsText(file);
                    }
                  };
                  input.click();
                }}
              />
            </TooltipHost>
            <TooltipHost content="Export settings to file">
              <DefaultButton
                iconProps={{ iconName: 'CloudExportImport' }}
                text="Export"
                onClick={() => {
                  settingsService.exportSettings().then(json => {
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'collaboration-footer-settings.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  });
                }}
              />
            </TooltipHost>
          </Stack>
        </Stack>

        <Separator />

        <Pivot>
          <PivotItem headerText="Display" itemIcon="View">
            <Stack tokens={{ childrenGap: 20 }}>
              {renderFullFooterPreview()}
              <Separator />
              {renderDisplaySettings()}
            </Stack>
          </PivotItem>
          <PivotItem headerText="Organization" itemIcon="Sort">
            {renderOrganizationSettings()}
          </PivotItem>
          <PivotItem headerText="Behavior & Storage" itemIcon="Settings">
            {renderBehaviorSettings()}
          </PivotItem>
        </Pivot>
      </Stack>
    </div>
  );
};