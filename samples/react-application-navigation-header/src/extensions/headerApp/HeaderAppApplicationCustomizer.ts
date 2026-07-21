import { override } from '@microsoft/decorators';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { Log } from '@microsoft/sp-core-library';
import { BaseApplicationCustomizer, PlaceholderName } from '@microsoft/sp-application-base';
import type { PlaceholderContent } from '@microsoft/sp-application-base';
import { ThemeProvider } from '@microsoft/sp-component-base';
import type { ThemeChangedEventArgs, IReadonlyTheme } from '@microsoft/sp-component-base';

import type { IHeaderFeatures } from './models/IHeaderFeatures';
import { resolveFeatureFlags, normalizeFeatureOverrides } from './models/IHeaderFeatures';

import type { IHeaderShellProps } from './components/HeaderShell';
import HeaderShell from './components/HeaderShell';
import { TermStoreNavigationService } from './services/TermStoreNavigationService';
import { JsonFileNavigationService } from './services/JsonFileNavigationService';
import type { INavigationProvider } from './services/INavigationProvider';
import { SettingsService } from './services/SettingsService';
import type { ISettingsFile } from './models/ISettingsFile';
import { DEFAULT_SETTINGS } from './models/ISettingsFile';
import { findActivePath, resolveNavigationTrail } from './utils/navigation';
import { configureNavigationTelemetry, emitNavigationDiagnostic } from './utils/navigationTelemetry';
import { reportError, withErrorReporting } from './utils/errorReporting';
import { applyThemeStylesToElement, clearSuiteBarBackgroundCache, tryReadSuiteBarBackground, normalizeColorOverrides, normalizeFontOverrides } from './utils/theme';
import type { IHeaderColorOverrides, IHeaderFontOverrides } from './utils/theme';
import { sanitizeHtml, escapeHtmlAttribute } from './utils/sanitize';
import { sanitizeUrl } from './utils/url';
import { getSafeStrings } from './utils/defaultStrings';
import * as strings from 'HeaderAppApplicationCustomizerStrings';

const LOG_SOURCE: string = 'HeaderAppApplicationCustomizer';
const MAX_INITIAL_RENDER_ATTEMPTS = 30;

export interface IHeaderAppApplicationCustomizerProperties {
  homeUrl?: string;
  logoUrl?: string;
  logoAltText?: string;
  telemetryEndpointUrl?: string;
  telemetryEndpointAllowlist?: string;
  navigationProviderName?: string;
  termSetId?: string;
  
  navigationSource?: 'taxonomy' | 'jsonFile';
  
  navigationFileName?: string;
  
  navigationFileFolder?: string;
  
  features?: IHeaderFeatures;
  
  colors?: IHeaderColorOverrides;
  
  fontSizes?: IHeaderFontOverrides;
}

interface IResolvedHeaderProperties {
  homeUrl: string;
  logoUrl?: string;
  logoAltText: string;
  telemetryEndpointUrl?: string;
  telemetryEndpointAllowlist?: string;
  navigationProviderName?: string;
  termSetId?: string;
  navigationSource: 'taxonomy' | 'jsonFile';
  navigationFileName: string;
  navigationFileFolder: string;
  features: IHeaderFeatures;
  colors: IHeaderColorOverrides;
  fontSizes: IHeaderFontOverrides;
}

interface IResolvedChromeLocale {
  chromeLanguageLabel: string;
  chromeLanguageShortLabel: string;
  isChromeLanguageFallback: boolean;
}

const HEADER_CHROME_LANGUAGE_METADATA: Record<string, { label: string; shortLabel: string }> = {
  en: { label: 'English', shortLabel: 'EN' },
  sv: { label: 'Svenska', shortLabel: 'SV' },
  de: { label: 'Deutsch', shortLabel: 'DE' },
  es: { label: 'Español', shortLabel: 'ES' },
  fr: { label: 'Français', shortLabel: 'FR' },
  pt: { label: 'Português', shortLabel: 'PT' },
  zh: { label: '中文', shortLabel: 'ZH' },
  ja: { label: '日本語', shortLabel: 'JA' },
  ar: { label: 'العربية', shortLabel: 'AR' }
};

interface IHeaderLifecycleDebugDetail {
  action: string;
  metadata?: Record<string, boolean | number | string | undefined>;
}

export default class HeaderAppApplicationCustomizer extends BaseApplicationCustomizer<IHeaderAppApplicationCustomizerProperties> {
  private _root: Root | null = null;
  private _topPlaceholder?: PlaceholderContent;
  private _bottomPlaceholder?: PlaceholderContent;
  private _hostElement?: HTMLDivElement;
  private _footerHostElement?: HTMLDivElement;
  private _navigationService!: INavigationProvider;
  private _settingsService?: SettingsService;
  private _runtimeSettings: ISettingsFile = DEFAULT_SETTINGS;
  private _themeProvider?: ThemeProvider;
  private _themeVariant?: IReadonlyTheme;
  private _resolvedProperties?: IResolvedHeaderProperties;
  private _resolvedChromeLocale?: IResolvedChromeLocale;
  private _isPlaceholderReady = false;
  private _renderRetryFrame?: number;
  private _renderRetryAttempts = 0;
  private _lastSeoUrl?: string;
  private _lastFooterSignature?: string;
  private _suiteBarObserver?: MutationObserver;
  private _suiteBarWatchFrame?: number;
  private _suiteBarWatchAttempts = 0;
  private _suiteBarWatchActive = false;
  private _disposed = false;

  @override
  public onInit(): Promise<void> {
    const safeStrings = getSafeStrings(strings);

    try {
      Log.info(LOG_SOURCE, `Initialized ${safeStrings.Title}`);
      this._resolvedProperties = this._getResolvedProperties();
      this._resolvedChromeLocale = this._getResolvedChromeLocale();
      this._settingsService = new SettingsService(this.context, this._resolvedProperties.homeUrl);
      this._navigationService = this._createNavigationProvider(this._resolvedProperties);
      void this._navigationService.getNavigation().catch((): void => undefined);
      this._themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey);
      this._themeVariant = this._themeProvider.tryGetTheme();
      const hasInitialTheme = !!this._themeVariant;

      this._debugLifecycle('onInit', {
        hasInitialTheme,
        hasThemeProvider: !!this._themeProvider,
        webUrl: this.context.pageContext.web.absoluteUrl,
        currentPageUrl: this.context.pageContext.site.serverRequestPath ?? this.context.pageContext.web.absoluteUrl
      });

      this._themeProvider.themeChangedEvent.add(this, this._onThemeChanged);
      if (this.context.application) {
        this.context.application.navigatedEvent.add(this, this._onNavigated);
      }

      configureNavigationTelemetry({
        applicationName: LOG_SOURCE,
        endpointUrl: this._resolvedProperties.telemetryEndpointUrl,
        endpointAllowlist: this._resolvedProperties.telemetryEndpointAllowlist
      });

      if (this.context.placeholderProvider) {
        const hasTopPlaceholder = this.context.placeholderProvider.placeholderNames.indexOf(PlaceholderName.Top) !== -1;
        if (hasTopPlaceholder) {
          this._isPlaceholderReady = true;
        }
      }

      if (hasInitialTheme) {
        this._renderPlaceholders();
      } else {
        this._debugLifecycle('onInitDeferredRender', { reason: 'theme-unavailable' });
      }

      void this._loadRuntimeSettings();

      this._startSuiteBarWatch();
    } catch (error: unknown) {
      reportError(error, { action: 'oninit-failed', level: 'service' });
    }

    return Promise.resolve();
  }

  @override
  protected onPlaceholdersChanged(): void {
    this._isPlaceholderReady = true;
    this._debugLifecycle('onPlaceholdersChanged', {
      hasTopPlaceholderElement: !!document.getElementById('spTopPlaceholder')
    });

    this._renderPlaceholders();
  }

  @override
  protected onDispose(): void {
    this._disposed = true;

    if (this._themeProvider) {
      this._themeProvider.themeChangedEvent.remove(this, this._onThemeChanged);
    }

    if (this.context.application) {
      this.context.application.navigatedEvent.remove(this, this._onNavigated);
    }

    if (this._renderRetryFrame !== undefined) {
      window.cancelAnimationFrame(this._renderRetryFrame);
      this._renderRetryFrame = undefined;
    }

    this._stopSuiteBarWatch();

    this._disposeRenderedHost();
    this._disposeFooterHost();
    this._topPlaceholder?.dispose();
    this._bottomPlaceholder?.dispose();
    clearSuiteBarBackgroundCache();

    super.onDispose();
  }

  
  private readonly _onSettingsChanged = (): void => {
    void this._loadRuntimeSettings();
  };

  private readonly _renderPlaceholders = (): void => {
    if (!this._isPlaceholderReady) {
      this._debugLifecycle('renderSkippedNotReady');
      return;
    }

    if (!this.context.placeholderProvider) {
      this._debugLifecycle('placeholderProviderUnavailable');
      return;
    }

    if (!this._topPlaceholder) {
      try {
        this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, {
          onDispose: this._onPlaceholderDispose
        });

        this._debugLifecycle('tryCreateTopPlaceholder', {
          createdPlaceholder: !!this._topPlaceholder
        });
      } catch (error: unknown) {
        this._debugLifecycle('tryCreateTopPlaceholderFailed', {
          error: error instanceof Error ? error.message : String(error)
        });
        reportError(error, { action: 'placeholder-creation-failed', level: 'service' });
      }
    }

    if (!this._topPlaceholder?.domElement) {
      this._debugLifecycle('topPlaceholderUnavailable', {
        hasPlaceholder: !!this._topPlaceholder,
        hasDomElement: !!this._topPlaceholder?.domElement
      });
      this._scheduleRenderRetry();
      return;
    }

    this._renderRetryAttempts = 0;

    if (!this._hostElement) {
      this._hostElement = document.createElement('div');
      this._hostElement.className = 'header-host';
      this._hostElement.setAttribute('data-automation-id', 'header-host');
      this._topPlaceholder.domElement.appendChild(this._hostElement);

      this._debugLifecycle('hostCreated', {
        childCount: this._topPlaceholder.domElement.childElementCount
      });
    }

    try {
      const resolvedProperties = this._resolvedProperties!;
      const currentPageUrl: string = this._getCurrentPageUrl();

      const safeStrings = getSafeStrings(strings);
      const elementProps: IHeaderShellProps = {
        chromeLanguageLabel: this._resolvedChromeLocale?.chromeLanguageLabel ?? 'English',
        chromeLanguageShortLabel: this._resolvedChromeLocale?.chromeLanguageShortLabel ?? 'EN',
        isChromeLanguageFallback: !!this._resolvedChromeLocale?.isChromeLanguageFallback,
        context: this.context,
        navigationService: this._navigationService,
        navigationSource: resolvedProperties.navigationSource,
        homeUrl: resolvedProperties.homeUrl,
        logoUrl: resolvedProperties.logoUrl,
        logoAltText: resolvedProperties.logoAltText,
        themeVariant: this._themeVariant,
        currentPageUrl,
        features: resolvedProperties.features,
        colors: resolvedProperties.colors,
        fontSizes: resolvedProperties.fontSizes,
        settingsService: this._settingsService,
        runtimeSettings: this._runtimeSettings,
        onSettingsChanged: this._onSettingsChanged,
        strings: safeStrings
      };

      if (!this._root) {
        this._root = createRoot(this._hostElement);
      }
      this._root.render(React.createElement(HeaderShell, elementProps));
      this._debugLifecycle('renderComplete');

      void withErrorReporting(() => this._renderFooterPlaceholder(), { action: 'footer-render-failed', level: 'service' })();
      void withErrorReporting(() => this._applySeoMetaTags(), { action: 'seo-meta-apply-failed', level: 'service' })();
    } catch (error: unknown) {
      reportError(error, { action: 'render-failed', level: 'service' });
    }
  };

  private _disposeRenderedHost(): void {
    if (this._hostElement) {
      const el = this._hostElement;
      this._hostElement = undefined;
      if (this._root) {
        const r = this._root;
        this._root = null;
        try {
          r.unmount();
        } catch { void 0; }
        window.queueMicrotask(() => {
          try {
            el.remove();
          } catch { void 0; }
        });
      } else {
        try {
          ReactDom.unmountComponentAtNode(el);
        } finally {
          try {
            el.remove();
          } catch { void 0; }
        }
      }
    }
  }

  private _disposeFooterHost(): void {
    if (this._footerHostElement) {
      try {
        this._footerHostElement.remove();
      } catch { void 0; }
      this._footerHostElement = undefined;
    }
  }

  private readonly _onPlaceholderDispose = (): void => {
    this._disposeRenderedHost();
    this._disposeFooterHost();
    this._topPlaceholder = undefined;
    this._bottomPlaceholder = undefined;
  };

  private async _renderFooterPlaceholder(): Promise<void> {
    if (this._disposed) {
      return;
    }

    if (!this.context.placeholderProvider) {
      return;
    }

    const rootItems = await this._navigationService.getNavigation();
    if (this._disposed) {
      return;
    }

    const rootFeatures = rootItems[0]?.features ?? {};
    const features = resolveFeatureFlags(rootFeatures, this._resolvedProperties?.features ?? {});

    if (!features.footerEnabled) {
      this._bottomPlaceholder?.dispose();
      this._bottomPlaceholder = undefined;
      this._lastFooterSignature = undefined;
      return;
    }

    if (this._disposed) {
      return;
    }

    if (!this._bottomPlaceholder) {
      try {
        this._bottomPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Bottom, {
          onDispose: this._onPlaceholderDispose
        });
      } catch (error: unknown) {
        reportError(error, { action: 'footer-placeholder-creation-failed', level: 'service' });
      }
    }

    if (!this._bottomPlaceholder?.domElement) {
      return;
    }

    if (!this._footerHostElement) {
      this._footerHostElement = document.createElement('div');
      this._footerHostElement.className = 'header-footer-host';
      this._footerHostElement.setAttribute('data-automation-id', 'header-footer-host');
      this._bottomPlaceholder.domElement.appendChild(this._footerHostElement);
    }

    applyThemeStylesToElement(this._footerHostElement, this._themeVariant, undefined, this._resolvedProperties?.colors, this._resolvedProperties?.fontSizes);

    const footerHtml = sanitizeHtml(features.footerHtml || this._getDefaultFooterHtml());
    const footerHeight = features.footerHeight || 48;
    const footerSignature = `${footerHeight}|${footerHtml}`;

    if (this._lastFooterSignature === footerSignature) {
      return;
    }
    this._lastFooterSignature = footerSignature;

    if (this._disposed) {
      return;
    }

    this._footerHostElement.innerHTML = footerHtml;
    this._footerHostElement.style.minHeight = `${footerHeight}px`;
    this._footerHostElement.style.display = 'flex';
    this._footerHostElement.style.alignItems = 'center';
    this._footerHostElement.style.justifyContent = 'center';

    this._debugLifecycle('footerRendered', {
      footerEnabled: features.footerEnabled,
      footerHeight
    });
  }

  private _getDefaultFooterHtml(): string {
    const year = new Date().getFullYear();
    const homeUrl = escapeHtmlAttribute(this._resolvedProperties?.homeUrl ?? '/');
    return `
      <footer style="padding: 12px 24px; text-align: center; width: 100%;" role="contentinfo">
        <span>&copy; ${year} Contoso. All rights reserved.</span>
        <span style="margin: 0 12px;">|</span>
        <a href="${homeUrl}" style="color: inherit; text-decoration: underline;">Home</a>
      </footer>
    `;
  }

  private async _applySeoMetaTags(): Promise<void> {
    if (this._disposed) {
      return;
    }

    const currentPageUrl = this._getCurrentPageUrl();

    if (this._lastSeoUrl === currentPageUrl) {
      return;
    }

    const rootItems = await this._navigationService.getNavigation();
    if (this._disposed) {
      return;
    }

    const rootFeatures = rootItems[0]?.features ?? {};
    const features = resolveFeatureFlags(rootFeatures, this._resolvedProperties?.features ?? {});

    if (!features.seoMetaEnabled) {
      return;
    }

    const activePath = findActivePath(rootItems, currentPageUrl);
    const activeItem = activePath.length > 0
      ? resolveNavigationTrail(rootItems, activePath).pop()
      : undefined;

    const meta = activeItem?.meta;
    if (!meta) {
      return;
    }

    this._lastSeoUrl = currentPageUrl;

    if (this._disposed) {
      return;
    }

    this._upsertMetaTag('description', meta.description);
    this._upsertMetaTag('keywords', meta.keywords);
    this._upsertMetaTag('robots', meta.robots);

    if (meta.ogType) {
      this._upsertPropertyMetaTag('og:type', meta.ogType);
    }

    if (meta.ogImage) {
      this._upsertPropertyMetaTag('og:image', meta.ogImage);
    }

    if (meta.canonical) {
      this._upsertCanonicalLink(meta.canonical);
    }

    if (meta.title) {
      document.title = meta.title;
    }

    this._debugLifecycle('seoMetaApplied', {
      itemId: activeItem?.id,
      itemLabel: activeItem?.label,
      hasMeta: !!meta
    });
  }

  private _upsertMetaTag(name: string, content: string | undefined): void {
    if (!content) {
      return;
    }

    const safeName = escapeHtmlAttribute(name);
    let element = document.querySelector(`meta[name="${safeName}"]`) as HTMLMetaElement | null;

    if (!element) {
      element = document.createElement('meta');
      element.setAttribute('name', name);
      document.head.appendChild(element);
    }

    element.setAttribute('content', content);
  }

  private _upsertPropertyMetaTag(property: string, content: string | undefined): void {
    if (!content) {
      return;
    }

    const safeProperty = escapeHtmlAttribute(property);
    let element = document.querySelector(`meta[property="${safeProperty}"]`) as HTMLMetaElement | null;

    if (!element) {
      element = document.createElement('meta');
      element.setAttribute('property', property);
      document.head.appendChild(element);
    }

    element.setAttribute('content', content);
  }

  private _upsertCanonicalLink(href: string): void {
    const safeHref = sanitizeUrl(href);
    if (!safeHref) {
      return;
    }

    let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', 'canonical');
      document.head.appendChild(element);
    }

    element.setAttribute('href', safeHref);
  }

  
  private _getCurrentPageUrl(): string {
    const webAbsoluteUrl = this.context.pageContext.web.absoluteUrl;
    const serverRequestPath = this.context.pageContext.site.serverRequestPath;

    if (!serverRequestPath) {
      return webAbsoluteUrl;
    }

    try {
      return `${new URL(webAbsoluteUrl).origin}${serverRequestPath}`;
    } catch {
      return webAbsoluteUrl;
    }
  }

  private _getResolvedProperties(): IResolvedHeaderProperties {
    const webUrl: string = this.context.pageContext.web.absoluteUrl?.replace(/\/+$/, '') ?? '';
    const props = this.properties || {};

    return {
      homeUrl: props.homeUrl || webUrl || '/',
      logoUrl: props.logoUrl,
      logoAltText: props.logoAltText || 'Contoso',
      telemetryEndpointUrl: props.telemetryEndpointUrl,
      telemetryEndpointAllowlist: props.telemetryEndpointAllowlist,
      navigationProviderName: props.navigationProviderName,
      termSetId: props.termSetId,
      navigationSource: props.navigationSource === 'jsonFile' ? 'jsonFile' : 'taxonomy',
      navigationFileName: props.navigationFileName || 'navigation.json',
      navigationFileFolder: props.navigationFileFolder || 'SiteAssets',
      features: normalizeFeatureOverrides(props.features as unknown as Record<string, unknown> | string | undefined),
      colors: normalizeColorOverrides(props.colors as unknown as Record<string, unknown> | string | undefined),
      fontSizes: normalizeFontOverrides(props.fontSizes as unknown as Record<string, unknown> | string | undefined)
    };
  }

  private _createNavigationProvider(resolved: IResolvedHeaderProperties): INavigationProvider {
    if (resolved.navigationSource === 'jsonFile') {
      return new JsonFileNavigationService(
        this.context,
        resolved.homeUrl,
        resolved.navigationFileName,
        resolved.navigationFileFolder
      );
    }

    return new TermStoreNavigationService(
      this.context,
      resolved.navigationProviderName,
      resolved.termSetId
    );
  }

  private async _loadRuntimeSettings(): Promise<void> {
    if (!this._settingsService || this._disposed) {
      return;
    }

    try {
      const settings = await this._settingsService.getSettings();
      if (this._disposed) {
        return;
      }
      this._runtimeSettings = settings;
      this._resolvedProperties = this._resolvePropertiesWithSettings(this._getResolvedProperties(), settings);

      const newSource = this._resolvedProperties.navigationSource;
      const currentSource = this._navigationService?.providerName === 'jsonFile' ? 'jsonFile' : 'taxonomy';
      if (newSource !== currentSource) {
        this._navigationService = this._createNavigationProvider(this._resolvedProperties);
        this._navigationService.clearCache();
        void this._navigationService.getNavigation().catch((): void => undefined);
      }

      this._renderPlaceholders();
      this._debugLifecycle('runtimeSettingsLoaded', {
        navigationSource: newSource,
        hasColors: Object.keys(settings.colors).length > 0,
        hasFontSizes: Object.keys(settings.fontSizes).length > 0
      });
    } catch (error: unknown) {

      reportError(error, { action: 'runtime-settings-load-failed', level: 'service', severity: 'warning' });
    }
  }

  private _resolvePropertiesWithSettings(
    deploy: IResolvedHeaderProperties,
    settings: ISettingsFile
  ): IResolvedHeaderProperties {
    const g = settings.general ?? {};
    return {
      ...deploy,
      homeUrl: g.homeUrl || deploy.homeUrl,
      logoUrl: g.logoUrl ?? deploy.logoUrl,
      logoAltText: g.logoAltText || deploy.logoAltText,
      navigationSource: g.navigationSource ?? deploy.navigationSource,
      navigationFileName: g.navigationFileName || deploy.navigationFileName,
      navigationFileFolder: g.navigationFileFolder || deploy.navigationFileFolder,
      navigationProviderName: g.navigationProviderName ?? deploy.navigationProviderName,
      termSetId: g.termSetId ?? deploy.termSetId,
      features: { ...deploy.features, ...(settings.features ?? {}) },
      colors: { ...deploy.colors, ...(settings.colors ?? {}) },
      fontSizes: { ...deploy.fontSizes, ...(settings.fontSizes ?? {}) }
    };
  }

  private _getResolvedChromeLocale(): IResolvedChromeLocale {
    const requestedLocaleName: string = this.context.pageContext.cultureInfo.currentUICultureName
      || document.documentElement.lang
      || navigator.language
      || 'en-us';
    const normalizedLocaleName: string = requestedLocaleName.replace('_', '-').toLowerCase();
    const languageCode: string = normalizedLocaleName.split('-')[0];
    const languageMetadata = HEADER_CHROME_LANGUAGE_METADATA[languageCode] ?? HEADER_CHROME_LANGUAGE_METADATA.en;
    const isFallback = !HEADER_CHROME_LANGUAGE_METADATA[languageCode];

    if (isFallback) {
      emitNavigationDiagnostic({
        action: 'locale-fallback',
        level: 'service',
        reason: requestedLocaleName,
        metadata: {
          fallbackLanguage: languageCode
        }
      });
    }

    return {
      chromeLanguageLabel: languageMetadata.label,
      chromeLanguageShortLabel: languageMetadata.shortLabel,
      isChromeLanguageFallback: isFallback
    };
  }

  private readonly _onThemeChanged = (args: ThemeChangedEventArgs): void => {
    this._themeVariant = args.theme;
    this._debugLifecycle('themeChanged', {
      hasTheme: !!args.theme
    });

    if (!this._resolvedProperties) {
      this._debugLifecycle('themeChangedSkippedRender', {
        hasResolvedProperties: !!this._resolvedProperties
      });
      return;
    }

    this._renderPlaceholders();
  };

  private readonly _onNavigated = (): void => {

    if (this._themeProvider) {
      const refreshedTheme = this._themeProvider.tryGetTheme();
      if (refreshedTheme) {
        const themeChanged = this._themeVariant !== refreshedTheme;
        this._themeVariant = refreshedTheme;
        if (themeChanged) {
          this._debugLifecycle('onNavigatedThemeRefreshed', {
            isInverted: !!refreshedTheme.isInverted
          });
        }
      }
    }

    this._debugLifecycle('onNavigated', {
      currentPageUrl: this.context.pageContext.site.serverRequestPath ?? this.context.pageContext.web.absoluteUrl
    });
    this._renderPlaceholders();
  };

  private _scheduleRenderRetry(): void {
    if (
      typeof window === 'undefined'
      || this._hostElement
      || this._renderRetryFrame !== undefined
      || this._renderRetryAttempts >= MAX_INITIAL_RENDER_ATTEMPTS
    ) {
      if (this._renderRetryAttempts >= MAX_INITIAL_RENDER_ATTEMPTS) {
        emitNavigationDiagnostic({
          action: 'placeholder-retry-exhausted',
          level: 'service',
          reason: `Top placeholder unavailable after ${MAX_INITIAL_RENDER_ATTEMPTS} attempts`
        });
      }

      return;
    }

    this._renderRetryAttempts += 1;
    this._debugLifecycle('queueRenderRetry', {
      attempt: this._renderRetryAttempts
    });

    this._renderRetryFrame = window.requestAnimationFrame(() => {
      this._renderRetryFrame = undefined;
      this._renderPlaceholders();
    });
  }

  
  private _startSuiteBarWatch(): void {
    if (this._suiteBarWatchActive) {
      return;
    }

    this._suiteBarWatchActive = true;
    this._suiteBarWatchAttempts = 0;

    if (this._probeAndReRender()) {
      this._stopSuiteBarWatch();
      return;
    }

    if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') {
      return;
    }

    try {
      let isProbeScheduled = false;
      this._suiteBarObserver = new MutationObserver((): void => {
        if (isProbeScheduled) {
          return;
        }
        isProbeScheduled = true;
        window.requestAnimationFrame(() => {
          isProbeScheduled = false;
          if (this._probeAndReRender()) {
            this._stopSuiteBarWatch();
          }
        });
      });

      const knownTarget = document.getElementById('spTopPlaceholder')
        ?? document.getElementById('spPageHeader')
        ?? document.getElementById('SuiteNav');

      if (knownTarget) {
        this._suiteBarObserver.observe(knownTarget, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class', 'style']
        });
      } else {

        this._suiteBarObserver.observe(document.body, {
          childList: true,
          subtree: false
        });
      }
    } catch { void 0; }

    this._suiteBarWatchFrame = window.setTimeout((): void => {
      this._suiteBarWatchFrame = undefined;
      if (this._probeAndReRender()) {
        this._stopSuiteBarWatch();
      } else {

        this._suiteBarWatchFrame = window.setTimeout((): void => {
          this._suiteBarWatchFrame = undefined;
          if (this._probeAndReRender()) {
            this._stopSuiteBarWatch();
          } else {
            this._stopSuiteBarWatch();
          }
        }, 1500);
      }
    }, 300) as unknown as number;
  }

  private _probeAndReRender(): boolean {
    if (this._disposed) {
      return true;
    }

    const color = tryReadSuiteBarBackground();
    if (!color) {
      return false;
    }

    this._debugLifecycle('suiteBarDetected', {
      color
    });

    this._renderPlaceholders();
    return true;
  }

  private _stopSuiteBarWatch(): void {
    this._suiteBarWatchActive = false;

    if (this._suiteBarObserver) {
      this._suiteBarObserver.disconnect();
      this._suiteBarObserver = undefined;
    }

    if (this._suiteBarWatchFrame !== undefined) {
      window.clearTimeout(this._suiteBarWatchFrame);
      this._suiteBarWatchFrame = undefined;
    }
  }

  private _debugLifecycle(action: string, metadata?: Record<string, boolean | number | string | undefined>): void {
    if (typeof window === 'undefined') {
      return;
    }

    const search = window.location.search;
    const isDebugSession = window.location.hostname === 'localhost'
      || search.indexOf('debugManifestsFile=') >= 0
      || search.indexOf('loadSPFX=true') >= 0;

    if (!isDebugSession) {
      return;
    }

    const detail: IHeaderLifecycleDebugDetail = { action, metadata };

    if (typeof CustomEvent !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent<IHeaderLifecycleDebugDetail>('header:lifecycle', { detail }));
    }

    // eslint-disable-next-line no-console
    console.warn('[header:lifecycle]', action, metadata ?? {});
  }
}
