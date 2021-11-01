import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as strings from 'CopyMoveItemsCommandSetStrings';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import { Dialog, DialogType } from '@fluentui/react/lib/Dialog';
import { useBoolean } from '@fluentui/react-hooks';
import { ResponsiveMode } from '@fluentui/react';
import CMContainer from './CMContainer';

const modelProps = {
    isBlocking: true
};
const dialogContentProps = {
    type: DialogType.largeHeader,
    title: strings.DialogTitle,
    subText: '',
    showCloseButton: true
};
export interface IAppDialogProps {
    closeDialog: () => void;
    data: any;
}

export const AppDialog: React.FunctionComponent<IAppDialogProps> = (props) => {
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);

    const _closeDialog = () => {
        props.closeDialog();
        toggleHideDialog();
    };

    return (
        <>
            <Dialog
                hidden={hideDialog}
                onDismiss={toggleHideDialog}
                dialogContentProps={dialogContentProps}
                modalProps={modelProps}
                closeButtonAriaLabel={strings.CloseAL}                
                minWidth="900px"
                responsiveMode={ResponsiveMode.large}>
                <CMContainer Info={props.data} closeDialog={_closeDialog} />
            </Dialog>
        </>
    );
};

export default class AppBaseDialog extends BaseDialog {
    public data: any;
    public closeDialog: () => void;

    public render(): void {
        const reactElement = <AppDialog closeDialog={this.closeDialog} data={this.data} />;
        ReactDOM.render(reactElement, this.domElement);
    }

    public getConfig(): IDialogConfiguration {
        return {
            isBlocking: true,
        };
    }
}
