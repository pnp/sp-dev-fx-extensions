import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';

import TemplateBuilderDialogContent from './TemplateBuilderDialogContent';

export default class TemplateBuilderDialog extends BaseDialog {


  public render(): void {
    
    ReactDOM.render(<TemplateBuilderDialogContent 
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

