import * as React from "react";
import { PrimaryButton, DefaultButton, IconButton } from '@fluentui/react/lib/Button';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { IIconProps } from '@fluentui/react';
import { Callout } from '@fluentui/react/lib/Callout';
import { List } from '@fluentui/react/lib/List';
import GraphService from "../../../../services/GraphService";
import { SPService } from "../../../../services/SPService";
import styles from './SharingLinks.module.scss';
import { ISharingLinksProps } from "./ISharingLinksProps";
import { ISharingLink } from "../../../../models/ISharingLink";

export const SharingLinks: React.FC<ISharingLinksProps> = (props) => {
  const [items, setItems] = React.useState<ISharingLink[]>([]);
  const spService = new SPService(props.serviceScope);
  const graphService = new GraphService(props.serviceScope);
  const [dialog, setDialog] = React.useState<JSX.Element>();
  const [isShareCalloutVisible, setIsShareCalloutVisible] = React.useState<boolean>(false);
  const cancelBtn: IIconProps = { iconName: 'Cancel' };
  const shareBtn: IIconProps = { iconName: 'Share' };
  
  const dialogContentProps = {
    type: DialogType.normal,
    title: 'Confirm Permission Change',
    closeButtonAriaLabel: 'Close',
    subText: '',
  };

  const getSharingLinks = async (): Promise<void> => {
    const respItems = await spService.getSharingLinks(props.currentSiteUrl, props.siteId);
    setItems(respItems);
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const deleteSharingLink = async (docId: string, shareId: string) => { 
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    hideDialog();   
    const response = await graphService.deleteSharingLink(props.siteId, docId, shareId);
    if (response) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      getSharingLinks();
    }
  };

  const hideDialog = (): void => {
    setDialog(<React.Fragment></React.Fragment>);
  };

  const confirmDeleteSharingLink = React.useCallback((docId: string, shareId: string) => {
    dialogContentProps.subText = 'Do you really want to remove the sharing link?'
    setDialog(<Dialog
              hidden={false}
              onDismiss={hideDialog}
              dialogContentProps={dialogContentProps}
            >
              <DialogFooter>
                <PrimaryButton onClick={() => deleteSharingLink(docId, shareId)} text="OK" />
                <DefaultButton onClick={hideDialog} text="Cancel" />
              </DialogFooter>
            </Dialog>);
  }, [items]);

  const copyShareLinkToClipboard = React.useCallback((shareLink: string) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    navigator.clipboard.writeText(shareLink);
    setIsShareCalloutVisible(true);
  }, [items]);

  const onRenderCell = (item: ISharingLink, index: number | undefined): JSX.Element => {
    return (
      <div data-is-focusable={true}>       
        <div className={index! % 2 === 0 ? styles.evenRow : styles.oddRow}>
          <div className={styles.itemName}><a href={item.url}>{item.name}</a></div>
          <div className={styles.itemPerson}>{item.description}</div>
          <div className={styles.itemPermission}>
            <span className={styles.txtPermission}>{item.role}</span>
            <span>
              <IconButton iconProps={ shareBtn } title={item.shareLink} id={`sharing-button${item.key}`} onClick={ () => copyShareLinkToClipboard(item.shareLink!) } />
              {props.isSiteOwner &&
              <IconButton iconProps={ cancelBtn } title='Stop sharing!' onClick={ () => confirmDeleteSharingLink(item.docId, item.key) } />}
              {isShareCalloutVisible && (
                <Callout
                  role="dialog"
                  gapSpace={0}
                  target={`#sharing-button${item.key}`}
                  onDismiss={() => setIsShareCalloutVisible(false)}
                  setInitialFocus
                >
                  Sharing Link copied to clipboard!
              </Callout>)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  React.useEffect((): void => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getSharingLinks();
  }, []);

  return (
    <div className={styles.sharingLinks}>
      <h4>Shared Files</h4>
      <List items={items} onRenderCell={onRenderCell} />

      {dialog}
    </div>
  )
}