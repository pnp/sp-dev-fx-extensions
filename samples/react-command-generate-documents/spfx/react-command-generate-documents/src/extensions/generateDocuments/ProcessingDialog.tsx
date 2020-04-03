import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import {
  ColorPicker,
  PrimaryButton,
  Button,
  DialogFooter,
  DialogContent
} from 'office-ui-fabric-react';
interface IProcessingDialogContentProps {
    message: string;
    title:string;
  }
  class ProcessingDialogContent extends React.Component<IProcessingDialogContentProps, {}> {
      public render(): JSX.Element {
      return <DialogContent
        title={this.props.title}
        showCloseButton={true}
      >
    <div>{this.props.message}</div>
      </DialogContent>;
    }
  }
  export default class ProcessingDialog extends BaseDialog {
    public message: string;
    public title: string;
    public Process :()=> Promise<void>;
    public render(): void {
      ReactDOM.render(<ProcessingDialogContent
        message={ this.message }
        title={ this.title }
     
      />, this.domElement);

      this.Process();
    }
  
    public getConfig(): IDialogConfiguration {
      return {
        isBlocking: true
      };
    }
    
    protected onAfterClose(): void {
      super.onAfterClose();
      // Clean up the element for the next dialog
      ReactDOM.unmountComponentAtNode(this.domElement);
    }
  
 
  }