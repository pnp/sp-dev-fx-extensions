import type { IHeaderFeatures } from './IHeaderFeatures';
import type { IHeaderColorOverrides, IHeaderFontOverrides } from '../utils/theme';
import type { INavigationItem } from './INavigationItem';

export interface ISettingsFile {
  version: number;
  updatedBy?: string;
  updatedAt?: string;
  general: IGeneralSettings;
  features: IHeaderFeatures;
  colors: IHeaderColorOverrides;
  fontSizes: IHeaderFontOverrides;
  
  navigation?: INavigationItem[];
}

export interface IGeneralSettings {
  homeUrl?: string;
  logoUrl?: string;
  logoAltText?: string;
  navigationSource?: 'taxonomy' | 'jsonFile';
  navigationFileName?: string;
  navigationFileFolder?: string;
  navigationProviderName?: string;
  termSetId?: string;
  footerHtml?: string;
  footerHeight?: number;
}

export function mergeSettings(base: ISettingsFile, override: Partial<ISettingsFile>): ISettingsFile {
  return {
    version: override.version ?? base.version,
    updatedBy: override.updatedBy ?? base.updatedBy,
    updatedAt: override.updatedAt ?? base.updatedAt,
    general: { ...base.general, ...(override.general ?? {}) },
    features: { ...base.features, ...(override.features ?? {}) },
    colors: { ...base.colors, ...(override.colors ?? {}) },
    fontSizes: { ...base.fontSizes, ...(override.fontSizes ?? {}) },
    navigation: override.navigation !== undefined ? override.navigation : base.navigation
  };
}

export const DEFAULT_SETTINGS: ISettingsFile = {
  version: 1,
  general: {
    logoAltText: 'Logo',
    navigationSource: 'taxonomy',
    navigationFileName: 'navigation.json',
    navigationFileFolder: 'SiteAssets',
    navigationProviderName: 'GlobalNavSiteMapProvider'
  },
  features: {},
  colors: {},
  fontSizes: {}
};