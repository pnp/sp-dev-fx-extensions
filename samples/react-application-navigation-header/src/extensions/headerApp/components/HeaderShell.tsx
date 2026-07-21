import * as React from 'react';
import {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
  Button
} from '@fluentui/react-components';
import { Navigation24Regular } from '@fluentui/react-icons';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
import type { ApplicationCustomizerContext } from '@microsoft/sp-application-base';

import type { INavigationItem } from '../models/INavigationItem';
import type { IHeaderStrings } from '../models/IHeaderStrings';
import type { IHeaderFeatures } from '../models/IHeaderFeatures';
import { resolveFeatureFlags } from '../models/IHeaderFeatures';
import type { INavigationProvider } from '../services/INavigationProvider';
import type { SettingsService } from '../services/SettingsService';
import type { ISettingsFile } from '../models/ISettingsFile';
import { HeaderServices } from '../services/HeaderServices';
import { AnalyticsService } from '../services/AnalyticsService';
import { emitNavigationTelemetry } from '../utils/navigationTelemetry';
import { reportError } from '../utils/errorReporting';
import { useLazyReady, useScrollCondensed, useDocumentTitle } from '../hooks/useHeaderHooks';
import { useStableCallback } from '../hooks/useStableCallback';
import { useEditMode } from '../hooks/useEditMode';
import { useMoreToolsItems } from '../hooks/useMoreToolsItems';
import { getThemeStylesCss } from '../utils/theme';
import type { IHeaderColorOverrides, IHeaderFontOverrides } from '../utils/theme';
import { classNames, isConstrainedPresentationHost, itemHasChildren, findActivePath } from '../utils/navigation';
import { scheduleIdleTask, cancelIdleTask } from '../utils/idle';
import DesktopNavigation from './DesktopNavigation';
import ErrorBoundary from './ErrorBoundary';
import SearchTool from './SearchTool';
import type { ISearchToolHandle } from './SearchTool';
import UserProfileTool from './UserProfileTool';
import NotificationsTool from './NotificationsTool';
import BookmarksTool from './BookmarksTool';
import AdminSettingsTool from './AdminSettingsTool';
import MoreToolsMenu from './MoreToolsMenu';
import BackToTop from './BackToTop';
import Breadcrumbs from './Breadcrumbs';
const SettingsEditorDialog = React.lazy(() => import(/* webpackChunkName: 'header-settings-editor' */ './SettingsEditorDialog'));
import type { ISettingsEditorStrings } from './SettingsEditorDialog';
import styles from './HeaderShell.module.scss';

const MobilePanel = React.lazy(() => import(/* webpackChunkName: 'header-mobile-panel' */ './MobilePanel'));

const QuickActionsTool = React.lazy(() => import(/* webpackChunkName: 'header-quick-actions' */ './QuickActionsTool'));
const AppLauncherTool = React.lazy(() => import(/* webpackChunkName: 'spfx-global-navigation-header-app-launcher' */ './AppLauncherTool'));

export interface IHeaderShellProps {
  chromeLanguageLabel: string;
  chromeLanguageShortLabel: string;
  isChromeLanguageFallback: boolean;
  context: ApplicationCustomizerContext;
  navigationService: INavigationProvider;
  navigationSource: 'taxonomy' | 'jsonFile';
  homeUrl: string;
  logoUrl?: string;
  logoAltText: string;
  themeVariant?: IReadonlyTheme;
  currentPageUrl: string;
  isTeamsContext?: boolean;
  strings: IHeaderStrings;
  features?: IHeaderFeatures;
  colors?: IHeaderColorOverrides;
  fontSizes?: IHeaderFontOverrides;
  settingsService?: SettingsService;
  runtimeSettings?: ISettingsFile;
  onSettingsChanged?: () => void;
  headerServices?: HeaderServices;
  analytics?: AnalyticsService;
}

const SKIP_LINK_ID = 'header-skip-to-navigation';
const SKIP_NAV_TARGET_ID = 'header-navigation-target';
const SCROLL_CONDENSE_THRESHOLD = 24;
const EAGER_BRANCH_PRELOAD_COUNT = 2;

const MORE_TRIGGER_RESERVED_WIDTH = 90;

const PHONE_BREAKPOINT_MAX_WIDTH = 767;
const LOGO_PARALLAX_MAX_X = 8;
const LOGO_PARALLAX_MAX_Y = 5;
const LOGO_PARALLAX_SENSITIVITY_X = 0.06;
const LOGO_PARALLAX_SENSITIVITY_Y = 0.05;
const FONT_SCALE_STORAGE_KEY = 'header-font-scale';
const FONT_SCALE_VERSION_KEY = 'header-font-scale-v2';
const HIGH_CONTRAST_STORAGE_KEY = 'header-high-contrast';
const FORCED_COLORS_CLASS = 'header-forced-colors';
const MIN_FONT_SCALE = 80;
const MAX_FONT_SCALE = 200;
const DEFAULT_FONT_SCALE = 125;

function clampFontScale(value: number): number {
  if (Number.isNaN(value)) {
    return DEFAULT_FONT_SCALE;
  }

  return Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, value));
}

function collectRootFeatures(items: INavigationItem[]): IHeaderFeatures {
  if (!items.length) {
    return {};
  }

  return items[0]?.features ?? {};
}

import { getSafeStrings } from '../utils/defaultStrings';

const HeaderShell: React.FC<IHeaderShellProps> = (rawProps) => {
  const {
    chromeLanguageLabel,
    chromeLanguageShortLabel,
    isChromeLanguageFallback,
    context,
    navigationService,
    navigationSource,
    homeUrl,
    logoUrl,
    logoAltText,
    themeVariant,
    currentPageUrl,
    isTeamsContext,
    strings: rawStrings,
    features: propFeatures,
    colors,
    fontSizes,
    settingsService,
    runtimeSettings,
    onSettingsChanged: propOnSettingsChanged,
    headerServices: propHeaderServices,
    analytics: propAnalytics
  } = rawProps;

  const props = React.useMemo(() => ({
    chromeLanguageLabel,
    chromeLanguageShortLabel,
    isChromeLanguageFallback,
    context,
    navigationService,
    navigationSource,
    homeUrl,
    logoUrl,
    logoAltText,
    themeVariant,
    currentPageUrl,
    isTeamsContext,
    strings: getSafeStrings(rawStrings),
    features: propFeatures,
    colors,
    fontSizes,
    settingsService,
    runtimeSettings,
    onSettingsChanged: propOnSettingsChanged,
    headerServices: propHeaderServices,
    analytics: propAnalytics
  }), [
    chromeLanguageLabel,
    chromeLanguageShortLabel,
    isChromeLanguageFallback,
    context,
    navigationService,
    navigationSource,
    homeUrl,
    logoUrl,
    logoAltText,
    themeVariant,
    currentPageUrl,
    isTeamsContext,
    rawStrings,
    propFeatures,
    colors,
    fontSizes,
    settingsService,
    runtimeSettings,
    propOnSettingsChanged,
    propHeaderServices,
    propAnalytics
  ]);

  const [items, setItems] = React.useState<INavigationItem[]>(() =>
    props.navigationService.getCachedNavigationSnapshot() ?? []
  );
  const initialLoadDoneRef = React.useRef<boolean>(items.length > 0);
  const [showLoading, setShowLoading] = React.useState<boolean>(items.length === 0);
  const [loadingBranchIds, setLoadingBranchIds] = React.useState<Record<string, true>>({});
  const [isPanelOpen, setIsPanelOpen] = React.useState<boolean>(false);

  const [visibleNavCount, setVisibleNavCount] = React.useState<number | undefined>(undefined);
  const [logoSrc, setLogoSrc] = React.useState<string | undefined>(props.logoUrl);
  const [isDarkTheme, setIsDarkTheme] = React.useState<boolean>(false);
  const [fontScale, setFontScale] = React.useState<number>(DEFAULT_FONT_SCALE);
  const [currentLanguage, setCurrentLanguage] = React.useState<string>(
    props.chromeLanguageShortLabel?.toLowerCase().split('-')[0] || 'en'
  );
  const [isEditorOpen, setIsEditorOpen] = React.useState<boolean>(false);
  const [navigationReloadToken, setNavigationReloadToken] = React.useState<number>(0);

  const loadingBranchIdsRef = React.useRef<Record<string, true>>({});
  const isReady = useLazyReady();
  const isCondensed = useScrollCondensed(SCROLL_CONDENSE_THRESHOLD);
  const documentTitle = useDocumentTitle();
  const isInEditMode = useEditMode(props.context);
  const isConstrainedHost = React.useMemo(
    () => isConstrainedPresentationHost({ currentPageUrl: props.currentPageUrl, isTeamsContext: !!props.isTeamsContext }),
    [props.currentPageUrl, props.isTeamsContext]
  );

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const brandLinkRef = React.useRef<HTMLAnchorElement | null>(null);
  const desktopNavigationListRef = React.useRef<HTMLUListElement | null>(null);
  const navMeasuringStripRef = React.useRef<HTMLDivElement | null>(null);
  const headerToolsRef = React.useRef<HTMLDivElement | null>(null);
  const toolsIntrinsicWidthRef = React.useRef<number>(0);
  const skipTargetRef = React.useRef<HTMLDivElement | null>(null);
  const pointerFrameRef = React.useRef<number | undefined>();
  const pendingPointerRef = React.useRef<{ clientX: number; clientY: number } | undefined>();
  const menuButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const searchTriggerRef = React.useRef<ISearchToolHandle | null>(null);

  const features = React.useMemo(
    () => resolveFeatureFlags(collectRootFeatures(items), props.features),
    [props.features, items]
  );

  const headerServices = React.useMemo(
    () => props.headerServices ?? new HeaderServices(props.context),
    [props.headerServices, props.context]
  );
  const analytics = React.useMemo(() => props.analytics ?? new AnalyticsService(), [props.analytics]);

  const appLauncherItems = React.useMemo(
    () => headerServices.parseAppLauncherItems(features.appLauncherJson),
    [features.appLauncherJson, headerServices]
  );
  const quickActions = React.useMemo(
    () => headerServices.parseQuickActions(features.quickActionsJson),
    [features.quickActionsJson, headerServices]
  );
  const languageOptions = React.useMemo(
    () => headerServices.parseLanguageOptions(features.supportedLanguages, features.defaultLanguage),
    [features.supportedLanguages, features.defaultLanguage, headerServices]
  );

  const effectiveThemeVariant = React.useMemo(
    () => {
      if (!isDarkTheme || !props.themeVariant) {
        return props.themeVariant;
      }

      return {
        ...props.themeVariant,
        isInverted: true
      };
    },
    [isDarkTheme, props.themeVariant]
  );

  const themeStylesCss = React.useMemo(
    () => getThemeStylesCss(effectiveThemeVariant, fontScale, props.colors, props.fontSizes),
    [effectiveThemeVariant, fontScale, props.colors, props.fontSizes]
  );

  const loadNavigationBranch = React.useCallback(
    async (item: INavigationItem): Promise<void> => {
      if (!itemHasChildren(item) || item.children.length > 0 || loadingBranchIdsRef.current[item.id]) {
        return;
      }

      const nextLoadingSet: Record<string, true> = { ...loadingBranchIdsRef.current, [item.id]: true };
      loadingBranchIdsRef.current = nextLoadingSet;
      setLoadingBranchIds(nextLoadingSet);

      try {
        const nextChildren = await props.navigationService.getChildren(item.id);

        setItems((currentItems) =>
          currentItems.map((currentItem) => {
            if (currentItem.id === item.id) {
              return {
                ...currentItem,
                hasChildren: nextChildren.length > 0,
                children: nextChildren
              };
            }
            return currentItem;
          })
        );
      } catch (error: unknown) {
        reportError(error, { action: 'branch-load-failed', level: 'service', itemId: item.id, itemLabel: item.label });
      } finally {
        const nextSet: Record<string, true> = { ...loadingBranchIdsRef.current };
        delete nextSet[item.id];
        loadingBranchIdsRef.current = nextSet;
        setLoadingBranchIds(nextSet);
      }
    },
    [props.navigationService]
  );

  const stableLoadBranch = useStableCallback(loadNavigationBranch);

  React.useEffect(() => {
    return () => {
      if (pointerFrameRef.current !== undefined) {
        window.cancelAnimationFrame(pointerFrameRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    let isDisposed = false;
    let idleHandle: number | undefined;

    const loadNavigation = async (): Promise<void> => {
      const immediateNavigation = props.navigationService.getImmediateNavigationSnapshot();
      if (!isDisposed) {
        setItems(immediateNavigation);
      }

      const nextItems = await props.navigationService.getNavigation();
      if (!isDisposed) {
        setItems(nextItems);
      }

      initialLoadDoneRef.current = true;
      setShowLoading(false);

      if (isDisposed) {
        return;
      }

      idleHandle = scheduleIdleTask(() => {
        if (isDisposed) {
          return;
        }
        nextItems
          .filter((item) => itemHasChildren(item) && item.children.length === 0)
          .slice(0, EAGER_BRANCH_PRELOAD_COUNT)
          .forEach((item) => {
            void stableLoadBranch(item);
          });
      });
    };

    void loadNavigation();

    return () => {
      isDisposed = true;
      if (idleHandle !== undefined) {
        cancelIdleTask(idleHandle);
      }
    };
  }, [props.navigationService, stableLoadBranch, navigationReloadToken]);

  const onSettingsChanged = props.onSettingsChanged;
  const handleEditorDismiss = React.useCallback((): void => {
    setIsEditorOpen(false);
    setNavigationReloadToken((t) => t + 1);
    onSettingsChanged?.();
  }, [onSettingsChanged]);

  React.useEffect(() => {
    setLogoSrc(props.logoUrl);
  }, [props.logoUrl]);

  React.useEffect(() => {
    loadingBranchIdsRef.current = loadingBranchIds;
  }, [loadingBranchIds]);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    try {

      const migrated = window.localStorage.getItem(FONT_SCALE_VERSION_KEY);
      if (!migrated) {
        window.localStorage.removeItem(FONT_SCALE_STORAGE_KEY);
        window.localStorage.setItem(FONT_SCALE_VERSION_KEY, '1');
      }

      const savedScale = window.localStorage.getItem(FONT_SCALE_STORAGE_KEY);
      if (savedScale) {
        setFontScale(clampFontScale(parseInt(savedScale, 10)));
      }
    } catch { void 0; }
  }, []);

  React.useEffect(() => {

    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--header-font-scale', String(fontScale / 100));
    }
  }, [fontScale]);

  const handleFontScaleChange = React.useCallback((value: number): void => {
    const nextScale = clampFontScale(value);
    setFontScale(nextScale);

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(FONT_SCALE_STORAGE_KEY, String(nextScale));
      } catch { void 0; }
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let savedTheme: string | null = null;
    try {
      savedTheme = window.localStorage?.getItem('header-dark-theme') ?? null;
    } catch { void 0; }

    if (savedTheme === 'true') {
      setIsDarkTheme(true);
      return;
    }

    if (savedTheme === 'false') {

      return;
    }

    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      setIsDarkTheme(true);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    try {
      window.localStorage.setItem('header-dark-theme', String(isDarkTheme));
    } catch { void 0; }
  }, [isDarkTheme]);

  const [isForcedColorsActive, setIsForcedColorsActive] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(forced-colors: active)');
    let savedHighContrast = false;
    try {
      savedHighContrast = window.localStorage?.getItem(HIGH_CONTRAST_STORAGE_KEY) === 'true';
    } catch { void 0; }
    setIsForcedColorsActive(mediaQuery.matches || savedHighContrast);

    const handleChange = (event: MediaQueryListEvent): void => {
      setIsForcedColorsActive(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle(FORCED_COLORS_CLASS, isForcedColorsActive);
    }
  }, [isForcedColorsActive]);

  React.useEffect(() => {
    if (features.analyticsEnabled) {
      analytics.trackPageView({
        url: props.currentPageUrl,
        title: document.title,
        referrer: document.referrer,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        language: props.chromeLanguageLabel,
        isMobile: window.innerWidth <= PHONE_BREAKPOINT_MAX_WIDTH,
        isTeamsContext: !!props.isTeamsContext
      });
    }
  }, [features.analyticsEnabled, analytics, props.currentPageUrl, props.chromeLanguageLabel, props.isTeamsContext]);

  React.useEffect(() => {
    if (!features.searchEnabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {

      if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const activeElement = document.activeElement as HTMLElement | null;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
        return;
      }

      event.preventDefault();
      searchTriggerRef.current?.focus();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [features.searchEnabled]);

  const trackNavigation = React.useCallback(
    (item: INavigationItem, level: 'desktop' | 'mobile', action = 'navigate'): void => {
      emitNavigationTelemetry({
        action,
        itemId: item.id,
        itemLabel: item.label,
        level,
        targetUrl: item.url,
        metadata: {
          external: !!item.isExternal,
          hasChildren: itemHasChildren(item)
        }
      });
    },
    []
  );

  const stableTrackNavigation = useStableCallback(trackNavigation);

  const handleOpenMobilePanel = React.useCallback((): void => {
    setIsPanelOpen(true);
  }, []);

  const handleDismissMobilePanel = React.useCallback((): void => {
    setIsPanelOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  const handleHeaderError = React.useCallback(
    (error: Error, componentStack: string): void => {
      reportError(error, {
        action: 'react-error-boundary',
        level: 'service',
        metadata: { componentStack: componentStack.slice(0, 500) }
      });
    },
    []
  );

  const handleLanguageChange = React.useCallback((languageCode: string): void => {
    setCurrentLanguage(languageCode);
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('lang', languageCode);
    const targetUrl = `${window.location.origin}${window.location.pathname}?${searchParams.toString()}${window.location.hash}`;
    window.location.href = targetUrl;
  }, []);

  const handleHighContrastToggle = React.useCallback((): void => {
    setIsForcedColorsActive((current) => {
      const next = !current;
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(HIGH_CONTRAST_STORAGE_KEY, String(next));
        } catch { void 0; }
      }
      return next;
    });
  }, []);

  const resetPointerEffects = React.useCallback((): void => {
    const rootEl = rootRef.current;

    if (!rootEl) {
      return;
    }

    rootEl.style.removeProperty('--header-logo-shift-x');
    rootEl.style.removeProperty('--header-logo-shift-y');
  }, []);

  const flushPointerEffects = React.useCallback((): void => {
    pointerFrameRef.current = undefined;

    if (isConstrainedHost) {
      return;
    }

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const pointer = pendingPointerRef.current;
    const rootEl = rootRef.current;

    if (!pointer || !rootEl) {
      return;
    }

    const brandEl = brandLinkRef.current;

    if (!brandEl) {
      return;
    }

    const brandRect = brandEl.getBoundingClientRect();
    const brandCenterX = brandRect.left + brandRect.width / 2;
    const brandCenterY = brandRect.top + brandRect.height / 2;
    const offsetX = Math.max(
      -LOGO_PARALLAX_MAX_X,
      Math.min(LOGO_PARALLAX_MAX_X, (pointer.clientX - brandCenterX) * LOGO_PARALLAX_SENSITIVITY_X)
    );
    const offsetY = Math.max(
      -LOGO_PARALLAX_MAX_Y,
      Math.min(LOGO_PARALLAX_MAX_Y, (pointer.clientY - brandCenterY) * LOGO_PARALLAX_SENSITIVITY_Y)
    );

    rootEl.style.setProperty('--header-logo-shift-x', `${offsetX.toFixed(2)}px`);
    rootEl.style.setProperty('--header-logo-shift-y', `${offsetY.toFixed(2)}px`);
  }, [isConstrainedHost]);

  const handleRootPointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>): void => {
      if (isConstrainedHost || event.pointerType === 'touch') {
        return;
      }

      pendingPointerRef.current = {
        clientX: event.clientX,
        clientY: event.clientY
      };

      if (pointerFrameRef.current === undefined) {
        pointerFrameRef.current = window.requestAnimationFrame(flushPointerEffects);
      }
    },
    [isConstrainedHost, flushPointerEffects]
  );

  const handleRootPointerLeave = React.useCallback((): void => {
    pendingPointerRef.current = undefined;

    if (pointerFrameRef.current !== undefined) {
      window.cancelAnimationFrame(pointerFrameRef.current);
      pointerFrameRef.current = undefined;
    }

    resetPointerEffects();
  }, [resetPointerEffects]);

  const handleLogoError = React.useCallback((): void => {
    setLogoSrc((current) => {
      if (!current) {
        return undefined;
      }
      return undefined;
    });
  }, []);

  const handleSkipLinkClick = React.useCallback((event: React.MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
    skipTargetRef.current?.focus();
  }, []);

  const activePath = React.useMemo(
    () => findActivePath(items, props.currentPageUrl),
    [items, props.currentPageUrl]
  );

  const settingsEditorStrings = React.useMemo<ISettingsEditorStrings>(() => ({
    title: props.strings.SettingsTitle ?? 'Header settings',
    subtitle: props.strings.SettingsSubtitle ?? 'Manage navigation, features, colors, and typography for the global header.',
    save: props.strings.SettingsSave ?? 'Save',
    cancel: props.strings.SettingsCancel ?? 'Cancel',
    saving: props.strings.SettingsSaving ?? 'Saving...',
    loading: props.strings.SettingsLoading ?? 'Loading...',
    saveError: props.strings.SettingsSaveError ?? 'Save failed',
    saved: props.strings.SettingsSaved ?? 'Settings saved.',
    staleError: props.strings.SettingsStaleError ?? 'These settings were changed by another admin. Reload the panel and try again.',
    generalTab: props.strings.SettingsGeneralTab ?? 'General',
    featuresTab: props.strings.SettingsFeaturesTab ?? 'Features',
    colorsTab: props.strings.SettingsColorsTab ?? 'Colors',
    typographyTab: props.strings.SettingsTypographyTab ?? 'Typography',
    navigationTab: props.strings.SettingsNavigationTab ?? 'Navigation',
    generalSectionTitle: props.strings.SettingsGeneralSectionTitle ?? 'Branding',
    generalSectionDesc: props.strings.SettingsGeneralSectionDesc ?? 'Logo, home page URL, and footer.',
    homeUrl: props.strings.SettingsHomeUrl ?? 'Home URL',
    logoUrl: props.strings.SettingsLogoUrl ?? 'Logo URL',
    logoAltText: props.strings.SettingsLogoAltText ?? 'Logo alt text',
    footerHtml: props.strings.SettingsFooterHtml ?? 'Footer HTML',
    footerHeight: props.strings.SettingsFooterHeight ?? 'Footer height (px)',
    navSourceSectionTitle: props.strings.SettingsNavSourceSectionTitle ?? 'Navigation source',
    navSourceSectionDesc: props.strings.SettingsNavSourceSectionDesc ?? 'Choose where the header loads navigation from.',
    sourceTaxonomyTitle: props.strings.SettingsSourceTaxonomyTitle ?? 'Term Store',
    sourceTaxonomyDesc: props.strings.SettingsSourceTaxonomyDesc ?? 'Managed Navigation from the SharePoint Term Store. Configured in Site Settings.',
    sourceJsonFileTitle: props.strings.SettingsSourceJsonFileTitle ?? 'JSON file',
    sourceJsonFileDesc: props.strings.SettingsSourceJsonFileDesc ?? 'A JSON file in the home site library. Editable via the Navigation tab below.',
    navigationProviderName: props.strings.SettingsNavigationProviderName ?? 'Provider name',
    termSetId: props.strings.SettingsTermSetId ?? 'Term set ID',
    termSetIdHint: props.strings.SettingsTermSetIdHint ?? 'Optional. Targets a specific term set directly.',
    navigationFileName: props.strings.SettingsNavigationFileName ?? 'File name',
    navigationFileFolder: props.strings.SettingsNavigationFileFolder ?? 'Folder',
    featuresSectionTitle: props.strings.SettingsFeaturesSectionTitle ?? 'Features',
    featuresSectionDesc: props.strings.SettingsFeaturesSectionDesc ?? 'Toggle header tools on or off. Unspecified values use the built-in defaults.',
    featuresSearchSection: props.strings.SettingsFeaturesSearchSection ?? 'Search',
    featuresChromeSection: props.strings.SettingsFeaturesChromeSection ?? 'Header chrome',
    featuresContentSection: props.strings.SettingsFeaturesContentSection ?? 'Content',
    featuresConfigSection: props.strings.SettingsFeaturesConfigSection ?? 'Configuration URLs',
    colorsSectionTitle: props.strings.SettingsColorsSectionTitle ?? 'Colors',
    colorsSectionDesc: props.strings.SettingsColorsSectionDesc ?? 'Override header colors. Each value wins over the SharePoint theme. Leave blank to use the theme value.',
    chromeBackground: props.strings.SettingsChromeBackground ?? 'Header chrome',
    chromeText: props.strings.SettingsChromeText ?? 'Chrome text',
    surface: props.strings.SettingsSurface ?? 'Surface',
    surfaceHover: props.strings.SettingsSurfaceHover ?? 'Surface hover',
    border: props.strings.SettingsBorder ?? 'Border',
    borderStrong: props.strings.SettingsBorderStrong ?? 'Border strong',
    link: props.strings.SettingsLink ?? 'Link',
    linkHover: props.strings.SettingsLinkHover ?? 'Link hover',
    accent: props.strings.SettingsAccent ?? 'Accent',
    accentHover: props.strings.SettingsAccentHover ?? 'Accent hover',
    bodyText: props.strings.SettingsBodyText ?? 'Text',
    subtext: props.strings.SettingsSubtext ?? 'Subtext',
    hoverBackground: props.strings.SettingsHoverBackground ?? 'Hover background',
    activeBackground: props.strings.SettingsActiveBackground ?? 'Active background',
    focusRing: props.strings.SettingsFocusRing ?? 'Focus ring',
    shadow: props.strings.SettingsShadow ?? 'Shadow',
    typographySectionTitle: props.strings.SettingsTypographySectionTitle ?? 'Typography',
    typographySectionDesc: props.strings.SettingsTypographySectionDesc ?? 'Override header font sizes. Values can be px, rem, or em. Leave blank to use the default.',
    fontBody: props.strings.SettingsFontBody ?? 'Body',
    fontCaption: props.strings.SettingsFontCaption ?? 'Caption',
    fontSubtext: props.strings.SettingsFontSubtext ?? 'Subtext',
    fontTitle: props.strings.SettingsFontTitle ?? 'Title',
    fontTitleLarge: props.strings.SettingsFontTitleLarge ?? 'Title large',
    navigationSectionTitle: props.strings.SettingsNavigationSectionTitle ?? 'Navigation tree',
    navigationSectionDesc: props.strings.SettingsNavigationSectionDesc ?? 'Add, edit, reorder, and remove navigation items. Changes save to the JSON file on the home site.',
    navEmpty: props.strings.SettingsNavEmpty ?? 'No navigation items yet. Click "Add top-level item" to start.',
    navAddRoot: props.strings.SettingsNavAddRoot ?? 'Add top-level item',
    navAddChild: props.strings.SettingsNavAddChild ?? 'Add sub-item',
    navEdit: props.strings.SettingsNavEdit ?? 'Edit',
    navDelete: props.strings.SettingsNavDelete ?? 'Delete',
    navMoveUp: props.strings.SettingsNavMoveUp ?? 'Move up',
    navMoveDown: props.strings.SettingsNavMoveDown ?? 'Move down',
    navLabel: props.strings.SettingsNavLabel ?? 'Label',
    navUrl: props.strings.SettingsNavUrl ?? 'URL',
    navDescription: props.strings.SettingsNavDescription ?? 'Description',
    navGroup: props.strings.SettingsNavGroup ?? 'Group',
    navOrder: props.strings.SettingsNavOrder ?? 'Sort order',
    navFeatured: props.strings.SettingsNavFeatured ?? 'Featured',
    navFeaturedRank: props.strings.SettingsNavFeaturedRank ?? 'Featured rank',
    navOverviewTitle: props.strings.SettingsNavOverviewTitle ?? 'Overview title',
    navOverviewDescription: props.strings.SettingsNavOverviewDescription ?? 'Overview description',
    navMatchUrls: props.strings.SettingsNavMatchUrls ?? 'Match URLs (comma-separated)',
    navIconName: props.strings.SettingsNavIconName ?? 'Icon name',
    navAdd: props.strings.SettingsNavAdd ?? 'Add',
    navEditItem: props.strings.SettingsNavEditItem ?? 'Edit item',
    navAddItem: props.strings.SettingsNavAddItem ?? 'Add item',
    navExternal: props.strings.SettingsNavExternal ?? 'EXT',
    navCancel: props.strings.SettingsNavCancel ?? 'Cancel',
    navSave: props.strings.SettingsNavSave ?? 'Save',
    navTreeTitle: props.strings.SettingsNavTreeTitle ?? 'Navigation tree',
    navTreeCount: props.strings.SettingsNavTreeCount ?? 'top-level items',
    navExpand: props.strings.SettingsNavExpand ?? 'Expand',
    navCollapse: props.strings.SettingsNavCollapse ?? 'Collapse',
    navFeaturedBadge: props.strings.SettingsNavFeaturedBadge ?? 'Featured',
    navDeleteConfirm: props.strings.SettingsNavDeleteConfirm ?? 'Delete this navigation item and all its sub-items?',
    navSearchPlaceholder: props.strings.SettingsNavSearchPlaceholder ?? 'Search navigation items...',
    colorPresets: props.strings.SettingsColorPresets ?? 'Preset colors',
    colorCustom: props.strings.SettingsColorCustom ?? 'Custom color',
    colorClear: props.strings.SettingsColorClear ?? 'Reset to theme default',
    colorClearAria: props.strings.SettingsColorClearAria ?? 'Clear color override',
    colorNoColor: props.strings.SettingsColorNoColor ?? 'Theme default',
    colorInvalidHex: props.strings.SettingsColorInvalidHex ?? 'Enter a hex color like #0f6cbd or #fff.',
    featureSearchLabel: props.strings.SettingsFeatureSearchLabel ?? 'Search',
    featureSearchDesc: props.strings.SettingsFeatureSearchDesc ?? 'Search box in the header and mobile panel.',
    featureSearchSuggestionsLabel: props.strings.SettingsFeatureSearchSuggestionsLabel ?? 'Search suggestions',
    featureSearchSuggestionsDesc: props.strings.SettingsFeatureSearchSuggestionsDesc ?? 'Live search results as you type via Search REST.',
    featureUserProfileLabel: props.strings.SettingsFeatureUserProfileLabel ?? 'User profile',
    featureUserProfileDesc: props.strings.SettingsFeatureUserProfileDesc ?? 'Shows the current user avatar and profile menu.',
    featureNotificationsLabel: props.strings.SettingsFeatureNotificationsLabel ?? 'Notifications',
    featureNotificationsDesc: props.strings.SettingsFeatureNotificationsDesc ?? 'Notification bell with unread badge from a SharePoint list.',
    featureAppLauncherLabel: props.strings.SettingsFeatureAppLauncherLabel ?? 'App launcher',
    featureAppLauncherDesc: props.strings.SettingsFeatureAppLauncherDesc ?? 'Grid of app icons in a callout dropdown.',
    featureQuickActionsLabel: props.strings.SettingsFeatureQuickActionsLabel ?? 'Quick actions',
    featureQuickActionsDesc: props.strings.SettingsFeatureQuickActionsDesc ?? 'Configurable dropdown of shortcut links.',
    featureLanguageSwitcherLabel: props.strings.SettingsFeatureLanguageSwitcherLabel ?? 'Language switcher',
    featureLanguageSwitcherDesc: props.strings.SettingsFeatureLanguageSwitcherDesc ?? 'Lets users switch the UI language.',
    featureThemeSwitcherLabel: props.strings.SettingsFeatureThemeSwitcherLabel ?? 'Dark mode',
    featureThemeSwitcherDesc: props.strings.SettingsFeatureThemeSwitcherDesc ?? 'Toggle button for dark/light theme.',
    featureBookmarksLabel: props.strings.SettingsFeatureBookmarksLabel ?? 'Bookmarks',
    featureBookmarksDesc: props.strings.SettingsFeatureBookmarksDesc ?? 'Personal bookmarks saved to a list or local storage.',
    featureAdminSettingsLabel: props.strings.SettingsFeatureAdminSettingsLabel ?? 'Admin settings gear',
    featureAdminSettingsDesc: props.strings.SettingsFeatureAdminSettingsDesc ?? 'Shows the gear icon (this dialog) when the page is in edit mode.',
    featureHelpLabel: props.strings.SettingsFeatureHelpLabel ?? 'Help',
    featureHelpDesc: props.strings.SettingsFeatureHelpDesc ?? 'Link to a configurable help page.',
    featureSiteSwitcherLabel: props.strings.SettingsFeatureSiteSwitcherLabel ?? 'Site switcher',
    featureSiteSwitcherDesc: props.strings.SettingsFeatureSiteSwitcherDesc ?? 'Dropdown to jump between sites from navigation.',
    featureFeedbackLabel: props.strings.SettingsFeatureFeedbackLabel ?? 'Feedback',
    featureFeedbackDesc: props.strings.SettingsFeatureFeedbackDesc ?? 'Link to a configurable feedback page.',
    featurePrintShareLabel: props.strings.SettingsFeaturePrintShareLabel ?? 'Print / Share',
    featurePrintShareDesc: props.strings.SettingsFeaturePrintShareDesc ?? 'Print the current page and share via Web Share API.',
    featureBackToTopLabel: props.strings.SettingsFeatureBackToTopLabel ?? 'Back to top',
    featureBackToTopDesc: props.strings.SettingsFeatureBackToTopDesc ?? 'Floating button to scroll to the top of the page.',
    featureAccessibilityToolsLabel: props.strings.SettingsFeatureAccessibilityToolsLabel ?? 'Accessibility tools',
    featureAccessibilityToolsDesc: props.strings.SettingsFeatureAccessibilityToolsDesc ?? 'High-contrast toggle and font-size slider.',
    featureBreadcrumbsLabel: props.strings.SettingsFeatureBreadcrumbsLabel ?? 'Breadcrumbs',
    featureBreadcrumbsDesc: props.strings.SettingsFeatureBreadcrumbsDesc ?? 'Breadcrumb trail under the header showing the active path.',
    featureFooterLabel: props.strings.SettingsFeatureFooterLabel ?? 'Footer',
    featureFooterDesc: props.strings.SettingsFeatureFooterDesc ?? 'Optional footer in the Bottom placeholder with custom HTML.',
    featureSeoMetaLabel: props.strings.SettingsFeatureSeoMetaLabel ?? 'SEO meta tags',
    featureSeoMetaDesc: props.strings.SettingsFeatureSeoMetaDesc ?? 'Injects description/keywords/OG/canonical from navigation metadata.',
    featureAnalyticsLabel: props.strings.SettingsFeatureAnalyticsLabel ?? 'Analytics',
    featureAnalyticsDesc: props.strings.SettingsFeatureAnalyticsDesc ?? 'Emits page-view and feature-usage telemetry events.',
    featureMegaMenuRailLabel: props.strings.SettingsFeatureMegaMenuRailLabel ?? 'Mega-menu rail',
    featureMegaMenuRailDesc: props.strings.SettingsFeatureMegaMenuRailDesc ?? 'Left rail with overview and featured cards in the mega-menu.',
    featureMegaMenuOverviewLabel: props.strings.SettingsFeatureMegaMenuOverviewLabel ?? 'Mega-menu overview',
    featureMegaMenuOverviewDesc: props.strings.SettingsFeatureMegaMenuOverviewDesc ?? 'Summary card with section count and current page in the mega-menu.',
    featureLanguageBadgeLabel: props.strings.SettingsFeatureLanguageBadgeLabel ?? 'Language badge',
    featureLanguageBadgeDesc: props.strings.SettingsFeatureLanguageBadgeDesc ?? 'Small language indicator pill (e.g. "EN") in the header.',
    featuresEnabledCount: props.strings.SettingsFeaturesEnabledCount ?? 'enabled',
    OverviewLabel: props.strings.OverviewLabel,
    FeaturedLabel: props.strings.FeaturedLabel,
    SectionCountLabel: props.strings.SectionCountLabel,
    SectionCountSingleLabel: props.strings.SectionCountSingleLabel,
    CurrentSectionLabel: props.strings.CurrentSectionLabel,
    CurrentPageLabel: props.strings.CurrentPageLabel,
    ViewAllLabel: props.strings.ViewAllLabel,
    ViewAllForLabel: props.strings.ViewAllForLabel,
    NavigationLabel: props.strings.NavigationLabel,
    BackButtonLabel: props.strings.BackButtonLabel,
    MobileBreadcrumbsAriaLabel: props.strings.MobileBreadcrumbsAriaLabel,
    EmptySectionLabel: props.strings.EmptySectionLabel,
    navImportJson: props.strings.SettingsNavImportJson ?? 'Import JSON',
    navExportJson: props.strings.SettingsNavExportJson ?? 'Export JSON',
    navImportError: props.strings.SettingsNavImportError ?? 'Import failed: invalid navigation JSON file.',
    navImportSuccess: props.strings.SettingsNavImportSuccess ?? 'Navigation imported successfully.',
    navImportConfirm: props.strings.SettingsNavImportConfirm ?? 'Importing will replace the current navigation tree. Continue?'
  }), [props.strings]);

  const fallbackHeaderBar = React.useMemo(
    () => (
      <div className={classNames(styles.root, 'header-ready')}>
        <div className={styles.mainBar}>
          <div className={styles.container}>
            <div className={styles.mainContent}>
              <a aria-label={props.strings.HomeAriaLabel} className={styles.brandLink} href={props.homeUrl}>
                {logoSrc ? (
                  <img alt={props.logoAltText} className={styles.brandImage} src={logoSrc} />
                ) : null}
              </a>
              <div className={styles.fallbackSummary}>
                <span className={styles.fallbackNotice}>{props.strings.NavigationUnavailableLabel}</span>
                {<div className={styles.headerTools}></div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    [props.strings.HomeAriaLabel, props.strings.NavigationUnavailableLabel, props.homeUrl, props.logoAltText, logoSrc]
  );

  const staticFallbackBar = React.useMemo<React.ReactNode>(
    () => (
      <div className={classNames(styles.root, 'header-ready')}>
        <div className={styles.mainBar}>
          <div className={styles.container}>
            <div className={styles.mainContent}>
              <a aria-label={props.strings.HomeAriaLabel} className={styles.brandLink} href={props.homeUrl}>
                {logoSrc ? (
                  <img alt={props.logoAltText} className={styles.brandImage} src={logoSrc} />
                ) : null}
              </a>
              <div className={styles.fallbackSummary}>
                <span className={styles.fallbackNotice}>{props.strings.NavigationUnavailableLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    [props.strings.HomeAriaLabel, props.strings.NavigationUnavailableLabel, props.homeUrl, props.logoAltText, logoSrc]
  );

  const rootClassName = classNames(
    styles.root,
    isReady ? 'header-ready' : undefined,
    isConstrainedHost ? 'header-constrained' : undefined,
    (isForcedColorsActive || features.accessibilityToolsEnabled) ? 'header-forced-colors' : undefined,
    isCondensed ? styles.rootCondensed : undefined
  );
  const menuButtonClassName = classNames(
    styles.menuButton,
    isPanelOpen ? styles.menuButtonOpen : undefined
  );

  const moreToolsItems = useMoreToolsItems({
    strings: props.strings,
    features,
    languageOptions,
    currentLanguage,
    onChangeLanguage: handleLanguageChange,
    isHighContrast: isForcedColorsActive,
    onToggleHighContrast: handleHighContrastToggle,
    fontScale,
    onChangeFontScale: handleFontScaleChange
  });

  const measureNavFit = React.useCallback((): void => {
    try {
      const host = hostRef.current;
      const navStrip = navMeasuringStripRef.current;
      const brandEl = brandLinkRef.current;
      const toolsEl = headerToolsRef.current;
      if (!host || !navStrip) {
        return;
      }

      const navWidth = navStrip.scrollWidth;

      if (toolsEl && toolsEl.offsetParent !== null) {
        const children = Array.from(toolsEl.children) as HTMLElement[];
        let tw = 0;
        for (const child of children) {
          tw += child.offsetWidth;
        }
        const style = window.getComputedStyle(toolsEl);
        const toolsGap = parseFloat(style.columnGap || style.gap || '0') || 0;
        if (children.length > 1) {
          tw += toolsGap * (children.length - 1);
        }
        toolsIntrinsicWidthRef.current = tw;
      }

      const hostWidth = host.clientWidth;
      const brandWidth = brandEl?.offsetWidth ?? 0;
      const toolsWidth = toolsIntrinsicWidthRef.current;

      const mainContentStyle = window.getComputedStyle(host);
      const gap = parseFloat(mainContentStyle.columnGap || mainContentStyle.gap || '0') || 0;
      const requiredWidth = brandWidth + navWidth + toolsWidth + gap * 3;

      if (requiredWidth <= hostWidth) {
        host.dataset.navFits = 'true';
        setVisibleNavCount(undefined);
        return;
      }

      const itemStrips = Array.from(navStrip.children) as HTMLElement[];
      const stripStyle = window.getComputedStyle(navStrip);
      const stripGap = parseFloat(stripStyle.columnGap || stripStyle.gap || '0') || 0;
      const availableForNav = hostWidth - brandWidth - toolsWidth - gap * 3 - MORE_TRIGGER_RESERVED_WIDTH;

      let cumulative = 0;
      let visibleCount = 0;
      for (let i = 0; i < itemStrips.length; i += 1) {
        const itemWidth = itemStrips[i].offsetWidth + (i > 0 ? stripGap : 0);
        if (cumulative + itemWidth > availableForNav) {
          break;
        }
        cumulative += itemWidth;
        visibleCount = i + 1;
      }

      if (visibleCount > 0 && visibleCount < itemStrips.length) {
        host.dataset.navFits = 'true';
        setVisibleNavCount(visibleCount);
      } else if (visibleCount === 0) {
        host.dataset.navFits = 'false';
        setVisibleNavCount(undefined);
      } else {

        host.dataset.navFits = 'true';
        setVisibleNavCount(undefined);
      }
    } catch {

      const host = hostRef.current;
      if (host) {
        host.dataset.navFits = 'true';
      }
      setVisibleNavCount(undefined);
    }
  }, []);

  React.useLayoutEffect(() => {
    measureNavFit();

    let scheduledFrame: number | undefined;
    const scheduleMeasure = (): void => {
      if (scheduledFrame !== undefined) {
        return;
      }
      scheduledFrame = window.requestAnimationFrame(() => {
        scheduledFrame = undefined;
        measureNavFit();
      });
    };

    const ro = typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(() => {
        scheduleMeasure();
      });

    const host = hostRef.current;
    if (host && ro) {
      ro.observe(host);
    }

    window.addEventListener('resize', scheduleMeasure, { passive: true });

    const fontsReady = typeof document !== 'undefined' && document.fonts?.ready;
    if (fontsReady) {
      fontsReady.then(() => measureNavFit()).catch(() => undefined);
    }

    const timers = [50, 300, 1000].map((delay) => window.setTimeout(measureNavFit, delay));

    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', scheduleMeasure);
      timers.forEach((t) => window.clearTimeout(t));
      if (scheduledFrame !== undefined) {
        window.cancelAnimationFrame(scheduledFrame);
      }
    };
  }, [items, features, quickActions, appLauncherItems, moreToolsItems, measureNavFit]);

  const renderHeaderTools = React.useMemo((): React.ReactNode => {
    return (
      <>
        {features.quickActionsEnabled && quickActions.length > 0 ? (
          <React.Suspense fallback={null}>
            <QuickActionsTool strings={props.strings} actions={quickActions} />
          </React.Suspense>
        ) : null}
        {features.searchEnabled ? (
          <SearchTool
            strings={props.strings}
            services={headerServices}
            searchScope={features.searchScope}
            placeholder={features.searchPlaceholder}
            suggestionsEnabled={features.searchSuggestionsEnabled}
            searchResultsPageUrl={features.searchResultsPageUrl}
            triggerRef={searchTriggerRef}
          />
        ) : null}
        {features.notificationsEnabled ? (
          <NotificationsTool strings={props.strings} services={headerServices} listUrl={features.notificationListUrl} />
        ) : null}
        {features.appLauncherEnabled && appLauncherItems.length > 0 ? (
          <React.Suspense fallback={null}>
            <AppLauncherTool strings={props.strings} items={appLauncherItems} />
          </React.Suspense>
        ) : null}
        {features.bookmarksEnabled ? (
          <BookmarksTool
            strings={props.strings}
            services={headerServices}
            listUrl={features.bookmarkListUrl}
            currentTitle={documentTitle || props.strings.NavigationLabel}
            currentUrl={props.currentPageUrl}
          />
        ) : null}
        {moreToolsItems.length > 0 ? (
          <MoreToolsMenu strings={props.strings} items={moreToolsItems} />
        ) : null}
        {features.adminSettingsEnabled && isInEditMode ? (
          <AdminSettingsTool
            strings={props.strings}
            adminUrl={features.adminUrl}
            onOpenEditor={props.settingsService ? (): void => setIsEditorOpen(true) : undefined}
          />
        ) : null}
        {features.userProfileEnabled ? <UserProfileTool strings={props.strings} services={headerServices} /> : null}
      </>
    );
  }, [
    features,
    quickActions,
    appLauncherItems,
    headerServices,
    documentTitle,
    isInEditMode,
    moreToolsItems,
    props.strings,
    props.currentPageUrl,
    props.settingsService
  ]);

  const fluentV9Theme = isDarkTheme ? webDarkTheme : webLightTheme;

  const themeStyleTagRef = React.useRef<HTMLStyleElement | null>(null);

  React.useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    if (!themeStyleTagRef.current) {
      const styleEl = document.createElement('style');
      styleEl.setAttribute('data-header-theme', 'true');
      document.head.appendChild(styleEl);
      themeStyleTagRef.current = styleEl;
    }

    themeStyleTagRef.current.textContent = themeStylesCss;

    return () => {
      if (themeStyleTagRef.current) {
        themeStyleTagRef.current.remove();
        themeStyleTagRef.current = null;
      }
    };
  }, [themeStylesCss]);

  return (
    <ErrorBoundary fallback={staticFallbackBar} onError={handleHeaderError}>
    <FluentProvider theme={fluentV9Theme}>
        <div className="header-theme">

        <a
          className={styles.skipLink}
          href={`#${SKIP_NAV_TARGET_ID}`}
          id={SKIP_LINK_ID}
          onClick={handleSkipLinkClick}
        >
          {props.strings.SkipToNavigationLabel}
        </a>

        <div
          id={SKIP_NAV_TARGET_ID}
          ref={skipTargetRef}
          tabIndex={-1}
          role="region"
          aria-label={props.strings.SkipNavigationTargetAriaLabel}
        />

        <ErrorBoundary fallback={fallbackHeaderBar} onError={handleHeaderError}>
          {}
          <div ref={navMeasuringStripRef} className={styles.measuringStrip} aria-hidden="true">
            {items.map((item) => (
              <span key={item.id} className={styles.measuringStripTrigger}>
                {item.label}
                {itemHasChildren(item) ? <span style={{ width: '16px' }} /> : null}
              </span>
            ))}
          </div>

          <div
            className={rootClassName}
            onPointerLeave={handleRootPointerLeave}
            onPointerMove={handleRootPointerMove}
            ref={rootRef}
            role="banner"
          >
            <div className={styles.mainBar}>
              <div className={styles.container}>
                <div ref={hostRef} className={classNames(styles.headerHost, styles.mainContent)} data-nav-fits="true">
                  <div className={styles.mobileMenuSlot}>
                    <Button
                      aria-label={props.strings.OpenMenuLabel}
                      className={menuButtonClassName}
                      ref={menuButtonRef as React.Ref<HTMLButtonElement>}
                      icon={<Navigation24Regular />}
                      appearance="subtle"
                      onClick={handleOpenMobilePanel}
                      title={props.strings.OpenMenuLabel}
                    />
                  </div>

                  <a
                    aria-label={props.strings.HomeAriaLabel}
                    className={styles.brandLink}
                    href={props.homeUrl}
                    ref={brandLinkRef}
                  >
                    {logoSrc ? (
                      <img
                        alt={props.logoAltText}
                        className={styles.brandImage}
                        onError={handleLogoError}
                        src={logoSrc}
                      />
                    ) : null}
                  </a>

                  <div className={styles.desktopNavSlot}>
                    <DesktopNavigation
                      items={items}
                      navigationListRef={desktopNavigationListRef}
                      showLoading={showLoading}
                      loadingBranchIds={loadingBranchIds}
                      strings={props.strings}
                      currentPageUrl={props.currentPageUrl}
                      isTeamsContext={props.isTeamsContext}
                      showRail={features.megaMenuRailEnabled !== false}
                      showOverview={features.megaMenuOverviewEnabled !== false}
                      onTrackNavigation={stableTrackNavigation}
                      onLoadBranch={stableLoadBranch}
                      activePath={activePath}
                      visibleCount={visibleNavCount}
                    />
                  </div>

                  <div className={styles.headerTools} ref={headerToolsRef}>
                    {renderHeaderTools}
                  </div>
                </div>
              </div>
            </div>

            <React.Suspense fallback={null}>
              <MobilePanel
                isOpen={isPanelOpen}
                onDismiss={handleDismissMobilePanel}
                items={items}
                showLoading={showLoading}
                loadingBranchIds={loadingBranchIds}
                strings={props.strings}
                themeVariant={effectiveThemeVariant}
                currentPageUrl={props.currentPageUrl}
                features={features}
                headerServices={headerServices}
                currentLanguage={currentLanguage}
                onChangeLanguage={handleLanguageChange}
                isHighContrast={isForcedColorsActive}
                onToggleHighContrast={handleHighContrastToggle}
                fontScale={fontScale}
                onChangeFontScale={handleFontScaleChange}
                onTrackNavigation={stableTrackNavigation}
                onLoadBranch={stableLoadBranch}
                documentTitle={documentTitle}
                activePath={activePath}
              />
            </React.Suspense>

            {features.breadcrumbsEnabled ? (
              <Breadcrumbs
                strings={props.strings}
                items={items}
                activePath={activePath}
                homeUrl={props.homeUrl}
              />
            ) : null}
          </div>
        </ErrorBoundary>

        {features.backToTopEnabled ? <BackToTop strings={props.strings} /> : null}
      </div>

      {features.adminSettingsEnabled && props.settingsService ? (
        <React.Suspense fallback={null}>
        <SettingsEditorDialog
          isOpen={isEditorOpen}
          onDismiss={handleEditorDismiss}
          settingsService={props.settingsService}
          navigationService={props.navigationService}
          strings={settingsEditorStrings}
        />
        </React.Suspense>
      ) : null}
      </FluentProvider>
    </ErrorBoundary>
  );
};

export default HeaderShell;
