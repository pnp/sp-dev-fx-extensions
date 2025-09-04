import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Log } from '@microsoft/sp-core-library';
import {
  DefaultButton,
  PrimaryButton,
  DialogFooter,
  DialogContent,
  Stack,
  Text,
  getTheme,
  FontWeights,
  FontSizes,
  MessageBar,
  MessageBarType,
  Icon,
} from '@fluentui/react';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { PersonalLinksTab } from './tabs/PersonalLinksTab';
import { useSafeTimeout } from '../../hooks/useSafeTimeout';
import { IconGallery } from '../shared/IconGallery';
import styles from './LinkManagementDialog.module.scss'; // Re-using styles from LinkManagementDialog

const LOG_SOURCE: string = 'PersonalLinkManagementDialog';

// Proper interfaces to replace 'any' types
interface INewLinkFormData {
  title: string;
  url: string;
  description: string;
  iconName: string;
  iconUrl: string;
  category: string;
  targetUsers: string[];
  isMandatory: boolean;
  validFrom: string;
  validTo: string;
  id?: string;
}

interface ILinkOperationStatus {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  lastOperation: string | null;
}

interface IPersonalLinksState {
  searchQuery: string;
  selectedCategory: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

export interface IPersonalLinkManagementDialogProps {
  personalLinks: IContextualMenuItem[];
  onSave: (updatedLinks: IContextualMenuItem[]) => Promise<boolean>;
  onCancel: () => void;
}

interface IPersonalLinkManagementDialogContentProps extends IPersonalLinkManagementDialogProps {
  // Add any state or handlers needed for the content component
}

const PersonalLinkManagementDialogContent: React.FC<IPersonalLinkManagementDialogContentProps> = ({
  personalLinks,
  onSave,
  onCancel,
}) => {
  const [myLinks, setMyLinks] = React.useState<IContextualMenuItem[]>(personalLinks);
  const [showAddPersonalLinkForm, setShowAddPersonalLinkForm] = React.useState<boolean>(false);
  const [newLinkFormData, setNewLinkFormData] = React.useState<INewLinkFormData>({
    title: '',
    url: '',
    description: '',
    iconName: 'Link',
    iconUrl: '',
    category: 'General',
    targetUsers: [],
    isMandatory: false,
    validFrom: '',
    validTo: ''
  });
  const [linkOperationStatus, setLinkOperationStatus] = React.useState<ILinkOperationStatus>({
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    lastOperation: null
  });
  const [personalLinksState, setPersonalLinksState] = React.useState<IPersonalLinksState>({
    searchQuery: '',
    selectedCategory: 'all',
    sortBy: 'name',
    sortDirection: 'asc'
  });
  const [showIconGallery, setShowIconGallery] = React.useState<boolean>(false);
  const { setSafeTimeout } = useSafeTimeout();

  // Generate categories from existing links
  const availableCategories = React.useMemo(() => {
    const categories = new Set(['Personal', 'Work', 'Tools', 'Resources']);
    
    // Extract categories from existing links
    myLinks.forEach(link => {
      const linkCategory = (link.data as any)?.category;
      if (linkCategory && typeof linkCategory === 'string') {
        categories.add(linkCategory);
      }
    });
    
    return Array.from(categories).map(category => ({
      key: category.toLowerCase(),
      text: category
    }));
  }, [myLinks]);
  const theme = getTheme();

  const handleSave = React.useCallback(async () => {
    setLinkOperationStatus((prev: any) => ({ ...prev, isCreating: true, lastOperation: 'Saving personal links...' }));
    try {
      const success = await onSave(myLinks);
      if (success) {
        Log.info(LOG_SOURCE, 'Personal links saved successfully via dialog');
        setLinkOperationStatus((prev: any) => ({ ...prev, isCreating: false, lastOperation: 'Personal links saved!' }));
        setSafeTimeout(() => onCancel(), 1000); // Close dialog after a short delay
      } else {
        Log.error(LOG_SOURCE, new Error('Failed to save personal links via dialog'));
        setLinkOperationStatus((prev: any) => ({ ...prev, isCreating: false, lastOperation: 'Failed to save personal links!' }));
      }
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      setLinkOperationStatus((prev: any) => ({ ...prev, isCreating: false, lastOperation: `Error: ${(error as Error).message}` }));
    }
  }, [myLinks, onSave, onCancel]);

  const handleIconSelect = (iconName: string) => {
    setNewLinkFormData({ ...newLinkFormData, iconName });
    setShowIconGallery(false);
  };

  const handleSavePersonalLink = React.useCallback(() => {
    if (!newLinkFormData.title.trim() || !newLinkFormData.url.trim()) {
      Log.warn(LOG_SOURCE, 'Title and URL are required');
      return;
    }

    const newLink: IContextualMenuItem = {
      key: `personal-${Date.now()}`,
      name: newLinkFormData.title,
      href: newLinkFormData.url,
      iconProps: { iconName: newLinkFormData.iconName },
      title: newLinkFormData.description,
      target: '_blank',
      data: {
        category: newLinkFormData.category,
        iconUrl: newLinkFormData.iconUrl || undefined
      }
    };

    setMyLinks(prev => [...prev, newLink]);
    setShowAddPersonalLinkForm(false);
    setNewLinkFormData({
      title: '',
      url: '',
      description: '',
      iconName: 'Link',
      iconUrl: '',
      category: 'General',
      targetUsers: [],
      isMandatory: false,
      validFrom: '',
      validTo: ''
    });
    Log.info(LOG_SOURCE, `Added new personal link: ${newLinkFormData.title}`);
  }, [newLinkFormData]);

  return (
    <>
      <DialogContent
        title="Manage My Personal Links"
        onDismiss={onCancel}
        showCloseButton={true}
        styles={{
          content: {
            maxWidth: '800px',
            width: '90vw',
            maxHeight: '90vh',
            padding: 0,
          },
          header: {
            padding: '24px 24px 0 24px',
          },
          inner: {
            padding: 0,
          },
          title: {
            fontSize: FontSizes.size24,
            fontWeight: FontWeights.semibold,
            color: theme.palette.neutralPrimary,
          }
        }}
      >
        <div className={styles.panelContent}> {/* Using panelContent as a generic class */}
          {/* Status messages */}
          {linkOperationStatus.lastOperation && (
            <div className={styles.panelContent}> {/* Using panelContent as a generic class */}
              <MessageBar
                messageBarType={linkOperationStatus.lastOperation.includes('Failed') ? MessageBarType.error : MessageBarType.info}
                isMultiline={false}
                onDismiss={() => setLinkOperationStatus((prev: any) => ({ ...prev, lastOperation: null }))}
                styles={{
                  root: {
                    borderRadius: '6px',
                  }
                }}
              >
                <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign="center">
                  <Icon
                    iconName={linkOperationStatus.lastOperation.includes('Failed') ? 'ErrorBadge' : 'Info'}
                    styles={{
                      root: {
                        fontSize: FontSizes.size16,
                        color: linkOperationStatus.lastOperation.includes('Failed') ? theme.palette.red : theme.palette.themePrimary,
                      }
                    }}
                  />
                  <Text variant="medium">
                    {linkOperationStatus.lastOperation}
                  </Text>
                </Stack>
              </MessageBar>
            </div>
          )}

          <PersonalLinksTab
            links={myLinks}
            onLinksChange={setMyLinks}
            state={personalLinksState}
            onStateChange={setPersonalLinksState}
            showAddForm={showAddPersonalLinkForm}
            onShowAddForm={setShowAddPersonalLinkForm}
            newLinkFormData={newLinkFormData}
            onFormDataChange={setNewLinkFormData}
            onSave={handleSavePersonalLink}
            availableCategories={availableCategories}
            onShowIconGallery={() => setShowIconGallery(true)}
            isLoading={linkOperationStatus.isCreating}
          />
        </div>

        <DialogFooter>
          <PrimaryButton
            text="Save Changes"
            onClick={handleSave}
            disabled={linkOperationStatus.isCreating}
            styles={{ root: { marginRight: '8px' } }}
          />
          <DefaultButton
            text="Cancel"
            onClick={onCancel}
            disabled={linkOperationStatus.isCreating}
          />
        </DialogFooter>
      </DialogContent>
      <IconGallery
        isOpen={showIconGallery}
        selectedIcon={newLinkFormData?.iconName}
        onIconSelect={handleIconSelect}
        onCustomIconUpload={(file) => {
          // Handle custom icon upload logic here
        }}
        onClose={() => setShowIconGallery(false)}
      />
    </>
  );
};

export class PersonalLinkManagementDialog extends BaseDialog {
  private personalLinks: IContextualMenuItem[];
  private saveCallback: (updatedLinks: IContextualMenuItem[]) => Promise<boolean>;

  constructor(
    personalLinks: IContextualMenuItem[],
    saveCallback: (updatedLinks: IContextualMenuItem[]) => Promise<boolean>
  ) {
    super();
    this.personalLinks = personalLinks;
    this.saveCallback = saveCallback;
  }

  public render(): void {
    ReactDOM.render(
      React.createElement(PersonalLinkManagementDialogContent, {
        personalLinks: this.personalLinks,
        onSave: this.saveCallback,
        onCancel: () => this.close()
      }),
      this.domElement
    );
  }

  protected getConfig(): IDialogConfiguration {
    return {
      isBlocking: true
    };
  }
}