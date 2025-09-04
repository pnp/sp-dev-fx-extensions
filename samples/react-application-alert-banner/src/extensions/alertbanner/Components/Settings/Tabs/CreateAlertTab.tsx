import * as React from "react";
import { Save24Regular, Eye24Regular, Dismiss24Regular } from "@fluentui/react-icons";
import {
  SharePointButton,
  SharePointInput,
  SharePointSelect,
  SharePointToggle,
  SharePointSection,
  ISharePointSelectOption
} from "../../UI/SharePointControls";
import SharePointRichTextEditor from "../../UI/SharePointRichTextEditor";
import AlertPreview from "../../UI/AlertPreview";
import AlertTemplates, { IAlertTemplate } from "../../UI/AlertTemplates";
import SiteSelector from "../../UI/SiteSelector";
import MultiLanguageContentEditor from "../../UI/MultiLanguageContentEditor";
import { AlertPriority, NotificationType, IAlertType, ContentType, TargetLanguage } from "../../Alerts/IAlerts";
import { LanguageAwarenessService, ILanguageContent, ISupportedLanguage } from "../../Services/LanguageAwarenessService";
import { SiteContextDetector, ISiteValidationResult } from "../../Utils/SiteContextDetector";
import { SharePointAlertService } from "../../Services/SharePointAlertService";
import { MSGraphClientV3 } from "@microsoft/sp-http";
import { logger } from '../../Services/LoggerService';
import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import styles from "../AlertSettings.module.scss";

export interface INewAlert {
  title: string;
  description: string;
  AlertType: string;
  priority: AlertPriority;
  isPinned: boolean;
  notificationType: NotificationType;
  linkUrl: string;
  linkDescription: string;
  targetSites: string[];
  scheduledStart?: Date;
  scheduledEnd?: Date;
  // New language and classification properties
  contentType: ContentType;
  targetLanguage: TargetLanguage;
  languageContent: ILanguageContent[]; // Content for multiple languages
}

export interface IFormErrors {
  title?: string;
  description?: string;
  AlertType?: string;
  linkUrl?: string;
  linkDescription?: string;
  targetSites?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  // Index signature for dynamic language error keys
  [key: string]: string | undefined;
}

export interface ICreateAlertTabProps {
  newAlert: INewAlert;
  setNewAlert: React.Dispatch<React.SetStateAction<INewAlert>>;
  errors: IFormErrors;
  setErrors: React.Dispatch<React.SetStateAction<IFormErrors>>;
  alertTypes: IAlertType[];
  userTargetingEnabled: boolean;
  notificationsEnabled: boolean;
  siteDetector: SiteContextDetector;
  alertService: SharePointAlertService;
  graphClient: MSGraphClientV3;
  context: ApplicationCustomizerContext;
  creationProgress: ISiteValidationResult[];
  setCreationProgress: React.Dispatch<React.SetStateAction<ISiteValidationResult[]>>;
  isCreatingAlert: boolean;
  setIsCreatingAlert: React.Dispatch<React.SetStateAction<boolean>>;
  showPreview: boolean;
  setShowPreview: React.Dispatch<React.SetStateAction<boolean>>;
  showTemplates: boolean;
  setShowTemplates: React.Dispatch<React.SetStateAction<boolean>>;
  languageUpdateTrigger?: number;
}

const CreateAlertTab: React.FC<ICreateAlertTabProps> = ({
  newAlert,
  setNewAlert,
  errors,
  setErrors,
  alertTypes,
  userTargetingEnabled,
  notificationsEnabled,
  siteDetector,
  alertService,
  graphClient,
  context,
  creationProgress,
  setCreationProgress,
  isCreatingAlert,
  setIsCreatingAlert,
  showPreview,
  setShowPreview,
  showTemplates,
  setShowTemplates,
  languageUpdateTrigger
}) => {
  // Priority options
  const priorityOptions: ISharePointSelectOption[] = [
    { value: AlertPriority.Low, label: "Low Priority - Informational updates" },
    { value: AlertPriority.Medium, label: "Medium Priority - General announcements" },
    { value: AlertPriority.High, label: "High Priority - Important updates" },
    { value: AlertPriority.Critical, label: "Critical Priority - Urgent action required" }
  ];

  // Notification type options with detailed descriptions
  const notificationOptions: ISharePointSelectOption[] = [
    { 
      value: NotificationType.None, 
      label: "None - Display only in banner (no notifications)" 
    },
    { 
      value: NotificationType.Browser, 
      label: "Browser - Banner display only" 
    },
    { 
      value: NotificationType.Email, 
      label: "Email only - Sends email to selected audience (no banner display)" 
    },
    { 
      value: NotificationType.Both, 
      label: "Browser + Email - Banner display + Email notifications to selected audience" 
    }
  ];

  // Alert type options
  const alertTypeOptions: ISharePointSelectOption[] = alertTypes.map(type => ({
    value: type.name,
    label: type.name
  }));

  // Content type options
  const contentTypeOptions: ISharePointSelectOption[] = [
    { value: ContentType.Alert, label: "Alert - Live content for users" },
    { value: ContentType.Template, label: "Template - Reusable template for future alerts" }
  ];

  // Language awareness state
  const [languageService] = React.useState(() => new LanguageAwarenessService(graphClient, context));
  const [supportedLanguages, setSupportedLanguages] = React.useState<ISupportedLanguage[]>([]);
  const [useMultiLanguage, setUseMultiLanguage] = React.useState(false);

  // Language targeting options - only show enabled languages
  const languageOptions: ISharePointSelectOption[] = React.useMemo(() => {
    const enabledOptions = [
      { value: TargetLanguage.All, label: "All Languages - Show to everyone" }
    ];
    
    // Add only enabled languages (those with columnExists: true OR English which is always available)
    const enabledLanguages = supportedLanguages.filter(lang => 
      (lang.isSupported && lang.columnExists) || lang.code === TargetLanguage.EnglishUS
    );
    enabledLanguages.forEach(lang => {
      enabledOptions.push({
        value: lang.code,
        label: `${lang.flag} ${lang.nativeName} (${lang.name})`
      });
    });
    
    return enabledOptions;
  }, [supportedLanguages]);

  // Load supported languages from SharePoint (actual enabled ones)
  const loadSupportedLanguages = React.useCallback(async () => {
    try {
      // Get the base language definitions
      const baseLanguages = LanguageAwarenessService.getSupportedLanguages();
      
      // Get the actually supported languages from SharePoint columns
      const supportedLanguageCodes = await alertService.getSupportedLanguages();
      
      logger.info('CreateAlertTab', `Available language columns: ${supportedLanguageCodes.length}`);
      
      // Update the base languages with the actual status
      const updatedLanguages = baseLanguages.map(lang => ({
        ...lang,
        columnExists: supportedLanguageCodes.includes(lang.code) || lang.code === TargetLanguage.EnglishUS,
        isSupported: supportedLanguageCodes.includes(lang.code) || lang.code === TargetLanguage.EnglishUS
      }));
      
      setSupportedLanguages(updatedLanguages);
      logger.debug('CreateAlertTab', 'Updated supported languages', { supportedLanguages: updatedLanguages.filter(l => l.isSupported).map(l => l.code) });
    } catch (error) {
      logger.error('CreateAlertTab', 'Error loading supported languages', error);
      // Fallback to default with English only
      const defaultLanguages = LanguageAwarenessService.getSupportedLanguages();
      setSupportedLanguages(defaultLanguages.map(lang => ({
        ...lang,
        isSupported: lang.code === TargetLanguage.EnglishUS,
        columnExists: lang.code === TargetLanguage.EnglishUS
      })));
    }
  }, [alertService]);

  React.useEffect(() => {
    loadSupportedLanguages();
  }, [loadSupportedLanguages, languageUpdateTrigger]);

  // Initialize language content when multi-language is enabled
  React.useEffect(() => {
    if (useMultiLanguage && newAlert.languageContent.length === 0) {
      // Start with English by default
      setNewAlert(prev => {
        const englishContent: ILanguageContent = {
          language: TargetLanguage.EnglishUS,
          title: prev.title,
          description: prev.description,
          linkDescription: prev.linkUrl ? prev.linkDescription : undefined
        };
        return { ...prev, languageContent: [englishContent] };
      });
    } else if (!useMultiLanguage && newAlert.languageContent.length > 0) {
      // When switching back to single language, use the first language's content
      setNewAlert(prev => {
        const firstLang = prev.languageContent[0];
        if (firstLang) {
          return {
            ...prev,
            title: firstLang.title,
            description: firstLang.description,
            linkDescription: firstLang.linkDescription || '',
            languageContent: []
          };
        }
        return prev;
      });
    }
  }, [useMultiLanguage, newAlert.languageContent.length]);

  const handleTemplateSelect = React.useCallback(async (template: IAlertTemplate) => {
    try {
      // First, try to get the full alert data from SharePoint to include all fields
      const templateAlerts = await alertService.getTemplateAlerts(alertService.getCurrentSiteId());
      const fullTemplate = templateAlerts.find(t => t.id === template.id);
      
      if (fullTemplate) {
        // Use the full template data
        setNewAlert(prev => ({
          ...prev,
          title: fullTemplate.title,
          description: fullTemplate.description,
          AlertType: fullTemplate.AlertType,
          priority: fullTemplate.priority,
          notificationType: fullTemplate.notificationType,
          isPinned: fullTemplate.isPinned,
          linkUrl: fullTemplate.linkUrl || "",
          linkDescription: fullTemplate.linkDescription || "",
          contentType: ContentType.Alert, // New alert should be Alert, not Template
        }));

        // If multi-language is enabled, try to load language variants of the template
        if (useMultiLanguage && fullTemplate.languageGroup) {
          try {
            // Get all language variants of this template
            const allAlerts = await alertService.getAlerts([alertService.getCurrentSiteId()]);
            const languageVariants = allAlerts.filter(a => 
              a.languageGroup === fullTemplate.languageGroup && 
              a.contentType === ContentType.Template
            );
            
            // Convert to language content format
            const languageContent: ILanguageContent[] = languageVariants.map(variant => ({
              language: variant.targetLanguage,
              title: variant.title,
              description: variant.description,
              linkDescription: variant.linkDescription || ""
            }));

            if (languageContent.length > 0) {
              setNewAlert(prev => ({
                ...prev,
                languageContent,
                targetLanguage: languageContent[0].language // Set primary language
              }));
            }
          } catch (error) {
            logger.warn('CreateAlertTab', 'Could not load template language variants', error);
          }
        }
      } else {
        // Fallback to basic template data
        setNewAlert(prev => ({
          ...prev,
          title: template.template.title,
          description: template.template.description,
          priority: template.template.priority,
          notificationType: template.template.notificationType,
          isPinned: template.template.isPinned,
          linkUrl: template.template.linkUrl || "",
          linkDescription: template.template.linkDescription || "",
          contentType: ContentType.Alert, // New alert should be Alert, not Template
        }));
      }
    } catch (error) {
      logger.error('CreateAlertTab', 'Failed to load template', error);
      // Fallback to basic template data
      setNewAlert(prev => ({
        ...prev,
        title: template.template.title,
        description: template.template.description,
        priority: template.template.priority,
        notificationType: template.template.notificationType,
        isPinned: template.template.isPinned,
        linkUrl: template.template.linkUrl || "",
        linkDescription: template.template.linkDescription || "",
        contentType: ContentType.Alert, // New alert should be Alert, not Template
      }));
    }
    
    setShowTemplates(false);
  }, [alertService, setNewAlert, setShowTemplates, useMultiLanguage]);

  const validateForm = React.useCallback((): boolean => {
    const newErrors: IFormErrors = {};

    if (useMultiLanguage) {
      // Validate multi-language content
      if (newAlert.languageContent.length === 0) {
        newErrors.title = 'At least one language must be configured';
      } else {
        newAlert.languageContent.forEach(content => {
          if (!content.title.trim()) {
            newErrors.title = `Title is required for ${content.language}`;
          }
          if (!content.description.trim()) {
            newErrors.description = `Description is required for ${content.language}`;
          }
          if (newAlert.linkUrl && !content.linkDescription?.trim()) {
            newErrors.linkDescription = `Link description is required for ${content.language} when URL is provided`;
          }
        });
      }
    } else {
      // Validate single language content
      if (!newAlert.title?.trim()) {
        newErrors.title = "Title is required";
      } else if (newAlert.title.length < 3) {
        newErrors.title = "Title must be at least 3 characters";
      } else if (newAlert.title.length > 100) {
        newErrors.title = "Title cannot exceed 100 characters";
      }

      if (!newAlert.description?.trim()) {
        newErrors.description = "Description is required";
      } else if (newAlert.description.length < 10) {
        newErrors.description = "Description must be at least 10 characters";
      }

      if (newAlert.linkUrl && !newAlert.linkDescription?.trim()) {
        newErrors.linkDescription = "Link description is required when URL is provided";
      }
    }

    if (!newAlert.AlertType) {
      newErrors.AlertType = "Alert type is required";
    }

    if (newAlert.linkUrl && newAlert.linkUrl.trim()) {
      try {
        new URL(newAlert.linkUrl);
      } catch {
        newErrors.linkUrl = "Please enter a valid URL";
      }
    }

    if (newAlert.targetSites.length === 0) {
      newErrors.targetSites = "At least one target site must be selected";
    }

    if (newAlert.scheduledStart && newAlert.scheduledEnd) {
      if (newAlert.scheduledStart >= newAlert.scheduledEnd) {
        newErrors.scheduledEnd = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [newAlert, setErrors, useMultiLanguage]);

  const handleCreateAlert = React.useCallback(async () => {
    if (!validateForm()) return;

    setIsCreatingAlert(true);
    setCreationProgress([]);

    try {
      if (useMultiLanguage && newAlert.languageContent.length > 0) {
        // Create multi-language alerts
        const multiLanguageAlert = languageService.createMultiLanguageAlert({
          AlertType: newAlert.AlertType,
          priority: newAlert.priority,
          isPinned: newAlert.isPinned,
          linkUrl: newAlert.linkUrl,
          notificationType: newAlert.notificationType,
          createdDate: new Date().toISOString(),
          createdBy: context.pageContext.user.displayName,
          contentType: newAlert.contentType,
          targetLanguage: TargetLanguage.All,
          status: 'Active' as 'Active' | 'Expired' | 'Scheduled',
          targetSites: newAlert.targetSites,
          id: '0'
        }, newAlert.languageContent);

        const alertItems = languageService.generateAlertItems(multiLanguageAlert);
        
        // Create each language variant
        for (const alertItem of alertItems) {
          const alertData = {
            ...alertItem,
            targetSites: newAlert.targetSites,
            scheduledStart: newAlert.scheduledStart?.toISOString(),
            scheduledEnd: newAlert.scheduledEnd?.toISOString()
          };
          await alertService.createAlert(alertData);
        }
        
        setCreationProgress([{
          siteId: "success",
          siteName: `Multi-Language Alert Created (${alertItems.length} variants)`,
          hasAccess: true,
          canCreateAlerts: true,
          permissionLevel: "success",
          error: ""
        }]);
      } else {
        // Create single language alert
        const alertData = {
          title: newAlert.title,
          description: newAlert.description,
          AlertType: newAlert.AlertType,
          priority: newAlert.priority,
          isPinned: newAlert.isPinned,
          notificationType: newAlert.notificationType,
          linkUrl: newAlert.linkUrl,
          linkDescription: newAlert.linkDescription,
          targetSites: newAlert.targetSites,
          scheduledStart: newAlert.scheduledStart?.toISOString(),
          scheduledEnd: newAlert.scheduledEnd?.toISOString(),
          contentType: newAlert.contentType,
          targetLanguage: newAlert.targetLanguage
        };

        await alertService.createAlert(alertData);
        
        setCreationProgress([{
          siteId: "success",
          siteName: "Alert Created",
          hasAccess: true,
          canCreateAlerts: true,
          permissionLevel: "success",
          error: ""
        }]);
      }

      // Reset form on success
      setNewAlert({
        title: "",
        description: "",
        AlertType: alertTypes.length > 0 ? alertTypes[0].name : "",
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
      setUseMultiLanguage(false);
      setShowTemplates(true);
    } catch (error) {
      logger.error('CreateAlertTab', 'Error creating alert', error);
      setCreationProgress([{
        siteId: "error",
        siteName: "Creation Error",
        hasAccess: false,
        canCreateAlerts: false,
        permissionLevel: "error",
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }]);
    } finally {
      setIsCreatingAlert(false);
    }
  }, [validateForm, setIsCreatingAlert, setCreationProgress, alertService, newAlert, setNewAlert, alertTypes, setShowTemplates, useMultiLanguage, languageService, context.pageContext.user.displayName]);

  const resetForm = React.useCallback(() => {
    setNewAlert({
      title: "",
      description: "",
      AlertType: alertTypes.length > 0 ? alertTypes[0].name : "",
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
    setErrors({});
    setUseMultiLanguage(false);
    setShowTemplates(true);
  }, [setNewAlert, alertTypes, setErrors, setShowTemplates]);

  const getCurrentAlertType = React.useCallback((): IAlertType | undefined => {
    return alertTypes.find(type => type.name === newAlert.AlertType);
  }, [alertTypes, newAlert.AlertType]);

  return (
    <div className={styles.tabContent}>
      {showTemplates && (
        <div className={styles.templatesSection}>
          <AlertTemplates
            onSelectTemplate={handleTemplateSelect}
            graphClient={graphClient}
            context={context}
            alertService={alertService}
            className={styles.templates}
          />
          <div className={styles.templateActions}>
            <SharePointButton
              variant="secondary"
              onClick={() => setShowTemplates(false)}
            >
              Start from Scratch
            </SharePointButton>
          </div>
        </div>
      )}

      {!showTemplates && (
        <div className={styles.alertForm}>
          <div className={styles.formWithPreview}>
            <div className={styles.formColumn}>
              <SharePointSection title="Content Classification">
                <SharePointSelect
                  label="Content Type"
                  value={newAlert.contentType}
                  onChange={(value) => setNewAlert(prev => ({ ...prev, contentType: value as ContentType }))}
                  options={contentTypeOptions}
                  required
                  description="Choose whether this is a live alert or a reusable template"
                />

                <div className={styles.languageModeSelector}>
                  <label className={styles.fieldLabel}>Language Configuration</label>
                  <div className={styles.languageOptions}>
                    <SharePointButton
                      variant={!useMultiLanguage ? "primary" : "secondary"}
                      onClick={() => setUseMultiLanguage(false)}
                    >
                      🌐 Single Language
                    </SharePointButton>
                    <SharePointButton
                      variant={useMultiLanguage ? "primary" : "secondary"}
                      onClick={() => setUseMultiLanguage(true)}
                    >
                      🗣️ Multi-Language
                    </SharePointButton>
                  </div>
                </div>
              </SharePointSection>

              {!useMultiLanguage ? (
                <>
                  <SharePointSection title="Language Targeting">
                    <SharePointSelect
                      label="Target Language"
                      value={newAlert.targetLanguage}
                      onChange={(value) => setNewAlert(prev => ({ ...prev, targetLanguage: value as TargetLanguage }))}
                      options={languageOptions}
                      required
                      description="Choose which language audience this alert targets"
                    />
                  </SharePointSection>

                  <SharePointSection title="Basic Information">
                    <SharePointInput
                      label="Alert Title"
                      value={newAlert.title}
                      onChange={(value) => {
                        setNewAlert(prev => ({ ...prev, title: value }));
                        setErrors(prev => prev.title ? { ...prev, title: undefined } : prev);
                      }}
                      placeholder="Enter a clear, concise title"
                      required
                      error={errors.title}
                      description="This will be the main heading of your alert (3-100 characters)"
                    />

                    <SharePointRichTextEditor
                      label="Alert Description"
                      value={newAlert.description}
                      onChange={(value) => {
                        setNewAlert(prev => ({ ...prev, description: value }));
                        if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
                      }}
                      placeholder="Provide detailed information about the alert..."
                      required
                      error={errors.description}
                      description="Use the toolbar to format your message with rich text, links, lists, and more."
                    />
                  </SharePointSection>
                </>
              ) : (
                <SharePointSection title="Multi-Language Content">
                  <MultiLanguageContentEditor
                    content={newAlert.languageContent}
                    onContentChange={(content) => setNewAlert(prev => ({ ...prev, languageContent: content }))}
                    availableLanguages={supportedLanguages}
                    errors={errors}
                    linkUrl={newAlert.linkUrl}
                  />
                </SharePointSection>
              )}

              <SharePointSection title="Alert Configuration">
                <SharePointSelect
                  label="Alert Type"
                  value={newAlert.AlertType}
                  onChange={(value) => {
                    setNewAlert(prev => ({ ...prev, AlertType: value }));
                    if (errors.AlertType) setErrors(prev => ({ ...prev, AlertType: undefined }));
                  }}
                  options={alertTypeOptions}
                  required
                  error={errors.AlertType}
                  description="Choose the visual style and importance level"
                />

                <SharePointSelect
                  label="Priority Level"
                  value={newAlert.priority}
                  onChange={(value) => setNewAlert(prev => ({ ...prev, priority: value as AlertPriority }))}
                  options={priorityOptions}
                  required
                  description="This affects the visual styling and user attention level"
                />

                <SharePointToggle
                  label="Pin Alert"
                  checked={newAlert.isPinned}
                  onChange={(checked) => setNewAlert(prev => ({ ...prev, isPinned: checked }))}
                  description="Pinned alerts stay at the top and are harder to dismiss"
                />

                {notificationsEnabled && (
                  <SharePointSelect
                    label="Notification Type"
                    value={newAlert.notificationType}
                    onChange={(value) => setNewAlert(prev => ({ ...prev, notificationType: value as NotificationType }))}
                    options={notificationOptions}
                    description="How users will be notified about this alert"
                  />
                )}
              </SharePointSection>

              <SharePointSection title="Action Link (Optional)">
                <SharePointInput
                  label="Link URL"
                  value={newAlert.linkUrl}
                  onChange={(value) => {
                    setNewAlert(prev => ({ ...prev, linkUrl: value }));
                    setErrors(prev => prev.linkUrl ? { ...prev, linkUrl: undefined } : prev);
                  }}
                  placeholder="https://example.com/more-info"
                  error={errors.linkUrl}
                  description="Optional link for users to get more information or take action"
                />

                {newAlert.linkUrl && !useMultiLanguage && (
                  <SharePointInput
                    label="Link Description"
                    value={newAlert.linkDescription}
                    onChange={(value) => {
                      setNewAlert(prev => ({ ...prev, linkDescription: value }));
                      setErrors(prev => prev.linkDescription ? { ...prev, linkDescription: undefined } : prev);
                    }}
                    placeholder="Learn More"
                    required={!!newAlert.linkUrl}
                    error={errors.linkDescription}
                    description="Text that will appear on the action button"
                  />
                )}
                
                {newAlert.linkUrl && useMultiLanguage && (
                  <div className={styles.infoMessage}>
                    <p>Link descriptions will be configured per language in the Multi-Language Content section above.</p>
                  </div>
                )}
              </SharePointSection>

              <SharePointSection title="Target Sites">
                <SiteSelector
                  selectedSites={newAlert.targetSites}
                  onSitesChange={(sites) => {
                    setNewAlert(prev => ({ ...prev, targetSites: sites }));
                    if (errors.targetSites) setErrors(prev => ({ ...prev, targetSites: undefined }));
                  }}
                  siteDetector={siteDetector}
                  graphClient={graphClient}
                  showPermissionStatus={true}
                />
                {errors.targetSites && (
                  <div className={styles.errorMessage}>{errors.targetSites}</div>
                )}
              </SharePointSection>

              <SharePointSection title="Scheduling (Optional)">
                <SharePointInput
                  label="Start Date & Time"
                  type="datetime-local"
                  value={newAlert.scheduledStart ? new Date(newAlert.scheduledStart.getTime() - newAlert.scheduledStart.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                  onChange={(value) => {
                    setNewAlert(prev => ({ 
                      ...prev, 
                      scheduledStart: value ? new Date(value) : undefined 
                    }));
                    if (errors.scheduledStart) setErrors(prev => ({ ...prev, scheduledStart: undefined }));
                  }}
                  error={errors.scheduledStart}
                  description="When should this alert become visible? Leave empty to show immediately."
                />

                <SharePointInput
                  label="End Date & Time"
                  type="datetime-local"
                  value={newAlert.scheduledEnd ? new Date(newAlert.scheduledEnd.getTime() - newAlert.scheduledEnd.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                  onChange={(value) => {
                    setNewAlert(prev => ({ 
                      ...prev, 
                      scheduledEnd: value ? new Date(value) : undefined 
                    }));
                    if (errors.scheduledEnd) setErrors(prev => ({ ...prev, scheduledEnd: undefined }));
                  }}
                  error={errors.scheduledEnd}
                  description="When should this alert automatically hide? Leave empty to keep it visible until manually removed."
                />
              </SharePointSection>

              <div className={styles.formActions}>
                <SharePointButton
                  variant="primary"
                  onClick={handleCreateAlert}
                  disabled={isCreatingAlert || alertTypes.length === 0}
                  icon={<Save24Regular />}
                >
                  {isCreatingAlert ? "Creating Alert..." : "Create Alert"}
                </SharePointButton>

                <SharePointButton
                  variant="secondary"
                  onClick={resetForm}
                  disabled={isCreatingAlert}
                  icon={<Dismiss24Regular />}
                >
                  Reset Form
                </SharePointButton>

                <SharePointButton
                  variant="secondary"
                  onClick={() => setShowPreview(!showPreview)}
                  icon={<Eye24Regular />}
                >
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </SharePointButton>
              </div>

              {/* Creation Progress */}
              {creationProgress.length > 0 && (
                <div className={styles.alertsList}>
                  <h3>Creation Results:</h3>
                  {creationProgress.map((result, index) => (
                    <div
                      key={index}
                      className={`${styles.alertCard} ${result.error ? styles.error : styles.success}`}
                    >
                      <strong>{result.siteName}</strong>: {result.error ? `❌ ${result.error}` : "✅ Created successfully"}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preview Column */}
            {showPreview && (
              <div className={styles.formColumn}>
                <div className={styles.alertCard}>
                  <h3>Live Preview</h3>
                  
                  {/* Multi-language preview mode selector */}
                  {useMultiLanguage && newAlert.languageContent.length > 0 && (
                    <div className={styles.previewLanguageSelector}>
                      <label className={styles.previewLabel}>Preview Language:</label>
                      <div className={styles.previewLanguageButtons}>
                        {newAlert.languageContent.map((content, index) => {
                          const lang = supportedLanguages.find(l => l.code === content.language);
                          return (
                            <SharePointButton
                              key={content.language}
                              variant={index === 0 ? "primary" : "secondary"}
                              onClick={() => {
                                // Move selected language to front for preview
                                const reorderedContent = [content, ...newAlert.languageContent.filter((_, i) => i !== index)];
                                setNewAlert(prev => ({ ...prev, languageContent: reorderedContent }));
                              }}
                              className={styles.previewLanguageButton}
                            >
                              {lang?.flag || content.language} {lang?.nativeName || content.language}
                            </SharePointButton>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <AlertPreview
                    title={useMultiLanguage && newAlert.languageContent.length > 0 
                      ? newAlert.languageContent[0]?.title || "Multi-language Alert Title"
                      : newAlert.title || "Alert Title"}
                    description={useMultiLanguage && newAlert.languageContent.length > 0
                      ? newAlert.languageContent[0]?.description || "Multi-language alert description will appear here..."
                      : newAlert.description || "Alert description will appear here..."}
                    alertType={getCurrentAlertType() || { name: "Default", iconName: "Info", backgroundColor: "#0078d4", textColor: "#ffffff", additionalStyles: "", priorityStyles: {} }}
                    priority={newAlert.priority}
                    linkUrl={newAlert.linkUrl}
                    linkDescription={useMultiLanguage && newAlert.languageContent.length > 0
                      ? newAlert.languageContent[0]?.linkDescription || "Learn More"
                      : newAlert.linkDescription || "Learn More"}
                    isPinned={newAlert.isPinned}
                  />

                  {/* Multi-language preview info */}
                  {useMultiLanguage && newAlert.languageContent.length > 0 && (
                    <div className={styles.multiLanguagePreviewInfo}>
                      <p><strong>Multi-Language Alert</strong></p>
                      <p>Currently previewing: <strong>{supportedLanguages.find(l => l.code === newAlert.languageContent[0]?.language)?.nativeName || newAlert.languageContent[0]?.language}</strong></p>
                      <p>Available in {newAlert.languageContent.length} language(s): {newAlert.languageContent.map(c => supportedLanguages.find(l => l.code === c.language)?.flag || c.language).join(' ')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAlertTab;