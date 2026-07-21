import * as React from 'react';
import { Button, Popover, PopoverTrigger, PopoverSurface } from '@fluentui/react-components';
import { Globe24Regular } from '@fluentui/react-icons';
import type { IHeaderStrings } from '../models/IHeaderStrings';
import type { ILanguageOption } from '../models/IHeaderServices';
import { emitNavigationTelemetry } from '../utils/navigationTelemetry';
import styles from './HeaderTools.module.scss';

export interface ILanguageSwitcherToolProps {
  strings: IHeaderStrings;
  languages: ILanguageOption[];
  currentLanguage: string;
  onChangeLanguage: (languageCode: string) => void;
  
  inline?: boolean;
}

const LanguageSwitcherTool: React.FC<ILanguageSwitcherToolProps> = (props) => {
  const { strings, languages, currentLanguage, onChangeLanguage, inline } = props;
  const [open, setOpen] = React.useState(false);

  const current = languages.find((lang) => lang.code === currentLanguage) || languages[0];

  const handleSelect = React.useCallback(
    (code: string): void => {
      onChangeLanguage(code);
      setOpen(false);
      emitNavigationTelemetry({
        action: 'language-change',
        level: 'service',
        metadata: { selectedLanguage: code }
      });
    },
    [onChangeLanguage]
  );

  if (languages.length <= 1) {
    return null;
  }

  return (
    <div className={styles.headerTool}>
      <Popover open={open} onOpenChange={(e, data) => setOpen(data.open)} inline={inline}>
        <PopoverTrigger>
          <Button
            className={styles.headerToolButton}
            icon={<Globe24Regular />}
            appearance="subtle"
            title={`${strings.LanguageSwitcherAriaLabel || 'Change language'} (${current?.shortLabel || currentLanguage})`}
          >
            <span className={styles.languageShortLabel}>{current?.shortLabel || currentLanguage}</span>
          </Button>
        </PopoverTrigger>
        <PopoverSurface className={styles.languageCallout}>
          <div className={styles.languageContent}>
            <h3 className={styles.calloutTitle}>{strings.LanguageSwitcherAriaLabel || 'Language'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {languages.map((language) => (
                <button
                  key={language.code}
                  aria-current={language.code === currentLanguage ? 'true' : undefined}
                  className={styles.languageOption}
                  onClick={(): void => handleSelect(language.code)}
                  type="button"
                >
                  <span className={styles.languageOptionLabel}>{language.label}</span>
                  <span className={styles.languageOptionCode}>{language.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>
        </PopoverSurface>
      </Popover>
    </div>
  );
};

export default React.memo(LanguageSwitcherTool);
