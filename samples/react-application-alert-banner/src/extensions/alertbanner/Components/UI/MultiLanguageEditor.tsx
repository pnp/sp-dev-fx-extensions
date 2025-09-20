import * as React from 'react';
import {
  Field,
  Input,
  Textarea,
  Button,
  Card,
  CardHeader,
  CardPreview,
  Text,
  Spinner,
  MessageBar,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dropdown,
  Option,
  Switch,
  tokens
} from '@fluentui/react-components';
import { Add24Regular, Delete24Regular, Globe24Regular, Translate24Regular } from '@fluentui/react-icons';
import { useLocalization } from '../Hooks/useLocalization';
import { LanguageManagementService, ICustomLanguage } from '../Services/LanguageManagementService';
import { ILanguageInfo } from '../Services/LocalizationService';
import { IAlertListItem } from '../Services/SharePointAlertService';
import styles from './MultiLanguageEditor.module.scss';

export interface IMultiLanguageEditorProps {
  alertItem?: IAlertListItem;
  onContentChange?: (content: { [languageCode: string]: { [fieldName: string]: string } }) => void;
  languageManager: LanguageManagementService;
  className?: string;
}

interface ILanguageContent {
  [fieldName: string]: string;
}

const MultiLanguageEditor: React.FC<IMultiLanguageEditorProps> = ({
  alertItem,
  onContentChange,
  languageManager,
  className
}) => {
  const { getString, currentLanguage } = useLocalization();
  const [availableLanguages, setAvailableLanguages] = React.useState<ICustomLanguage[]>([]);
  const [activeLanguage, setActiveLanguage] = React.useState<string>(currentLanguage.code);
  const [content, setContent] = React.useState<{ [languageCode: string]: ILanguageContent }>({});
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [showAddLanguageDialog, setShowAddLanguageDialog] = React.useState(false);
  const [newLanguageInfo, setNewLanguageInfo] = React.useState<ILanguageInfo>({
    code: '',
    name: '',
    nativeName: '',
    isRTL: false
  });

  // Content fields that support multi-language
  const contentFields = languageManager.getContentFields();

  React.useEffect(() => {
    loadLanguages();
  }, []);

  React.useEffect(() => {
    if (alertItem) {
      loadExistingContent();
    }
  }, [alertItem, availableLanguages]);

  React.useEffect(() => {
    if (onContentChange) {
      onContentChange(content);
    }
  }, [content, onContentChange]);

  const loadLanguages = async () => {
    try {
      setLoading(true);
      const languages = await languageManager.getAllAvailableLanguages();
      setAvailableLanguages(languages);
    } catch (error) {
      setMessage({
        type: 'error',
        text: getString('FailedToLoadLanguages') || 'Failed to load available languages'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExistingContent = () => {
    if (!alertItem || !availableLanguages.length) return;

    const existingContent: { [languageCode: string]: ILanguageContent } = {};

    availableLanguages.forEach(language => {
      const langContent: ILanguageContent = {};

      contentFields.forEach(field => {
        const fieldName = languageManager.createLanguageFieldName(field.fieldName, language.code);
        const value = alertItem[fieldName] || '';
        if (value) {
          langContent[field.fieldName] = value;
        }
      });

      if (Object.keys(langContent).length > 0) {
        existingContent[language.code] = langContent;
      }
    });

    setContent(existingContent);
  };

  const handleContentChange = (languageCode: string, fieldName: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [languageCode]: {
        ...prev[languageCode],
        [fieldName]: value
      }
    }));
  };

  const handleAddCustomLanguage = async () => {
    try {
      await languageManager.addCustomLanguage(newLanguageInfo);
      await loadLanguages();
      setShowAddLanguageDialog(false);
      setNewLanguageInfo({ code: '', name: '', nativeName: '', isRTL: false });
      setMessage({
        type: 'success',
        text: getString('LanguageAddedSuccessfully') || 'Language added successfully'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || getString('FailedToAddLanguage') || 'Failed to add language'
      });
    }
  };

  const handleRemoveLanguage = async (languageCode: string) => {
    try {
      await languageManager.removeCustomLanguage(languageCode);
      await loadLanguages();

      // Remove content for this language
      setContent(prev => {
        const updated = { ...prev };
        delete updated[languageCode];
        return updated;
      });

      setMessage({
        type: 'success',
        text: getString('LanguageRemovedSuccessfully') || 'Language removed successfully'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || getString('FailedToRemoveLanguage') || 'Failed to remove language'
      });
    }
  };

  const getSuggestedLanguages = (): ILanguageInfo[] => {
    const suggested = languageManager.getSuggestedLanguages();
    return suggested.filter(lang =>
      !availableLanguages.find(available => available.code === lang.code)
    );
  };

  const getActiveLanguageInfo = (): ICustomLanguage | undefined => {
    return availableLanguages.find(lang => lang.code === activeLanguage);
  };

  const hasContentForLanguage = (languageCode: string): boolean => {
    const langContent = content[languageCode];
    return langContent && Object.values(langContent).some(value => value.trim() !== '');
  };

  if (loading) {
    return (
      <div className={`${styles.multiLanguageEditor} ${className}`}>
        <Spinner label={getString('LoadingLanguages') || 'Loading languages...'} />
      </div>
    );
  }

  return (
    <div className={`${styles.multiLanguageEditor} ${className}`}>
      {message && (
        <MessageBar intent={message.type}>
          {message.text}
        </MessageBar>
      )}

      <Card>
        <CardHeader
          image={<Globe24Regular />}
          header={
            <Text weight="semibold">
              {getString('MultiLanguageContent') || 'Multi-Language Content'}
            </Text>
          }
          description={
            <Text size={200}>
              {getString('MultiLanguageContentDescription') || 'Create content in multiple languages for broader accessibility'}
            </Text>
          }
        />
      </Card>

      {/* Language Tabs */}
      <div className={styles.languageTabs}>
        {availableLanguages.filter(lang => lang.hasContentColumns).map(language => (
          <Button
            key={language.code}
            appearance={activeLanguage === language.code ? 'primary' : 'secondary'}
            onClick={() => setActiveLanguage(language.code)}
            className={styles.languageTab}
            icon={hasContentForLanguage(language.code) ? <Translate24Regular /> : undefined}
          >
            <span className={styles.languageName}>{language.nativeName}</span>
            <span className={styles.languageCode}>({language.code})</span>
            {language.isCustom && <span className={styles.customLabel}>Custom</span>}
          </Button>
        ))}

        <Dialog open={showAddLanguageDialog} onOpenChange={(_, data) => setShowAddLanguageDialog(data.open)}>
          <DialogTrigger disableButtonEnhancement>
            <Button
              appearance="outline"
              icon={<Add24Regular />}
              className={styles.addLanguageButton}
            >
              {getString('AddLanguage') || 'Add Language'}
            </Button>
          </DialogTrigger>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>
                {getString('AddCustomLanguage') || 'Add Custom Language'}
              </DialogTitle>
              <DialogContent>
                <div className={styles.addLanguageForm}>
                  <Field label={getString('LanguageCode') || 'Language Code'} required>
                    <Input
                      value={newLanguageInfo.code}
                      onChange={(_, data) => setNewLanguageInfo(prev => ({ ...prev, code: data.value }))}
                      placeholder="e.g., it-it"
                    />
                  </Field>

                  <Field label={getString('LanguageName') || 'Language Name'} required>
                    <Input
                      value={newLanguageInfo.name}
                      onChange={(_, data) => setNewLanguageInfo(prev => ({ ...prev, name: data.value }))}
                      placeholder="e.g., Italian"
                    />
                  </Field>

                  <Field label={getString('NativeLanguageName') || 'Native Language Name'} required>
                    <Input
                      value={newLanguageInfo.nativeName}
                      onChange={(_, data) => setNewLanguageInfo(prev => ({ ...prev, nativeName: data.value }))}
                      placeholder="e.g., Italiano"
                    />
                  </Field>

                  <Field label={getString('QuickAdd') || 'Quick Add'}>
                    <Dropdown
                      placeholder={getString('SelectSuggestedLanguage') || 'Select from suggested languages'}
                      onOptionSelect={(_, data) => {
                        const suggested = getSuggestedLanguages();
                        const selectedLang = suggested.find(lang => lang.code === data.optionValue);
                        if (selectedLang) {
                          setNewLanguageInfo(selectedLang);
                        }
                      }}
                    >
                      {getSuggestedLanguages().map(lang => (
                        <Option key={lang.code} value={lang.code} text={`${lang.nativeName} (${lang.name})`}>
                          {lang.nativeName} ({lang.name})
                        </Option>
                      ))}
                    </Dropdown>
                  </Field>

                  <Field label={getString('RightToLeft') || 'Right-to-Left'}>
                    <Switch
                      checked={newLanguageInfo.isRTL}
                      onChange={(_, data) => setNewLanguageInfo(prev => ({ ...prev, isRTL: data.checked }))}
                      label={newLanguageInfo.isRTL ? getString('RTLEnabled') || 'RTL Enabled' : getString('RTLDisabled') || 'RTL Disabled'}
                    />
                  </Field>
                </div>
              </DialogContent>
              <DialogActions>
                <DialogTrigger disableButtonEnhancement>
                  <Button appearance="secondary">
                    {getString('Cancel') || 'Cancel'}
                  </Button>
                </DialogTrigger>
                <Button
                  appearance="primary"
                  onClick={handleAddCustomLanguage}
                  disabled={!newLanguageInfo.code || !newLanguageInfo.name || !newLanguageInfo.nativeName}
                >
                  {getString('AddLanguage') || 'Add Language'}
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </div>

      {/* Content Editor for Active Language */}
      {(() => {
        const activeLanguageInfo = getActiveLanguageInfo();
        if (!activeLanguageInfo) return null;

        return (
          <Card className={styles.contentEditor}>
            <CardHeader
              header={
                <div className={styles.contentEditorHeader}>
                  <Text weight="semibold">
                    {getString('EditingContent') || 'Editing Content'}: {activeLanguageInfo.nativeName}
                  </Text>
                  {activeLanguageInfo.isCustom && (
                    <Button
                      appearance="subtle"
                      icon={<Delete24Regular />}
                      onClick={() => handleRemoveLanguage(activeLanguage)}
                      size="small"
                    >
                      {getString('RemoveLanguage') || 'Remove Language'}
                    </Button>
                  )}
                </div>
              }
            />
            <CardPreview>
              <div className={styles.contentFields}>
                {contentFields.map(field => (
                  <Field
                    key={field.fieldName}
                    label={getString(field.displayName) || field.displayName}
                  >
                    {field.fieldName === 'Description' ? (
                      <Textarea
                        value={content[activeLanguage]?.[field.fieldName] || ''}
                        onChange={(_, data) => handleContentChange(activeLanguage, field.fieldName, data.value)}
                        rows={4}
                        resize="vertical"
                      />
                    ) : (
                      <Input
                        value={content[activeLanguage]?.[field.fieldName] || ''}
                        onChange={(_, data) => handleContentChange(activeLanguage, field.fieldName, data.value)}
                      />
                    )}
                  </Field>
                ))}
              </div>
            </CardPreview>
          </Card>
        );
      })()}

      {/* Language Summary */}
      <Card className={styles.languageSummary}>
        <CardHeader
          header={<Text weight="semibold">{getString('ContentSummary') || 'Content Summary'}</Text>}
        />
        <CardPreview>
          <div className={styles.summaryGrid}>
            {availableLanguages
              .filter(lang => lang.hasContentColumns)
              .map(language => (
              <div key={language.code} className={styles.summaryItem}>
                <div className={styles.summaryLanguage}>
                  <Text weight="semibold">{language.nativeName}</Text>
                  <Text size={200} className={styles.summaryCode}>({language.code})</Text>
                </div>
                <div className={styles.summaryStatus}>
                  {hasContentForLanguage(language.code) ? (
                    <Text style={{ color: tokens.colorPaletteGreenForeground1 }}>
                      ✓ {getString('HasContent') || 'Has Content'}
                    </Text>
                  ) : (
                    <Text style={{ color: tokens.colorNeutralForeground3 }}>
                      ○ {getString('NoContent') || 'No Content'}
                    </Text>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardPreview>
      </Card>
    </div>
  );
};

export default MultiLanguageEditor;