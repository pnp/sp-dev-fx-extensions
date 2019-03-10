import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import { EMailProperties, IService, EMailAttachment } from '../../models';
import { SendEMailDialogContent } from '../SendEMailDialogContent/SendEMailDialogContent';

export default class SendEMailDialog extends BaseDialog {
    private eMailProperties: EMailProperties;
    private sendDocumentService: IService;
    /**
     *
     */
    constructor(service: IService, eMailProperties?: EMailProperties) {
        super();
        this.sendDocumentService = service;
        if (eMailProperties) {
            this.eMailProperties = eMailProperties;
        }
        else {
            this.eMailProperties = new EMailProperties({
                To: "",
                Subject: `Send Document - ${this.sendDocumentService.fileName}`,
                Body: "",
            });
        }
    }


    public render(): void {
        ReactDOM.render(<SendEMailDialogContent
            close={this._close.bind(this)}
            eMailProperties={this.eMailProperties}
            submit={this._submit.bind(this)}
            sendDocumentService={this.sendDocumentService}
        />, this.domElement);
    }

    public getConfig(): IDialogConfiguration {
        return {
            isBlocking: false
        };
    }

    private clear() {
        if (this.eMailProperties) {
            this.eMailProperties = undefined;
        }

        ReactDOM.unmountComponentAtNode(this.domElement);
    }

    private _close(): void {
        this.clear();
        this.close();
    }

    private _submit(eMailProperties: EMailProperties): void {
        this.clear();
        this.close();
    }
}