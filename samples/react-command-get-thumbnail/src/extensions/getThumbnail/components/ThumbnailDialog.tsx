import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import { ListViewCommandSetContext } from '@microsoft/sp-listview-extensibility';
import { ThumbnailDialogContent, IThumbnailDialogContentProps } from './ThumbnailDialogContent';

export class ThumbnailDialog extends BaseDialog {
  public data: any;
  public context: ListViewCommandSetContext;

  constructor(config: IDialogConfiguration) {
    super(config);

    this._close = this._close.bind(this);
  }

  private _close() {
    this.close();
    ReactDOM.unmountComponentAtNode(this.domElement);
  }

  public render(): void {
    const reactElement: React.ReactElement<IThumbnailDialogContentProps> = React.createElement(
      ThumbnailDialogContent,
      {
        data: this.data,
        context: this.context,
        close: this._close
      }
    );
    ReactDOM.render(reactElement, this.domElement);
  }
}