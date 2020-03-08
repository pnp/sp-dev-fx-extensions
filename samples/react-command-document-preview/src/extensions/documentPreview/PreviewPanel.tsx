import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import { IFramePanel } from "@pnp/spfx-controls-react/lib/IFramePanel";

export interface IPreviewPanelProps {
    URL: string;
    Title: string;
    FileType: string;
    close: () => void;
}

class PreviewPanelContent extends React.Component<IPreviewPanelProps, {}> {
    constructor(props) {
        super(props);
    }

    public render(): JSX.Element {        
        return (            
            <IFramePanel url={this.props.URL}
                type={6}
                headerText={this.props.Title}
                closeButtonAriaLabel="Close"
                isOpen={true}
                onDismiss={this.props.close}
            />
        );
    }
}

export default class PreviewPanel extends BaseDialog {
    public url: string;
    public filename: string;
    public filetype: string;
    public render(): void {
        ReactDOM.render(<PreviewPanelContent
            close={this.close}
            Title={this.filename}
            URL={this.url}
            FileType={this.filetype}
        />, this.domElement);
    }

    public getConfig(): IDialogConfiguration {
        return {
            isBlocking: false
        };
    }

    protected onAfterClose(): void {
        super.onAfterClose();
        // Clean up the element for the next dialog
        ReactDOM.unmountComponentAtNode(this.domElement);
    }
}