import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog } from '@microsoft/sp-dialog';
import MultiShareDialogContent from './MultiShareDialogContent';
import { RowAccessor } from '@microsoft/sp-listview-extensibility';

class MultiShareDialog extends BaseDialog {
  public listItems: ReadonlyArray<RowAccessor>;

  public render(): void {
    ReactDOM.render(<MultiShareDialogContent
      listItems={this.listItems}
      close={this.close}
    />, this.domElement);
  }
}

export {
  MultiShareDialog
};
