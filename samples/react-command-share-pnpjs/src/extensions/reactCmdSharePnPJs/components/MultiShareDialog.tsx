import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import { Item } from '@pnp/sp';
import MultiShareDialogContent from './MultiShareDialogContent'


export default class MultiShareDialog extends BaseDialog {
    public listItems: any;
  
    public render(): void {
      ReactDOM.render(<MultiShareDialogContent
        listItems={ this.listItems }
        close={ this.close }
      />, this.domElement);
    }
  }