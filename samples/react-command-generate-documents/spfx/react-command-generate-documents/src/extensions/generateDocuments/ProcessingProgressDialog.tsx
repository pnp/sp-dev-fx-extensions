import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import {
  ProgressIndicator,
  DialogContent
} from 'office-ui-fabric-react';

interface IProcessingProgressDialogContentProps {
  message: string;
  title: string;
  totalNumberOfDocs: number;
}
interface IProcessingProgressDialogContentState {
  currentNumberOfDocs: number;
}
class ProcessingProgressDialogContent extends React.Component<IProcessingProgressDialogContentProps, IProcessingProgressDialogContentState> {
  constructor(props) {
    super(props);
    this.state = { currentNumberOfDocs: 0 };
  }
  public incrementCount() {
    this.setState((current) => ({ ...current, currentNumberOfDocs: current.currentNumberOfDocs + 1 }));
  }
  public render(): JSX.Element {

    return <DialogContent
      title={this.props.title}
      showCloseButton={true}    >
      <div>
        {this.props.message}
        <ProgressIndicator
          percentComplete={this.state.currentNumberOfDocs / this.props.totalNumberOfDocs}
          barHeight={10}   >
        </ProgressIndicator>
      </div>
    </DialogContent>;

  }
}
export default class ProcessingProgressDialog extends BaseDialog {
  public message: string;
  public title: string;
  public Process: () => Promise<void>;
  public totDocs: number;
  public currDocs: number;
  public component: any;
  public render(): void {
    debugger;
    this.component = ReactDOM.render(<ProcessingProgressDialogContent
      message={this.message}
      title={this.title}
      totalNumberOfDocs={this.totDocs}
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