import * as React from 'react';
import {
  autobind,
  PrimaryButton,
  TextField,
  Dropdown,
  IDropdownOption,
  DialogContent,
  IBasePickerSuggestionsProps,
  IPersonaProps,
  MessageBarType,
  Spinner,
  MessageBar,
  NormalPeoplePicker,
  Checkbox,
  DialogFooter,
} from 'office-ui-fabric-react';

import { sp, SharingRole, SharingEmailData, SharingResult } from '@pnp/sp';
import { MultiShareHelper } from '../MultiShareHelper';
import { RowAccessor } from '@microsoft/sp-listview-extensibility';

import * as strings from 'ReactCmdSharePnPJsCommandSetStrings';
import styles from './MultiShareDialog.module.scss';

export interface IMultiShareDialogContentProps {
  listItems: ReadonlyArray<RowAccessor>;
  close: () => void;
}

export interface IMultiShareDialogContentState {
  externalUsers: any;
  selectedPeople: any;
  isLoadingPeople: boolean;
  shareResult: any;
  result: any;
  sharingLevel: number;
  isChecked: boolean;
  emailBody: string;
  isLoading: boolean;
  isExternal: boolean;
}

export default class MultiShareDialogContent extends React.Component<IMultiShareDialogContentProps, IMultiShareDialogContentState> {
  private _peopleList;
  private _listItems: ReadonlyArray<RowAccessor>;

  private suggestionProps: IBasePickerSuggestionsProps = {
    suggestionsHeaderText: strings.MultiShareDialogSuggested,
    noResultsFoundText: strings.MultiShareDialogNoResults,
    loadingText: strings.MultiShareDialogLoading,
  };

  constructor(props) {
    super(props);

    this._listItems = this.props.listItems;
    this._peopleList = null;

    this.state = {
      externalUsers: [],
      selectedPeople: [],
      isLoadingPeople: true,
      shareResult: null,
      result: null,
      sharingLevel: SharingRole.View,
      isChecked: false,
      isLoading: false,
      emailBody: null,
      isExternal: false,
    };

  }

  public render(): JSX.Element {
    return (
      <div className={styles.multiShareDialog}>
        <DialogContent
          title={strings.MultiShareDialogTitle}
          subText={strings.MultiShareDialogDescription}
          onDismiss={this.props.close}
          showCloseButton={true}
        >
          <div className={styles.multiShareDialogContent}>
            <div className="ms-Grid">

              {!this.state.shareResult && this.state.isLoading &&
                <div className="ms-Grid-row">
                  <div className="ms-Grid-col ms-u-sm12 ms-u-md12 ms-u-lg12">
                    <Spinner label={strings.MultiShareDialogSharingItems} />
                  </div>
                </div>
              }

              {this.state.shareResult &&
                <div className="ms-Grid-row">
                  <div className="ms-Grid-col ms-u-sm12 ms-u-md12 ms-u-lg12">
                    <MessageBar
                      messageBarType={this.state.shareResult.type}
                      isMultiline={true}>
                      {this.state.shareResult.text}
                    </MessageBar>
                  </div>
                </div>
              }

              <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-u-sm12 ms-u-md12 ms-u-lg12">
                  <NormalPeoplePicker
                    className={'peoplePicker'}
                    onResolveSuggestions={this._onFilterChanged}
                    getTextFromItem={(persona: IPersonaProps) => persona.primaryText}
                    pickerSuggestionsProps={this.suggestionProps}
                    key={'normal'}
                    onChange={this._onSelectionChanged}
                  />
                </div>
              </div>

              {this.state.isExternal &&
                <div className="ms-Grid-row">
                  <div className="ms-Grid-col ms-u-sm12 ms-u-md12 ms-u-lg12">
                    <MessageBar
                      messageBarType={MessageBarType.info}
                      isMultiline={true}>
                      {this.state.externalUsers.map(e => e.primaryText).join(', ').replace(/,(?!.*,)/gmi, ' and')}
                      {this.state.externalUsers.length === 1 ? strings.MultiShareDialogExternalUser : strings.MultiShareDialogExternalUsers}
                    </MessageBar>
                  </div>
                </div>
              }

              <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-u-sm12 ms-u-md12 ms-u-lg12">
                  <Dropdown
                    label={strings.MultiShareDialogSelectShareType}
                    options={[
                      { key: SharingRole.View, text: strings.MultiShareDialogReadRole },
                      { key: SharingRole.Edit, text: strings.MultiShareDialogEditRole },
                    ]}
                    selectedKey={this.state.sharingLevel}
                    onChanged={this._dropDownSelected}
                  />
                </div>
              </div>
              <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-u-sm12 ms-u-md12 ms-u-lg12">
                  <TextField
                    placeholder={strings.MultiShareDialogAddMessageHere}
                    multiline
                    resizable={false}
                    onChanged={(text) => this.setState({ emailBody: text })}
                    disabled={!(this.state.isChecked)}
                  />
                </div>
              </div>
              <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-u-sm12 ms-u-md12 ms-u-lg12">
                  <Checkbox
                    label={strings.MultiShareDialogSendEmail}
                    checked={this.state.isChecked}
                    onChange={(ev, checked) => this.setState({ isChecked: checked })} />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <PrimaryButton
              onClick={async () => {
                await this._shareItemsWithPeople(this._listItems, this.state.selectedPeople,
                  this.state.sharingLevel, this.state.isChecked, this.state.emailBody);
              }}
              disabled={(!(this.state.selectedPeople.length > 0))}>
              {strings.MultiShareDialogShare}
            </PrimaryButton>

            {this.state.result &&
              <MessageBar
                messageBarType={this.state.result.type}>
                {this.state.result.text}
              </MessageBar>
            }
          </DialogFooter>
        </DialogContent>
      </div>
    );
  }

  @autobind
  private _onSelectionChanged(items) {
    // Get external users from the chosen in the peoplepicker
    const ext = items.filter(i => (i.secondaryText === "External"));

    this.setState({
      externalUsers: ext ? ext : null,
      result: null,
      selectedPeople: items,
      shareResult: null,
      isExternal: ext.length > 0,
    });
  }

  @autobind
  private async _onFilterChanged(filterText: string, currentPersonas: IPersonaProps[]) {
    // Check of users already has been collected from SharePoint
    if (this._peopleList) {
      if (filterText) {
        return MultiShareHelper.setupFilteredPersonas(filterText, currentPersonas, this._peopleList);
      }
      else {
        return [];
      }
    } else {
      const users = await this._getUsers();
      this._peopleList = MultiShareHelper.mapUsersToPersonas(users);

      return MultiShareHelper.setupFilteredPersonas(filterText, currentPersonas, this._peopleList);
    }
  }

  @autobind
  private _dropDownSelected(option: IDropdownOption) {
    this.setState({ sharingLevel: +option.key });
  }

  @autobind
  private _showError(err) {
    this.setState({
      result: {
        type: MessageBarType.error,
        text: `Error ${err.statusCode}: ${err.code} - ${err.message}`
      }
    });
  }

  @autobind
  private async _shareItemsWithPeople(listItems: any, selectedPeople: any, sharingLevel: any, isChecked: boolean, emailBody: string) {
    try {
      this.setState({
        isLoading: true
      });
      // Get login names for users  
      const users = selectedPeople.map((p: IPersonaProps) => p.tertiaryText);
      const requireSignin = false;
      const emailData: SharingEmailData = { body: isChecked ? emailBody : '' };
     
      const sharingResults: SharingResult[] = []; 
      // Push sharingResults returned by shareWith to array
      for (const item of listItems) {
        switch (item.getValueByName('FSObjType')) {
          case "1": {
            sharingResults.push(await sp.web.getFolderByServerRelativePath(item.getValueByName('FileRef')).shareWith(users, sharingLevel, requireSignin, true, emailData));
            
            break;
          } case "0": {

            sharingResults.push(await sp.web.getFileByServerRelativeUrl(item.getValueByName('FileRef')).shareWith(users, sharingLevel, requireSignin, emailData));
            break;
          }
        }
      }

      // Setup messagebar and hide Spinner
      const messageBarResult = MultiShareHelper.setupSharingMessageBar(sharingResults, strings);
      this.setState({
        shareResult: {
          type: messageBarResult.barType,
          text: messageBarResult.text,
        },
        isLoading: false
      });

      // Wait 3 seconds, then close dialog (parent)
      setTimeout(() => this.props.close(), 3000);

    } catch (error) {
      
      this._showError(error);
      this.setState({
        isLoading: false
      });
    }
  }

  // Get site users and only get "real users" by filtering
  private async _getUsers() {
    try {
      return await sp.web.siteUsers.filter("PrincipalType eq 1 and UserId/NameIdIssuer eq 'urn:federation:microsoftonline'").get();

    } catch (error) {
      this._showError(error);
    }
  }

}
