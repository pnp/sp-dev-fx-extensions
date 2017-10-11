import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import {
  autobind,
  DatePicker,
  PrimaryButton,
  CommandButton,
  TextField,
  Label,
  Dropdown,
  DropdownMenuItemType,
  IDropdownOption,
  DialogFooter,
  DialogContent
} from 'office-ui-fabric-react';

import { DateTimePicker } from './DateTimePicker';
import { ExtensionContext } from '@microsoft/sp-extension-base';
import { GraphHttpClient, GraphHttpClientResponse, IGraphHttpClientOptions } from '@microsoft/sp-http';
import { Dialog } from '@microsoft/sp-dialog';

import styles from './ScheduleMeetingDialog.module.scss';
import * as strings from 'DiscussNowCommandSetStrings';

interface IScheduleMeetingDialogContentProps {
  fileName: string;
  filePath: string;
  close: () => void;
  submit: (subject: string, meetingDateTime: Date, duration: number) => void;
}

interface IScheduleMeetingDialogContentState {
  subject: string;
  dateTime: Date;
  duration: number;
}

class ScheduleMeetingDialogContent extends 
  React.Component<IScheduleMeetingDialogContentProps, IScheduleMeetingDialogContentState> {

    constructor(props) {
      super(props);

      this.state = {
        subject: this.props.fileName,
        dateTime: new Date(),
        duration: 60
      };
    }
  
    public render(): JSX.Element {
      return (<div className={ styles.scheduleMeetingDialogRoot }>
        <DialogContent
          title={ strings.DiscussNowDialogTitle }
          subText={ strings.DiscussNowDialogDescription }
          onDismiss={ this.props.close }
          showCloseButton={ true }
          >

          <div className={ styles.scheduleMeetingDialogContent }>
            <div className="ms-Grid">
              <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-u-sm12 ms-u-md12 ms-u-lg12">
                  <TextField 
                    label={ strings.ScheduleMeetingSubjectLabel } 
                    required={ true } 
                    value={ this.state.subject }
                    onChanged={ this._onChangedSubject }
                    onGetErrorMessage={ this._getErrorMessageSubject }
                  />
                </div>
              </div>
              <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-u-sm12 ms-u-md12 ms-u-lg12">
                  <DateTimePicker
                    showTime={ true }                
                    includeSeconds={ false }
                    isRequired={ true } 
                    dateLabel={ strings.ScheduleMeetingDateLabel }
                    hoursLabel={ strings.ScheduleMeetingHoursLabel }
                    hoursValidationError={ strings.ScheduleMeetingHoursValidationError }
                    minutesLabel={ strings.ScheduleMeetingMinutesLabel }
                    minutesValidationError={ strings.ScheduleMeetingMinutesValidationError }
                    onChanged={ this._onChangedScheduledDateTime }
                  />
                </div>
              </div>
              <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-u-sm12 ms-u-md12 ms-u-lg12">
                  <Dropdown
                    label={ strings.ScheduleMeetingDurationLabel }
                    defaultSelectedKey='60'
                    options={
                      [
                        { key: '30', text: '30 minutes' },
                        { key: '60', text: '1 hour' },
                        { key: '90', text: '1 hour and 30 minutes' },
                        { key: '120', text: '2 hours' },
                      ]
                    }
                    onChanged={ this._onChangedScheduleDuration }
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
              <CommandButton text='Cancel' title='Cancel' onClick={ this.props.close } />
              <PrimaryButton text='OK' title='OK' onClick={() => { this.props.submit(this.state.subject, this.state.dateTime, this.state.duration); }} />
          </DialogFooter>
        </DialogContent>
      </div>);
    }

    @autobind
    private _onChangedSubject(newValue: string): void {
      this.setState({
        subject: newValue,
      });
    }

    private _getErrorMessageSubject(value: string): string {
      return (value == null || value.length == 0 || value.length >= 10)
        ? ''
        : `${strings.ScheduleMeetingSubjectValidationErrorMessage} ${value.length}.`;
    }

    @autobind
    private _onChangedScheduledDateTime(newValue: Date): void {
      this.setState({
        dateTime: newValue,
      });
    }

    @autobind
    private _onChangedScheduleDuration(option: IDropdownOption, index?: number): void {
      const duration: number = Number(option.key);

      this.setState({
        duration: duration
      });
    }
}

export default class ScheduleMeetingDialog extends BaseDialog {
    public fileName: string;
    public filePath: string;
    public context: ExtensionContext;
  
    public render(): void {
      ReactDOM.render(<ScheduleMeetingDialogContent
        fileName={ this.fileName }
        filePath={ this.filePath }
        close={ this.close }
        submit={ this._submit }
      />, this.domElement);
    }
  
    public getConfig(): IDialogConfiguration {
      return {
        isBlocking: false
      };
    }
  
    @autobind
    private _submit(subject: string, dateTime: Date, duration: number): void {

      // *******************************************
      // Schedule the meeting with Microsoft Graph
      // *******************************************

      const startDateTimeISO: string = dateTime.toISOString();

      // Calculate the end date time
      let addMinutes: number = 0;
      let addHours: number = 0;
      
      switch (duration){
        case 30:
          addMinutes = 30;
          break;
        case 60:
          addHours = 1;
          break;
        case 90:
          addHours = 1;
          addMinutes = 30;
          break;
        case 120:
          addHours = 2;
          break;
        default:
          break;
      }

      let endDateTime: Date = new Date(startDateTimeISO);
      endDateTime.setHours(dateTime.getHours() + addHours);
      endDateTime.setMinutes(dateTime.getMinutes() + addMinutes);
      
      const endDateTimeISO: string = endDateTime.toISOString();
      
      const groupId: string = this.context.pageContext.legacyPageContext.groupId;

      const newMeetingRequestOptions: IGraphHttpClientOptions = {
        body: `{
                "body": {
                  "content":"Let's discuss about this document: ${this.filePath}",
                  "contentType":"Text"
                },
                "subject": "${subject}",
                "start": {
                  "dateTime":"${startDateTimeISO}",
                  "timeZone":"UTC"
                },
                "end": {
                  "dateTime":"${endDateTimeISO}",
                  "timeZone":"UTC"
                }
              }`
      };

      let meetingCreated: boolean = false;

      this.context.graphHttpClient.post(`v1.0/groups/${groupId}/calendar/events`, GraphHttpClient.configurations.v1, newMeetingRequestOptions)
        .then((response: GraphHttpClientResponse) => {
          if (response.ok) {
            meetingCreated = true;
            return(response.json());
          } else {
            console.warn(response.statusText);
          }
        })
        .then((result: any) => {
          if (meetingCreated) {
            Dialog.alert(`Meeting "${result.subject}" has been successfully created.`);
          } else {
            Dialog.alert(`Failed to create meeting "${result.subject}"!`);
          }
        });

      this.close();
    }
}