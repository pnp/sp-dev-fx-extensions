import * as React from "react";
import { Delete24Regular, Edit24Regular, Globe24Regular, Save24Regular, Eye24Regular, Filter24Regular, Search24Regular, Calendar24Regular, ChevronDown24Regular, ChevronUp24Regular } from "@fluentui/react-icons";
import {
  SharePointButton,
  SharePointInput,
  SharePointSelect,
  SharePointToggle,
  SharePointSection,
  ISharePointSelectOption
} from "../../UI/SharePointControls";
import SharePointRichTextEditor from "../../UI/SharePointRichTextEditor";
import SharePointDialog from "../../UI/SharePointDialog";
import MultiLanguageContentEditor from "../../UI/MultiLanguageContentEditor";
import AlertPreview from "../../UI/AlertPreview";
import SiteSelector from "../../UI/SiteSelector";
import { AlertPriority, NotificationType, IAlertType, TargetLanguage, ContentType } from "../../Alerts/IAlerts";
import { LanguageAwarenessService, ILanguageContent, ISupportedLanguage } from "../../Services/LanguageAwarenessService";
import { logger } from '../../Services/LoggerService';
import { NotificationService } from '../../Services/NotificationService';
import { SiteContextDetector } from "../../Utils/SiteContextDetector";
import { SharePointAlertService, IAlertItem } from "../../Services/SharePointAlertService";
import { htmlSanitizer } from "../../Utils/HtmlSanitizer";
import { MSGraphClientV3 } from "@microsoft/sp-http";
import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import styles from "../AlertSettings.module.scss";

export interface IEditingAlert extends Omit<IAlertItem, 'scheduledStart' | 'scheduledEnd'> {
  scheduledStart?: Date;
  scheduledEnd?: Date;
  languageContent?: ILanguageContent[];
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

export interface IManageAlertsTabProps {
  existingAlerts: IAlertItem[];
  setExistingAlerts: React.Dispatch<React.SetStateAction<IAlertItem[]>>;
  isLoadingAlerts: boolean;
  setIsLoadingAlerts: React.Dispatch<React.SetStateAction<boolean>>;
  selectedAlerts: string[];
  setSelectedAlerts: React.Dispatch<React.SetStateAction<string[]>>;
  editingAlert: IEditingAlert | null;
  setEditingAlert: React.Dispatch<React.SetStateAction<IEditingAlert | null>>;
  isEditingAlert: boolean;
  setIsEditingAlert: React.Dispatch<React.SetStateAction<boolean>>;
  alertTypes: IAlertType[];
  siteDetector: SiteContextDetector;
  alertService: SharePointAlertService;
  graphClient: MSGraphClientV3;
  context: ApplicationCustomizerContext;
  setActiveTab: React.Dispatch<React.SetStateAction<"create" | "manage" | "types" | "settings">>;
}

const ManageAlertsTab: React.FC<IManageAlertsTabProps> = ({
  existingAlerts,
  setExistingAlerts,
  isLoadingAlerts,
  setIsLoadingAlerts,
  selectedAlerts,
  setSelectedAlerts,
  editingAlert,
  setEditingAlert,
  isEditingAlert,
  setIsEditingAlert,
  alertTypes,
  siteDetector,
  alertService,
  graphClient,
  context,
  setActiveTab
}) => {
  const [editErrors, setEditErrors] = React.useState<IFormErrors>({});
  const [contentTypeFilter, setContentTypeFilter] = React.useState<'all' | ContentType>(ContentType.Alert);
  const [supportedLanguages, setSupportedLanguages] = React.useState<ISupportedLanguage[]>([]);
  const [useMultiLanguage, setUseMultiLanguage] = React.useState(false);
  const [tenantDefaultLanguage, setTenantDefaultLanguage] = React.useState<TargetLanguage>(TargetLanguage.EnglishUS);
  const [showPreview, setShowPreview] = React.useState(true);
  
  // Enhanced filter states
  const [priorityFilter, setPriorityFilter] = React.useState<'all' | AlertPriority>('all');
  const [alertTypeFilter, setAlertTypeFilter] = React.useState<'all' | string>('all');
  const [statusFilter, setStatusFilter] = React.useState<'all' | string>('all');
  const [languageFilter, setLanguageFilter] = React.useState<'all' | TargetLanguage>('all');
  const [notificationFilter, setNotificationFilter] = React.useState<'all' | NotificationType>('all');
  const [dateFilter, setDateFilter] = React.useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customDateFrom, setCustomDateFrom] = React.useState<string>('');
  const [customDateTo, setCustomDateTo] = React.useState<string>('');
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [showFilters, setShowFilters] = React.useState(false);
  
  // Initialize services with useMemo to prevent recreation
  const languageService = React.useMemo(() => 
    new LanguageAwarenessService(graphClient, context), 
    [graphClient, context]
  );
  
  const notificationService = React.useMemo(() => 
    NotificationService.getInstance(context), 
    [context]
  );

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

  // Content type options (matching CreateAlerts)
  const contentTypeOptions: ISharePointSelectOption[] = [
    { value: ContentType.Alert, label: "📢 Alert - Live content for users" },
    { value: ContentType.Template, label: "📄 Template - Reusable template for future alerts" }
  ];

  // Language options (matching CreateAlerts)  
  const languageOptions: ISharePointSelectOption[] = [
    { value: TargetLanguage.All, label: "🌐 All Languages" },
    { value: TargetLanguage.EnglishUS, label: "🇺🇸 English (US)" },
    { value: TargetLanguage.FrenchFR, label: "🇫🇷 French (France)" },
    { value: TargetLanguage.GermanDE, label: "🇩🇪 German (Germany)" },
    { value: TargetLanguage.SpanishES, label: "🇪🇸 Spanish (Spain)" },
    { value: TargetLanguage.SwedishSE, label: "🇸🇪 Swedish (Sweden)" },
    { value: TargetLanguage.FinnishFI, label: "🇫🇮 Finnish (Finland)" },
    { value: TargetLanguage.DanishDK, label: "🇩🇰 Danish (Denmark)" },
    { value: TargetLanguage.NorwegianNO, label: "🇳🇴 Norwegian (Norway)" }
  ];

  // Load supported languages and tenant default on component mount
  React.useEffect(() => {
    const loadLanguageSettings = async () => {
      try {
        const languages = LanguageAwarenessService.getSupportedLanguages();
        setSupportedLanguages(languages);
        const defaultLang = languageService.getTenantDefaultLanguage();
        setTenantDefaultLanguage(defaultLang);
      } catch (error) {
        logger.error('ManageAlertsTab', 'Error loading language settings', error);
      }
    };
    loadLanguageSettings();
  }, [languageService]);

  const loadExistingAlerts = React.useCallback(async () => {
    setIsLoadingAlerts(true);
    try {
      logger.info('ManageAlertsTab', 'Loading both alerts and templates');
      
      // Load both alerts and templates separately
      const [alerts, templates] = await Promise.all([
        alertService.getAlerts(),
        alertService.getTemplateAlerts(context.pageContext.site.id.toString())
      ]);
      
      // Combine alerts and templates
      const allItems = [...alerts, ...templates];
      
      logger.info('ManageAlertsTab', 'Successfully loaded items', { 
        alertCount: alerts.length, 
        templateCount: templates.length, 
        totalCount: allItems.length 
      });
      
      // Log template count for monitoring
      logger.info('ManageAlertsTab', `Loaded ${templates.length} templates`);
      
      setExistingAlerts(allItems);
    } catch (error) {
      logger.error('ManageAlertsTab', 'Error loading alerts', error);
      setExistingAlerts([]);
    } finally {
      setIsLoadingAlerts(false);
    }
  }, [alertService, context.pageContext.site.id]);

  const handleBulkDelete = React.useCallback(async () => {
    if (selectedAlerts.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedAlerts.length} alert(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      await Promise.all(
        selectedAlerts.map(alertId => alertService.deleteAlert(alertId))
      );
      
      // Refresh the alerts list
      await loadExistingAlerts();
      setSelectedAlerts([]);
      notificationService.showSuccess(`Successfully deleted ${selectedAlerts.length} alert(s)`, 'Alerts Deleted');
    } catch (error) {
      logger.error('ManageAlertsTab', 'Error deleting alerts', error);
      notificationService.showError('Failed to delete some alerts. Please try again.', 'Deletion Failed');
    }
  }, [selectedAlerts, alertService, loadExistingAlerts]);

  const handleEditAlert = React.useCallback((alert: IAlertItem) => {
    logger.info('ManageAlertsTab', 'Opening edit dialog for alert', { id: alert.id, title: alert.title });
    
    try {
      // Check if this is a multi-language alert (has languageGroup)
      const isMultiLang = !!alert.languageGroup;
      
      if (isMultiLang && alert.languageGroup) {
        // Load all language variants for this group
        const languageVariants = existingAlerts.filter(a => a.languageGroup === alert.languageGroup);
        logger.debug('ManageAlertsTab', 'Found language variants', { 
          languageGroup: alert.languageGroup, 
          variantCount: languageVariants.length 
        });
        const languageContent = languageService?.getLanguageContent(languageVariants, alert.languageGroup) || [];
        
        const editingData: IEditingAlert = {
          ...alert,
          scheduledStart: alert.scheduledStart ? new Date(alert.scheduledStart) : undefined,
          scheduledEnd: alert.scheduledEnd ? new Date(alert.scheduledEnd) : undefined,
          languageContent
        };
        
        setEditingAlert(editingData);
        setUseMultiLanguage(true);
        logger.info('ManageAlertsTab', 'Multi-language edit mode activated', { languageVariants: languageVariants.length });
      } else {
        // Single language alert
        const editingData: IEditingAlert = {
          ...alert,
          scheduledStart: alert.scheduledStart ? new Date(alert.scheduledStart) : undefined,
          scheduledEnd: alert.scheduledEnd ? new Date(alert.scheduledEnd) : undefined,
          languageContent: undefined
        };
        
        setEditingAlert(editingData);
        setUseMultiLanguage(false);
        logger.info('ManageAlertsTab', 'Single-language edit mode activated');
      }
      
      setEditErrors({});
      setShowPreview(true); // Ensure preview is visible when opening edit
    } catch (error) {
      logger.error('ManageAlertsTab', 'Error opening edit dialog', error);
      notificationService.showError('Failed to open edit dialog. Please try again.', 'Edit Failed');
    }
  }, [setEditingAlert, existingAlerts, languageService, notificationService]);

  const handleDeleteAlert = React.useCallback(async (alertId: string, alertTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${alertTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await alertService.deleteAlert(alertId);
      await loadExistingAlerts();
      notificationService.showSuccess(`Successfully deleted "${alertTitle}"`, 'Alert Deleted');
    } catch (error) {
      logger.error('ManageAlertsTab', 'Error deleting alert', error);
      notificationService.showError('Failed to delete alert. Please try again.', 'Deletion Failed');
    }
  }, [alertService, loadExistingAlerts]);

  const validateEditForm = React.useCallback((): boolean => {
    if (!editingAlert) return false;

    const newErrors: IFormErrors = {};

    if (useMultiLanguage && editingAlert.languageContent) {
      // Validate multi-language content
      if (editingAlert.languageContent.length === 0) {
        newErrors.title = 'At least one language must be configured';
      } else {
        editingAlert.languageContent.forEach(content => {
          if (!content.title.trim()) {
            newErrors[`title_${content.language}`] = `Title is required for ${content.language}`;
          }
          if (!content.description.trim()) {
            newErrors[`description_${content.language}`] = `Description is required for ${content.language}`;
          }
          if (editingAlert.linkUrl && !content.linkDescription?.trim()) {
            newErrors[`linkDescription_${content.language}`] = `Link description is required for ${content.language} when URL is provided`;
          }
        });
      }
    } else {
      // Validate single language content
      if (!editingAlert.title?.trim()) {
        newErrors.title = "Title is required";
      } else if (editingAlert.title.length < 3) {
        newErrors.title = "Title must be at least 3 characters";
      } else if (editingAlert.title.length > 100) {
        newErrors.title = "Title cannot exceed 100 characters";
      }

      if (!editingAlert.description?.trim()) {
        newErrors.description = "Description is required";
      } else if (editingAlert.description.length < 10) {
        newErrors.description = "Description must be at least 10 characters";
      }

      if (editingAlert.linkUrl && !editingAlert.linkDescription?.trim()) {
        newErrors.linkDescription = "Link description is required when URL is provided";
      }
    }

    if (!editingAlert.AlertType) {
      newErrors.AlertType = "Alert type is required";
    }

    if (editingAlert.linkUrl && editingAlert.linkUrl.trim()) {
      try {
        new URL(editingAlert.linkUrl);
      } catch {
        newErrors.linkUrl = "Please enter a valid URL";
      }
    }

    // Validate site targeting
    if (!editingAlert.targetSites || editingAlert.targetSites.length === 0) {
      newErrors.targetSites = "At least one target site must be selected";
    }

    if (editingAlert.scheduledStart && editingAlert.scheduledEnd) {
      if (editingAlert.scheduledStart >= editingAlert.scheduledEnd) {
        newErrors.scheduledEnd = "End date must be after start date";
      }
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [editingAlert, useMultiLanguage]);

  const handleSaveEdit = React.useCallback(async () => {
    if (!editingAlert || !validateEditForm()) return;

    setIsEditingAlert(true);
    try {
      if (useMultiLanguage && editingAlert.languageContent && editingAlert.languageContent.length > 0) {
        // Update multi-language alert - need to update all language variants
        if (editingAlert.languageGroup) {
          // Get all alerts in this language group
          const groupAlerts = existingAlerts.filter(a => a.languageGroup === editingAlert.languageGroup);
          
          // Create updated alert items
          const updatedAlerts = editingAlert.languageContent.map(content => ({
            ...editingAlert,
            title: content.title,
            description: content.description,
            linkDescription: content.linkDescription || '',
            targetLanguage: content.language,
            availableForAll: content.availableForAll
          }));

          // Update each language variant
          for (let i = 0; i < updatedAlerts.length; i++) {
            const updatedAlert = updatedAlerts[i];
            const existingAlert = groupAlerts.find(a => a.targetLanguage === updatedAlert.targetLanguage);
            
            if (existingAlert) {
              // Update existing language variant
              await alertService.updateAlert(existingAlert.id, {
                title: updatedAlert.title,
                description: updatedAlert.description,
                AlertType: updatedAlert.AlertType,
                priority: updatedAlert.priority,
                isPinned: updatedAlert.isPinned,
                notificationType: updatedAlert.notificationType,
                linkUrl: updatedAlert.linkUrl,
                linkDescription: updatedAlert.linkDescription,
                scheduledStart: updatedAlert.scheduledStart?.toISOString(),
                scheduledEnd: updatedAlert.scheduledEnd?.toISOString(),
                availableForAll: updatedAlert.availableForAll
              });
            } else {
              // Create new language variant
              await alertService.createAlert({
                title: updatedAlert.title,
                description: updatedAlert.description,
                AlertType: updatedAlert.AlertType,
                priority: updatedAlert.priority,
                isPinned: updatedAlert.isPinned,
                notificationType: updatedAlert.notificationType,
                linkUrl: updatedAlert.linkUrl,
                linkDescription: updatedAlert.linkDescription,
                targetSites: existingAlerts.find(a => a.languageGroup === editingAlert.languageGroup)?.targetSites || [],
                scheduledStart: updatedAlert.scheduledStart?.toISOString(),
                scheduledEnd: updatedAlert.scheduledEnd?.toISOString(),
                contentType: updatedAlert.contentType,
                targetLanguage: updatedAlert.targetLanguage,
                languageGroup: updatedAlert.languageGroup,
                availableForAll: updatedAlert.availableForAll
              });
            }
          }

          // Delete language variants that were removed
          const updatedLanguages = editingAlert.languageContent.map(c => c.language);
          const toDelete = groupAlerts.filter(a => !updatedLanguages.includes(a.targetLanguage));
          for (const alertToDelete of toDelete) {
            await alertService.deleteAlert(alertToDelete.id);
          }
        }
      } else {
        // Update single language alert
        await alertService.updateAlert(editingAlert.id, {
          title: editingAlert.title,
          description: editingAlert.description,
          AlertType: editingAlert.AlertType,
          priority: editingAlert.priority,
          isPinned: editingAlert.isPinned,
          notificationType: editingAlert.notificationType,
          linkUrl: editingAlert.linkUrl,
          linkDescription: editingAlert.linkDescription,
          scheduledStart: editingAlert.scheduledStart?.toISOString(),
          scheduledEnd: editingAlert.scheduledEnd?.toISOString()
        });
      }

      setEditingAlert(null);
      setEditErrors({});
      setUseMultiLanguage(false);
      await loadExistingAlerts();
      notificationService.showSuccess('Alert updated successfully!', 'Update Complete');
    } catch (error) {
      logger.error('ManageAlertsTab', 'Error updating alert', error);
      notificationService.showError('Failed to update alert. Please try again.', 'Update Failed');
    } finally {
      setIsEditingAlert(false);
    }
  }, [editingAlert, validateEditForm, setIsEditingAlert, alertService, setEditingAlert, setEditErrors, loadExistingAlerts, useMultiLanguage, existingAlerts, notificationService]);

  const handleCancelEdit = React.useCallback(() => {
    setEditingAlert(null);
    setEditErrors({});
    setUseMultiLanguage(false);
  }, [setEditingAlert]);

  // Helper function to get current alert type for preview (matching CreateAlerts)
  const getCurrentAlertType = React.useCallback((): IAlertType | undefined => {
    if (!editingAlert) return undefined;
    return alertTypes.find(type => type.name === editingAlert.AlertType);
  }, [alertTypes, editingAlert]);

  // Helper function to check if date matches filter
  const matchesDateFilter = React.useCallback((alert: IAlertItem): boolean => {
    if (dateFilter === 'all') return true;
    
    const alertDate = new Date(alert.createdDate || Date.now());
    const now = new Date();
    
    switch (dateFilter) {
      case 'today':
        return alertDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return alertDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return alertDate >= monthAgo;
      case 'custom':
        if (!customDateFrom && !customDateTo) return true;
        const fromDate = customDateFrom ? new Date(customDateFrom) : new Date(0);
        const toDate = customDateTo ? new Date(customDateTo) : new Date();
        return alertDate >= fromDate && alertDate <= toDate;
      default:
        return true;
    }
  }, [dateFilter, customDateFrom, customDateTo]);

  // Group alerts by language group with enhanced filtering
  const groupedAlerts = React.useMemo(() => {
    let filteredAlerts = [...existingAlerts];
    
    // Apply content type filter
    if (contentTypeFilter !== 'all') {
      filteredAlerts = filteredAlerts.filter(a => a.contentType === contentTypeFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filteredAlerts = filteredAlerts.filter(a => a.priority === priorityFilter);
    }
    
    // Apply alert type filter
    if (alertTypeFilter !== 'all') {
      filteredAlerts = filteredAlerts.filter(a => a.AlertType === alertTypeFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filteredAlerts = filteredAlerts.filter(a => a.status.toLowerCase() === statusFilter.toLowerCase());
    }
    
    // Apply language filter
    if (languageFilter !== 'all') {
      filteredAlerts = filteredAlerts.filter(a => a.targetLanguage === languageFilter);
    }
    
    // Apply notification type filter
    if (notificationFilter !== 'all') {
      filteredAlerts = filteredAlerts.filter(a => a.notificationType === notificationFilter);
    }
    
    // Apply date filter
    filteredAlerts = filteredAlerts.filter(matchesDateFilter);
    
    // Apply search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filteredAlerts = filteredAlerts.filter(alert =>
        alert.title?.toLowerCase().includes(search) ||
        alert.description?.toLowerCase().includes(search) ||
        alert.AlertType?.toLowerCase().includes(search) ||
        alert.createdBy?.toLowerCase().includes(search) ||
        alert.linkDescription?.toLowerCase().includes(search) ||
        alert.contentType?.toLowerCase().includes(search) ||
        alert.priority?.toLowerCase().includes(search) ||
        alert.status?.toLowerCase().includes(search)
      );
    }
    
    const groups: { [key: string]: IAlertItem[] } = {};
    const ungrouped: IAlertItem[] = [];
    
    filteredAlerts.forEach(alert => {
      if (alert.languageGroup) {
        if (!groups[alert.languageGroup]) {
          groups[alert.languageGroup] = [];
        }
        groups[alert.languageGroup].push(alert);
      } else {
        ungrouped.push(alert);
      }
    });
    
    // Create combined display items: one item per language group, plus all ungrouped items
    const displayItems: (IAlertItem & { isLanguageGroup?: boolean; languageVariants?: IAlertItem[] })[] = [];
    
    // Add language groups (show primary language variant as the main item)
    Object.entries(groups).forEach(([languageGroup, variants]) => {
      // Use the first variant as the primary display item, with variants attached
      const primaryVariant = variants.find(v => v.targetLanguage === TargetLanguage.EnglishUS) || variants[0];
      displayItems.push({
        ...primaryVariant,
        isLanguageGroup: true,
        languageVariants: variants
      });
    });
    
    // Add ungrouped items
    displayItems.push(...ungrouped);
    
    return displayItems;
  }, [
    existingAlerts, 
    contentTypeFilter, 
    priorityFilter, 
    alertTypeFilter, 
    statusFilter, 
    languageFilter, 
    notificationFilter,
    dateFilter, 
    customDateFrom, 
    customDateTo, 
    searchTerm, 
    matchesDateFilter
  ]);

  // Load alerts on mount
  React.useEffect(() => {
    loadExistingAlerts();
  }, [loadExistingAlerts]);

  return (
    <>
      <div className={styles.tabContent}>
        <div className={styles.tabHeader}>
          <div>
            <h3>Manage Alerts</h3>
            <p>View, edit, and manage existing alerts across your sites</p>
          </div>
          <div className={styles.flexRowGap12}>
            {selectedAlerts.length === 1 && (
              <SharePointButton
                variant="primary"
                icon={<Edit24Regular />}
                onClick={() => {
                  const selectedAlert = groupedAlerts.find(alert => selectedAlerts.includes(alert.id));
                  if (selectedAlert) {
                    handleEditAlert(selectedAlert);
                  }
                }}
              >
                Edit Selected
              </SharePointButton>
            )}
            {selectedAlerts.length > 0 && (
              <SharePointButton
                variant="danger"
                icon={<Delete24Regular />}
                onClick={handleBulkDelete}
              >
                Delete Selected ({selectedAlerts.length})
              </SharePointButton>
            )}
            <SharePointButton
              variant="secondary"
              onClick={loadExistingAlerts}
              disabled={isLoadingAlerts}
            >
              {isLoadingAlerts ? 'Refreshing...' : 'Refresh'}
            </SharePointButton>
            <button
              className={styles.filterToggleButton}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter24Regular />
              {showFilters ? 'Hide' : 'Show'} Filters
              {showFilters ? <ChevronUp24Regular /> : <ChevronDown24Regular />}
            </button>
          </div>
        </div>

        {isLoadingAlerts ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingTitle}>Loading alerts...</div>
            <div className={styles.loadingSubtitle}>Please wait while we fetch your alerts</div>
          </div>
        ) : existingAlerts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📢</div>
            <h4>No Alerts Found</h4>
            <p>No alerts are currently available. This might be because:</p>
            <ul className={styles.emptyStateList}>
              <li>The Alert Banner lists haven't been created yet</li>
              <li>You don't have access to the lists</li>
              <li>No alerts have been created yet</li>
            </ul>
            <div className={styles.flexRowCentered}>
              <SharePointButton
                variant="primary"
                onClick={() => setActiveTab("create")}
              >
                Create First Alert
              </SharePointButton>
              <SharePointButton
                variant="secondary"
                onClick={loadExistingAlerts}
              >
                Refresh
              </SharePointButton>
            </div>
          </div>
        ) : (
          <div className={styles.alertsList}>
            {/* Enhanced Filter Section */}
            <div className={styles.filterSection}>
              <div className={styles.filterHeader}>
                <div className={styles.filterSummary}>
                  <span>Showing {groupedAlerts.length} of {existingAlerts.length} items</span>
                  <span>{groupedAlerts.filter(a => a.isLanguageGroup).length} multi-language groups</span>
                </div>
              </div>

              {/* Search Bar - Always Visible */}
              <div className={styles.searchBar}>
                <SharePointInput
                  label=""
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="🔍 Search alerts and templates by title, description, type, priority, or author..."
                  className={styles.searchInput}
                />
              </div>

              {/* Collapsible Advanced Filters */}
              {showFilters && (
                <div className={styles.advancedFilters}>
                  <div className={styles.filterGrid}>
                    {/* Content Type Filter */}
                    <SharePointSelect
                      label="Content Type"
                      value={contentTypeFilter}
                      onChange={(value) => setContentTypeFilter(value as 'all' | ContentType)}
                      options={[
                        { value: ContentType.Alert, label: '📢 Alerts' },
                        { value: ContentType.Template, label: '📄 Templates' }
                      ]}
                    />

                    {/* Priority Filter */}
                    <SharePointSelect
                      label="Priority"
                      value={priorityFilter}
                      onChange={(value) => setPriorityFilter(value as 'all' | AlertPriority)}
                      options={[
                        { value: 'all', label: '🔘 All Priorities' },
                        { value: AlertPriority.Critical, label: '🔴 Critical' },
                        { value: AlertPriority.High, label: '🟠 High' },
                        { value: AlertPriority.Medium, label: '🟡 Medium' },
                        { value: AlertPriority.Low, label: '🟢 Low' }
                      ]}
                    />

                    {/* Alert Type Filter */}
                    <SharePointSelect
                      label="Alert Type"
                      value={alertTypeFilter}
                      onChange={(value) => setAlertTypeFilter(value)}
                      options={[
                        { value: 'all', label: '🎨 All Types' },
                        ...alertTypes.map(type => ({
                          value: type.name,
                          label: `${type.iconName ? '🎯' : '📢'} ${type.name}`
                        }))
                      ]}
                    />

                    {/* Status Filter */}
                    <SharePointSelect
                      label="Status"
                      value={statusFilter}
                      onChange={(value) => setStatusFilter(value)}
                      options={[
                        { value: 'all', label: '⚪ All Statuses' },
                        { value: 'active', label: '🟢 Active' },
                        { value: 'expired', label: '🔴 Expired' },
                        { value: 'scheduled', label: '🟡 Scheduled' }
                      ]}
                    />

                    {/* Language Filter */}
                    <SharePointSelect
                      label="Language"
                      value={languageFilter}
                      onChange={(value) => setLanguageFilter(value as 'all' | TargetLanguage)}
                      options={[
                        { value: 'all', label: '🌐 All Languages' },
                        { value: TargetLanguage.All, label: '🌍 Multi-Language' },
                        ...supportedLanguages.map(lang => ({
                          value: lang.code,
                          label: `${lang.flag} ${lang.nativeName}`
                        }))
                      ]}
                    />

                    {/* Notification Type Filter */}
                    <SharePointSelect
                      label="Notification Type"
                      value={notificationFilter}
                      onChange={(value) => setNotificationFilter(value as 'all' | NotificationType)}
                      options={[
                        { value: 'all', label: '📧 All Notification Types' },
                        { value: NotificationType.None, label: '🚫 None - Banner only' },
                        { value: NotificationType.Browser, label: '🌐 Browser - Banner display' },
                        { value: NotificationType.Email, label: '📧 Email only - No banner' },
                        { value: NotificationType.Both, label: '📧🌐 Browser + Email' }
                      ]}
                    />

                    {/* Date Filter */}
                    <SharePointSelect
                      label="Created Date"
                      value={dateFilter}
                      onChange={(value) => setDateFilter(value as any)}
                      options={[
                        { value: 'all', label: '📅 All Dates' },
                        { value: 'today', label: '📅 Today' },
                        { value: 'week', label: '📅 This Week' },
                        { value: 'month', label: '📅 This Month' },
                        { value: 'custom', label: '📅 Custom Range' }
                      ]}
                    />
                  </div>

                  {/* Custom Date Range */}
                  {dateFilter === 'custom' && (
                    <div className={styles.dateRangeFilters}>
                      <SharePointInput
                        label="From Date"
                        type="date"
                        value={customDateFrom}
                        onChange={setCustomDateFrom}
                      />
                      <SharePointInput
                        label="To Date"
                        type="date"
                        value={customDateTo}
                        onChange={setCustomDateTo}
                      />
                    </div>
                  )}

                  {/* Clear Filters Button */}
                  <div className={styles.filterActions}>
                    <SharePointButton
                      variant="secondary"
                      onClick={() => {
                        setContentTypeFilter(ContentType.Alert);
                        setPriorityFilter('all');
                        setAlertTypeFilter('all');
                        setStatusFilter('all');
                        setLanguageFilter('all');
                        setNotificationFilter('all');
                        setDateFilter('all');
                        setCustomDateFrom('');
                        setCustomDateTo('');
                        setSearchTerm('');
                      }}
                    >
                      Clear All Filters
                    </SharePointButton>
                  </div>
                </div>
              )}
            </div>

            {groupedAlerts.map((alert) => {
              const alertType = alertTypes.find(type => type.name === alert.AlertType);
              const isSelected = selectedAlerts.includes(alert.id);
              const isMultiLanguage = alert.isLanguageGroup && alert.languageVariants && alert.languageVariants.length > 1;
              
              // Template rendering validation
              if (alert.contentType === ContentType.Template && (!alert.title || !alert.description)) {
                logger.warn('ManageAlertsTab', `Template ${alert.id} has missing content`, {
                  hasTitle: !!alert.title,
                  hasDescription: !!alert.description
                });
              }
              
              return (
                  <div key={alert.id} className={`${styles.alertCard} ${isSelected ? styles.selected : ''} ${alert.contentType === ContentType.Template ? styles.templateCard : ''}`}>
                    <div className={styles.alertCardHeader}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAlerts(prev => [...prev, alert.id]);
                          } else {
                            setSelectedAlerts(prev => prev.filter(id => id !== alert.id));
                          }
                        }}
                        className={styles.alertCheckbox}
                      />
                      <div className={styles.alertStatus}>
                        <span className={`${styles.statusBadge} ${alert.status.toLowerCase() === 'active' ? styles.active : alert.status.toLowerCase() === 'expired' ? styles.expired : styles.scheduled}`}>
                          {alert.status}
                        </span>
                        {alert.isPinned && (
                          <span className={styles.pinnedBadge}>📌 PINNED</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Force render alertCardContent with error boundaries for templates */}
                    <div className={styles.alertCardContent} style={alert.contentType === ContentType.Template ? { display: 'block', visibility: 'visible', opacity: 1 } : {}}>
                    {/* Show AlertType if available, otherwise show content type */}
                    {alert.AlertType ? (
                      <div 
                        className={styles.alertTypeIndicator}
                        style={{
                          '--bg-color': alertType?.backgroundColor || '#0078d4',
                          '--text-color': alertType?.textColor || '#ffffff'
                        } as React.CSSProperties}
                      >
                        {alert.AlertType}
                      </div>
                    ) : (
                      <div 
                        className={styles.alertTypeIndicator}
                        style={{
                          '--bg-color': alert.contentType === ContentType.Template ? '#8764b8' : '#0078d4',
                          '--text-color': '#ffffff'
                        } as React.CSSProperties}
                      >
                        {alert.contentType === ContentType.Template ? '📄 Template' : '📢 Alert'}
                      </div>
                    )}
                    
                    <h4 className={styles.alertCardTitle}>
                      {alert.title || '[No Title Available]'}
                      {isMultiLanguage && (
                        <span className={styles.multiLanguageBadge}>
                          <Globe24Regular style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                          {alert.languageVariants?.length} languages
                        </span>
                      )}
                    </h4>
                    
                    <div className={styles.alertCardDescription}>
                      {alert.description ? (
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: htmlSanitizer.sanitizeHtml(
                              alert.description.length > 150 
                                ? alert.description.substring(0, 150) + '...' 
                                : alert.description
                            )
                          }}
                        />
                      ) : (
                        <em style={{ color: '#999' }}>[No Description Available]</em>
                      )}
                    </div>
                    
                    <div className={styles.alertMetaData}>
                      <div className={styles.metaInfo}>
                        <strong>Type:</strong> 
                        <span className={`${styles.contentTypeBadge} ${alert.contentType === ContentType.Template ? styles.template : styles.alert}`}>
                          {alert.contentType === ContentType.Template ? '📄 Template' : '📢 Alert'}
                        </span>
                      </div>
                      <div className={styles.metaInfo}>
                        <strong>Priority:</strong> {alert.priority}
                      </div>
                      <div className={styles.metaInfo}>
                        <strong>Language:</strong> 
                        {isMultiLanguage ? (
                          <span className={styles.languageList}>
                            🌐 Multi-language ({alert.languageVariants?.map(v => 
                              supportedLanguages.find(l => l.code === v.targetLanguage)?.flag || v.targetLanguage
                            ).join(' ')})
                          </span>
                        ) : (
                          alert.targetLanguage === TargetLanguage.All ? '🌐 All Languages' : 
                          supportedLanguages.find(l => l.code === alert.targetLanguage)?.flag + ' ' + 
                          supportedLanguages.find(l => l.code === alert.targetLanguage)?.nativeName || alert.targetLanguage
                        )}
                      </div>
                      {alert.linkUrl && (
                        <div className={styles.metaInfo}>
                          <strong>Action:</strong> {alert.linkDescription}
                        </div>
                      )}
                      <div className={styles.metaInfo}>
                        <strong>Created:</strong> {new Date(alert.createdDate || Date.now()).toLocaleDateString()}
                      </div>
                      {alert.scheduledStart && (
                        <div className={styles.metaInfo}>
                          <strong>Start:</strong> {new Date(alert.scheduledStart).toLocaleString()}
                        </div>
                      )}
                      {alert.scheduledEnd && (
                        <div className={styles.metaInfo}>
                          <strong>End:</strong> {new Date(alert.scheduledEnd).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.alertCardActions}>
                    <SharePointButton
                      variant="secondary"
                      icon={<Edit24Regular />}
                      onClick={() => {
                        handleEditAlert(alert);
                      }}
                    >
                      Edit
                    </SharePointButton>
                    <SharePointButton
                      variant="danger"
                      icon={<Delete24Regular />}
                      onClick={() => {
                        handleDeleteAlert(alert.id, alert.title);
                      }}
                    >
                      Delete
                    </SharePointButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Enhanced Edit Alert Dialog - Matching CreateAlerts Layout */}
      {editingAlert && (
        <SharePointDialog
          isOpen={!!editingAlert}
          onClose={handleCancelEdit}
          title={`Edit ${editingAlert.contentType === ContentType.Template ? 'Template' : 'Alert'}: ${editingAlert.title}`}
          width={1200}
          height={800}
        >
          <div className={styles.alertForm}>
            <div className={styles.formWithPreview}>
              <div className={styles.formColumn}>
                <SharePointSection title="Content Classification">
                  <SharePointSelect
                    label="Content Type"
                    value={editingAlert.contentType}
                    onChange={(value) => setEditingAlert(prev => prev ? { ...prev, contentType: value as ContentType } : null)}
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
                        value={editingAlert.targetLanguage}
                        onChange={(value) => setEditingAlert(prev => prev ? { ...prev, targetLanguage: value as TargetLanguage } : null)}
                        options={languageOptions}
                        required
                        description="Choose which language audience this alert targets"
                      />
                    </SharePointSection>

                    <SharePointSection title="Basic Information">
                      <SharePointInput
                        label="Alert Title"
                        value={editingAlert.title}
                        onChange={(value) => {
                          setEditingAlert(prev => prev ? { ...prev, title: value } : null);
                          if (editErrors.title) setEditErrors(prev => ({ ...prev, title: undefined }));
                        }}
                        placeholder="Enter a clear, concise title"
                        required
                        error={editErrors.title}
                        description="This will be the main heading of your alert (3-100 characters)"
                      />

                      <SharePointRichTextEditor
                        label="Alert Description"
                        value={editingAlert.description}
                        onChange={(value) => {
                          setEditingAlert(prev => prev ? { ...prev, description: value } : null);
                          if (editErrors.description) setEditErrors(prev => ({ ...prev, description: undefined }));
                        }}
                        placeholder="Provide detailed information about the alert..."
                        required
                        error={editErrors.description}
                        description="Use the toolbar to format your message with rich text, links, lists, and more."
                      />
                    </SharePointSection>
                  </>
                ) : (
                  <SharePointSection title="Multi-Language Content">
                    <MultiLanguageContentEditor
                      content={editingAlert.languageContent || []}
                      onContentChange={(content) => {
                        setEditingAlert(prev => prev ? { ...prev, languageContent: content } : null);
                      }}
                      availableLanguages={supportedLanguages}
                      errors={editErrors}
                      linkUrl={editingAlert.linkUrl}
                      tenantDefaultLanguage={tenantDefaultLanguage}
                    />
                  </SharePointSection>
                )}

                <SharePointSection title="Alert Configuration">
                  <SharePointSelect
                    label="Alert Type"
                    value={editingAlert.AlertType}
                    onChange={(value) => {
                      setEditingAlert(prev => prev ? { ...prev, AlertType: value } : null);
                      if (editErrors.AlertType) setEditErrors(prev => ({ ...prev, AlertType: undefined }));
                    }}
                    options={alertTypeOptions}
                    required
                    error={editErrors.AlertType}
                    description="Select the visual style and category for this alert"
                  />

                  <SharePointSelect
                    label="Priority Level"
                    value={editingAlert.priority}
                    onChange={(value) => setEditingAlert(prev => prev ? { ...prev, priority: value as AlertPriority } : null)}
                    options={priorityOptions}
                    required
                    description="Set the importance level - affects visual styling and user attention"
                  />

                  <SharePointToggle
                    label="Pin Alert to Top"
                    checked={editingAlert.isPinned}
                    onChange={(checked) => setEditingAlert(prev => prev ? { ...prev, isPinned: checked } : null)}
                    description="Pinned alerts appear at the top and are more prominent"
                  />

                  <SharePointSelect
                    label="Notification Method"
                    value={editingAlert.notificationType}
                    onChange={(value) => setEditingAlert(prev => prev ? { ...prev, notificationType: value as NotificationType } : null)}
                    options={notificationOptions}
                    description="Choose how users will be notified about this alert"
                  />
                </SharePointSection>

                <SharePointSection title="Action Link (Optional)">
                  <SharePointInput
                    label="Link URL"
                    value={editingAlert.linkUrl || ""}
                    onChange={(value) => {
                      setEditingAlert(prev => prev ? { ...prev, linkUrl: value } : null);
                      if (editErrors.linkUrl) setEditErrors(prev => ({ ...prev, linkUrl: undefined }));
                    }}
                    placeholder="https://example.com/more-info"
                    error={editErrors.linkUrl}
                    description="Optional link for users to get more information or take action"
                  />

                  {editingAlert.linkUrl && !useMultiLanguage && (
                    <SharePointInput
                      label="Link Description"
                      value={editingAlert.linkDescription || ""}
                      onChange={(value) => {
                        setEditingAlert(prev => prev ? { ...prev, linkDescription: value } : null);
                        if (editErrors.linkDescription) setEditErrors(prev => ({ ...prev, linkDescription: undefined }));
                      }}
                      placeholder="Learn More"
                      required={!!editingAlert.linkUrl}
                      error={editErrors.linkDescription}
                      description="Text that will appear on the link button"
                    />
                  )}
                  
                  {editingAlert.linkUrl && useMultiLanguage && (
                    <div className={styles.infoMessage}>
                      <p>💡 <strong>Multi-Language Mode:</strong> Link descriptions are configured per language in the Multi-Language Content section above.</p>
                    </div>
                  )}
                </SharePointSection>

                <SharePointSection title="Site Targeting">
                  <SiteSelector
                    selectedSites={editingAlert.targetSites || []}
                    onSitesChange={(sites: string[]) => {
                      setEditingAlert(prev => prev ? { ...prev, targetSites: sites } : null);
                      if (editErrors.targetSites) setEditErrors(prev => ({ ...prev, targetSites: undefined }));
                    }}
                    siteDetector={siteDetector}
                    graphClient={graphClient}
                  />
                  {editErrors.targetSites && (
                    <div className={styles.errorMessage}>{editErrors.targetSites}</div>
                  )}
                  <div className={styles.fieldDescription}>
                    Choose which SharePoint sites will display this alert
                  </div>
                </SharePointSection>

                <SharePointSection title="Scheduling & Timing">
                  <div className={styles.schedulingContainer}>
                    <div className={styles.schedulingHeader}>
                      <p className={styles.schedulingDescription}>
                        Configure when this alert will be visible to users. Leave dates empty for immediate activation and manual control.
                      </p>
                    </div>

                    <div className={styles.schedulingGrid}>
                      <div>
                        <SharePointInput
                          label="Start Date & Time"
                          type="datetime-local"
                          value={editingAlert.scheduledStart ? new Date(editingAlert.scheduledStart.getTime() - editingAlert.scheduledStart.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                          onChange={(value) => {
                            setEditingAlert(prev => prev ? { 
                              ...prev, 
                              scheduledStart: value ? new Date(value) : undefined 
                            } : null);
                            if (editErrors.scheduledStart) setEditErrors(prev => ({ ...prev, scheduledStart: undefined }));
                          }}
                          error={editErrors.scheduledStart}
                          description="When this alert becomes active"
                        />
                      </div>

                      <div>
                        <SharePointInput
                          label="End Date & Time"
                          type="datetime-local"
                          value={editingAlert.scheduledEnd ? new Date(editingAlert.scheduledEnd.getTime() - editingAlert.scheduledEnd.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                          onChange={(value) => {
                            setEditingAlert(prev => prev ? { 
                              ...prev, 
                              scheduledEnd: value ? new Date(value) : undefined 
                            } : null);
                            if (editErrors.scheduledEnd) setEditErrors(prev => ({ ...prev, scheduledEnd: undefined }));
                          }}
                          error={editErrors.scheduledEnd}
                          description="When this alert expires"
                        />
                      </div>
                    </div>

                    {/* Schedule Summary */}
                    <div className={styles.scheduleSummary}>
                      <h4>Schedule Summary</h4>
                      {!editingAlert.scheduledStart && !editingAlert.scheduledEnd ? (
                        <p>⚡ <strong>Immediate & Manual:</strong> Alert is active immediately and requires manual deactivation</p>
                      ) : editingAlert.scheduledStart && !editingAlert.scheduledEnd ? (
                        <p>📅 <strong>Scheduled Start:</strong> Alert activates on {new Date(editingAlert.scheduledStart).toLocaleString()} and remains active until manually deactivated</p>
                      ) : !editingAlert.scheduledStart && editingAlert.scheduledEnd ? (
                        <p>⏰ <strong>Auto-Expire:</strong> Alert is active immediately until {new Date(editingAlert.scheduledEnd).toLocaleString()}</p>
                      ) : (
                        <p>📅 <strong>Fully Scheduled:</strong> Active from {new Date(editingAlert.scheduledStart!).toLocaleString()} to {new Date(editingAlert.scheduledEnd!).toLocaleString()}</p>
                      )}
                    </div>

                    {/* Time Zone Info */}
                    <div className={styles.timezoneInfo}>
                      <p>🌍 <strong>Time Zone:</strong> All times are in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})</p>
                    </div>
                  </div>
                </SharePointSection>

                {/* Action Buttons */}
                <div className={styles.formActions}>
                  <SharePointButton
                    variant="primary"
                    onClick={handleSaveEdit}
                    disabled={isEditingAlert}
                    icon={<Save24Regular />}
                  >
                    {isEditingAlert ? 'Saving Changes...' : 'Save Changes'}
                  </SharePointButton>

                  <SharePointButton
                    variant="secondary"
                    onClick={handleCancelEdit}
                    disabled={isEditingAlert}
                  >
                    Cancel
                  </SharePointButton>

                  <SharePointButton
                    variant="secondary"
                    onClick={() => setShowPreview(!showPreview)}
                    icon={<Eye24Regular />}
                  >
                    {showPreview ? "Hide Preview" : "Show Preview"}
                  </SharePointButton>
                </div>
              </div>

              {/* Preview Column */}
              {showPreview && (
                <div className={styles.formColumn}>
                  <div className={styles.alertCard}>
                    <h3>Live Preview</h3>
                    
                    {/* Multi-language preview mode selector */}
                    {useMultiLanguage && editingAlert.languageContent && editingAlert.languageContent.length > 0 && (
                      <div className={styles.previewLanguageSelector}>
                        <label className={styles.previewLabel}>Preview Language:</label>
                        <div className={styles.previewLanguageButtons}>
                          {editingAlert.languageContent.map((content, index) => {
                            const lang = supportedLanguages.find(l => l.code === content.language);
                            return (
                              <SharePointButton
                                key={content.language}
                                variant={index === 0 ? "primary" : "secondary"}
                                onClick={() => {
                                  // Move selected language to front for preview
                                  const reorderedContent = [content, ...editingAlert.languageContent!.filter((_, i) => i !== index)];
                                  setEditingAlert(prev => prev ? { ...prev, languageContent: reorderedContent } : null);
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
                      title={useMultiLanguage && editingAlert.languageContent && editingAlert.languageContent.length > 0 
                        ? editingAlert.languageContent[0]?.title || "Multi-language Alert Title"
                        : editingAlert.title || "Alert Title"}
                      description={useMultiLanguage && editingAlert.languageContent && editingAlert.languageContent.length > 0
                        ? editingAlert.languageContent[0]?.description || "Multi-language alert description will appear here..."
                        : editingAlert.description || "Alert description will appear here..."}
                      alertType={getCurrentAlertType() || { name: "Default", iconName: "Info", backgroundColor: "#0078d4", textColor: "#ffffff", additionalStyles: "", priorityStyles: {} }}
                      priority={editingAlert.priority}
                      linkUrl={editingAlert.linkUrl}
                      linkDescription={useMultiLanguage && editingAlert.languageContent && editingAlert.languageContent.length > 0
                        ? editingAlert.languageContent[0]?.linkDescription || "Learn More"
                        : editingAlert.linkDescription || "Learn More"}
                      isPinned={editingAlert.isPinned}
                    />

                    {/* Multi-language preview info */}
                    {useMultiLanguage && editingAlert.languageContent && editingAlert.languageContent.length > 0 && (
                      <div className={styles.multiLanguagePreviewInfo}>
                        <p><strong>Multi-Language {editingAlert.contentType === ContentType.Template ? 'Template' : 'Alert'}</strong></p>
                        <p>Currently previewing: <strong>{supportedLanguages.find(l => l.code === editingAlert.languageContent![0]?.language)?.nativeName || editingAlert.languageContent![0]?.language}</strong></p>
                        <p>Available in {editingAlert.languageContent.length} language(s): {editingAlert.languageContent.map(c => supportedLanguages.find(l => l.code === c.language)?.flag || c.language).join(' ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </SharePointDialog>
      )}
    </>
  );
};

export default ManageAlertsTab;