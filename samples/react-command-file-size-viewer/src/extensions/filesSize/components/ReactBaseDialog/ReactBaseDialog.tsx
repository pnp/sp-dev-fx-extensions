import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';

import FileSizeViewer from "../../components/FileSizeViewer/FileSizeViewer";
// import { data } from "../../data/data";


export default class ReactBaseDialog extends BaseDialog {
    public data: any;

    public render(): void {
        const reactElement =
            <FileSizeViewer
                data={this.data}
                close={this.close}
            />;

        ReactDOM.render(reactElement, this.domElement);
    }

    public getConfig(): IDialogConfiguration {
        return {
            isBlocking: false
        };
    }

}
