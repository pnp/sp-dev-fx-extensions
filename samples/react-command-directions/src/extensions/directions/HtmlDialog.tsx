import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import {
  autobind,
  PrimaryButton,
  Button,
  DialogFooter
} from 'office-ui-fabric-react';
import { DialogContent } from '@microsoft/sp-dialog';

interface IHtmlDialogContentProps {
  title: string;
  message: string;
  html: string;
  closeText: string;
  close: () => void;
}

class HtmlDialogContent extends React.Component<IHtmlDialogContentProps, {}> {
  constructor(props) {
    super(props);
  }

  public render(): JSX.Element {
    return <DialogContent
      title={this.props.title}
      subText={this.props.message}
      onDismiss={this.props.close}
      showCloseButton={true}
    >
      <div dangerouslySetInnerHTML={{__html: this.props.html}} />
      <DialogFooter>
        <PrimaryButton text={this.props.closeText} title={this.props.closeText} onClick={() => { this.props.close(); }} />
      </DialogFooter>
    </DialogContent>;
  }
}

export default class HtmlPickerDialog extends BaseDialog {
  constructor(private dialogTitle: string, private dialogMessage: string, private html: string, private closeButtonText: string) {
      super();
  }

  public render(): void {
    ReactDOM.render(<HtmlDialogContent
      title={ this.dialogTitle }
      message={ this.dialogMessage }
      html={ this.html }
      closeText={ this.closeButtonText }
      close={ this.close }
    />, this.domElement);
  }

  public getConfig(): IDialogConfiguration {
    return {
      isBlocking: true
    };
  }
}