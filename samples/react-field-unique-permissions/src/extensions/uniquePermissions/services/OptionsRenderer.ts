import { BaseComponentContext } from '@microsoft/sp-component-base';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AdditionalCommandButton, IAdditionalCommandButtonProps } from "../components";
import { IOptionsRenderer, IPermissionsService } from "./interfaces";
import styles from '../components/AdditionalCommandButton/AdditionalCommandButton.module.scss';

export class OptionsRenderer implements IOptionsRenderer {
    private readonly InitializationVariableName = 'IsUniquePermissionsRendererInitialized';

    constructor(protected permissionsService: IPermissionsService) {
    }

    public getIsRenderingInitialized(): boolean {
        /* eslint-disable @typescript-eslint/no-explicit-any*/
        return (window as any)[this.InitializationVariableName];
    }

    public async renderAdditionalOptions(context: BaseComponentContext): Promise<void> {
        if (this.getIsRenderingInitialized()) { return; }
        const shouldRender = await this.shouldRenderAdditionalOptions(context);
        if (!shouldRender) { return; }

        /* eslint-disable @typescript-eslint/no-explicit-any*/
        (window as any)[this.InitializationVariableName] = true;

        const secondaryCommandsContainer = this.getButtonContainer();

        const additionalButton: React.ReactElement<{}> =
            React.createElement(AdditionalCommandButton, {
                context
            } as IAdditionalCommandButtonProps);
        ReactDOM.render(additionalButton, secondaryCommandsContainer);
    }

    private async shouldRenderAdditionalOptions(context: BaseComponentContext): Promise<boolean> {
        const webUrl = context.pageContext.web.absoluteUrl;
        const listId = context.pageContext.list.id;
        const hasCurrentUserManagePermission = await this.permissionsService.hasUserManagePermissionAccessToList({
            listId: listId,
            webUrl: webUrl
        }, `i:0#.f|membership|${context.pageContext.user.loginName}`);

        return hasCurrentUserManagePermission;
    }

    public unMountAdditionalOptions(): void {
        /* eslint-disable @typescript-eslint/no-explicit-any*/
        (window as any)[this.InitializationVariableName] = false;

        const secondaryCommandsContainer = this.getButtonContainer();
        ReactDOM.unmountComponentAtNode(secondaryCommandsContainer);
    }

    private getButtonContainer(): HTMLDivElement {
        const commandBarContainers = document.getElementsByClassName('ms-CommandBar-primaryCommand');
        const realContainer = commandBarContainers && commandBarContainers.length > 0 ? commandBarContainers[0] : null;
        if (!realContainer) { return null; }

        const newDivElement = document.createElement('div');

        newDivElement.className = `ms-OverflowSet-item ${styles.additionalButtonContainer}`;
        realContainer.appendChild(newDivElement)

        return newDivElement
    }
}