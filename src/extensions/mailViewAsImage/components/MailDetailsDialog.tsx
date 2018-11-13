import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import {
    autobind,
    PrimaryButton,
    CommandButton,
    TextField,
    Label,
    DialogFooter,
    DialogContent,
    DialogType,
    Toggle,
    Spinner,
    SpinnerSize,
    Checkbox,
    Icon
} from 'office-ui-fabric-react';
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { ListPicker } from "@pnp/spfx-controls-react/lib/ListPicker";
import { LibsOrderBy } from "@pnp/spfx-controls-react/lib/services/ISPService";
import { sp, PermissionKind } from '@pnp/sp';
import { ExtensionContext } from '@microsoft/sp-extension-base';
import { Dialog } from '@microsoft/sp-dialog';
import { MSGraphClient } from '@microsoft/sp-http';
import { IMailMessage } from '../../interfaces/IMailMessage';
import html2canvas from 'html2canvas';
import styles from './MailDetailsDialog.module.scss';


interface IMailDetailsDialogContentProps {
    context: ExtensionContext;
    close: () => void;
    submit: (capturedDetails: IMailDetailsDialogContentState) => void;
}

interface IMailDetailsDialogContentState {
    sendTo: string;
    subject: string;
    message: string;
    sendToInternalUser: boolean;
    saveToSharePoint: boolean;
    selectedUserHasPermission: boolean;
    selectedLibrary: string;
    imageName: string;
    sendLink: boolean;
    status: JSX.Element;
    loading: boolean;
}


class MailDetailsDialogContent extends
    React.Component<IMailDetailsDialogContentProps, IMailDetailsDialogContentState> {

    constructor(props) {
        super(props);

        this.state = {
            sendTo: "",
            subject: "",
            message: "",
            sendToInternalUser: false,
            saveToSharePoint: false,
            selectedUserHasPermission: false,
            selectedLibrary: "",
            imageName: "",
            sendLink: false,
            status: null,
            loading: false
        };
    }

    public render(): JSX.Element {

        return (<div className={styles.mailDetailsDialogRoot}>
            <DialogContent
                title="Send view"
                onDismiss={this.props.close}
                showCloseButton={true}
                type={DialogType.largeHeader}
            >

                <div className={styles.mailDetailsDialogContent}>
                    <div className="ms-Grid">
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-u-sm12 ms-u-md12 ms-u-lg12">
                                <div className="ms-borderBase ms-fontColor-themePrimary" />
                                <Label className="ms-bgColor-themeLight ms-fontWeight-semibold">&nbsp;<Icon iconName="ContactCard" className="ms-IconExample" /> User related</Label>
                                <Toggle
                                    defaultChecked={false}
                                    label="Send to Internal User"
                                    onText="Yes"
                                    offText="No"
                                    onChanged={this._onChangedInternal}
                                />
                                <Label><Icon iconName="Contact" className="ms-IconExample" /> {this.state.sendToInternalUser ? " Choose a colleague" : " Type an email address (external user)"}</Label>

                                {
                                    this.state.sendToInternalUser ?

                                        <PeoplePicker
                                            context={this.props.context} //Updated context in IPeoplePicker.d.ts to be of type ExtensionContext - not ideal will be submitting a PR soon
                                            titleText=" "
                                            personSelectionLimit={1}
                                            disabled={false}
                                            selectedItems={this._getPeoplePickerItems}
                                            showHiddenInUI={false}
                                            principleTypes={[PrincipalType.User]} /> :
                                        <TextField
                                            value={this.state.sendTo}
                                            onChanged={this._onChangedSendTo}
                                            iconProps={{ iconName: 'World' }}
                                        />
                                }

                                {
                                    this.state.sendToInternalUser && this.state.selectedUserHasPermission
                                        ? <div>
                                            <br />
                                            <Checkbox label="User has view permissions so, send link in mail instead?" onChange={this._onCheckboxChange.bind(this)} />
                                        </div>
                                        :
                                        null
                                }
                                <br />
                                <div className="ms-borderBase ms-fontColor-themePrimary" />
                                <Label className="ms-bgColor-themeLight ms-fontWeight-semibold">&nbsp;<Icon iconName="Mail" className="ms-IconExample" /> Mail related</Label>
                                <Label>The following email will be sent {this.state.sendLink ? " with link in the body." : " with image attached."}</Label>

                                <Label><Icon iconName="Mail" className="ms-IconExample" /> Subject</Label>
                                <TextField
                                    value={this.state.subject}
                                    onChanged={this._onChangedSubject}
                                />
                                <Label><Icon iconName="TextField" className="ms-IconExample" /> Message</Label>
                                <TextField
                                    multiline
                                    rows={4}
                                    value={this.state.message}
                                    onChanged={this._onChangedMessage}
                                />
                                {!this.state.sendLink &&
                                    <div>
                                        <Label><Icon iconName="Attach" className="ms-IconExample" /> Attachment name</Label>
                                        <TextField
                                            suffix=".png"
                                            value={this.state.imageName}
                                            onChanged={this._onChangedImageName}
                                        />
                                    </div>
                                }

                                <br />
                                <div className="ms-borderBase ms-fontColor-themePrimary" />
                                <Label className="ms-bgColor-themeLight ms-fontWeight-semibold">&nbsp;<Icon iconName="SharepointLogo" className="ms-IconExample" /> SharePoint related</Label>
                                <Toggle
                                    defaultChecked={false}
                                    label="Save to library"
                                    onText="Yes"
                                    offText="No"
                                    checked={this.state.saveToSharePoint}
                                    onChanged={this._onChangedSave}
                                    disabled={this.state.sendLink}
                                />
                                {
                                    this.state.saveToSharePoint &&

                                    <div>
                                        <Label><Icon iconName="FileImage" className="ms-IconExample" /> File name</Label>
                                        <TextField
                                            suffix=".png"
                                            value={this.state.imageName}
                                            onChanged={this._onChangedImageName}
                                        />
                                        <Label><Icon iconName="DocLibrary" className="ms-IconExample" /> Library</Label>
                                        <ListPicker
                                            context={this.props.context} //Updated context in IListPicker.d.ts to be of type ExtensionContext - not ideal will be submitting a PR soon
                                            placeHolder="Select a library to save in"
                                            baseTemplate={101}
                                            includeHidden={false}
                                            multiSelect={false}
                                            orderBy={LibsOrderBy.Title}
                                            onSelectionChanged={this._onListPickerChange} />
                                    </div>
                                }
                                <br />
                                {this.state.status}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <PrimaryButton text='Submit' title='Submit' iconProps={{ iconName: 'SkypeCircleCheck' }} disabled={this.state.loading} onClick={() => {
                        this.setState({ loading: true, status: <Spinner size={SpinnerSize.large} label='Loading...' /> });
                        this.props.submit(this.state);
                    }} />
                    <CommandButton text='Cancel' title='Cancel' iconProps={{ iconName: 'StatusErrorFull' }} disabled={this.state.loading} onClick={this.props.close} />
                </DialogFooter>
            </DialogContent>
        </div>);
    }

    @autobind
    private async _getPeoplePickerItems(items: any[]) {
        console.log('Items:', items);

        this.setState({
            sendTo: items.length > 0 ? items[0].secondaryText : "",
            selectedUserHasPermission: items.length > 0 ? await sp.web.lists.getById(this.props.context.pageContext.list.id.toString()).userHasPermissions("i:0#.f|membership|" + items[0].secondaryText, PermissionKind.ViewListItems) : false,
            sendLink: false
        })


    }

    @autobind
    private _onListPickerChange(list: string) {
        console.log("List:", list);
        this.setState({
            selectedLibrary: list
        })
    }

    @autobind
    private _onChangedSendTo(newValue: string): void {
        this.setState({
            sendTo: newValue,
        });
    }
    @autobind
    private _onChangedSubject(newValue: string): void {
        this.setState({
            subject: newValue,
        });
    }
    @autobind
    private _onChangedMessage(newValue: string): void {
        this.setState({
            message: newValue,
        });
    }
    @autobind
    private _onChangedSave(newValue: boolean): void {
        this.setState({
            saveToSharePoint: newValue,
        });
    }
    @autobind
    private _onChangedInternal(newValue: boolean): void {
        this.setState({
            sendToInternalUser: newValue,
            sendTo: ""
        });
    }

    @autobind
    private _onCheckboxChange(ev: React.FormEvent<HTMLElement>, newValue: boolean): void {
        console.log(newValue);
        this.setState({
            sendLink: newValue,
            saveToSharePoint: newValue && false
        });
    }

    @autobind
    private _onChangedImageName(newValue: string): void {
        this.setState({
            imageName: newValue,
        });
    }

    private _getErrorMessage(value: string): string {
        return (value == null || value.length == 0 || value.length >= 10)
            ? ''
            : `${value.length}.`;
    }
}

export default class MailDetailsDialog extends BaseDialog {
    public context: ExtensionContext;

    public render(): void {
        ReactDOM.render(<MailDetailsDialogContent
            context={this.context}
            close={this.close}
            submit={this._submit}
        />, this.domElement);
    }

    public getConfig(): IDialogConfiguration {
        return {
            isBlocking: false
        };
    }

    @autobind
    private async _submit(capturedDetails: IMailDetailsDialogContentState): Promise<void> {

        const mailMessage: IMailMessage = {
            message: {
                subject: capturedDetails.subject,
                body: {
                    contentType: "HTML",
                    content: capturedDetails.message
                },
                toRecipients: [
                    {
                        emailAddress: {
                            address: capturedDetails.sendTo
                        }
                    }
                ],
                attachments: []
            },
            saveToSentItems: false
        }

        if (capturedDetails.sendLink) {
            mailMessage.message.body.content += `<br/> Here is the <a href="${window.location.href}" target="_blank">Link</a>`;
            this.sendMail(mailMessage, capturedDetails.saveToSharePoint);
        }
        else {
            html2canvas(document.querySelector('.StandaloneList-innerContent')).then(async (canvas) => {
                let base64image = canvas.toDataURL('image/png');
                let base64String = base64image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

                !capturedDetails.sendLink && mailMessage.message.attachments.push(
                    {
                        "@odata.type": "#microsoft.graph.fileAttachment",
                        name: `${capturedDetails.imageName}.png`,
                        contentBytes: base64String
                    }
                );
                this.sendMail(mailMessage, capturedDetails.saveToSharePoint);


                if (capturedDetails.saveToSharePoint) {
                    this.saveImageToSharePoint(base64String, capturedDetails.selectedLibrary, capturedDetails.imageName);
                }

            });
        }
    }

    private async sendMail(mailMessage: IMailMessage, saveToSharePoint: boolean): Promise<void> {
        const graphClient: MSGraphClient = await this.context.msGraphClientFactory.getClient();

        await graphClient
            .api(`me/sendMail`)
            .version("v1.0")
            .post(mailMessage, (err, res) => {
                if (err) {
                    Dialog.alert(`Failed to send mail.`);
                }
                else {
                    if (!saveToSharePoint) {
                        console.log("Done");
                        Dialog.alert(`Mail sent.`);
                    }
                }
                this.close();
            });
    }

    private async saveImageToSharePoint(base64String: string, selectedLibrary: string, imageName: string): Promise<void> {
        var binary_string = window.atob(base64String);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }

        await sp.web.lists.getById(selectedLibrary).rootFolder
            .files.add(`${imageName}.png`, bytes.buffer, true)
            .then(() => {
                Dialog.alert("Mail sent and saved to SharePoint")
                this.close();
            });
    }

}