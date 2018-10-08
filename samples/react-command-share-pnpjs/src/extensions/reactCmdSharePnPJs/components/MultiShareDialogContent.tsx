import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import {
  autobind,
  PrimaryButton,
  TextField,
  Dropdown,
  IDropdownOption,
  DialogContent,
  IBasePickerSuggestionsProps,
  IContextualMenuItem,
  IPersonaProps,
  MessageBarType,
  Spinner,
  MessageBar,
  NormalPeoplePicker,
  Checkbox,
} from 'office-ui-fabric-react';
import * as strings from  'ReactCmdSharePnPJsCommandSetStrings';
import { sp, SharingRole, SharingEmailData, SharingResult, Item } from '@pnp/sp';
import { MultiShareHelper } from '../MultiShareHelper';

export interface IMultiShareDialogContentProps {
    listItems: Item[];
    close: () => void;
}

export interface IMultiShareDialogContentState {
    selectedPeople?: any;
    isLoadingPeople?: boolean;
    shareResult?: any;
    result?: any;
    sharingLevel?: number;
    isChecked?: boolean;
    emailBody?: string;
    isLoading?: boolean;
  }

export default class MultiShareDialogContent extends React.Component<IMultiShareDialogContentProps, IMultiShareDialogContentState> {
    private _peopleList;
    private _listItems;
    private contextualMenuItems: IContextualMenuItem[] = [];
    private suggestionProps: IBasePickerSuggestionsProps = {
      suggestionsHeaderText: strings.MultiShareDialogSuggested,
      noResultsFoundText: strings.MultiShareDialogNoResults,
      loadingText: strings.MultiShareDialogLoading,
      searchForMoreText: strings.MultiShareDialogSearch
    };
    
    constructor(props) {
        super(props);

        this._listItems = this.props.listItems;
        this._peopleList = null;

        this.state = {
            selectedPeople: [],
            isLoadingPeople: true,
            sharingLevel: SharingRole.View,
            isChecked: false,
            isLoading: false
        };
            
      }

      public render(): JSX.Element {
          return(
              <div>
                  <DialogContent
                    title={ strings.MultiShareDialogTitle }
                    subText={ strings.MultiShareDialogDescription }
                    onDismiss={ this.props.close }
                    showCloseButton={ true }
                    >
                    <div>
                      {!this.state.shareResult && this.state.isLoading &&
                          <Spinner label={ strings.MultiShareDialogSharingItems } />
                        }
                        {this.state.shareResult &&
                          <MessageBar
                            messageBarType={this.state.shareResult.type}
                            isMultiline={true}>
                            {this.state.shareResult.text}
                          </MessageBar>
                        }
                        <br/>
                        <NormalPeoplePicker
                          onResolveSuggestions={this._onFilterChanged}
                          getTextFromItem={(persona: IPersonaProps) => persona.primaryText}
                          pickerSuggestionsProps={this.suggestionProps}
                          key={'normal'}
                          onChange={this._onSelectionChanged}
                        />
                        <br />
                        <div>
                          <Dropdown label={ strings.MultiShareDialogSelectShareType } 
                            options={[
                              { key: SharingRole.View, text: strings.MultiShareDialogReadRole },
                              { key: SharingRole.Edit, text: strings.MultiShareDialogEditRole },
                            ]}
                            selectedKey={this.state.sharingLevel}
                            onChanged={this._dropDownSelected}
                          />
                          <br/>
                          <TextField
                            placeholder={ strings.MultiShareDialogAddMessageHere }
                            multiline
                            resizable={false}
                            onChanged={(text) => this.setState({ emailBody: text })}
                            disabled={!(this.state.isChecked)}
                          />
                          <br/>
                          <Checkbox
                            label={ strings.MultiShareDialogSendEmail }
                            checked={this.state.isChecked}
                            onChange={(ev, checked) => this.setState({ isChecked: checked })} />
                        </div>
                        <br/>
                          <PrimaryButton
                            onClick={() => { this._shareItemsWithPeople(this._listItems, this.state.selectedPeople, this.state.sharingLevel, this.state.isChecked, this.state.emailBody); }}
                            disabled={(!(this.state.selectedPeople.length > 0))}>
                            { strings.MultiShareDialogShare }
                          </PrimaryButton>
                          <br />
                          <br />

                        {
                          this.state.result &&
                          <MessageBar
                            messageBarType={this.state.result.type}>
                            {this.state.result.text}
                          </MessageBar>
                        }
                      </div>
                    </DialogContent>
              </div>
          );
      }

  @autobind
  private _onSelectionChanged(items) {
    this.setState({
      result: null,
      selectedPeople: items,
      shareResult: null
    });
  }

  @autobind
  private _onFilterChanged(filterText: string, currentPersonas: IPersonaProps[], limitResults?: number) {
    // Check of users already has been collected from SharePoint
    if (this._peopleList) {
      if (filterText) {
        // filter user suggestions based on people picker input
        let filteredPersonas: IPersonaProps[] = MultiShareHelper.filterPersonasByText(filterText, this._peopleList);
        // remove user from suggestions if already chosed in people picker
        filteredPersonas = MultiShareHelper.removeDuplicates(filteredPersonas, currentPersonas);
        return filteredPersonas;
      }
      else {
        return [];
      }
    } else {
      return new Promise((resolve, reject) => 
        // Get site users from SharePoint
        this._getUsers()
          .then((r: any) => {
            let users: any = r;
            // Map users to personas and add to peoplelist (suggestions)
            this._peopleList = MultiShareHelper.mapUsersToPersonas(users, false, this.contextualMenuItems);
            resolve(this._peopleList);
          }))
        .then((value: any) => {
          // filter user suggestions based on people picker input
          let filteredPersonas: IPersonaProps[] = MultiShareHelper.filterPersonasByText(filterText, this._peopleList);
          // remove user from suggestions if already chosed in people picker
          filteredPersonas = MultiShareHelper.removeDuplicates(value, currentPersonas);
          return filteredPersonas;

        });
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
  private _shareItemsWithPeople(listItems: any, selectedPeople: any, sharingLevel: any, isChecked: boolean, emailBody: string) {
    this.setState({
      isLoading: true
    })
    // Get login names for users  
    let users = selectedPeople.map((p: IPersonaProps) => p.tertiaryText);
    // Include "includeAnonymousLinkInEmail = false" is only thing thats working in the share
    let requireSignin = false;
    // If send email is checked, use emailtext from textfield as body, else set to empty string
    let emailData: SharingEmailData = { body: isChecked ? emailBody : '' };

    var promises = [];
    // Push promise returned by shareWith to array
    listItems.forEach(item => {
      promises.push(sp.web.getFileByServerRelativeUrl(item.getValueByName('FileRef')).shareWith(users, sharingLevel, requireSignin, emailData));
    });

    // When all promises are done, handle sharingresult
    Promise.all(promises).then((results: SharingResult[]) => {
      let responses = results;
      let returnObj = { textStr: '', messageBarType: null };
      
      // If any response contains other statuscode than 0
      if (responses.some(a => a.StatusCode != 0)) {
        
        // get those responses 
        let errorObjs = responses.filter(a => a.StatusCode != 0);
        
        // Setup strings for messagebar
        returnObj.textStr = strings.MultiShareDialogSharingError;
        returnObj.textStr += errorObjs.map(a => a.Name).join(', ');
        returnObj.textStr += strings.MultiShareDialogSharingErrorMsgs;
        returnObj.textStr += errorObjs.map(a => a.ErrorMessage).join(' | ');
        returnObj.messageBarType = MessageBarType.error;
      }

      // If successful
      else {
        // Setup strings for messagebar
        returnObj.textStr = strings.MultiShareDialogSharingSuccess;
        returnObj.textStr += responses.map(a => a.Name).join(', ');
        returnObj.messageBarType = MessageBarType.success;
      }

      // Set state with messagebar strings, so messagebar is shown
      // And hide spinner
      this.setState({
        shareResult: {
          type: returnObj.messageBarType,
          text: returnObj.textStr
        },
        isLoading: false
      });

      // Wait 2 seconds, then close dialog (parent)
      setTimeout(() => this.props.close(), 3000);
    }).catch(() => this.setState({
      isLoading: false
    }));
  }

// Get site users and only get "real users" by filtering
private _getUsers() {
  return sp.web.siteUsers.filter("PrincipalType eq 1 and UserId/NameIdIssuer eq 'urn:federation:microsoftonline'").get();
}
  
}


