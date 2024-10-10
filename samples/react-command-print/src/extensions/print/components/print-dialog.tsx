import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog } from '@microsoft/sp-dialog';
import PrintDialogContent from './print-dialog-content/print-dialog-content';

class PrintDialog extends BaseDialog {
    close: () => void;
    domElement: HTMLElement;
    public webUrl: string;
    public listId: string;
    public itemId: number;
    public title: string;

    public render(): void {
        // Render the React component into the dialog
        ReactDOM.render(
            <PrintDialogContent
                close={this.close}
                webUrl={this.webUrl}
                listId={this.listId}
                itemId={this.itemId}
                title={this.title}
            />,
            this.domElement as HTMLElement
        );
    }

    // Override show() if needed, but it should be available in BaseDialog
    public show(): Promise<void> {
        return super.show();
    }
}

export { PrintDialog };
