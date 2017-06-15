import * as React from 'react';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';
import {
    autobind
} from 'office-ui-fabric-react/lib/Utilities';
import InnerDialogComponent, { IInnerDialogProps } from './innerdialogcomponent';

export interface IDialogProps {
    listItems?: any;
}

export default class DialogComponent extends React.Component<IDialogProps, any> {

    constructor(props: IDialogProps) {
        super(props);
        // Since I am building the component on the "fly", it doesn't matter that the showDialog is true
        // Could had gotten some property from properties aswell
        this.state = {
            showDialog: true
        };
    }

    public render() {
        return (
            <div>
                <Dialog
                    isOpen={this.state.showDialog}
                    type={DialogType.close}
                    onDismiss={this._closeDialog.bind(this)}
                    title='Multi Share'
                    subText='Simple example of sharing multiple documents with users in SharePoint'
                    isBlocking={true}
                    containerClassName='ms-dialogMainOverride'>
                    <InnerDialogComponent
                        listItems={this.props.listItems} callbackParent={this._closeDialog}
                    />
                </Dialog>
            </div>
        );
    }

    @autobind
    private _closeDialog() {
        this.setState({ showDialog: false });
    }
}