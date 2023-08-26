import { Icon } from 'office-ui-fabric-react';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { AppContext } from '../../contexts';
import { IItemData, IPermissionsData } from '../../models';
import { IPermissionsService } from '../../services';
import { ItemPermissionOptions } from '../ItemPermissionOptions';
import styles from './UniquePermissions.module.scss';

export interface IUniquePermissionsProps {
  permissionsService: IPermissionsService;
  itemData: IItemData;
  currentUserLoginName: string;
}

const UniquePermissions: React.FC<IUniquePermissionsProps> = (props) => {
  const [hasUniquePermissions, setHasUniquePermissions] = useState(false);
  const [hasCurrentUserPermissionsToManage, setHasCurrentUserPermissionsToManage] = useState(false);
  const [userPermissions, setUserPermission] = useState<string>(null);
  const [userLogin, setUserLogin] = useState<string>(null);

  const updateUserItemPermissions = useCallback((userPermissions: IPermissionsData): void => {
    const { permissionsService } = props;
    const hasUserPermissionsToManage = permissionsService.checkManagePermissionsAccess(userPermissions);
    if (hasUserPermissionsToManage) {
      setUserPermission('Manage');
      return;
    }

    const editPermission = permissionsService.checkEditPermissions(userPermissions);
    if (editPermission) {
      setUserPermission('Edit');
      return;
    }
    const readPermission = permissionsService.checkReadPermissions(userPermissions);
    if (readPermission) {
      setUserPermission('Read');
      return;
    }

    setUserPermission(null);
  }, []);

  const initData = useCallback(async (): Promise<void> => {
    const { permissionsService, itemData, currentUserLoginName } = props;
    AppContext.subscribeToContextChange(setUserLogin);

    const hasItemUniquePermissions = await permissionsService.getUniquePermissionsForItem(itemData);

    const currentUserPermissions = await permissionsService.getUserPermissionsForItem(itemData, currentUserLoginName);
    const hasUserPermissionsToHandle = permissionsService.checkManagePermissionsAccess(currentUserPermissions);

    setHasUniquePermissions(hasItemUniquePermissions);
    setHasCurrentUserPermissionsToManage(hasUserPermissionsToHandle);
    if (AppContext.userLogin) {
      setUserLogin(AppContext.userLogin);
    }
    else {
      updateUserItemPermissions(currentUserPermissions)
    }
  }, []);

  const updateUserLogin = async (): Promise<void> => {
    const { permissionsService, itemData, currentUserLoginName } = props;
    const loginToCheck = userLogin || currentUserLoginName;
    const userPermissions = await permissionsService.getUserPermissionsForItem(itemData, loginToCheck);

    updateUserItemPermissions(userPermissions);
  }

  /* eslint-disable no-void*/
  useEffect(() => {
    void initData();
  }, []);

  useEffect(() => {
    void updateUserLogin();
  }, [userLogin]);

  const renderUserPermissions = (permissions: string): JSX.Element => {
    let iconProperties = { iconName: 'Blocked', title: `None` }
    switch (permissions) {
      case 'Manage':
        iconProperties = { iconName: 'DeveloperTools', title: `Manage` };
        break;
      case 'Edit':
        iconProperties = { iconName: 'Edit', title: `Edit` };
        break;
      case 'Read':
        iconProperties = { iconName: 'ReadingMode', title: `Read` };
    }

    const loginText = userLogin ? userLogin : 'Current User';

    return <Icon className={styles.itemIcon} iconName={iconProperties.iconName} title={`Permissions for ${loginText} - ${iconProperties.title}`} />;
  };

  return <div
    data-testid="unique-permissions"
    className={styles.uniquePermissions}>
    {hasUniquePermissions ? <Icon className={styles.itemIcon} iconName="Lock" title="Has Unique Permissions" /> : <span />}
    {hasCurrentUserPermissionsToManage && renderUserPermissions(userPermissions)}
    {hasCurrentUserPermissionsToManage && <ItemPermissionOptions
      permissionsService={props.permissionsService}
      itemData={props.itemData}
      hasUniquePermissions={hasUniquePermissions} />}
  </div>;

};

export default UniquePermissions;