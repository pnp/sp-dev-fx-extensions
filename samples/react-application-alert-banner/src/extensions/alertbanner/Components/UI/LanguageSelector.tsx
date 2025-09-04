import * as React from 'react';
import { logger } from '../Services/LoggerService';
import {
  Dropdown,
  Option,
  Button,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem
} from '@fluentui/react-components';
import { LocalLanguage24Regular } from '@fluentui/react-icons';
import { useLocalization } from '../Hooks/useLocalization';
import styles from './LanguageSelector.module.scss';

export interface ILanguageSelectorProps {
  /** Whether to show the language selector in compact mode (just icon) */
  compact?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Callback when language changes */
  onLanguageChange?: (languageCode: string) => void;
}

const LanguageSelector: React.FC<ILanguageSelectorProps> = ({
  compact = false,
  className,
  onLanguageChange
}) => {
  const { 
    currentLanguage, 
    supportedLanguages, 
    setLanguage, 
    getString 
  } = useLocalization();

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await setLanguage(languageCode);
      onLanguageChange?.(languageCode);
    } catch (error) {
      logger.error('LanguageSelector', 'Failed to change language', error);
    }
  };

  if (compact) {
    return (
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <Button
            appearance="subtle"
            icon={<LocalLanguage24Regular />}
            aria-label={getString('ChangeLanguage')}
            title={getString('ChangeLanguage')}
            className={className}
            size="small"
          />
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            {supportedLanguages.map((language) => (
              <MenuItem
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                disabled={language.code === currentLanguage.code}
              >
                <div className={styles.languageOption}>
                  <span className={styles.languageName}>{language.nativeName}</span>
                  <span className={styles.languageCode}>({language.name})</span>
                </div>
              </MenuItem>
            ))}
          </MenuList>
        </MenuPopover>
      </Menu>
    );
  }

  return (
    <div className={`${styles.languageSelector} ${className || ''}`}>
      <Dropdown
        aria-label={getString('SelectLanguage')}
        placeholder={getString('SelectLanguage')}
        value={currentLanguage.nativeName}
        onOptionSelect={(_, data) => {
          if (data.optionValue && data.optionValue !== currentLanguage.code) {
            handleLanguageChange(data.optionValue);
          }
        }}
      >
        {supportedLanguages.map((language) => (
          <Option
            key={language.code}
            value={language.code}
            text={language.nativeName}
          >
            <div className={styles.languageOption}>
              <span className={styles.languageName}>{language.nativeName}</span>
              <span className={styles.languageCode}>({language.name})</span>
            </div>
          </Option>
        ))}
      </Dropdown>
    </div>
  );
};

export default LanguageSelector;