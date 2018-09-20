import {
    IPersona,
    IPersonaProps,
    assign  
  } from 'office-ui-fabric-react';

export class MultiShareHelper {
    
    public static getInitials(title: string) {
        let temp = title.split(/\s+/);
        let initials = '';
        temp.forEach(element => {
          initials += element.substr(0, 1);
        });
        return initials;
    
      }

      public static mapUsersToPersonas(users, useMailProp, contextualMenuItems) {
        let tempList = [];
        users.forEach((p) => {
          let target: IPersona = {};
          let persona: IPersonaProps = {};
    
          persona.primaryText = p.Title;
          persona.secondaryText = p.Email;
          // just for using when sharing
          persona.tertiaryText = p.LoginName;
          persona.imageInitials = MultiShareHelper.getInitials(p.Title);
          persona.initialsColor = Math.floor(Math.random() * 15) + 0;
    
          assign(target, persona, { menuItems: contextualMenuItems });
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
}