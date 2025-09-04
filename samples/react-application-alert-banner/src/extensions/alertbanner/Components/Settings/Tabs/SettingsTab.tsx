import * as React from "react";
import { Add24Regular, LocalLanguage24Regular, Wrench24Regular, Globe24Regular } from "@fluentui/react-icons";
import {
  Card,
  CardHeader,
  CardPreview,
  Text,
  Checkbox,
  makeStyles,
  tokens
} from "@fluentui/react-components";
import {
  SharePointButton,
  SharePointInput,
  SharePointToggle,
  SharePointSection
} from "../../UI/SharePointControls";
import { SharePointAlertService, IRepairResult } from "../../Services/SharePointAlertService";
import { StorageService } from "../../Services/StorageService";
import LanguageFieldManager from "../../UI/LanguageFieldManager";
import { LanguageAwarenessService } from "../../Services/LanguageAwarenessService";
import { NotificationService } from "../../Services/NotificationService";
import ProgressIndicator, { StepStatus, IProgressStep } from "../../UI/ProgressIndicator";
import RepairDialog from "../../UI/RepairDialog";
import { logger } from '../../Services/LoggerService';
import styles from "../AlertSettings.module.scss";

const useCardStyles = makeStyles({
  languageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "12px",
    marginTop: "16px",
    marginRight: "20px"
  },
  languageItem: {
    padding: "12px 16px",
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: "6px",
    backgroundColor: tokens.colorNeutralBackground1,
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  languageInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  languageName: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200
  },
  languageCode: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground2
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  cardContent: {
    padding: "16px"
  },
  hintText: {
    marginTop: "12px",
    color: tokens.colorNeutralForeground2
  }
});

export interface ISettingsData {
  alertTypesJson: string;
  userTargetingEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface ISettingsTabProps {
  settings: ISettingsData;
  setSettings: React.Dispatch<React.SetStateAction<ISettingsData>>;
  alertsListExists: boolean | null;
  setAlertsListExists: React.Dispatch<React.SetStateAction<boolean | null>>;
  alertTypesListExists: boolean | null;
  setAlertTypesListExists: React.Dispatch<React.SetStateAction<boolean | null>>;
  isCheckingLists: boolean;
  setIsCheckingLists: React.Dispatch<React.SetStateAction<boolean>>;
  isCreatingLists: boolean;
  setIsCreatingLists: React.Dispatch<React.SetStateAction<boolean>>;
  alertService: SharePointAlertService;
  onSettingsChange: (settings: ISettingsData) => void;
  onLanguageChange?: (languages: string[]) => void;
  context?: any; // ApplicationCustomizerContext for notifications
}


const SettingsTab: React.FC<ISettingsTabProps> = ({
  settings,
  setSettings,
  alertsListExists,
  setAlertsListExists,
  alertTypesListExists,
  setAlertTypesListExists,
  isCheckingLists,
  setIsCheckingLists,
  isCreatingLists,
  setIsCreatingLists,
  alertService,
  onSettingsChange,
  onLanguageChange,
  context
}) => {
  const cardStyles = useCardStyles();
  const storageService = React.useRef<StorageService>(StorageService.getInstance());
  const [carouselEnabled, setCarouselEnabled] = React.useState(false);
  const [carouselInterval, setCarouselInterval] = React.useState(5);
  const [isRepairDialogOpen, setIsRepairDialogOpen] = React.useState(false);
  const [preCreationLanguages, setPreCreationLanguages] = React.useState<string[]>(['en-us']); // English selected by default
  const [creationSteps, setCreationSteps] = React.useState<IProgressStep[]>([]);
  const notificationService = React.useMemo(() => 
    context ? NotificationService.getInstance(context) : null, 
    [context]
  );

  // Load carousel settings from StorageService on mount
  React.useEffect(() => {
    const savedCarouselEnabled = storageService.current.getFromLocalStorage<boolean>('carouselEnabled');
    const savedCarouselInterval = storageService.current.getFromLocalStorage<number>('carouselInterval');
    
    if (savedCarouselEnabled !== null) {
      setCarouselEnabled(savedCarouselEnabled);
    }
    if (savedCarouselInterval && savedCarouselInterval >= 2000 && savedCarouselInterval <= 30000) {
      setCarouselInterval(savedCarouselInterval / 1000);
    }
  }, []);

  const handleCarouselEnabledChange = React.useCallback((checked: boolean) => {
    setCarouselEnabled(checked);
    storageService.current.saveToLocalStorage('carouselEnabled', checked);
    
    // Trigger a page refresh to apply changes
    setTimeout(() => window.location.reload(), 100);
  }, []);

  const handleCarouselIntervalChange = React.useCallback((value: string) => {
    const seconds = parseInt(value);
    if (seconds >= 2 && seconds <= 30) {
      setCarouselInterval(seconds);
      storageService.current.saveToLocalStorage('carouselInterval', seconds * 1000);
      
      // Trigger a page refresh to apply changes
      setTimeout(() => window.location.reload(), 100);
    }
  }, []);

  const handleSettingsChange = React.useCallback((newSettings: Partial<ISettingsData>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    onSettingsChange(updatedSettings);
  }, [settings, setSettings, onSettingsChange]);


  const checkListsExistence = React.useCallback(async () => {
    setIsCheckingLists(true);
    try {
      // Use the new detailed check method
      const listStatus = await alertService.checkListsNeeded();
      const currentSite = listStatus[0]; // Should be current site
      
      if (currentSite) {
        setAlertsListExists(currentSite.needsAlerts ? false : true);
        setAlertTypesListExists(currentSite.needsTypes ? false : true);
      } else {
        // Fallback to old method
        const [alertsTest, typesTest] = await Promise.allSettled([
          alertService.getAlerts(),
          alertService.getAlertTypes()
        ]);
        
        setAlertsListExists(alertsTest.status === 'fulfilled');
        setAlertTypesListExists(typesTest.status === 'fulfilled');
      }
    } catch (error) {
      logger.error('SettingsTab', 'Error checking lists', error);
      // Fallback: assume lists don't exist if there's an error
      setAlertsListExists(false);
      setAlertTypesListExists(false);
    } finally {
      setIsCheckingLists(false);
    }
  }, [alertService, setAlertsListExists, setAlertTypesListExists, setIsCheckingLists]);

  const handleCreateLists = React.useCallback(async () => {
    setIsCreatingLists(true);
    
    // Initialize progress steps
    const steps: IProgressStep[] = [
      {
        id: 'check-lists',
        name: 'Checking existing lists',
        description: 'Verifying what lists need to be created',
        status: StepStatus.InProgress
      },
      {
        id: 'create-lists',
        name: 'Creating SharePoint lists',
        description: 'Setting up Alerts and AlertBannerTypes lists',
        status: StepStatus.Pending
      }
    ];

    // Add language steps if multiple languages selected
    if (preCreationLanguages.length > 1) {
      preCreationLanguages.forEach((lang, index) => {
        if (lang !== 'en-us') {
          steps.push({
            id: `add-language-${lang}`,
            name: `Adding ${lang.toUpperCase()} language support`,
            description: `Creating language-specific columns for ${lang}`,
            status: StepStatus.Pending
          });
        }
      });
    }

    steps.push({
      id: 'finalize',
      name: 'Finalizing setup',
      description: 'Completing configuration and verification',
      status: StepStatus.Pending
    });

    setCreationSteps(steps);
    
    try {
      // First check what's needed
      const listStatus = await alertService.checkListsNeeded();
      const currentSite = listStatus[0];

      // Update first step as completed
      setCreationSteps(prev => prev.map(step => 
        step.id === 'check-lists' 
          ? { ...step, status: StepStatus.Completed }
          : step
      ));
      
      if (!currentSite || (!currentSite.needsAlerts && !currentSite.needsTypes)) {
        if (notificationService) {
          notificationService.showInfo('All required lists already exist on this site.', 'Lists Already Exist');
        } else {
          alert('All required lists already exist on this site.');
        }
        return;
      }
      
      // Start creating lists step
      setCreationSteps(prev => prev.map(step => 
        step.id === 'create-lists' 
          ? { ...step, status: StepStatus.InProgress }
          : step
      ));

      // Initialize lists using the existing service method
      await alertService.initializeLists();
      
      // Complete create lists step
      setCreationSteps(prev => prev.map(step => 
        step.id === 'create-lists' 
          ? { ...step, status: StepStatus.Completed }
          : step
      ));
      
      // Add selected language columns to the newly created lists
      if (preCreationLanguages.length > 1 || !preCreationLanguages.includes('en-us')) {
        for (const languageCode of preCreationLanguages) {
          if (languageCode !== 'en-us') { // English is already included by default
            // Start language step
            setCreationSteps(prev => prev.map(step => 
              step.id === `add-language-${languageCode}` 
                ? { ...step, status: StepStatus.InProgress }
                : step
            ));

            try {
              await alertService.addLanguageSupport(languageCode);
              logger.debug('SettingsTab', `Added ${languageCode} language columns during list creation`);
              
              // Complete language step
              setCreationSteps(prev => prev.map(step => 
                step.id === `add-language-${languageCode}` 
                  ? { ...step, status: StepStatus.Completed }
                  : step
              ));
            } catch (error) {
              logger.warn('SettingsTab', `Failed to add ${languageCode} language columns`, error);
              
              // Mark language step as failed
              setCreationSteps(prev => prev.map(step => 
                step.id === `add-language-${languageCode}` 
                  ? { ...step, status: StepStatus.Failed, error: error.message }
                  : step
              ));
            }
          }
        }
      }
      
      // Start finalize step
      setCreationSteps(prev => prev.map(step => 
        step.id === 'finalize' 
          ? { ...step, status: StepStatus.InProgress }
          : step
      ));

      // Re-check lists after creation
      await checkListsExistence();

      // Complete finalize step
      setCreationSteps(prev => prev.map(step => 
        step.id === 'finalize' 
          ? { ...step, status: StepStatus.Completed }
          : step
      ));
      
      // Success message
      const createdLists = [];
      if (currentSite.needsAlerts) createdLists.push('Alerts');
      if (currentSite.needsTypes && currentSite.isHomeSite) createdLists.push('AlertBannerTypes (Home Site only)');
      
      if (createdLists.length > 0) {
        const languageMessage = preCreationLanguages.length > 1 
          ? ` with support for ${preCreationLanguages.length} languages (${preCreationLanguages.join(', ')})`
          : '';
        const successMessage = `Successfully created ${createdLists.join(' and ')} list${createdLists.length > 1 ? 's' : ''}${languageMessage} on this site.`;
        
        if (notificationService) {
          notificationService.showSuccess(successMessage, 'Lists Created Successfully');
        } else {
          alert(successMessage);
        }
      }
      
      // Trigger language change callback to refresh other components
      if (onLanguageChange) {
        onLanguageChange(preCreationLanguages);
      }
      
      // Show informational message about AlertBannerTypes if not on home site
      if (!currentSite.isHomeSite && currentSite.needsAlerts) {
        const infoMessage = 'Alerts list created successfully. Note: AlertBannerTypes list is only created on the SharePoint home site to maintain consistency across the tenant.';
        
        if (notificationService) {
          notificationService.showInfo(infoMessage, 'Additional Information');
        } else {
          alert(infoMessage);
        }
      }
    } catch (error) {
      logger.error('SettingsTab', 'Error creating lists', error);
      const errorMsg = error.message || error.toString();
      
      if (errorMsg.includes('PERMISSION_DENIED')) {
        const permissionError = 'Permission denied: You need site owner or full control permissions to create SharePoint lists.';
        
        if (notificationService) {
          notificationService.showError(permissionError, 'Permission Error', [
            {
              text: 'Contact Administrator',
              onClick: () => {
                window.open('mailto:?subject=SharePoint Permissions Required&body=I need permissions to create SharePoint lists for the Alert Banner system.');
              }
            }
          ]);
        } else {
          alert(permissionError);
        }
      } else {
        const generalError = `Failed to create some lists: ${errorMsg}`;
        
        if (notificationService) {
          notificationService.showError(generalError, 'List Creation Failed', [
            {
              text: 'Retry',
              onClick: () => handleCreateLists()
            }
          ]);
        } else {
          alert(generalError);
        }
      }
    } finally {
      setIsCreatingLists(false);
    }
  }, [alertService, checkListsExistence, setIsCreatingLists]);

  const handleOpenRepairDialog = React.useCallback(() => {
    setIsRepairDialogOpen(true);
  }, []);

  const handleCloseRepairDialog = React.useCallback(() => {
    setIsRepairDialogOpen(false);
  }, []);

  const handleRepairComplete = React.useCallback(async (result: IRepairResult) => {
    // Show appropriate notification based on result
    if (notificationService) {
      if (result.success) {
        if (result.details.warnings.length > 0) {
          notificationService.showWarning(result.message, 'Repair Completed with Warnings');
        } else {
          notificationService.showSuccess(result.message, 'Repair Completed Successfully');
        }
      } else {
        notificationService.showError(result.message, 'Repair Failed');
      }
    }
    
    // Re-check lists after repair to refresh the UI
    try {
      await checkListsExistence();
    } catch (error) {
      logger.warn('SettingsTab', 'Failed to refresh list status after repair', error);
    }
  }, [checkListsExistence, notificationService]);

  // Check lists on mount
  React.useEffect(() => {
    checkListsExistence();
  }, [checkListsExistence]);

  return (
    <div className={styles.tabContent}>
      <SharePointSection title="Feature Settings">
        <div className={styles.settingsGrid}>
          <SharePointToggle
            label="Enable User Targeting"
            checked={settings.userTargetingEnabled}
            onChange={(checked) => handleSettingsChange({ userTargetingEnabled: checked })}
            description="Allow alerts to target specific users or groups based on SharePoint profiles and security groups"
          />

          <SharePointToggle
            label="Enable Browser Notifications"
            checked={settings.notificationsEnabled}
            onChange={(checked) => handleSettingsChange({ notificationsEnabled: checked })}
            description="Send native browser notifications for critical and high-priority alerts to ensure visibility"
          />

        </div>
      </SharePointSection>

      <SharePointSection title="Carousel Settings">
        <div className={styles.settingsGrid}>
          <SharePointToggle
            label="Enable Carousel Auto-Rotation"
            checked={carouselEnabled}
            onChange={handleCarouselEnabledChange}
            description="Automatically rotate between multiple alerts when more than one is displayed"
          />

          <SharePointInput
            label="Carousel Timer (seconds)"
            value={carouselInterval.toString()}
            onChange={handleCarouselIntervalChange}
            placeholder="5"
            type="text"
            description="Time in seconds between automatic alert transitions (2-30 seconds)"
            disabled={!carouselEnabled}
          />
        </div>
      </SharePointSection>

      {/* SharePoint Setup - Shows when lists are missing */}
      {(alertsListExists === false || alertTypesListExists === false) && (
        <SharePointSection title="SharePoint Setup Required">
          <div className={styles.settingsGrid}>
            <div className={styles.fullWidthColumn}>
              {isCheckingLists ? (
                <div className={styles.spinnerContainer}>
                  <div className={styles.spinner}></div>
                  Checking SharePoint lists...
                </div>
              ) : (
                <>
                  <p className={styles.infoText}>
                    The following lists are missing on this site and need to be created:
                  </p>
                  <div className={styles.infoText}>
                    <strong>Current Site:</strong> {window.location.href.split('/')[2]}
                  </div>
                  <ul className={styles.infoText}>
                    {alertsListExists === false && (
                      <li><strong>Alerts</strong> - For storing alert content on this site</li>
                    )}
                    {alertTypesListExists === false && (
                      <li><strong>AlertBannerTypes</strong> - For alert styling configurations (can be shared across sites)</li>
                    )}
                  </ul>
                  
                  {/* Language Selection */}
                  <Card>
                    <CardHeader
                      header={
                        <div className={cardStyles.cardHeader}>
                          <Globe24Regular />
                          <Text weight="semibold">Select Languages for Initial Setup</Text>
                        </div>
                      }
                      description={
                        <Text size={200}>
                          Choose which languages to support from the start. Additional languages can be added later through Language Management.
                        </Text>
                      }
                    />
                    
                    <CardPreview>
                      <div className={cardStyles.cardContent}>
                        <div className={cardStyles.languageGrid}>
                          {LanguageAwarenessService.getSupportedLanguages().map(language => (
                            <div key={language.code} className={cardStyles.languageItem}>
                              <Checkbox
                                checked={preCreationLanguages.includes(language.code)}
                                disabled={language.code === 'en-us'}
                                onChange={(_, data) => {
                                  if (data.checked === true) {
                                    setPreCreationLanguages(prev => [...prev, language.code]);
                                  } else {
                                    // Don't allow unchecking English
                                    if (language.code !== 'en-us') {
                                      setPreCreationLanguages(prev => prev.filter(code => code !== language.code));
                                    }
                                  }
                                }}
                              />
                              <div className={cardStyles.languageInfo}>
                                <div className={cardStyles.languageName}>
                                  {language.flag} {language.nativeName}
                                </div>
                                <div className={cardStyles.languageCode}>
                                  {language.name} ({language.code.toUpperCase()})
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Text size={100} className={cardStyles.hintText}>
                          💡 English is always included and cannot be removed as it serves as the fallback language.
                        </Text>
                      </div>
                    </CardPreview>
                  </Card>
                  
                  <div className={styles.actionButtonsRow}>
                    <SharePointButton
                      variant="primary"
                      icon={<Add24Regular />}
                      onClick={handleCreateLists}
                      disabled={isCreatingLists}
                    >
                      {isCreatingLists ? 'Creating Lists...' : 'Create Missing Lists'}
                    </SharePointButton>
                    
                    <div className={styles.helpText}>
                      Creates only the missing lists on the current site.
                    </div>
                  </div>

                  {isCreatingLists && creationSteps.length > 0 && (
                    <div className={styles.creatingProgress}>
                      <ProgressIndicator 
                        steps={creationSteps} 
                        title="Creating SharePoint Lists"
                        showStepDescriptions={true}
                        variant="vertical"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </SharePointSection>
      )}

      {/* Success message when lists exist with language management option */}
      {alertsListExists === true && alertTypesListExists === true && (
        <SharePointSection title="SharePoint Setup">
          <div className={styles.successContainer}>
            <div className={styles.successHeader}>
              <span className={styles.successIcon}>✅</span>
              <strong>Setup Complete</strong>
            </div>
            <p className={styles.successDescription}>
              All required SharePoint lists are properly configured and ready to use.
            </p>
            
            {/* List Maintenance */}
            <div className={styles.additionalOptions}>
              <h4>List Maintenance</h4>
              <div className={styles.actionButtonsRow}>
                <SharePointButton
                  variant="secondary"
                  icon={<Wrench24Regular />}
                  onClick={handleOpenRepairDialog}
                >
                  Repair Alerts List
                </SharePointButton>
                <div className={styles.helpText}>
                  Remove outdated columns and add current ones to match the latest schema.
                </div>
              </div>
            </div>
            
            {/* Language Management */}
            <div className={styles.additionalOptions}>
              <h3 className={styles.languageManagementTitle}>
                <LocalLanguage24Regular style={{ marginRight: '8px' }} />
                Manage Language Support
              </h3>
              <p className={styles.languageManagementDescription}>
                Add or update multi-language support for your existing alert lists. This will add additional language-specific columns to support content in multiple languages.
              </p>
              <LanguageFieldManager 
                alertService={alertService}
                onLanguageChange={onLanguageChange}
              />
            </div>
          </div>
        </SharePointSection>
      )}

      <SharePointSection title="Storage Management">
        <div className={styles.settingsGrid}>
          <div className={styles.fullWidthColumn}>
            <p className={styles.storageManagement}>
              Manage local storage and cached data for the Alert Banner system.
            </p>
            <div className={styles.storageButtons}>
              <SharePointButton
                variant="secondary"
                onClick={() => {
                  storageService.current.clearAllAlertData();
                  
                  if (notificationService) {
                    notificationService.showSuccess('Alert data cleared from local storage.', 'Cache Cleared');
                  } else {
                    alert('Alert data cleared from local storage.');
                  }
                }}
              >
                Clear Alert Cache
              </SharePointButton>
              <SharePointButton
                variant="secondary"
                onClick={() => {
                  storageService.current.removeFromLocalStorage('carouselEnabled');
                  storageService.current.removeFromLocalStorage('carouselInterval');
                  setCarouselEnabled(false);
                  setCarouselInterval(5);
                  
                  if (notificationService) {
                    notificationService.showSuccess('Carousel settings reset to defaults.', 'Settings Reset');
                  } else {
                    alert('Carousel settings reset to defaults.');
                  }
                }}
              >
                Reset Carousel Settings
              </SharePointButton>
            </div>
          </div>
        </div>
      </SharePointSection>

      {/* Repair Dialog */}
      <RepairDialog
        isOpen={isRepairDialogOpen}
        onDismiss={handleCloseRepairDialog}
        onRepairComplete={handleRepairComplete}
        alertService={alertService}
      />
    </div>
  );
};

export default SettingsTab;