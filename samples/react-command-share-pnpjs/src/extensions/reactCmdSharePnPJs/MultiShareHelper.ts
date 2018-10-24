import {
  IPersona,
  IPersonaProps,
  assign,
  MessageBarType
} from 'office-ui-fabric-react';
import { SharingResult } from '@pnp/sp';

export class MultiShareHelper {

  public static getInitials(title: string): string {
    const temp = title.split(/\s+/);
    let initials = '';
    temp.forEach(element => {
      initials += element.substr(0, 1);
    });
    return initials;

  }

  public static checkIfExternalEmail(email: string): boolean {
    const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return regexp.test(email);
  }

  public static mapUsersToPersonas(users): IPersona[] {
    let tempList = [];
    users.forEach((p) => {
      let target: IPersona = {};
      let persona: IPersonaProps = {};

      persona.primaryText = p.Title ? p.Title : p.Email;
      persona.secondaryText = p.Email;
      // just for using when sharing
      persona.tertiaryText = p.LoginName ? p.LoginName : p.Email;
      persona.imageInitials = MultiShareHelper.getInitials(p.Title);
      persona.initialsColor = Math.floor(Math.random() * 15) + 0;

      assign(target, persona);
      tempList.push(target);
    });
    return tempList;

  }

  private static _doesTextStartWith(text: string, filterText: string): boolean {
    return text.toLowerCase().indexOf(filterText.toLowerCase()) === 0;
  }

  private static _listContainsPersona(persona: IPersonaProps, personas: IPersonaProps[]) {
    if (!personas || !personas.length || personas.length === 0) {
      return false;
    }
    return personas.filter(item => item.primaryText === persona.primaryText).length > 0;
  }

  public static filterPersonasByText(filterText: string, peopleList): IPersonaProps[] {
    return peopleList.filter(item => this._doesTextStartWith(item.primaryText, filterText));
  }

  public static removeDuplicates(personas: IPersonaProps[], possibleDupes: IPersonaProps[]) {
    return personas.filter(persona => !this._listContainsPersona(persona, possibleDupes));
  }

  public static setupFilteredPersonas(filterText: string, currentPersonas: IPersonaProps[], peopleList: any): IPersonaProps[] {
    let filteredPersonas: IPersonaProps[] = MultiShareHelper.filterPersonasByText(filterText, peopleList);
    // remove user from suggestions if already chosen in people picker
    filteredPersonas = MultiShareHelper.removeDuplicates(filteredPersonas, currentPersonas);

    if (filteredPersonas.length === 0 && MultiShareHelper.checkIfExternalEmail(filterText)) {
      filteredPersonas.push({ primaryText: filterText, secondaryText: "External", tertiaryText: filterText });
    }

    return filteredPersonas;
  }

  public static setupSharingMessageBar(responses: SharingResult[], strings: any): IReturnObject {
    const returnObject: IReturnObject = { text: '', barType: null };
    // Error
    if (responses.some(a => a.StatusCode != 0)) {
      let errorObjs = responses.filter(a => a.StatusCode != 0);
      // Setup strings for messagebar
      returnObject.text = strings.MultiShareDialogSharingError;
      returnObject.text += errorObjs.map(a => a.Name).join(', ');
      returnObject.text += strings.MultiShareDialogSharingErrorMsgs;
      returnObject.text += errorObjs.map(a => a.ErrorMessage).join(' | ');
      returnObject.barType = MessageBarType.error;
    }
    // Success
    else {
      // Invited users (External)
      let invited = [];
      const invitedRes = responses.filter(res => res.InvitedUsers !== null);
      if (invitedRes.length > 0) {
        invitedRes.forEach(res => {
          res.InvitedUsers.forEach(inv => {
            if (invited.indexOf(inv.Email) === -1) {
              invited.push(inv.Email);
            }
          });
        });
      }

      // Shared with users
      let uniquePerm = [];
      const sharedRes = responses.filter(res => res.UniquelyPermissionedUsers !== null);
      if (sharedRes.length > 0) {
        sharedRes.forEach(res => {
          res.UniquelyPermissionedUsers.forEach(uniq => {
            if (uniquePerm.indexOf(uniq.DisplayName) === -1) {
              uniquePerm.push(uniq.DisplayName);
            }
          });
        });
      }
      returnObject.text = strings.MultiShareDialogSharingSuccess;
      // Name of the items
      returnObject.text += responses.map(a => a.Name).join(', ').replace(/,(?!.*,)/gmi, ' and');
      // Show external users invited
      if (invited.length > 0) {
        returnObject.text += `\nInvited: ${invited.join(', ').replace(/,(?!.*,)/gmi, ' and')}`;
      }
      // Invited users from the tenant
      if (uniquePerm.length > 0) {
        returnObject.text += `\nShared with: ${uniquePerm.join(', ').replace(/,(?!.*,)/gmi, ' and')}`;
      }
      returnObject.barType = MessageBarType.success;
    }

    return returnObject;
  }
}

export interface IReturnObject {
  text: string;
  barType: MessageBarType;
}
