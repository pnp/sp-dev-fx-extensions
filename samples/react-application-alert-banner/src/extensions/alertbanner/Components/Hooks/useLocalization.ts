import * as React from 'react';
import { LocalizationService, ILanguageInfo } from '../Services/LocalizationService';

export interface ILocalizationContext {
  getString: (key: string, ...args: any[]) => string;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatRelativeTime: (date: Date | string) => string;
  currentLanguage: ILanguageInfo;
  supportedLanguages: ILanguageInfo[];
  setLanguage: (languageCode: string) => Promise<void>;
  isRTL: boolean;
}

/**
 * React hook for localization functionality
 */
export const useLocalization = (): ILocalizationContext => {
  const locService = React.useMemo(() => LocalizationService.getInstance(), []);
  
  const [currentLanguage, setCurrentLanguage] = React.useState<ILanguageInfo>(() => 
    locService.getCurrentLanguage()
  );
  
  const [isRTL, setIsRTL] = React.useState<boolean>(() => 
    locService.isRTL()
  );

  const getString = React.useCallback((key: string, ...args: any[]): string => {
    return locService.getString(key, ...args);
  }, [locService]);

  const formatDate = React.useCallback((date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    return locService.formatDate(date, options);
  }, [locService]);

  const formatTime = React.useCallback((date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    return locService.formatTime(date, options);
  }, [locService]);

  const formatRelativeTime = React.useCallback((date: Date | string): string => {
    return locService.formatRelativeTime(date);
  }, [locService]);

  const setLanguage = React.useCallback(async (languageCode: string): Promise<void> => {
    await locService.setLanguage(languageCode);
    setCurrentLanguage(locService.getCurrentLanguage());
    setIsRTL(locService.isRTL());
  }, [locService]);

  const supportedLanguages = React.useMemo(() => 
    locService.getSupportedLanguages(), [locService]
  );

  return {
    getString,
    formatDate,
    formatTime,
    formatRelativeTime,
    currentLanguage,
    supportedLanguages,
    setLanguage,
    isRTL
  };
};

/**
 * Localization context for providing localization throughout the component tree
 */
export const LocalizationContext = React.createContext<ILocalizationContext | null>(null);

/**
 * Provider component for localization context
 */
export interface ILocalizationProviderProps {
  children: React.ReactNode;
  localizationService?: LocalizationService;
}

export const LocalizationProvider: React.FC<ILocalizationProviderProps> = ({ 
  children, 
  localizationService 
}) => {
  const localization = useLocalization();

  return React.createElement(
    LocalizationContext.Provider,
    { value: localization },
    children
  );
};

/**
 * Hook to use localization context
 */
export const useLocalizationContext = (): ILocalizationContext => {
  const context = React.useContext(LocalizationContext);
  
  if (!context) {
    // Fallback to direct hook if not within provider
    return useLocalization();
  }
  
  return context;
};