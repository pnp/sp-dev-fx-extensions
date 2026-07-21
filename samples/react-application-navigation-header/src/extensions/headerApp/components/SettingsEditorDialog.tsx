import * as React from 'react';
import {
  Button,
  Spinner,
  OverlayDrawer,
  DrawerBody,
  TabList,
  Tab,
  Switch,
  Input,
  Textarea,
  Label,
  Field
} from '@fluentui/react-components';
import {
  Dismiss24Regular,
  ArrowDownload20Regular,
  ArrowUpload20Regular
} from '@fluentui/react-icons';

import type { ISettingsFile, IGeneralSettings } from '../models/ISettingsFile';
import { DEFAULT_SETTINGS } from '../models/ISettingsFile';
import type { IHeaderFeatures, IHeaderFeatureFlags } from '../models/IHeaderFeatures';
import { DEFAULT_FEATURE_FLAGS } from '../models/IHeaderFeatures';
import type { IHeaderColorOverrides, IHeaderFontOverrides } from '../utils/theme';
import { applyThemeStylesToElement } from '../utils/theme';
import type { INavigationItem } from '../models/INavigationItem';
import { JsonFileNavigationService } from '../services/JsonFileNavigationService';
import { sanitizeHtml } from '../utils/sanitize';
import { sanitizeUrl } from '../utils/url';
import { ConcurrentModificationError } from '../utils/spFileConcurrency';
import { isPlainObject, sanitizeNavigationItems } from '../utils/navigationFileValidation';
import { classNames } from '../utils/navigation';
import { reportError } from '../utils/errorReporting';
import { DynamicIcon } from './DynamicIcon';
import {
  validateUrl,
  validateGuid,
  validateFontSize,
  validatePositiveInt,
  validateFileName,
  validateFolder,
  hasValidationErrors,
  type IFieldValidationState
} from '../utils/validation';
import ColorPicker from './ColorPicker';
import { NavigationTreeEditor } from './NavigationTreeEditor';
import type { ISettingsEditorStrings, ISettingsEditorDialogProps } from './SettingsEditorDialog.types';
import styles from './SettingsEditorDialog.module.scss';

export type { ISettingsEditorStrings, ISettingsEditorDialogProps };

type TabKey = 'general' | 'features' | 'colors' | 'typography' | 'navigation';

interface IFeatureToggleDefinition {
  key: keyof IHeaderFeatureFlags;
  icon: string;
  labelKey: keyof ISettingsEditorStrings;
  descKey: keyof ISettingsEditorStrings;
  dependsOn?: keyof IHeaderFeatureFlags;
  section: 'search' | 'chrome' | 'content';
}

const FEATURE_TOGGLES: IFeatureToggleDefinition[] = [

  { key: 'searchEnabled', icon: 'Search', labelKey: 'featureSearchLabel' as keyof ISettingsEditorStrings, descKey: 'featureSearchDesc' as keyof ISettingsEditorStrings, section: 'search' },
  { key: 'searchSuggestionsEnabled', icon: 'QueryList', labelKey: 'featureSearchSuggestionsLabel' as keyof ISettingsEditorStrings, descKey: 'featureSearchSuggestionsDesc' as keyof ISettingsEditorStrings, dependsOn: 'searchEnabled', section: 'search' },

  { key: 'userProfileEnabled', icon: 'Contact', labelKey: 'featureUserProfileLabel' as keyof ISettingsEditorStrings, descKey: 'featureUserProfileDesc' as keyof ISettingsEditorStrings, section: 'chrome' },
  { key: 'notificationsEnabled', icon: 'Ringer', labelKey: 'featureNotificationsLabel' as keyof ISettingsEditorStrings, descKey: 'featureNotificationsDesc' as keyof ISettingsEditorStrings, section: 'chrome' },
  { key: 'appLauncherEnabled', icon: 'AppIconDefault', labelKey: 'featureAppLauncherLabel' as keyof ISettingsEditorStrings, descKey: 'featureAppLauncherDesc' as keyof ISettingsEditorStrings, section: 'chrome' },
  { key: 'quickActionsEnabled', icon: 'LightningBolt', labelKey: 'featureQuickActionsLabel' as keyof ISettingsEditorStrings, descKey: 'featureQuickActionsDesc' as keyof ISettingsEditorStrings, section: 'chrome' },
  { key: 'languageSwitcherEnabled', icon: 'LocaleLanguage', labelKey: 'featureLanguageSwitcherLabel' as keyof ISettingsEditorStrings, descKey: 'featureLanguageSwitcherDesc' as keyof ISettingsEditorStrings, section: 'chrome' },
  { key: 'bookmarksEnabled', icon: 'Bookmark', labelKey: 'featureBookmarksLabel' as keyof ISettingsEditorStrings, descKey: 'featureBookmarksDesc' as keyof ISettingsEditorStrings, section: 'chrome' },
  { key: 'adminSettingsEnabled', icon: 'Settings', labelKey: 'featureAdminSettingsLabel' as keyof ISettingsEditorStrings, descKey: 'featureAdminSettingsDesc' as keyof ISettingsEditorStrings, section: 'chrome' },
  { key: 'helpEnabled', icon: 'Help', labelKey: 'featureHelpLabel' as keyof ISettingsEditorStrings, descKey: 'featureHelpDesc' as keyof ISettingsEditorStrings, section: 'chrome' },
  { key: 'feedbackEnabled', icon: 'Feedback', labelKey: 'featureFeedbackLabel' as keyof ISettingsEditorStrings, descKey: 'featureFeedbackDesc' as keyof ISettingsEditorStrings, section: 'chrome' },
  { key: 'printShareEnabled', icon: 'Print', labelKey: 'featurePrintShareLabel' as keyof ISettingsEditorStrings, descKey: 'featurePrintShareDesc' as keyof ISettingsEditorStrings, section: 'chrome' },

  { key: 'backToTopEnabled', icon: 'UpArrow', labelKey: 'featureBackToTopLabel' as keyof ISettingsEditorStrings, descKey: 'featureBackToTopDesc' as keyof ISettingsEditorStrings, section: 'content' },
  { key: 'accessibilityToolsEnabled', icon: 'Accessibility', labelKey: 'featureAccessibilityToolsLabel' as keyof ISettingsEditorStrings, descKey: 'featureAccessibilityToolsDesc' as keyof ISettingsEditorStrings, section: 'content' },
  { key: 'breadcrumbsEnabled', icon: 'BulletedListBullets', labelKey: 'featureBreadcrumbsLabel' as keyof ISettingsEditorStrings, descKey: 'featureBreadcrumbsDesc' as keyof ISettingsEditorStrings, section: 'content' },
  { key: 'footerEnabled', icon: 'Page', labelKey: 'featureFooterLabel' as keyof ISettingsEditorStrings, descKey: 'featureFooterDesc' as keyof ISettingsEditorStrings, section: 'content' },
  { key: 'seoMetaEnabled', icon: 'Tag', labelKey: 'featureSeoMetaLabel' as keyof ISettingsEditorStrings, descKey: 'featureSeoMetaDesc' as keyof ISettingsEditorStrings, section: 'content' },
  { key: 'analyticsEnabled', icon: 'Chart', labelKey: 'featureAnalyticsLabel' as keyof ISettingsEditorStrings, descKey: 'featureAnalyticsDesc' as keyof ISettingsEditorStrings, section: 'content' },
  { key: 'megaMenuRailEnabled', icon: 'BulletedTreeList', labelKey: 'featureMegaMenuRailLabel' as keyof ISettingsEditorStrings, descKey: 'featureMegaMenuRailDesc' as keyof ISettingsEditorStrings, section: 'content' },
  { key: 'megaMenuOverviewEnabled', icon: 'Tiles', labelKey: 'featureMegaMenuOverviewLabel' as keyof ISettingsEditorStrings, descKey: 'featureMegaMenuOverviewDesc' as keyof ISettingsEditorStrings, dependsOn: 'megaMenuRailEnabled', section: 'content' }
];

interface IFeatureStringFieldDefinition {
  key: keyof IHeaderFeatures;
  labelKey: keyof ISettingsEditorStrings;
  placeholder: string;
  validator?: (value: string | undefined) => string | undefined;
  featureKey?: keyof IHeaderFeatureFlags;
}

const FEATURE_STRING_FIELDS: IFeatureStringFieldDefinition[] = [
  { key: 'searchScope', labelKey: 'navigationProviderName' as keyof ISettingsEditorStrings, placeholder: 'e.g. /sites/hub', validator: validateUrl, featureKey: 'searchEnabled' },
  { key: 'searchPlaceholder', labelKey: 'navSearchPlaceholder' as keyof ISettingsEditorStrings, placeholder: 'Search this site...' },
  { key: 'quickActionsJson', labelKey: 'featuresSearchSection' as keyof ISettingsEditorStrings, placeholder: '[ { "id": "1", "label": "Mail", "url": "https://outlook.office.com", "iconName": "Mail" } ]', featureKey: 'quickActionsEnabled' },
  { key: 'appLauncherJson', labelKey: 'featuresChromeSection' as keyof ISettingsEditorStrings, placeholder: '[ { "id": "1", "label": "Portal", "url": "https://portal.office.com", "iconName": "AppIconDefault" } ]', featureKey: 'appLauncherEnabled' },
  { key: 'bookmarkListUrl', labelKey: 'bookmarksEnabled' as keyof ISettingsEditorStrings, placeholder: '/sites/hub/Lists/Bookmarks', validator: validateUrl, featureKey: 'bookmarksEnabled' },
  { key: 'notificationListUrl', labelKey: 'notificationsEnabled' as keyof ISettingsEditorStrings, placeholder: '/sites/hub/Lists/Notifications', validator: validateUrl, featureKey: 'notificationsEnabled' },
  { key: 'adminUrl', labelKey: 'adminSettingsEnabled' as keyof ISettingsEditorStrings, placeholder: 'https://contoso.sharepoint.com/sites/hub/SitePages/HeaderAdmin.aspx', validator: validateUrl, featureKey: 'adminSettingsEnabled' },
  { key: 'helpUrl', labelKey: 'helpEnabled' as keyof ISettingsEditorStrings, placeholder: 'https://support.office.com', validator: validateUrl, featureKey: 'helpEnabled' },
  { key: 'feedbackUrl', labelKey: 'feedbackEnabled' as keyof ISettingsEditorStrings, placeholder: 'https://forms.office.com/r/xyz', validator: validateUrl, featureKey: 'feedbackEnabled' }
];

interface IColorField {
  key: keyof IHeaderColorOverrides;
  labelKey: keyof ISettingsEditorStrings;
}

interface IColorGroup {
  titleKey: keyof ISettingsEditorStrings;
  descKey: keyof ISettingsEditorStrings;
  fields: IColorField[];
}

const COLOR_GROUPS: IColorGroup[] = [
  {
    titleKey: 'generalTab' as keyof ISettingsEditorStrings,
    descKey: 'colorsSectionDesc',
    fields: [
      { key: 'chromeBackground', labelKey: 'chromeBackground' },
      { key: 'chromeText', labelKey: 'chromeText' }
    ]
  },
  {
    titleKey: 'featuresTab' as keyof ISettingsEditorStrings,
    descKey: 'featuresSectionDesc',
    fields: [
      { key: 'surface', labelKey: 'surface' },
      { key: 'surfaceHover', labelKey: 'surfaceHover' },
      { key: 'border', labelKey: 'border' },
      { key: 'borderStrong', labelKey: 'borderStrong' }
    ]
  },
  {
    titleKey: 'colorsTab' as keyof ISettingsEditorStrings,
    descKey: 'colorsSectionTitle',
    fields: [
      { key: 'link', labelKey: 'link' },
      { key: 'linkHover', labelKey: 'linkHover' },
      { key: 'accent', labelKey: 'accent' },
      { key: 'accentHover', labelKey: 'accentHover' },
      { key: 'bodyText', labelKey: 'bodyText' },
      { key: 'subtext', labelKey: 'subtext' }
    ]
  },
  {
    titleKey: 'typographyTab' as keyof ISettingsEditorStrings,
    descKey: 'typographySectionTitle',
    fields: [
      { key: 'hoverBackground', labelKey: 'hoverBackground' },
      { key: 'activeBackground', labelKey: 'activeBackground' },
      { key: 'focusRing', labelKey: 'focusRing' },
      { key: 'shadow', labelKey: 'shadow' }
    ]
  }
];

interface IFontFieldDefinition {
  key: keyof IHeaderFontOverrides;
  labelKey: keyof ISettingsEditorStrings;
}

const FONT_FIELDS: IFontFieldDefinition[] = [
  { key: 'body', labelKey: 'fontBody' },
  { key: 'caption', labelKey: 'fontCaption' },
  { key: 'subtext', labelKey: 'fontSubtext' },
  { key: 'title', labelKey: 'fontTitle' },
  { key: 'titleLarge', labelKey: 'fontTitleLarge' }
];

const SettingsEditorDialog: React.FC<ISettingsEditorDialogProps> = (props) => {
  const { isOpen, onDismiss, settingsService, navigationService, strings } = props;
  const [settings, setSettings] = React.useState<ISettingsFile>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isSaving, startSaveTransition] = React.useTransition();
  const [saveError, setSaveError] = React.useState<string | undefined>(undefined);
  const [saveSuccess, setSaveSuccess] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<TabKey>('general');
  const [loadedUpdatedAt, setLoadedUpdatedAt] = React.useState<string | undefined>(undefined);
  const [validationErrors, setValidationErrors] = React.useState<IFieldValidationState>({});
  const [isLogoUploading, setIsLogoUploading] = React.useState<boolean>(false);
  const [logoUploadError, setLogoUploadError] = React.useState<string | undefined>(undefined);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const logoInputRef = React.useRef<HTMLInputElement | null>(null);
  const originalSettingsRef = React.useRef<ISettingsFile | null>(null);

  React.useEffect(() => {
    if (isOpen && settings) {
      applyThemeStylesToElement(document.documentElement, undefined, undefined, settings.colors, settings.fontSizes);
    }
  }, [settings, isOpen]);

  React.useEffect(() => {
    if (!isOpen && originalSettingsRef.current) {
      applyThemeStylesToElement(document.documentElement, undefined, undefined, originalSettingsRef.current.colors, originalSettingsRef.current.fontSizes);
    }
  }, [isOpen]);

  const handleExportConfig = React.useCallback((): void => {
    try {
      const dataStr = JSON.stringify(settings, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `navigation-header-config-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setSaveError('Export failed: unable to serialize settings');
    }
  }, [settings]);

  const handleImportClick = React.useCallback((): void => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  }, []);

  const handleImportFileChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        if (!isPlainObject(parsed)) {
          throw new Error('Invalid JSON format');
        }

        const warnings: string[] = [];

        const general = isPlainObject(parsed.general) ? parsed.general : DEFAULT_SETTINGS.general;
        if (parsed.general !== undefined && !isPlainObject(parsed.general)) {
          warnings.push(`general: expected an object, got ${typeof parsed.general} — using defaults.`);
        }

        const features = isPlainObject(parsed.features) ? parsed.features : DEFAULT_SETTINGS.features;
        if (parsed.features !== undefined && !isPlainObject(parsed.features)) {
          warnings.push(`features: expected an object, got ${typeof parsed.features} — using defaults.`);
        }

        const colors = isPlainObject(parsed.colors) ? parsed.colors : DEFAULT_SETTINGS.colors;
        if (parsed.colors !== undefined && !isPlainObject(parsed.colors)) {
          warnings.push(`colors: expected an object, got ${typeof parsed.colors} — using defaults.`);
        }

        const fontSizes = isPlainObject(parsed.fontSizes) ? parsed.fontSizes : DEFAULT_SETTINGS.fontSizes;
        if (parsed.fontSizes !== undefined && !isPlainObject(parsed.fontSizes)) {
          warnings.push(`fontSizes: expected an object, got ${typeof parsed.fontSizes} — using defaults.`);
        }

        const { items: navigation, warnings: navigationWarnings } = sanitizeNavigationItems(parsed.navigation);
        warnings.push(...navigationWarnings);

        const imported: ISettingsFile = {
          version: (typeof parsed.version === 'number' ? parsed.version : undefined) ?? DEFAULT_SETTINGS.version,
          general,
          features,
          colors,
          fontSizes,
          navigation: navigation as unknown as INavigationItem[],
          updatedAt: new Date().toISOString()
        };

        if (warnings.length > 0) {
          reportError(new Error(`Navigation/settings import: ${warnings.length} field(s) dropped during validation`), {
            action: 'settings-import-validation-warnings',
            level: 'service',
            severity: 'warning',
            metadata: { details: warnings.slice(0, 10).join(' | ') }
          });
        }

        setSettings(imported);
        setSaveSuccess(false);
        setSaveError(
          warnings.length > 0
            ? `Import completed, but ${warnings.length} invalid field(s)/item(s) were skipped. Review the imported configuration before saving.`
            : undefined
        );
      } catch {
        setSaveError('Import failed: invalid or corrupt JSON configuration file');
      }
    };
    reader.readAsText(file);
  }, []);

  const loadSettings = React.useCallback(async (): Promise<void> => {
    if (!settingsService) {
      return;
    }
    setIsLoading(true);
    setSaveError(undefined);
    setSaveSuccess(false);
    try {
      settingsService.clearCache();
      const loaded = await settingsService.getSettings();
      setSettings(loaded);
      originalSettingsRef.current = loaded;
      setLoadedUpdatedAt(loaded.updatedAt);
    } catch (error: unknown) {
      reportError(error, { action: 'settings-editor-load-failed', level: 'service' });

      setSaveError('Failed to load current settings. Reload before making changes — saving now could overwrite existing configuration.');
    } finally {
      setIsLoading(false);
    }
  }, [settingsService]);

  React.useEffect(() => {
    if (isOpen) {
      void loadSettings();
      setActiveTab('general');
    }
  }, [isOpen, loadSettings]);

  const updateGeneral = React.useCallback((key: keyof IGeneralSettings, value: string | number | undefined): void => {
    setSettings((prev) => ({ ...prev, general: { ...prev.general, [key]: value } }));
  }, []);

  const updateFeature = React.useCallback((key: keyof IHeaderFeatures, value: string | boolean | number | undefined): void => {
    setSettings((prev) => ({ ...prev, features: { ...prev.features, [key]: value } }));
  }, []);

  const updateColor = React.useCallback((key: keyof IHeaderColorOverrides, value: string | undefined): void => {
    setSettings((prev) => ({ ...prev, colors: { ...prev.colors, [key]: value || undefined } }));
  }, []);

  const updateFont = React.useCallback((key: keyof IHeaderFontOverrides, value: string): void => {
    setSettings((prev) => ({ ...prev, fontSizes: { ...prev.fontSizes, [key]: value || undefined } }));
  }, []);

  const updateNavigation = React.useCallback((items: INavigationItem[]): void => {
    setSettings((prev) => ({ ...prev, navigation: items }));
  }, []);

  const handleLogoUploadClick = React.useCallback((): void => {
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
      logoInputRef.current.click();
    }
  }, []);

  const handleLogoFileChange = React.useCallback(async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsLogoUploading(true);
    setLogoUploadError(undefined);

    try {
      const serverRelativeUrl = await settingsService.uploadLogo(file);
      updateGeneral('logoUrl', serverRelativeUrl);
    } catch {
      setLogoUploadError('Logo upload failed. Please verify site collection permissions.');
    } finally {
      setIsLogoUploading(false);
    }
  }, [settingsService, updateGeneral]);

  const navSource: 'taxonomy' | 'jsonFile' = settings.general.navigationSource ?? 'taxonomy';

  const handleSourceSelect = React.useCallback((source: 'taxonomy' | 'jsonFile'): void => {
    updateGeneral('navigationSource', source);
  }, [updateGeneral]);

  const setValidationError = React.useCallback((fieldId: string, message: React.ReactNode | undefined): void => {
    setValidationErrors((prev) => {
      const next = { ...prev };
      if (typeof message === 'string' && message) {
        next[fieldId] = message;
      } else {
        delete next[fieldId];
      }
      return next;
    });
  }, []);

  const handleSave = React.useCallback(async (): Promise<void> => {
    if (!settingsService) {
      setSaveError(strings.saveError);
      return;
    }

    if (hasValidationErrors(validationErrors)) {
      setSaveError(strings.saveError);
      return;
    }

    setSaveError(undefined);
    setSaveSuccess(false);

    const sanitizedGeneral: IGeneralSettings = { ...settings.general };
    sanitizedGeneral.homeUrl = sanitizeUrl(sanitizedGeneral.homeUrl);
    sanitizedGeneral.logoUrl = sanitizeUrl(sanitizedGeneral.logoUrl);

    const sanitizedFeatures: IHeaderFeatures = { ...settings.features };
    sanitizedFeatures.helpUrl = sanitizeUrl(sanitizedFeatures.helpUrl);
    sanitizedFeatures.feedbackUrl = sanitizeUrl(sanitizedFeatures.feedbackUrl);
    sanitizedFeatures.adminUrl = sanitizeUrl(sanitizedFeatures.adminUrl);
    sanitizedFeatures.bookmarkListUrl = sanitizeUrl(sanitizedFeatures.bookmarkListUrl);
    sanitizedFeatures.notificationListUrl = sanitizeUrl(sanitizedFeatures.notificationListUrl);
    if (sanitizedFeatures.footerHtml) {
      sanitizedFeatures.footerHtml = sanitizeHtml(sanitizedFeatures.footerHtml);
    }

    const toSave: ISettingsFile = {
      ...settings,
      general: sanitizedGeneral,
      features: sanitizedFeatures
    };

    try {

      if (loadedUpdatedAt) {
        settingsService.clearCache();
        const serverSettings = await settingsService.getSettings();
        if (serverSettings.updatedAt && serverSettings.updatedAt !== loadedUpdatedAt) {
          setSaveError(strings.staleError);
          return;
        }
      }

      if (navSource === 'jsonFile' && navigationService instanceof JsonFileNavigationService) {
        await (navigationService as JsonFileNavigationService).saveNavigation(settings.navigation ?? []);
      }

      const stamped: ISettingsFile = {
        ...toSave,
        updatedAt: new Date().toISOString()
      };
      await settingsService.saveSettings(stamped);

      startSaveTransition(() => {
        setSettings(stamped);
        originalSettingsRef.current = stamped;
        setLoadedUpdatedAt(stamped.updatedAt);
        setSaveSuccess(true);
      });
    } catch (error: unknown) {

      if (error instanceof ConcurrentModificationError) {
        setSaveError(strings.staleError);
      } else {
        setSaveError(strings.saveError);
      }
      reportError(error, { action: 'settings-editor-save-failed', level: 'service' });
    }
  }, [settingsService, navigationService, settings, strings.saveError, strings.staleError, loadedUpdatedAt, validationErrors, navSource]);

  const general = settings.general;
  const features = settings.features;
  const colors = settings.colors;
  const fontSizes = settings.fontSizes;

  const enabledFeatureCount = React.useMemo(() => {
    return FEATURE_TOGGLES.filter((t) => features[t.key] ?? DEFAULT_FEATURE_FLAGS[t.key]).length;
  }, [features]);

  const renderFeatureSection = (section: 'search' | 'chrome' | 'content', title: string): React.ReactNode => {
    const sectionToggles = FEATURE_TOGGLES.filter((t) => t.section === section);
    if (sectionToggles.length === 0) {
      return null;
    }

    return (
      <div className={styles.featureSection}>
        <h4 className={styles.featureSectionTitle}>{title}</h4>
        <div className={styles.featureCardGrid}>
          {sectionToggles.map((toggle) => {
            const isOn = features[toggle.key] ?? DEFAULT_FEATURE_FLAGS[toggle.key];
            const dependencyOff = toggle.dependsOn && !(features[toggle.dependsOn] ?? DEFAULT_FEATURE_FLAGS[toggle.dependsOn]);
            return (
              <div
                className={`${styles.featureCard} ${isOn ? styles.featureCardOn : ''} ${dependencyOff ? styles.featureCardDisabled : ''}`}
                key={toggle.key}
              >
                <div className={styles.featureCardLeft}>
                  <div className={styles.featureCardIcon}>
                    <DynamicIcon iconName={toggle.icon} />
                  </div>
                  <div className={styles.featureCardText}>
                    <span className={styles.featureCardLabel}>{strings[toggle.labelKey]}</span>
                    <span className={styles.featureCardDesc}>{strings[toggle.descKey]}</span>
                  </div>
                </div>
                <Switch
                  checked={isOn}
                  disabled={!!dependencyOff}
                  onChange={(_e, data): void => updateFeature(toggle.key, data.checked)}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderColorGroup = (group: IColorGroup): React.ReactNode => {
    return (
      <div className={styles.fieldGroup}>
        <h4 className={styles.sectionTitle}>{strings[group.titleKey]}</h4>
        <div className={styles.colorRow}>
          {group.fields.map((field) => (
            <div className={styles.fieldRowSingle} key={field.key}>
              <Label className={styles.fieldLabel}>{strings[field.labelKey]}</Label>
              <ColorPicker
                label={strings[field.labelKey] || ''}
                strings={strings}
                value={colors[field.key] || ''}
                onChange={(v): void => updateColor(field.key, v)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const canSave = !isSaving && !isLoading && !hasValidationErrors(validationErrors);

  return (
    <OverlayDrawer
      open={isOpen}
      position="end"
      onOpenChange={(e, data): void => {
        if (!data.open) {
          onDismiss();
        }
      }}
      style={{ maxWidth: '680px', width: '100%' }}
    >
      <DrawerBody className={styles.editorPanel} style={{ padding: 0 }}>
        <div className={styles.editorHeader}>
          <div className={styles.editorHeaderIcon}>
            <DynamicIcon iconName="Settings" />
          </div>
          <div className={styles.editorHeaderTitleBlock}>
            <h2 className={styles.editorTitle}>{strings.title}</h2>
            <p className={styles.editorSubtitle}>{strings.subtitle}</p>
          </div>
          <Button
            aria-label={strings.cancel}
            className={styles.editorClose}
            icon={<Dismiss24Regular />}
            onClick={onDismiss}
            appearance="subtle"
            title={strings.cancel}
          />
        </div>

        <div className={styles.editorTabs}>
          <TabList
            selectedValue={activeTab}
            onTabSelect={(e, data): void => {
              setActiveTab(data.value as TabKey);
            }}
            size="large"
          >
            <Tab value="general">{strings.generalTab}</Tab>
            <Tab value="features">{strings.featuresTab}</Tab>
            <Tab value="colors">{strings.colorsTab}</Tab>
            <Tab value="typography">{strings.typographyTab}</Tab>
            {navSource === 'jsonFile' ? (
              <Tab value="navigation">{strings.navigationTab}</Tab>
            ) : null}
          </TabList>
        </div>

        <div className={styles.editorBody}>
          {isLoading ? (
            <div className={styles.loadingWrap}>
              <Spinner label={strings.loading} size="large" />
            </div>
          ) : (
            <>
              {activeTab === 'general' ? (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>{strings.navSourceSectionTitle}</h3>
                    <p className={styles.sectionDescription}>{strings.navSourceSectionDesc}</p>
                  </div>

                  <div className={styles.fieldGroup}>
                    <div className={styles.sourceCardGroup} role="radiogroup" aria-label={strings.navSourceSectionTitle}>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={navSource === 'taxonomy'}
                        className={classNames(styles.sourceCard, navSource === 'taxonomy' ? styles.sourceCardSelected : undefined)}
                        onClick={(): void => {
                          handleSourceSelect('taxonomy');
                          if ((activeTab as string) === 'navigation') {
                            setActiveTab('general');
                          }
                        }}
                        style={{ position: 'relative', textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                      >
                        <div style={{ position: 'absolute', top: '12px', right: '12px', width: '16px', height: '16px', borderRadius: '50%', border: '1px solid var(--header-border-strong, #d2d0ce)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {navSource === 'taxonomy' ? (
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--header-accent, #0f6cbd)' }} />
                          ) : null}
                        </div>
                        <DynamicIcon className={styles.sourceCardIcon} iconName="BulletedTreeList" />
                        <span className={styles.sourceCardTitle}>{strings.sourceTaxonomyTitle}</span>
                        <span className={styles.sourceCardDesc}>{strings.sourceTaxonomyDesc}</span>
                      </button>

                      <button
                        type="button"
                        role="radio"
                        aria-checked={navSource === 'jsonFile'}
                        className={classNames(styles.sourceCard, navSource === 'jsonFile' ? styles.sourceCardSelected : undefined)}
                        onClick={(): void => {
                          handleSourceSelect('jsonFile');
                          if ((activeTab as string) === 'navigation') {
                            setActiveTab('general');
                          }
                        }}
                        style={{ position: 'relative', textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                      >
                        <div style={{ position: 'absolute', top: '12px', right: '12px', width: '16px', height: '16px', borderRadius: '50%', border: '1px solid var(--header-border-strong, #d2d0ce)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {navSource === 'jsonFile' ? (
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--header-accent, #0f6cbd)' }} />
                          ) : null}
                        </div>
                        <DynamicIcon className={styles.sourceCardIcon} iconName="Page" />
                        <span className={styles.sourceCardTitle}>{strings.sourceJsonFileTitle}</span>
                        <span className={styles.sourceCardDesc}>{strings.sourceJsonFileDesc}</span>
                      </button>
                    </div>
                  </div>

                  {navSource === 'taxonomy' ? (
                    <div className={styles.fieldGroup}>
                      <div className={styles.fieldRow}>
                        <Field label={strings.navigationProviderName} className={styles.fieldRowSingle}>
                          <Input
                            onChange={(e, data): void => updateGeneral('navigationProviderName', data.value || undefined)}
                            placeholder="GlobalNavSiteMapProvider"
                            value={general.navigationProviderName || ''}
                          />
                        </Field>
                        <Field
                          label={strings.termSetId}
                          validationState={validationErrors['termSetId'] ? 'error' : 'none'}
                          validationMessage={validationErrors['termSetId'] || strings.termSetIdHint}
                          className={styles.fieldRowSingle}
                        >
                          <Input
                            onChange={(e, data): void => {
                              const val = data.value;
                              updateGeneral('termSetId', val || undefined);
                              const err = validateGuid(val);
                              setValidationError('termSetId', err);
                            }}
                            placeholder="e.g. 98f8a745-9fc2-402c-92f2-ec218a3695aa"
                            value={general.termSetId || ''}
                          />
                        </Field>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.fieldGroup}>
                      <div className={styles.fieldRow}>
                        <Field
                          label={strings.navigationFileName}
                          validationState={validationErrors['navigationFileName'] ? 'error' : 'none'}
                          validationMessage={validationErrors['navigationFileName']}
                          className={styles.fieldRowSingle}
                        >
                          <Input
                            onChange={(e, data): void => {
                              const val = data.value;
                              updateGeneral('navigationFileName', val || undefined);
                              const err = validateFileName(val);
                              setValidationError('navigationFileName', err);
                            }}
                            value={general.navigationFileName || 'navigation.json'}
                          />
                        </Field>
                        <Field
                          label={strings.navigationFileFolder}
                          validationState={validationErrors['navigationFileFolder'] ? 'error' : 'none'}
                          validationMessage={validationErrors['navigationFileFolder']}
                          className={styles.fieldRowSingle}
                        >
                          <Input
                            onChange={(e, data): void => {
                              const val = data.value;
                              updateGeneral('navigationFileFolder', val || undefined);
                              const err = validateFolder(val);
                              setValidationError('navigationFileFolder', err);
                            }}
                            value={general.navigationFileFolder || 'SiteAssets'}
                          />
                        </Field>
                      </div>
                      <span className={styles.fieldHint}>{strings.navigationSectionDesc}</span>
                    </div>
                  )}

                  <hr className={styles.sectionDivider} />

                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>{strings.generalSectionTitle}</h3>
                    <p className={styles.sectionDescription}>{strings.generalSectionDesc}</p>
                  </div>

                  <div className={styles.fieldGroup}>
                    <div className={styles.fieldRow}>
                      <Field
                        label={strings.homeUrl}
                        validationState={validationErrors['homeUrl'] ? 'error' : 'none'}
                        validationMessage={validationErrors['homeUrl']}
                        className={styles.fieldRowSingle}
                      >
                        <Input
                          onChange={(e, data): void => {
                            const val = data.value;
                            updateGeneral('homeUrl', val || undefined);
                            const err = validateUrl(val);
                            setValidationError('homeUrl', err);
                          }}
                          placeholder="https://contoso.sharepoint.com"
                          value={general.homeUrl || ''}
                        />
                      </Field>
                      <Field label={strings.logoAltText} className={styles.fieldRowSingle}>
                        <Input
                          onChange={(e, data): void => updateGeneral('logoAltText', data.value || undefined)}
                          value={general.logoAltText || ''}
                        />
                      </Field>
                    </div>

                    <Field
                      label={strings.logoUrl}
                      validationState={validationErrors['logoUrl'] || logoUploadError ? 'error' : 'none'}
                      validationMessage={logoUploadError || validationErrors['logoUrl']}
                      className={styles.fieldRowSingle}
                    >
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Input
                          onChange={(e, data): void => {
                            const val = data.value;
                            updateGeneral('logoUrl', val || undefined);
                            const err = validateUrl(val);
                            setValidationError('logoUrl', err);
                            setLogoUploadError(undefined);
                          }}
                          placeholder="https://contoso.sharepoint.com/SiteAssets/logo.png"
                          value={general.logoUrl || ''}
                          style={{ flexGrow: 1 }}
                        />
                        <Button
                          onClick={handleLogoUploadClick}
                          disabled={isLogoUploading}
                          icon={isLogoUploading ? <Spinner size="tiny" /> : <ArrowUpload20Regular />}
                        >
                          Upload logo
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          ref={logoInputRef}
                          onChange={handleLogoFileChange}
                          style={{ display: 'none' }}
                        />
                      </div>
                    </Field>

                    <div className={styles.fieldRow}>
                      <Field
                        label={strings.footerHeight}
                        validationState={validationErrors['footerHeight'] ? 'error' : 'none'}
                        validationMessage={validationErrors['footerHeight']}
                        className={styles.fieldRowSingle}
                      >
                        <Input
                          onChange={(e, data): void => {
                            const val = data.value;
                            updateGeneral('footerHeight', parseInt(val || '0', 10) || undefined);
                            const err = validatePositiveInt(val);
                            setValidationError('footerHeight', err);
                          }}
                          type="number"
                          value={String(general.footerHeight ?? 48)}
                        />
                      </Field>
                      <div className={styles.fieldRowSingle} />
                    </div>

                    <Field label={strings.footerHtml} className={styles.fieldRowSingle}>
                      <Textarea
                        onChange={(e, data): void => updateFeature('footerHtml', data.value || undefined)}
                        rows={3}
                        value={features.footerHtml || ''}
                      />
                      <span className={styles.fieldHint}>{strings.navSourceSectionDesc}</span>
                    </Field>
                  </div>

                  <hr className={styles.sectionDivider} />

                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Backup & Portability</h3>
                    <p className={styles.sectionDescription}>Export your complete header configuration to a JSON file, or restore it from an existing backup.</p>
                  </div>

                  <div className={styles.fieldGroup}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Button
                        icon={<ArrowDownload20Regular />}
                        onClick={handleExportConfig}
                        appearance="outline"
                      >
                        Export Configuration
                      </Button>
                      <Button
                        icon={<ArrowUpload20Regular />}
                        onClick={handleImportClick}
                        appearance="outline"
                      >
                        Import Configuration
                      </Button>
                      <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        onChange={handleImportFileChange}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === 'features' ? (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionHeaderRow}>
                      <div>
                        <h3 className={styles.sectionTitle}>{strings.featuresSectionTitle}</h3>
                        <p className={styles.sectionDescription}>{strings.featuresSectionDesc}</p>
                      </div>
                      <span className={styles.featureCountBadge}>
                        {enabledFeatureCount} / {FEATURE_TOGGLES.length}
                      </span>
                    </div>
                  </div>

                  {renderFeatureSection('search', strings.featuresSearchSection)}
                  {renderFeatureSection('chrome', strings.featuresChromeSection)}
                  {renderFeatureSection('content', strings.featuresContentSection)}

                  <hr className={styles.sectionDivider} />

                  <div className={styles.fieldGroup}>
                    <h4 className={styles.sectionTitle}>{strings.featuresConfigSection}</h4>
                    {FEATURE_STRING_FIELDS.map((field) => {
                      const featureOn = field.featureKey ? (features[field.featureKey] ?? DEFAULT_FEATURE_FLAGS[field.featureKey]) : true;
                      if (!featureOn) {
                        return null;
                      }
                      const fieldId = `feature-${field.key}`;
                      return (
                        <Field
                          key={field.key}
                          label={strings[field.labelKey]}
                          validationState={validationErrors[fieldId] ? 'error' : 'none'}
                          validationMessage={validationErrors[fieldId]}
                          className={styles.fieldRowSingle}
                        >
                          <Input
                            onChange={(e, data): void => {
                              const val = data.value;
                              updateFeature(field.key, val || undefined);
                              if (field.validator) {
                                const err = field.validator(val);
                                setValidationError(fieldId, err ? String(err) : undefined);
                              }
                            }}
                            placeholder={field.placeholder}
                            value={String(features[field.key] ?? '')}
                          />
                        </Field>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {activeTab === 'colors' ? (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>{strings.colorsSectionTitle}</h3>
                    <p className={styles.sectionDescription}>{strings.colorsSectionDesc}</p>
                  </div>
                  {COLOR_GROUPS.map((group) => (
                    <React.Fragment key={group.titleKey}>
                      {renderColorGroup(group)}
                      <hr className={styles.sectionDivider} />
                    </React.Fragment>
                  ))}
                </div>
              ) : null}

              {activeTab === 'typography' ? (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>{strings.typographySectionTitle}</h3>
                    <p className={styles.sectionDescription}>{strings.typographySectionDesc}</p>
                  </div>
                  <div className={styles.fieldGroup}>
                    {FONT_FIELDS.map((field) => {
                      const fieldId = `font-${field.key}`;
                      return (
                        <Field
                          key={field.key}
                          label={strings[field.labelKey]}
                          validationState={validationErrors[fieldId] ? 'error' : 'none'}
                          validationMessage={validationErrors[fieldId]}
                          className={styles.fieldRowSingle}
                        >
                          <Input
                            onChange={(e, data): void => {
                              const val = data.value;
                              updateFont(field.key, val || '');
                              const err = validateFontSize(val);
                              setValidationError(fieldId, err);
                            }}
                            placeholder="18px, 1.125rem, 1.1em"
                            value={fontSizes[field.key] || ''}
                          />
                        </Field>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {activeTab === 'navigation' && navSource === 'jsonFile' ? (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>{strings.navigationSectionTitle}</h3>
                    <p className={styles.sectionDescription}>{strings.navigationSectionDesc}</p>
                  </div>
                  <NavigationTreeEditor
                    items={settings.navigation ?? []}
                    onChange={updateNavigation}
                    strings={strings}
                  />
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className={styles.editorFooter}>
          {saveError ? (
            <div className={styles.footerError} style={{ marginInlineEnd: 'auto', maxWidth: '60%' }}>
              {saveError}
            </div>
          ) : null}
          {saveSuccess ? (
            <div style={{ color: '#107c41', background: '#f4fbf6', padding: '6px 12px', borderRadius: '4px', marginInlineEnd: 'auto', maxWidth: '60%', fontSize: '14px' }}>
              {strings.saved}
            </div>
          ) : null}
          {isSaving ? <Spinner label={strings.saving} size="small" style={{ marginInlineEnd: 'auto' }} /> : null}
          <Button disabled={isSaving} onClick={onDismiss} appearance="secondary">
            {strings.cancel}
          </Button>
          <Button disabled={!canSave} onClick={handleSave} appearance="primary">
            {isSaving ? strings.saving : strings.save}
          </Button>
        </div>
      </DrawerBody>
    </OverlayDrawer>
  );
};

export default SettingsEditorDialog;
