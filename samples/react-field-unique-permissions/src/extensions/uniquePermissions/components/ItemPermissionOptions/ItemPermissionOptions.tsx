import { DefaultButton, IContextualMenuProps } from '@fluentui/react';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { IItemData } from '../../models';
import { IPermissionsService } from '../../services';
import styles from './ItemPermissionOptions.module.scss';

export interface IItemPermissionOptionsProps {
    permissionsService: IPermissionsService;
    itemData: IItemData;
    hasUniquePermissions: boolean;
}

export const ItemPermissionOptions: React.FC<IItemPermissionOptionsProps> = (props) => {

    const goToPermissionsPage = async (): Promise<void> => {
        const { permissionsService, itemData } = props;
        await permissionsService.goToItemPermissionsPage(itemData);
    }

    /* eslint-disable no-void*/
    const [menuProps, setMenuProps] = useState<IContextualMenuProps>({
        shouldFocusOnMount: true,
        items: [
            { key: 'goToPermissionsPage', text: 'Go To Permissions Page', onClick: () => { void goToPermissionsPage(); } },
        ],
    });

    const resetRoleInheritance = useCallback(async (): Promise<void> => {
        const { permissionsService, itemData } = props;
        await permissionsService.resetRoleInheritance(itemData);
    }, []);

    const initData = useCallback(async (): Promise<void> => {
        if (props.hasUniquePermissions) {
            menuProps.items.push({ key: 'resetRoleInheritance', text: 'Delete Unique Permissions', onClick: () => { void resetRoleInheritance(); } });
        }
        setMenuProps(menuProps);
    }, []);

    useEffect(() => {
        void initData();
    }, []);

    return <DefaultButton data-testid="item-permission-options" className={styles.moreActionsButton} menuProps={menuProps} />;

};