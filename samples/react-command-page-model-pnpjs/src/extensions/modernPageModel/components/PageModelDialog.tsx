import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';

import PageModelDialogContent from './PageModelDialogContent';

export default class PageModelDialog extends BaseDialog {


  public render(): void {
    
    ReactDOM.render(<PageModelDialogContent 
      close={ this.close.bind(this) }

    />, this.domElement);

  }

  public getConfig(): IDialogConfiguration {
    return {
      isBlocking: false
    };
  }

  public close(): Promise<void> {

    return super.close();

  }
 
  protected onAfterClose(): void {
    super.onAfterClose();
    super.close();
    // Clean up the element for the next dialog
    ReactDOM.unmountComponentAtNode(this.domElement);
    
  }
 


}

