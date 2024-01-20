import * as React from 'react';
import { ICommandBarItemProps } from '@fluentui/react/lib/CommandBar';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { IMenuItem } from '../models/IMenuItem';
import { SubMenuSites } from '../extensions/commandBarNavigation/components/subMenu/SubMenuSites';
import { ISubMenuSitesProps } from '../extensions/commandBarNavigation/components/subMenu/ISubMenuSitesProps';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderSubmenu = (item: any): React.ReactElement => {
  const element: React.ReactElement<ISubMenuSitesProps> = React.createElement(SubMenuSites, item);
  return element;
}

const dismissProjects = (): void => {
  // What if submenu gets closed?
}

const closeMenu = (): boolean => {
  return true;
}
const homeSiteItem: ICommandBarItemProps = {
  key: 'My Hub',
  name: '',
  className: `ms-CommandBarItem`,
  href: '',
  iconProps: {
    iconName: 'Home'
  }                
};

const teamSitesItem: ICommandBarItemProps = {
  key: 'Teamsites',
  name: 'Teamsites',
  className: `ms-CommandBarItem`,
  iconProps: {
    iconName: 'Group'
  },
  subMenuProps: {
    items: [{
      key: 'Teamsites',
      name: 'Teamsites',   
      label: 'Modern Teamsites',
      dataItems: [],
      // searchCallback: this.searchTeamsites.bind(this),
      onRender: renderSubmenu
    }],
    onDismiss: dismissProjects,
    onItemClick: closeMenu
  }
};

  const commSitesItem: ICommandBarItemProps = {
    key: 'Commsites',
    name: 'Communication Sites',
    className: `ms-CommandBarItem`,
    iconProps: {
      iconName: 'Communications'
    },
    subMenuProps: {
      items: [{
        key: 'CommSub',
        name: 'CommSub', 
        label: 'Modern Communication Sites',       
        dataItems: [],
        //searchCallback: this.searchCommSites.bind(this),
        onRender: renderSubmenu
      }],
      onDismiss: dismissProjects,
      onItemClick: closeMenu                 
    }
  };

  const hubSitesItem: ICommandBarItemProps = {
    key: 'Hubsites',
    name: 'Hub Sites',
    className: `ms-CommandBarItem`,
    iconProps: {
      iconName: 'Org'
    },
    subMenuProps: {
      items: [{
        key: 'Hubsites',
        name: 'Hubsites',   
        label: 'Sites in Hub',     
        dataItems: [],
        // searchCallback: this.searchHubsites.bind(this),
        onRender: renderSubmenu
      }],
      onDismiss: dismissProjects,
      onItemClick: closeMenu                 
    }
  };

  const myTeamsItem: ICommandBarItemProps = {
    key: 'Myteams',
    name: 'My Teams',
    className: `ms-CommandBarItem`,
    iconProps: {
      iconName: 'TeamsLogo'
    },
    subMenuProps: {
      items: [{
        key: 'Myteams',
        name: 'Myteams',
        label: 'My Teams',        
        dataItems: [],
        // searchCallback: searchMyTeams,
        onRender: renderSubmenu
      }],
      onDismiss: dismissProjects,
      onItemClick: closeMenu
    }
  };

  const externalSharingItem: ICommandBarItemProps = {
    key: 'ExtNo',
    title : '',
    iconProps: {
      iconName: 'Info'
    },
    iconOnly: true
  };

  const permissionItem: ICommandBarItemProps = {
    key: 'permission',
    name: 'Permissions',
    iconProps: {
      iconName: 'Repair'
    },
    iconOnly: true,
    subMenuProps: {
      items: []
    }    
  };

  const permissionPanelItem: IContextualMenuItem = {    
    key: 'ListPermissions',
    name: 'List Permissions',
  };

  export const evaluateCommandItems = (teamsites: IMenuItem[], 
                                        commsites: IMenuItem[], 
                                        hubsites: IMenuItem[], 
                                        myTeams: IMenuItem[],
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        homesite: any,
                                        useTeamsites: boolean,
                                        searchTeamSites: (text: string) => void,
                                        useCommsites: boolean,
                                        searchCommSites: (text: string) => void,
                                        useHubsites: boolean,
                                        searchHubSites: (text: string) => void,
                                        useTeams: boolean): ICommandBarItemProps[] => {    
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    teamSitesItem.subMenuProps!.items[0].dataItems = teamsites;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    teamSitesItem.subMenuProps!.items[0].searchCallback = searchTeamSites;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    commSitesItem.subMenuProps!.items[0].dataItems = commsites;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    commSitesItem.subMenuProps!.items[0].searchCallback = searchCommSites;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    hubSitesItem.subMenuProps!.items[0].dataItems = hubsites;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    hubSitesItem.subMenuProps!.items[0].searchCallback = searchHubSites;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    myTeamsItem.subMenuProps!.items[0].dataItems = myTeams;
    const commandBarItems: ICommandBarItemProps[] = [];
    if (useHubsites && homesite !== null) {
      homeSiteItem.href = homesite.url;
      homeSiteItem.name = homesite.displayName;
      commandBarItems.push(homeSiteItem);
    }
    if (useTeamsites) {      
      commandBarItems.push(teamSitesItem);
    }
    if (useCommsites) {
      commandBarItems.push(commSitesItem);
    }
    if (useHubsites) {
      commandBarItems.push(hubSitesItem);
    }
    if (useTeams) {
      commandBarItems.push(myTeamsItem);
    }

    return commandBarItems;
  }

  export const evaluateFarItems = (externalSharingEnabled: boolean, showPermissions: () => void): ICommandBarItemProps[] => {
    const farItems: ICommandBarItemProps[] = [];
    if (externalSharingEnabled !== null) {
      if (externalSharingEnabled) {
        externalSharingItem.title = 'External Sharing enabled';
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        externalSharingItem.iconProps!.iconName = 'World';
      }
      else {
        externalSharingItem.title = 'External Sharing not enabled';
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        externalSharingItem.iconProps!.iconName = 'LifesaverLock';
      }
      farItems.push(externalSharingItem);      
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    permissionItem.subMenuProps!.items = [];
    permissionPanelItem.onClick = () => { showPermissions(); };
    permissionItem.subMenuProps?.items.push(permissionPanelItem);
    farItems.push(permissionItem);
    return farItems;
  }