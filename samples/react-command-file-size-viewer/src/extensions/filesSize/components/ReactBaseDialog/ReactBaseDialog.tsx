import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
// Note: DialogContent is available in v2.32.0 of office-ui-fabric-react
// As a workaround we're importing it from sp-dialog until the next version bump
import { DialogContent } from '@microsoft/sp-dialog';

import { FileSizeViewer } from "../../components/FileSizeViewer/FileSizeViewer";
// import { data } from "../../data/data";


export default class ReactBaseDialog extends BaseDialog {
  public data: any;

  public render(): void {
    const reactElement =
      <DialogContent
        title="File Size Viewer"
        showCloseButton={true}
        onDismiss={this.close}
      >
        <FileSizeViewer
          data={this.data}
        />
      </DialogContent>;

    ReactDOM.render(reactElement, this.domElement);
  }

  public getConfig(): IDialogConfiguration {
    return {
      isBlocking: false
    };
  }

}
