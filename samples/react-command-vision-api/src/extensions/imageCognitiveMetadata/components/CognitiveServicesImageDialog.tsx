import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import { ICognitiveServicesImage } from '../ICognitiveServicesImage';
import CognitiveServicesImageDialogContent from './CognitiveServicesImageDialogContent';

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