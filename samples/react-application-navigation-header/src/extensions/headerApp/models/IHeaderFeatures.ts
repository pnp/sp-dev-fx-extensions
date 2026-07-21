export interface IHeaderFeatureFlags {
  searchEnabled?: boolean;
  searchSuggestionsEnabled?: boolean;
  userProfileEnabled?: boolean;
  notificationsEnabled?: boolean;
  appLauncherEnabled?: boolean;
  quickActionsEnabled?: boolean;
  languageSwitcherEnabled?: boolean;
  bookmarksEnabled?: boolean;
  adminSettingsEnabled?: boolean;
  helpEnabled?: boolean;
  feedbackEnabled?: boolean;
  printShareEnabled?: boolean;
  backToTopEnabled?: boolean;
  accessibilityToolsEnabled?: boolean;
  breadcrumbsEnabled?: boolean;
  footerEnabled?: boolean;
  seoMetaEnabled?: boolean;
  analyticsEnabled?: boolean;
  
  megaMenuRailEnabled?: boolean;
  
  megaMenuOverviewEnabled?: boolean;
}

export interface IHeaderFeatures extends IHeaderFeatureFlags {
  searchScope?: string;
  searchPlaceholder?: string;
  
  searchResultsPageUrl?: string;
  quickActionsJson?: string;
  appLauncherJson?: string;
  adminUrl?: string;
  helpUrl?: string;
  feedbackUrl?: string;
  supportedLanguages?: string;
  defaultLanguage?: string;
  bookmarkListUrl?: string;
  notificationListUrl?: string;
  footerHtml?: string;
  footerHeight?: number;
}

export const DEFAULT_FEATURE_FLAGS: Required<IHeaderFeatureFlags> = {
  searchEnabled: true,
  searchSuggestionsEnabled: true,
  userProfileEnabled: true,
  notificationsEnabled: false,
  appLauncherEnabled: true,
  quickActionsEnabled: true,
  languageSwitcherEnabled: true,
  bookmarksEnabled: false,
  adminSettingsEnabled: false,
  helpEnabled: true,
  feedbackEnabled: false,
  printShareEnabled: false,
  backToTopEnabled: true,
  accessibilityToolsEnabled: true,
  breadcrumbsEnabled: false,
  footerEnabled: false,
  seoMetaEnabled: true,
  analyticsEnabled: true,
  megaMenuRailEnabled: true,
  megaMenuOverviewEnabled: true
};

const FEATURE_FLAG_KEYS: Array<keyof IHeaderFeatureFlags> = [
  'searchEnabled',
  'searchSuggestionsEnabled',
  'userProfileEnabled',
  'notificationsEnabled',
  'appLauncherEnabled',
  'quickActionsEnabled',
  'languageSwitcherEnabled',
  'bookmarksEnabled',
  'adminSettingsEnabled',
  'helpEnabled',
  'feedbackEnabled',
  'printShareEnabled',
  'backToTopEnabled',
  'accessibilityToolsEnabled',
  'breadcrumbsEnabled',
  'footerEnabled',
  'seoMetaEnabled',
  'analyticsEnabled',
  'megaMenuRailEnabled',
  'megaMenuOverviewEnabled'
];

const FEATURE_STRING_KEYS: Array<keyof IHeaderFeatures> = [
  'searchScope',
  'searchPlaceholder',
  'searchResultsPageUrl',
  'quickActionsJson',
  'appLauncherJson',
  'adminUrl',
  'helpUrl',
  'feedbackUrl',
  'supportedLanguages',
  'defaultLanguage',
  'bookmarkListUrl',
  'notificationListUrl',
  'footerHtml'
];

export function resolveFeatureFlags(
  termSetFeatures: IHeaderFeatures | undefined,
  componentFeatures: IHeaderFeatures | undefined
): IHeaderFeatures {
  return {
    ...DEFAULT_FEATURE_FLAGS,
    ...termSetFeatures,
    ...componentFeatures
  };
}

export function parseFeatureFlagsFromProperties(properties: Record<string, string>): IHeaderFeatures {
  const flags: IHeaderFeatures = {};

  for (const key of FEATURE_FLAG_KEYS) {
    const value = properties[key];

    if (value !== undefined) {
      flags[key] = parseBooleanFeature(value);
    }
  }

  flags.searchScope = properties.searchScope || undefined;
  flags.searchPlaceholder = properties.searchPlaceholder || undefined;
  flags.searchResultsPageUrl = properties.searchResultsPageUrl || properties.SearchResultsPageUrl || undefined;
  flags.quickActionsJson = properties.quickActionsJson || properties.QuickActions || undefined;
  flags.appLauncherJson = properties.appLauncherJson || properties.AppLauncher || undefined;
  flags.adminUrl = properties.adminUrl || properties.AdminUrl || undefined;
  flags.helpUrl = properties.helpUrl || properties.HelpUrl || undefined;
  flags.feedbackUrl = properties.feedbackUrl || properties.FeedbackUrl || undefined;
  flags.supportedLanguages = properties.supportedLanguages || properties.SupportedLanguages || undefined;
  flags.defaultLanguage = properties.defaultLanguage || properties.DefaultLanguage || undefined;
  flags.bookmarkListUrl = properties.bookmarkListUrl || properties.BookmarkListUrl || undefined;
  flags.notificationListUrl = properties.notificationListUrl || properties.NotificationListUrl || undefined;
  flags.footerHtml = properties.footerHtml || properties.FooterHtml || undefined;
  flags.footerHeight = parseInt(properties.footerHeight || '', 10) || undefined;

  return flags;
}

export function normalizeFeatureOverrides(raw: Record<string, unknown> | string | undefined): IHeaderFeatures {
  let parsedRaw: Record<string, unknown> | undefined;

  if (typeof raw === 'string') {
    try {
      parsedRaw = JSON.parse(raw);
    } catch {
      return {};
    }
  } else if (raw && typeof raw === 'object') {
    parsedRaw = raw;
  }

  if (!parsedRaw) {
    return {};
  }

  const flags: Record<string, unknown> = {};

  for (const key of FEATURE_FLAG_KEYS) {
    const value = parsedRaw[key];
    if (value !== undefined && value !== null) {
      flags[key] = typeof value === 'boolean' ? value : parseBooleanFeature(String(value));
    }
  }

  for (const key of FEATURE_STRING_KEYS) {
    const value = parsedRaw[key];
    if (value !== undefined && value !== null && value !== '') {
      flags[key] = String(value);
    }
  }

  const footerHeight = parsedRaw.footerHeight;
  if (footerHeight !== undefined && footerHeight !== null) {
    const parsed = typeof footerHeight === 'number' ? footerHeight : parseInt(String(footerHeight), 10);
    if (!Number.isNaN(parsed)) {
      flags.footerHeight = parsed;
    }
  }

  return flags as IHeaderFeatures;
}

function parseBooleanFeature(value: string): boolean {
  const normalized = value.toLowerCase().trim();
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on';
}