import * as React from 'react';
import {
  autobind,
  Dialog,
  DialogFooter,
  DefaultButton,
  PrimaryButton,
  ChoiceGroup,
  DialogType,
  TextField
}
  from 'office-ui-fabric-react';

import * as strings from 'ModernPageProvisioningCommandSetStrings';
import { ResponsiveMode } from 'office-ui-fabric-react/lib-es2015/utilities/decorators/withResponsiveMode';
import "./TemplateBuilderDialog.module.scss";

export interface ITemplateBuilderDialogContentState {
  hideDialog: boolean;
  optionSelected: string;
}

export interface ITemplateBuilderDialogContentProps {
  close: () => void;
}

export default class TemplateBuilderDialogContent extends React.Component<ITemplateBuilderDialogContentProps,ITemplateBuilderDialogContentState> {

  constructor(props: ITemplateBuilderDialogContentProps) {
    super(props);
    this.state = {
      hideDialog: false,
      optionSelected: 'A'
    };
  }

  public render() {
    return (
      <div>
        <Dialog 
          hidden={this.state.hideDialog}
          
          onDismiss={this._closeDialog}
          dialogContentProps={{ 
            type : DialogType.largeHeader,
            title: 'Choose a Layout ',
            subText: 'Please, select a model, type page title and proceed to create a Modern Page from Custom Layout'
          }}

          modalProps={{
            isBlocking: false,
            containerClassName: 'ms-dialogMainOverride'
          }}
          responsiveMode = {ResponsiveMode.large}
        >
          <ChoiceGroup
            label="Pick one icon"
            options={[
              {
                key: 'A',
                iconProps: { iconName: 'FitWidth' },
                text: 'Day',
                checked: this.state.optionSelected === 'A'
              },
              {
                key: 'B',
                iconProps: { iconName: 'ColumnRightTwoThirds' },
                text: 'Week',
                checked: this.state.optionSelected === 'B'
              },
              {
                key: 'C',
                iconProps: { iconName: 'ColumnLeftTwoThirds' },
                text: 'Month',
                checked: this.state.optionSelected === 'C'
              }
            ]}
            onChange={this._onChange}
            required={true}
            
          />
          <TextField label="Standard" />
          {this.state.optionSelected === 'A' && (
            <div>
              <h1>Description</h1>
              <div>
                {' '}
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
                dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                  proident, sunt in culpa qui officia deserunt mollit anim id est laborum.{' '}
              </div>
            </div>
          )}
          {this.state.optionSelected === 'B' && (
            <div>
              <h1>Description</h1>
              <div>
              {' '}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                proident, sunt in culpa qui officia deserunt mollit anim id est laborum.{' '}
              </div>
            </div>
          )}
          {this.state.optionSelected === 'C' && (
            <div>
              <h1>Description</h1>
              {' '}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                proident, sunt in culpa qui officia deserunt mollit anim id est laborum.{' '}
            </div>
          )}
          <DialogFooter>
            <PrimaryButton onClick={this._closeDialog} text="Save" />
            <DefaultButton onClick={this._closeDialog} text="Cancel" />
          </DialogFooter>
        </Dialog>
      </div>
    );
  }

  private _onChange = (ev: React.FormEvent<HTMLInputElement>, option: any): void => {
    this.setState({ optionSelected: option.key })
  };

  private _showDialog = (): void => {
    this.setState({ hideDialog: false })
  };

  private _closeDialog = (): void => {
    this.props.close();
    this.setState({ hideDialog: true })
    
  };

} 