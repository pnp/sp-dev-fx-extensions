
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import { IFileProperties } from "../../FollowDocuments/FollowDocumentsCommandSet";
import { followType } from "../../util/followType";
import { FollowDocument } from "../FollowDocument/followDocument";
import { FollowDocumentBulk } from "../FollowDocumentBulk/followDocumentBulk";
import {
    ListViewCommandSetContext,
} from "@microsoft/sp-listview-extensibility";

export default class followDocumentDialog extends BaseDialog {
    public fileInfo: IFileProperties[] = [];
    public followTypeDialog: followType;
    public context: ListViewCommandSetContext;

    public async initialize(info: IFileProperties[], context: ListViewCommandSetContext, type: followType) {
        this.followTypeDialog = type;
        this.fileInfo = info;
        this.context = context;
        this.show();
    }

    public render(): void {
        let reactElement;
        switch (this.followTypeDialog) {
            case followType.FOLLOW:
                reactElement =
                    <FollowDocument
                        context={this.context}
                        fileInfo={this.fileInfo}
                        close={this.close}
                    />;
                break;
            case followType.BULKFOLLOW:
                reactElement =
                    <FollowDocumentBulk
                        context={this.context}
                        fileInfo={this.fileInfo}
                        close={this.close}
                    />;
                break;
            default:
                throw new Error("Unknown command");
        }
        ReactDOM.render(reactElement, this.domElement);

    }

    public getConfig(): IDialogConfiguration {
        return {
            isBlocking: false
        };
    }

}