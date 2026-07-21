import * as React from 'react';
import type { IHeaderStrings } from '../models/IHeaderStrings';
import type { IHeaderFeatures } from '../models/IHeaderFeatures';
import type { ILanguageOption } from '../models/IHeaderServices';
import HelpTool from '../components/HelpTool';
import LanguageSwitcherTool from '../components/LanguageSwitcherTool';
import AccessibilityTool from '../components/AccessibilityTool';
import PrintShareTool from '../components/PrintShareTool';
import FeedbackTool from '../components/FeedbackTool';
import type { IMoreToolsMenuItem } from '../components/MoreToolsMenu';

export interface IUseMoreToolsItemsParams {
  strings: IHeaderStrings;
  features: IHeaderFeatures;
  languageOptions: ILanguageOption[];
  currentLanguage: string;
  onChangeLanguage: (languageCode: string) => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  fontScale: number;
  onChangeFontScale: (value: number) => void;
}

export function useMoreToolsItems(params: IUseMoreToolsItemsParams): IMoreToolsMenuItem[] {
  const {
    strings,
    features,
    languageOptions,
    currentLanguage,
    onChangeLanguage,
    isHighContrast,
    onToggleHighContrast,
    fontScale,
    onChangeFontScale
  } = params;

  return React.useMemo((): IMoreToolsMenuItem[] => {
    const menuItems: IMoreToolsMenuItem[] = [];

    if (features.helpEnabled && features.helpUrl) {
      menuItems.push({
        key: 'help',
        label: strings.HelpAriaLabel || 'Help',
        node: <HelpTool strings={strings} helpUrl={features.helpUrl} />
      });
    }

    if (features.languageSwitcherEnabled && languageOptions.length > 1) {
      menuItems.push({
        key: 'language',
        label: strings.LanguageSwitcherAriaLabel || 'Language',
        node: (
          <LanguageSwitcherTool
            strings={strings}
            languages={languageOptions}
            currentLanguage={currentLanguage}
            onChangeLanguage={onChangeLanguage}
            inline
          />
        )
      });
    }

    if (features.accessibilityToolsEnabled) {
      menuItems.push({
        key: 'accessibility',
        label: strings.AccessibilityToolsAriaLabel || 'Accessibility',
        node: (
          <AccessibilityTool
            strings={strings}
            isHighContrast={isHighContrast}
            onToggleHighContrast={onToggleHighContrast}
            fontScale={fontScale}
            onChangeFontScale={onChangeFontScale}
            inline
          />
        )
      });
    }

    if (features.printShareEnabled) {
      menuItems.push({
        key: 'print-share',
        label: strings.PrintAriaLabel || 'Print / Share',
        node: <PrintShareTool strings={strings} inline />
      });
    }

    if (features.feedbackEnabled && features.feedbackUrl) {
      menuItems.push({
        key: 'feedback',
        label: strings.FeedbackAriaLabel || 'Feedback',
        node: <FeedbackTool strings={strings} feedbackUrl={features.feedbackUrl} />
      });
    }

    return menuItems;
  }, [
    strings,
    features.helpEnabled,
    features.helpUrl,
    features.languageSwitcherEnabled,
    languageOptions,
    currentLanguage,
    onChangeLanguage,
    features.accessibilityToolsEnabled,
    isHighContrast,
    onToggleHighContrast,
    fontScale,
    onChangeFontScale,
    features.printShareEnabled,
    features.feedbackEnabled,
    features.feedbackUrl
  ]);
}
