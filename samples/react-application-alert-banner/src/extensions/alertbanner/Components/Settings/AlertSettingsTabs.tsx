import * as React from "react";
import { Settings24Regular, Add24Regular } from "@fluentui/react-icons";
import SharePointDialog from "../UI/SharePointDialog";
import { SharePointButton } from "../UI/SharePointControls";
import CreateAlertTab, { INewAlert, IFormErrors } from "./Tabs/CreateAlertTab";
import ManageAlertsTab, { IEditingAlert } from "./Tabs/ManageAlertsTab";
import AlertTypesTab from "./Tabs/AlertTypesTab";
import SettingsTab, { ISettingsData } from "./Tabs/SettingsTab";
import { AlertPriority, NotificationType, IAlertType, ContentType, TargetLanguage } from "../Alerts/IAlerts";
import { SiteContextDetector, ISiteValidationResult } from "../Utils/SiteContextDetector";
import { SharePointAlertService, IAlertItem } from "../Services/SharePointAlertService";
import { MSGraphClientV3 } from "@microsoft/sp-http";
import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import styles from "./AlertSettings.module.scss";
import { logger } from '../Services/LoggerService';

export interface IAlertSettingsTabsProps {
  isInEditMode: boolean;
  alertTypesJson: string;
  userTargetingEnabled: boolean;
  notificationsEnabled: boolean;
  graphClient: MSGraphClientV3;
  context: ApplicationCustomizerContext;
  onSettingsChange: (settings: ISettingsData) => void;
}

const AlertSettingsTabs: React.FC<IAlertSettingsTabsProps> = ({
  isInEditMode,
  alertTypesJson,
  userTargetingEnabled,
  notificationsEnabled,
  graphClient,
  context,
  onSettingsChange
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"create" | "manage" | "types" | "settings">("create");

  // Shared services - using useRef to prevent recreation
  const siteDetector = React.useRef<SiteContextDetector>(new SiteContextDetector(graphClient, context));
  const alertService = React.useRef<SharePointAlertService>(new SharePointAlertService(graphClient, context));
  const [languageUpdateTrigger, setLanguageUpdateTrigger] = React.useState(0);

  // Site context (removed unused variable)

  // Settings state
  const [settings, setSettings] = React.useState<ISettingsData>({
    alertTypesJson,
    userTargetingEnabled,
    notificationsEnabled
  });

  // Alert types state
  const [alertTypes, setAlertTypes] = React.useState<IAlertType[]>([]);

  // Create alert state
  const [newAlert, setNewAlert] = React.useState<INewAlert>({
    title: "",
    description: "",
    AlertType: "",
    priority: AlertPriority.Medium,
    isPinned: false,
    notificationType: NotificationType.Browser,
    linkUrl: "",
    linkDescription: "",
    targetSites: [],
    scheduledStart: undefined,
    scheduledEnd: undefined,
    contentType: ContentType.Alert,
    targetLanguage: TargetLanguage.All,
    languageContent: []
  });
  const [errors, setErrors] = React.useState<IFormErrors>({});
  const [creationProgress, setCreationProgress] = React.useState<ISiteValidationResult[]>([]);
  const [isCreatingAlert, setIsCreatingAlert] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(true);
  const [showTemplates, setShowTemplates] = React.useState(true);

  // Manage alerts state
  const [existingAlerts, setExistingAlerts] = React.useState<IAlertItem[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = React.useState(false);
  const [selectedAlerts, setSelectedAlerts] = React.useState<string[]>([]);
  const [editingAlert, setEditingAlert] = React.useState<IEditingAlert | null>(null);
  const [isEditingAlert, setIsEditingAlert] = React.useState(false);

  // Alert types state
  const [newAlertType, setNewAlertType] = React.useState<IAlertType>({
    name: "",
    iconName: "Info",
    backgroundColor: "#0078d4",
    textColor: "#ffffff",
    additionalStyles: "",
    priorityStyles: {
      [AlertPriority.Critical]: "border: 2px solid #E81123;",
      [AlertPriority.High]: "border: 1px solid #EA4300;",
      [AlertPriority.Medium]: "",
      [AlertPriority.Low]: ""
    }
  });
  const [isCreatingType, setIsCreatingType] = React.useState(false);

  // SharePoint list state
  const [alertsListExists, setAlertsListExists] = React.useState<boolean | null>(null);
  const [alertTypesListExists, setAlertTypesListExists] = React.useState<boolean | null>(null);
  const [isCheckingLists, setIsCheckingLists] = React.useState(false);
  const [isCreatingLists, setIsCreatingLists] = React.useState(false);

  // Initialize alert types from SharePoint
  React.useEffect(() => {
    const loadAlertTypes = async () => {
      try {
        const types = await alertService.current.getAlertTypes();
        setAlertTypes(types);
        
        // Set first alert type as default
        if (types.length > 0 && !newAlert.AlertType) {
          setNewAlert(prev => ({ ...prev, AlertType: types[0].name }));
        }
      } catch (error) {
        logger.error('AlertSettingsTabs', 'Error loading alert types from SharePoint', error);
        setAlertTypes([]);
      }
    };

    if (isInEditMode) {
      loadAlertTypes();
    }
  }, [isInEditMode, newAlert.AlertType]);

  // Initialize site context
  React.useEffect(() => {
    if (isInEditMode) {
      siteDetector.current.getCurrentSiteContext().then(siteContext => {
        // Set current site as default target if no sites selected
        if (newAlert.targetSites.length === 0) {
          setNewAlert(prev => ({
            ...prev,
            targetSites: [siteContext.siteId]
          }));
        }
      }).catch(error => {
        logger.error('AlertSettingsTabs', 'Failed to get site context', error);
      });
    }
  }, [isInEditMode, newAlert.targetSites.length]);

  // Update settings when props change
  React.useEffect(() => {
    setSettings({
      alertTypesJson,
      userTargetingEnabled,
      notificationsEnabled
    });
  }, [alertTypesJson, userTargetingEnabled, notificationsEnabled]);

  const handleSettingsChange = React.useCallback((newSettings: ISettingsData) => {
    setSettings(newSettings);
    onSettingsChange(newSettings);
  }, [onSettingsChange]);

  const handleLanguageChange = React.useCallback((languages: string[]) => {
    logger.debug('AlertSettingsTabs', 'Languages changed, triggering refresh', { languages });
    setLanguageUpdateTrigger(prev => prev + 1);
  }, []);

  // Don't render if not in edit mode
  if (!isInEditMode) {
    return null;
  }

  return (
    <>
      <div className={styles.settingsButton}>
        <SharePointButton
          variant="secondary"
          icon={<Settings24Regular />}
          onClick={() => setIsOpen(true)}
        >
          Alert Settings
        </SharePointButton>
      </div>

      <SharePointDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Alert Banner Settings"
        width={1200}
        height={800}
      >
        <div className={styles.settingsContainer}>
          {/* Tab Navigation */}
          <div className={styles.tabs}>
            <SharePointButton
              variant="secondary"
              onClick={() => setActiveTab("create")}
              className={`${styles.tab} ${activeTab === "create" ? styles.activeTab : ""}`}
              icon={<Add24Regular />}
            >
              Create Alert
            </SharePointButton>
            <SharePointButton
              variant="secondary"
              onClick={() => setActiveTab("manage")}
              className={`${styles.tab} ${activeTab === "manage" ? styles.activeTab : ""}`}
            >
              Manage Alerts
            </SharePointButton>
            <SharePointButton
              variant="secondary"
              onClick={() => setActiveTab("types")}
              className={`${styles.tab} ${activeTab === "types" ? styles.activeTab : ""}`}
            >
              Alert Types
            </SharePointButton>
            <SharePointButton
              variant="secondary"
              onClick={() => setActiveTab("settings")}
              className={`${styles.tab} ${activeTab === "settings" ? styles.activeTab : ""}`}
              icon={<Settings24Regular />}
            >
              Settings
            </SharePointButton>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === "create" && (
              <CreateAlertTab
                newAlert={newAlert}
                setNewAlert={setNewAlert}
                errors={errors}
                setErrors={setErrors}
                alertTypes={alertTypes}
                userTargetingEnabled={userTargetingEnabled}
                notificationsEnabled={notificationsEnabled}
                siteDetector={siteDetector.current}
                alertService={alertService.current}
                graphClient={graphClient}
                context={context}
                creationProgress={creationProgress}
                setCreationProgress={setCreationProgress}
                isCreatingAlert={isCreatingAlert}
                setIsCreatingAlert={setIsCreatingAlert}
                showPreview={showPreview}
                setShowPreview={setShowPreview}
                showTemplates={showTemplates}
                setShowTemplates={setShowTemplates}
                languageUpdateTrigger={languageUpdateTrigger}
              />
            )}

            {activeTab === "manage" && (
              <ManageAlertsTab
                existingAlerts={existingAlerts}
                setExistingAlerts={setExistingAlerts}
                isLoadingAlerts={isLoadingAlerts}
                setIsLoadingAlerts={setIsLoadingAlerts}
                selectedAlerts={selectedAlerts}
                setSelectedAlerts={setSelectedAlerts}
                editingAlert={editingAlert}
                setEditingAlert={setEditingAlert}
                isEditingAlert={isEditingAlert}
                setIsEditingAlert={setIsEditingAlert}
                alertTypes={alertTypes}
                siteDetector={siteDetector.current}
                alertService={alertService.current}
                graphClient={graphClient}
                context={context}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === "types" && (
              <AlertTypesTab
                alertTypes={alertTypes}
                setAlertTypes={setAlertTypes}
                newAlertType={newAlertType}
                setNewAlertType={setNewAlertType}
                isCreatingType={isCreatingType}
                setIsCreatingType={setIsCreatingType}
                alertService={alertService.current}
                onSettingsChange={handleSettingsChange}
                context={context}
              />
            )}

            {activeTab === "settings" && (
              <SettingsTab
                settings={settings}
                setSettings={setSettings}
                alertsListExists={alertsListExists}
                setAlertsListExists={setAlertsListExists}
                alertTypesListExists={alertTypesListExists}
                setAlertTypesListExists={setAlertTypesListExists}
                isCheckingLists={isCheckingLists}
                setIsCheckingLists={setIsCheckingLists}
                isCreatingLists={isCreatingLists}
                setIsCreatingLists={setIsCreatingLists}
                alertService={alertService.current}
                onSettingsChange={handleSettingsChange}
                onLanguageChange={handleLanguageChange}
                context={context}
              />
            )}
          </div>
        </div>
      </SharePointDialog>
    </>
  );
};

export default AlertSettingsTabs;