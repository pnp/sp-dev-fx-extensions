import * as React from 'react';
import {
  BaseComponent,
  assign,
  autobind
} from 'office-ui-fabric-react/lib/Utilities';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { IPersonaProps } from 'office-ui-fabric-react/lib/Persona';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { css } from 'office-ui-fabric-react';
import {
  CompactPeoplePicker,
  IBasePickerSuggestionsProps,
  ListPeoplePicker,
  NormalPeoplePicker
} from 'office-ui-fabric-react/lib/Pickers';
import {
  Spinner,
  SpinnerSize
} from 'office-ui-fabric-react/lib/Spinner';
import {
  Dialog,
  DialogType,
  DialogFooter
} from 'office-ui-fabric-react/lib/Dialog';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Button } from 'office-ui-fabric-react/lib/Button';
import { IPersonaWithMenu } from 'office-ui-fabric-react/lib/components/pickers/PeoplePicker/PeoplePickerItems/PeoplePickerItem.Props';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';

import * as pnp from 'sp-pnp-js';
import { SharingEmailData, SharingRole, SharingResult } from 'sp-pnp-js';

export interface IInnerDialogState {
  selectedPeople?: any;
  isLoadingPeople?: boolean;
  shareResult?: any;
  result?: any;
  sharingLevel?: number
  isChecked?: boolean;
  emailBody?: string;
  isLoading?: boolean;
}

export interface IInnerDialogProps {
  listItems?: any;
  callbackParent?: any;
}

const suggestionProps: IBasePickerSuggestionsProps = {
  suggestionsHeaderText: 'Suggested People',
  noResultsFoundText: 'No results found',
  loadingText: 'Loading',
  searchForMoreText: 'Search'

};

export default class InnerDialogComponent extends React.Component<IInnerDialogProps, IInnerDialogState> {
  private _peopleList;
  private _searchResults;
  private _listItems;
  private contextualMenuItems: IContextualMenuItem[] = [
    {
      key: 'newItem',
      icon: 'circlePlus',
      name: 'New'
    },
    {
      key: 'upload',
      icon: 'upload',
      name: 'Upload'
    },
    {
      key: 'divider_1',
      name: '-',
    },
    {
      key: 'rename',
      name: 'Rename'
    },
    {
      key: 'properties',
      name: 'Properties'
    },
    {
      key: 'disabled',
      name: 'Disabled item',
      disabled: true
    }
  ];

  constructor(props: IInnerDialogProps) {
    super(props);

    this._listItems = this.props.listItems;
    this._peopleList = null
    this._searchResults = [];

    this.state = {
      selectedPeople: [],
      isLoadingPeople: true,
      sharingLevel: SharingRole.View,
      isChecked: false,
      isLoading: false
    };

  }

  private _getInitials(title) {
    let temp = title.split(/\s+/);
    let initials = '';
    temp.forEach(element => {
      initials += element.substr(0, 1, 'UTF-8');
    })
    return initials;

  }

  private _mapUsersToPersonas(users, useMailProp) {
    let tempList = [];
    users.forEach((p) => {
      let target: IPersonaWithMenu = {};
      let persona: IPersonaProps = {};

      persona.primaryText = p.Title;
      persona.secondaryText = p.Email;
      // just for using when sharing
      persona.tertiaryText = p.LoginName;
      persona.imageInitials = this._getInitials(p.Title);
      persona.initialsColor = Math.floor(Math.random() * 15) + 0;

      assign(target, persona, { menuItems: this.contextualMenuItems });
      tempList.push(target);
    });
    return tempList;

  }

  @autobind
  private _shareItemsWithPeople() {
    // Activate spinner component
    this.setState({
      isLoading: true
    })
    // Get login names for users  
    let users = this.state.selectedPeople.map((p: IPersonaProps) => p.tertiaryText);
    // Selected sharing level from dropdown
    let sharingLevel = this.state.sharingLevel;
    // Include "includeAnonymousLinkInEmail = false" is only thing thats working in the share
    let requireSignin = false;
    // If send email is checked, use emailtext from textfield as body, else set to empty string
    let emailData: SharingEmailData = { body: this.state.isChecked ? this.state.emailBody : '' };

    // Selected list items from list in SharePoint
    let listItems = this._listItems;

    var promises = [];
    // Push promise returned by shareWith to array
    listItems.forEach(item => {
      promises.push(pnp.sp.web.getFileByServerRelativeUrl(item.getValueByName('FileRef')).shareWith(users, sharingLevel, requireSignin, emailData));
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
        returnObj.textStr = "Error in sharing of items: ";
        returnObj.textStr += errorObjs.map(a => a.Name).join(', ');
        returnObj.textStr += " Errormessages: ";
        returnObj.textStr += errorObjs.map(a => a.ErrorMessage).join(' | ');
        returnObj.messageBarType = MessageBarType.error;
      }

      // If successful
      else {
        // Setup strings for messagebar
        returnObj.textStr = "Sucessful sharing of items: ";
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
      setTimeout(() => this.props.callbackParent(), 2000);
    }).catch(() => this.setState({
      isLoading: false
    }))
  }

  // Get site users and only get "real users" by filtering
  private _getUsers() {
    return pnp.sp.web.siteUsers.filter("PrincipalType eq 1 and UserId/NameIdIssuer eq 'urn:federation:microsoftonline'").get();
  }


  public render() {
    return (
      <div>
        {!this.state.shareResult && this.state.isLoading &&
          <Spinner label='Sharing items...' />
        }

        {this.state.shareResult &&
          <MessageBar
            messageBarType={this.state.shareResult.type}
            isMultiline={true}>
            {this.state.shareResult.text}
          </MessageBar>
        }
        <br />
        <NormalPeoplePicker
          onResolveSuggestions={this._onFilterChanged}
          getTextFromItem={(persona: IPersonaProps) => persona.primaryText}
          pickerSuggestionsProps={suggestionProps}
          className={'ms-PeoplePicker'}
          key={'normal'}
          onChange={this._onSelectionChanged}
        />
        <br />
        <div className={'dropdown-div'}>
          <Dropdown label='Select Sharing Type'
            options={[
              { key: SharingRole.View, text: 'Read' },
              { key: SharingRole.Edit, text: 'Edit' },
            ]}
            selectedKey={this.state.sharingLevel}
            onChanged={this._dropDownSelected}
          />
          <TextField
            placeholder='Add a message here'
            multiline
            resizable={false}
            onChanged={(text) => this.setState({ emailBody: text })}
            disabled={!(this.state.isChecked)}
          />
          <Checkbox
            label='Send an email invitation'
            checked={this.state.isChecked}
            onChange={(ev, checked) => this.setState({ isChecked: checked })} />
        </div>
        <Button
          buttonType={0}
          onClick={this._shareItemsWithPeople}
          disabled={(!(this.state.selectedPeople.length > 0))}>
          Share
        </Button>
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
        let filteredPersonas: IPersonaProps[] = this._filterPersonasByText(filterText);
        // remove user from suggestions if already chosed in people picker
        filteredPersonas = this._removeDuplicates(filteredPersonas, currentPersonas);
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
            this._peopleList = this._mapUsersToPersonas(users, false);
            resolve(this._peopleList);
          }))
        .then((value: any) => {
          // filter user suggestions based on people picker input
          let filteredPersonas: IPersonaProps[] = this._filterPersonasByText(filterText);
          // remove user from suggestions if already chosed in people picker
          filteredPersonas = this._removeDuplicates(value, currentPersonas);
          return filteredPersonas;

        });
    }
  }
  
  private _listContainsPersona(persona: IPersonaProps, personas: IPersonaProps[]) {
    if (!personas || !personas.length || personas.length === 0) {
      return false;
    }
    return personas.filter(item => item.primaryText === persona.primaryText).length > 0;
  }

  private _filterPersonasByText(filterText: string): IPersonaProps[] {
    return this._peopleList.filter(item => this._doesTextStartWith(item.primaryText, filterText));
  }

  private _doesTextStartWith(text: string, filterText: string): boolean {
    return text.toLowerCase().indexOf(filterText.toLowerCase()) === 0;
  }

  private _removeDuplicates(personas: IPersonaProps[], possibleDupes: IPersonaProps[]) {
    return personas.filter(persona => !this._listContainsPersona(persona, possibleDupes));
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

}