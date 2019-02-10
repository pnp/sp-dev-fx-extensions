import * as React from 'react';
import {
    TextField,
    PrimaryButton,
    Button,
    DialogFooter,
    DialogContent,
    Spinner,
    SpinnerSize
} from 'office-ui-fabric-react';
import { ISendEMailDialogContentProps } from './ISendEMailDialogContentProps';
import { EMailProperties, EMailAttachment } from '../../models';
import { ISendEMailDialogContentState } from './ISendEMailDialogContentState';

export class SendEMailDialogContent extends React.Component<ISendEMailDialogContentProps, ISendEMailDialogContentState> {
    private _eMailProperties: EMailProperties;

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false
        }
        this._eMailProperties = this.props.eMailProperties;
        this._onChangedTo = this._onChangedTo.bind(this);
        this._onChangedSubject = this._onChangedSubject.bind(this);
        this._onChangedBody = this._onChangedBody.bind(this);
        this._submit = this._submit.bind(this);
    }

    public render(): JSX.Element {


        var getDialogContent = () => {
            if (this.state.isLoading) {
                return (
                    <Spinner size={SpinnerSize.large} label="loading..." ariaLive="assertive" />
                );
            }
            else {
                return (
                    <div>
                        <TextField label='To' required={true} value={this._eMailProperties.To} onChanged={this._onChangedTo} />
                        <TextField label='Subject' required={true} value={this._eMailProperties.Subject} onChanged={this._onChangedSubject} />
                        <TextField label='Body' required={true} multiline value={this._eMailProperties.Body} onChanged={this._onChangedBody} />

                        <DialogFooter>
                            <Button text='Cancel' title='Cancel' onClick={this.props.close} />
                            <PrimaryButton text='OK' title='OK' onClick={this._submit} />
                        </DialogFooter>
                    </div>);
            }
        }
        // UI
        return <DialogContent
            title='Send E-Mail Details'
            subText=''
            onDismiss={this.props.close}
            showCloseButton={true}
        >
            {getDialogContent()}
        </DialogContent>;
    }

    private _onChangedSubject(text: string) {
        this._eMailProperties.Subject = text;
    }

    private _onChangedTo(text: string) {
        this._eMailProperties.To = text;
    }

    private _onChangedBody(text: string) {
        this._eMailProperties.Body = text;
    }

    private getEMailAttachment(): Promise<EMailAttachment> {
        return new Promise((resolve, reject) => {
            this.props.sendDocumentService
                .getFileContentAsBase64(this.props.sendDocumentService.fileUri)
                .then((fileContent: string) => {
                    resolve(new EMailAttachment({
                        FileName: this.props.sendDocumentService.fileName,
                        ContentBytes: fileContent
                    })
                    );
                })
                .catch((err) => {
                    reject(err);
                });
        })
    }

    private sendEMail(eMailProperties: EMailProperties): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.props.sendDocumentService.sendEMail(eMailProperties)
                .then((emailData) => {
                    resolve(true);
                })
                .catch((err) => {
                    reject(err);
                })
        })
    }


    private _submit() {
        this.setState({ isLoading: true });
        this.getEMailAttachment().then((attachment: EMailAttachment) => {
            this._eMailProperties.Attachment = attachment;
            this.sendEMail(this._eMailProperties)
                .then(() => {
                    this.props.submit(this._eMailProperties);
                }).catch((err) => {
                    console.error("Send Document Error", err);
                })
        })
    }
}
