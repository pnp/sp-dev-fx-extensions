import { DefaultButton, Icon, Panel, PrimaryButton, initializeIcons } from '@fluentui/react';
import { BaseComponentContext } from '@microsoft/sp-component-base';
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { AppContext } from '../../contexts';
import { IUserProps } from '../../models';
import styles from './AdditionalCommandButton.module.scss';

export interface IAdditionalCommandButtonProps {
    context: BaseComponentContext;
}

export const AdditionalCommandButton: React.FC<IAdditionalCommandButtonProps> = (props) => {
    const [showSettingPanel, setShowSettingPanel] = useState(false);
    const [userData, setUserData] = useState<IUserProps>(null);

    /* eslint-disable no-void*/
    useEffect((): void => {
        initializeIcons();
        setShowSettingPanel(false);
    }, []);

    const toggleSettingPanel = (): void => {
        setShowSettingPanel(!showSettingPanel);
    }

    const getPeoplePickerItems = useCallback((items: IUserProps[]): void => {
        if (!items || items.length === 0) return;
        setUserData(items[0]);
    }, []);

    const submitUser = (): void => {
        AppContext.userLogin = userData?.loginName;
        AppContext.notifySubscribers(userData?.loginName);
        setShowSettingPanel(false);
    }

    const closeSettingPanel = useCallback((): void => {
        setShowSettingPanel(false);
    }, []);

    const clearUser = useCallback((): void => {
        setUserData(null);
    }, []);

    /* eslint-disable @typescript-eslint/no-explicit-any*/
    return <>
        <Icon
            data-testid="additional-command-button"
            onClick={toggleSettingPanel}
            className={`${styles.additionalButton} ${(userData) ? styles.redDot : ''}`}
            iconName='Permissions'
            title={userData ? `Check Permissions for ${userData.loginName}` : "Check Permissions"}
        />
        <Panel
            onDismiss={toggleSettingPanel}
            isOpen={showSettingPanel}
            isLightDismiss
        >
            <div
                data-testid="additonal-command-panel">
                <h1>Check Permissions for account</h1>

                <PeoplePicker
                    context={props.context as any}
                    titleText="Choose target user account"
                    personSelectionLimit={1}
                    showtooltip={true}
                    required={true}
                    onChange={getPeoplePickerItems}
                    showHiddenInUI={false}
                    principalTypes={[PrincipalType.User]}
                    resolveDelay={1000}
                    defaultSelectedUsers={userData ? [userData.secondaryText] : []}
                />
                <div className={styles.footerButtons}>
                    <PrimaryButton
                        text="Accept"
                        onClick={submitUser}
                    />
                    <DefaultButton
                        text="Cancel"
                        onClick={closeSettingPanel}
                    />
                    {userData && <DefaultButton
                        text="Clear"
                        onClick={clearUser}
                    />}
                </div>
            </div>
        </Panel>
    </>;

};