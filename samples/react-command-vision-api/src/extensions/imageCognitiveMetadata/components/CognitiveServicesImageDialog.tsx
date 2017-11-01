import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import { ICognitiveServicesImage } from '../ICognitiveServicesImage';

interface ICognitiveServicesImageDialogContentProps {
    cognitiveServicesImage: ICognitiveServicesImage;
    close: () => void;
}

class CognitiveServicesImageDialogContent extends React.Component<ICognitiveServicesImageDialogContentProps, {}> {
    
    constructor(props) {
        super(props);
    }

    public render(): JSX.Element {
        return (<div>
            {JSON.stringify(this.props.cognitiveServicesImage)}
        </div>);
    }
}

export default class CognitiveServicesImageDialog extends BaseDialog {
    public image: ICognitiveServicesImage;

    public render(): void {
        ReactDOM.render(<CognitiveServicesImageDialogContent
            cognitiveServicesImage={ this.image }
            close={ this.close }
          />, this.domElement);
    }

    public getConfig(): IDialogConfiguration {
        return {
            isBlocking: false
        };
    }
}