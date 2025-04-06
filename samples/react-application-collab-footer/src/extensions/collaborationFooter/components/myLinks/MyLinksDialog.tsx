import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  DefaultButton,
  TextField,
  CommandBar,
  DetailsList,
  DetailsListLayoutMode,
  Selection,
  IColumn,
  DialogFooter,
  DialogContent,
  SelectionMode,
  ICommandBarItemProps,
} from '@fluentui/react';
import IMyLink from './IMyLink';
import styles from './MyLinks.module.scss';
import * as strings from 'MyLinksStrings';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';

interface IMyLinksDialogContentProps {
  links: IMyLink[];
  saveLinksCallback: (updatedLinks: IMyLink[]) => Promise<void>;
  close: () => void;
}

const MyLinksDialogContent: React.FC<IMyLinksDialogContentProps> = ({
  links: initialLinks,
  saveLinksCallback,
  close,
}) => {
  const [links, setLinks] = React.useState<IMyLink[]>(() => {
    return initialLinks.map((link, index) => ({
      key: link.key || `link-${index}-${Date.now()}`,
      ...link,
    }));
  });

  const [selectedLink, setSelectedLink] = React.useState<IMyLink | null>(null);
  const [showDetailPanel, setShowDetailPanel] = React.useState<boolean>(false);
  const [addingNewItem, setAddingNewItem] = React.useState<boolean>(false);
  const [title, setTitle] = React.useState<string>('');
  const [url, setUrl] = React.useState<string>('');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Ref to track if the component is mounted
  const isMountedRef = React.useRef<boolean>(true);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const selection = React.useMemo(
    () =>
      new Selection({
        onSelectionChanged: () => {
          const selectedItems = selection.getSelection();
          setSelectedLink(selectedItems.length ? (selectedItems[0] as IMyLink) : null);
        },
      }),
    [links]
  );

  const linksColumns: IColumn[] = [
    {
      key: 'TitleColumn',
      name: strings.TitleColumn,
      fieldName: 'title',
      minWidth: 150,
      maxWidth: 350,
      isResizable: true,
      ariaLabel: strings.TitleColumnAriaLabel,
    },
    {
      key: 'UrlColumn',
      name: strings.UrlColumn,
      fieldName: 'url',
      minWidth: 150,
      maxWidth: 350,
      isResizable: true,
      ariaLabel: strings.UrlColumnAriaLabel,
    },
  ];

  const handleAddLink = (): void => {
    setAddingNewItem(true);
    setTitle('');
    setUrl('');
    setShowDetailPanel(true);
    selection.setAllSelected(false);
  };

  const handleEditLink = (): void => {
    if (selectedLink) {
      setAddingNewItem(false);
      setTitle(selectedLink.title);
      setUrl(selectedLink.url);
      setShowDetailPanel(true);
    }
  };

  const handleDeleteLink = async (): Promise<void> => {
    if (selectedLink) {
      const updatedLinks = links.filter((link) => link !== selectedLink);
      setLinks(updatedLinks);
      try {
        await saveLinksCallback(updatedLinks);
        if (isMountedRef.current) {
          setErrorMessage(null); // Clear any previous error messages
          setSelectedLink(null);
          selection.setItems(updatedLinks, true);
        }
      } catch (error) {
        console.error('Error saving links:', error);
        if (isMountedRef.current) {
          setErrorMessage(strings.SaveErrorMessage || 'Failed to save links.');
        }
      }
    }
  };

  const validateUrl = (value: string): string => {
    const urlPattern = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;
    return value && !urlPattern.test(value) ? strings.InvalidUrlError : '';
  };

  const handleSaveEdit = async (): Promise<void> => {
    if (!title || !url) {
      if (isMountedRef.current) {
        setErrorMessage(strings.RequiredFieldsError || 'Title and URL are required.');
      }
      return;
    }

    const urlError = validateUrl(url);
    if (urlError) {
      if (isMountedRef.current) {
        setErrorMessage(urlError);
      }
      return;
    }

    let updatedLinks = [...links];

    if (addingNewItem) {
      const newLink: IMyLink = {
        key: `link-${title}-${url}-${Date.now()}`,
        title,
        url,
      };
      updatedLinks.push(newLink);
    } else if (selectedLink) {
      const index = updatedLinks.findIndex((link) => link.key === selectedLink.key);
      if (index > -1) {
        updatedLinks[index] = { ...selectedLink, title, url };
      }
    }

    setLinks(updatedLinks);

    try {
      await saveLinksCallback(updatedLinks);
      if (isMountedRef.current) {
        setErrorMessage(null);
        setShowDetailPanel(false);
        setTitle('');
        setUrl('');
        selection.setItems(updatedLinks, true);
      }
    } catch (error) {
      console.error('Error saving links:', error);
      if (isMountedRef.current) {
        setErrorMessage(strings.SaveErrorMessage || 'Failed to save links.');
      }
    }
  };

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'addRow',
      text: strings.AddLinkCommand,
      iconProps: { iconName: 'Add' },
      onClick: handleAddLink,
    },
    {
      key: 'editRow',
      text: strings.EditLinkCommand,
      iconProps: { iconName: 'Edit' },
      onClick: handleEditLink,
      disabled: !selectedLink,
    },
    {
      key: 'deleteRow',
      text: strings.DeleteLinkCommand,
      iconProps: { iconName: 'Delete' },
      onClick: () => {
        handleDeleteLink();
      },
      disabled: !selectedLink,
    },
  ];

  const handleSave = async (): Promise<void> => {
    try {
      await saveLinksCallback(links);  // This should be an async call to save the updated links
      setErrorMessage(null);           // Clear any previous error message
      close();                         // Close the dialog if save is successful
    } catch (error) {
      console.error('Error saving links:', error);
      setErrorMessage(strings.SaveErrorMessage || 'Failed to save links.');
    }
  };
  
  return (
    <div className={styles.myLinksDialogRoot}>
      <DialogContent
        title={strings.MyLinksDialogTitle}
        subText={strings.MyLinksDialogDescription}
        onDismiss={close}
        showCloseButton={!showDetailPanel}
      >
        {errorMessage && (
          <div className={styles.errorMessage}>
            <span>{errorMessage}</span>
          </div>
        )}
        {showDetailPanel ? (
          <div className={styles.editPanel}>
            <TextField
              className={styles.textField}
              label={strings.LinkTitleLabel}
              required
              value={title}
              onChange={(_, newValue) => setTitle(newValue || '')}
            />
            <TextField
              className={styles.textField}
              label={strings.LinkUrlLabel}
              required
              value={url}
              onChange={(_, newValue) => setUrl(newValue || '')}
              onGetErrorMessage={validateUrl}
            />
            <DialogFooter>
              <DefaultButton text={strings.DialogCancelButton} onClick={() => setShowDetailPanel(false)} />
              <DefaultButton
                primary
                text={addingNewItem ? strings.DialogAddButton : strings.DialogUpdateButton}
                onClick={handleSaveEdit}
              />
            </DialogFooter>
          </div>
        ) : (
          <>
            <CommandBar items={commandBarItems} />
            <DetailsList
              items={links}
              columns={linksColumns}
              layoutMode={DetailsListLayoutMode.justified}
              selection={selection}
              selectionMode={SelectionMode.single}
              selectionPreservedOnEmptyClick={true}
              ariaLabelForSelectionColumn={strings.SelectionColumnAriaLabel}
              ariaLabelForSelectAllCheckbox={strings.SelectionAllColumnAriaLabel}
            />
            <DialogFooter>
              <DefaultButton text={strings.DialogCancelButton} onClick={close} />
              <DefaultButton primary text={strings.DialogSaveButton} onClick={handleSave} />
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </div>
  );
};

export default class MyLinksDialog extends BaseDialog {
  private initialLinks: IMyLink[];
  private saveCallback: (updatedLinks: IMyLink[]) => void;

  constructor(links: IMyLink[], saveCallback: (updatedLinks: IMyLink[]) => void) {
    super({ isBlocking: true });
    this.initialLinks = [...(links || [])];
    this.saveCallback = saveCallback;
  }

  public render(): void {
    // Wrap saveCallback into an async function that returns a Promise<void>
    const saveLinksCallback = (updatedLinks: IMyLink[]): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        try {
          this.saveCallback(updatedLinks);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    };

    ReactDOM.render(
      <MyLinksDialogContent
        links={this.initialLinks}
        saveLinksCallback={saveLinksCallback}
        close={this.close}
      />,
      this.domElement
    );
  }

  public getConfig(): IDialogConfiguration {
    return { isBlocking: true };
  }

  protected onAfterClose(): void {
    super.onAfterClose();
    ReactDOM.unmountComponentAtNode(this.domElement);
  }
}
