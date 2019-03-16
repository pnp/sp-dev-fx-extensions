import * as React from 'react';
import {
  Dialog,
  DialogFooter,
  DefaultButton,
  PrimaryButton,
  ChoiceGroup,
  DialogType,
  TextField,
  Dropdown,
  Spinner,
  SpinnerSize,
  Label
}
  from 'office-ui-fabric-react';

import * as strings from 'ModernPageProvisioningCommandSetStrings';
import { TemplateBuilderHelper } from './TemplateBuilderHelper'
import { sp as sp } from "@pnp/sp";
import { setup as pnpSetup } from "@pnp/common";


import "./TemplateBuilderDialog.module.scss";
import { SPPermission } from '@microsoft/sp-page-context';

export interface ITemplateBuilderDialogContentState {
  hideDialog: boolean;
  optionSelected: string;
  newPageName: string;
  selectedItem?: { key: string | number | undefined };
  selectedItems: string[];
  allItems: any[];
  isLoading: boolean;
  creationDone: boolean;
}

export interface ITemplateBuilderDialogContentProps {
  close: () => void;
}


export default class TemplateBuilderDialogContent extends React.Component<ITemplateBuilderDialogContentProps, ITemplateBuilderDialogContentState> {

  constructor(props: ITemplateBuilderDialogContentProps) {
    super(props);
    this.state = {
      hideDialog: false,
      optionSelected: 'A',
      newPageName: "",
      selectedItem: null,
      selectedItems: null,
      allItems: null,
      isLoading: false,
      creationDone: false
    };
    sp.web.lists.getByTitle("Site Pages").items.filter("Is_x0020_Template eq 1").select("Title,FileRef").getAll().then((items: any[]) => {
      var tmpItems: any[] = new Array();

      items.forEach(element => {
        var item = { key: element["FileRef"], text: element["Title"] };
        tmpItems.push(item);
      });

      this.setState({ allItems: tmpItems })
    });
  }


  public render() {

    return (
      <div>
        <Dialog
          hidden={this.state.hideDialog}

          onDismiss={this._closeDialog}
          dialogContentProps={{
            type: DialogType.largeHeader,
            title: "Modern Page Template with PnP/PnPjs"
          }}

          modalProps={{
            isBlocking: false,
            containerClassName: 'ms-dialogMainOverride'
          }}
        >
          {!this.state.creationDone && (
            <div>
              <ChoiceGroup
                label="Pick one icon"
                options={[
                  {
                    key: 'A',
                    iconProps: { iconName: 'FitWidth' },
                    text: 'Custom Page',
                    checked: this.state.optionSelected === 'A'
                  },
                  {
                    key: 'B',
                    iconProps: { iconName: 'SearchAndApps' },
                    text: 'From Template',
                    checked: this.state.optionSelected === 'B'
                  }
                ]}
                onChange={this._onChange}
                required={true}
                disabled={this.state.isLoading}
              />
              <TextField label="Page name" value={this.state.newPageName} onChanged={this._onChangeNewPageName} placeholder="Insert page name"
                readOnly={this.state.isLoading}
              />

              {this.state.optionSelected === 'A' && (
                <div>
                  <h1>Description</h1>
                  <div>
                    {' '}
                    This is a prefilled coded template using pnpjs ClientSidePage class {' '}
                  </div>
                </div>
              )}
              {this.state.optionSelected === 'B' && (
                <div>
                  <h1>Description</h1>
                  <div>
                    {' '}
                    <Dropdown
                      label="Page Templates"
                      selectedKey={this.state.selectedItem ? this.state.selectedItem.key : undefined}
                      placeholder="Select an Option"
                      onChanged={this.changeState}
                      options={this.state.allItems}
                      disabled={this.state.isLoading}
                    />

                    {' '}
                  </div>
                </div>
              )}
              {!this.state.isLoading && (<div>
                <DialogFooter>
                  <PrimaryButton onClick={this._executeAction} text="Go!" />
                  <DefaultButton onClick={this._closeDialog} text="Cancel" />
                </DialogFooter>
              </div>)}
            </div>

          )}
          <Spinner size={SpinnerSize.large} label="Please, wait.." ariaLive="assertive" hidden={!this.state.isLoading} />
          {this.state.creationDone && (
            <div>
              <Label>Done!</Label>
              <DialogFooter>
                <PrimaryButton onClick={this._closeDialog} text="Close" />
              </DialogFooter>
            </div>
          )}
        </Dialog>
      </div>
    );
  }

  public changeState = (evt: any): void => {
    this.setState({ selectedItem: evt });
  };


  private _executeAction = (): void => {
    this.setState({ isLoading: true });
    var resu: Promise<string> = TemplateBuilderHelper.createCustomPage(this.state.newPageName, this.state.optionSelected, this.state.selectedItem.key);
    resu.then(ss => {
      console.log(ss);
      this.setState({ isLoading: false, creationDone: true });
    });
  }

  private _onChangeNewPageName = (tmpPageName: any): void => {
    this.setState({ newPageName: tmpPageName })
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