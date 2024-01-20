import * as React from "react";
import { DefaultButton, PrimaryButton, IconButton } from '@fluentui/react/lib/Button';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { List } from '@fluentui/react/lib/List';
import { IIconProps } from '@fluentui/react';
import { SPService } from "../../../../services/SPService";
import { IPermissionItem } from "../../../../models/IPermissionItem";
import styles from './SitePermissions.module.scss';
import { ISitePermissionsProps } from "./ISitePermissionsProps";

export const SitePermissions: React.FC<ISitePermissionsProps> = (props) => {
  const [items, setItems] = React.useState<IPermissionItem[]>([]);
  const [dialog, setDialog] = React.useState<JSX.Element>();
  const cancelBtn: IIconProps = { iconName: 'Cancel' };
  const spService = new SPService(props.serviceScope);
  
  const dialogContentProps = {
    type: DialogType.normal,
    title: 'Confirm Permission Change',
    closeButtonAriaLabel: 'Close',
    subText: '',
  };

  const evalSitePermissions = async (): Promise<void> => {
    const respItems = await spService.getSitePermissions(props.currentSiteUrl);        
    setItems(respItems);
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const deletePermission = async (principalId: string) => { 
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    hideDialog();   
    const response = await spService.removeSitePermission(props.currentSiteUrl, principalId);
    if (response) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      evalSitePermissions();
    }
  };

  const hideDialog = (): void => {
    setDialog(<React.Fragment></React.Fragment>);
  };

  const confirmDeletePermission = React.useCallback((principalId: string) => {
    dialogContentProps.subText = 'Do you really want to remove the site permission?'
    setDialog(<Dialog
              hidden={false}
              onDismiss={hideDialog}
              dialogContentProps={dialogContentProps}
            >
              <DialogFooter>
                <PrimaryButton onClick={() => deletePermission(principalId)} text="OK" />
                <DefaultButton onClick={hideDialog} text="Cancel" />
              </DialogFooter>
            </Dialog>);
  }, [items]);

  const onRenderCell = (item: IPermissionItem, index: number): JSX.Element => {
    return (
      <div data-is-focusable={true}>       
        <div className={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
          <div className={styles.itemName}><a href={item.url}>{item.name}</a></div>
          <div className={styles.itemIndex}>
            <span>{item.permission}</span>
            {!item.isDefault && props.isSiteOwner &&
            <span>
              <IconButton iconProps={ cancelBtn } title='Remove permission' onClick={ () => confirmDeletePermission(item.key) } />
            </span>}
          </div>
        </div>
      </div>
    );
  };

  React.useEffect((): void => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    evalSitePermissions();
  }, []);

  return (
    <div className={styles.sitePermissions}>
      <h4>Site</h4>
      <List items={items} onRenderCell={onRenderCell} />

      {dialog}
    </div>
  )
}