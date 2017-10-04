import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import {
  autobind,
  DatePicker,
  PrimaryButton,
  Button,
  DialogFooter,
  DialogContent
} from 'office-ui-fabric-react';

interface ITenantScheduleDialogContentProps {
    message: string;
    close: () => void;
    submit: (meetingDate: Date) => void;
    defaultDate?: Date;
}

class TenantScheduleDialogContent extends React.Component<ITenantScheduleDialogContentProps, {}> {
    private _pickedDate: Date;
  
    constructor(props) {
      super(props);
      // Default Date
      this._pickedDate = props.defaultDate;
    }
  
    public render(): JSX.Element {
        return <DialogContent
        title='Setup Discussion'
        subText={this.props.message}
        onDismiss={this.props.close}
        showCloseButton={true}
        >
        <DatePicker value={this._pickedDate} onSelectDate={this._onSelectDate} />
        <DialogFooter>
            <Button text='Cancel' title='Cancel' onClick={this.props.close} />
            <PrimaryButton text='OK' title='OK' onClick={() => { this.props.submit(this._pickedDate); }} />
        </DialogFooter>
        </DialogContent>;
    }

    @autobind
    private _onSelectDate(meetingDate: Date): void {
        this._pickedDate = meetingDate;
    }
}

export default class TenantScheduleDialog extends BaseDialog {
    public message: string;
    public meetingDate: Date;
  
    public render(): void {
      ReactDOM.render(<TenantScheduleDialogContent
        close={ this.close }
        message={ this.message }
        defaultDate={ this.meetingDate }
        submit={ this._submit }
      />, this.domElement);
    }
  
    public getConfig(): IDialogConfiguration {
      return {
        isBlocking: false
      };
    }
  
    @autobind
    private _submit(meetingDate: Date): void {
      this.meetingDate = meetingDate;
      this.close();
    }
}