import * as React from 'react';
import * as ReactDom from 'react-dom';
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';
import * as strings from 'CollaborationFooterApplicationCustomizerStrings';
import SPTaxonomyService from '../../services/taxonomy/SPTaxonomyService';
import { ITerm } from '../../services/taxonomy/SPTaxonomyTypes';
import SPUserProfileService from '../../services/userProfile/SPUserProfileService';
import IMyLink from './components/myLinks/IMyLink';
import MyLinksDialog from './components/myLinks/MyLinksDialog';
import { IContextualMenuItem, ContextualMenuItemType } from '@fluentui/react/lib/ContextualMenu';
import CollabFooter from './components/footer/CollabFooter';
import { ICollabFooterEditResult, ICollabFooterProps } from './components/footer/ICollabFooterProps';
import { initializeIcons } from '@fluentui/react';

const LOG_SOURCE: string = 'CollaborationFooterApplicationCustomizer';
initializeIcons();

export interface ICollaborationFooterApplicationCustomizerProperties {
  sourceTermSet: string;
  personalItemsStorageProperty: string;
}

export default class CollaborationFooterApplicationCustomizer
  extends BaseApplicationCustomizer<ICollaborationFooterApplicationCustomizerProperties> {

  private _footerPlaceholder: PlaceholderContent | undefined;
  private _myLinks: IMyLink[] = [];

  @override
  public async onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    const { sourceTermSet, personalItemsStorageProperty } = this.properties;

    if (!sourceTermSet || !personalItemsStorageProperty) {
      console.error('Please provide valid properties for CollaborationFooterApplicationCustomizer!');
      return;
    }

    await this._renderPlaceHolders();
  }

  private async getSharedMenuItems(taxonomyService: SPTaxonomyService): Promise<IContextualMenuItem[]> {
    try {
      const terms: ITerm[] = await taxonomyService.getTermsFromTermSet(this.properties.sourceTermSet);
      console.log("terms", terms);

      // Map top-level terms and their nested terms correctly with itemType: 0 (Normal)
      return terms.map(term => this.mapTermToMenuItem(term, ContextualMenuItemType.Normal));
    } catch (error) {
      console.error('Error fetching shared menu items:', error);
      return [];
    }
  }

  private async getPersonalMenuItems(): Promise<IContextualMenuItem[]> {
    try {
      const profileService = new SPUserProfileService(this.context);
      const myLinksJson: string | null = await profileService.getUserProfileProperty(this.properties.personalItemsStorageProperty);

      if (!myLinksJson) {
        console.warn('No personal links found.');
        return [];
      }

      // Decode the personal links
      const decodedLinksJson = decodeURIComponent(myLinksJson);
      this._myLinks = JSON.parse(decodedLinksJson) as IMyLink[];

      return this._myLinks.map(link => this.mapMyLinkToMenuItem(link, ContextualMenuItemType.Normal));
    } catch (error) {
      console.error('Error fetching personal menu items:', error);
      return [];
    }
  }

  private mapTermToMenuItem(term: ITerm, itemType: ContextualMenuItemType): IContextualMenuItem {
    const termName = term.Name || "Unnamed Term";
    const iconName = term.LocalCustomProperties?.["PnP-CollabFooter-Icon"];
    const href = term.LocalCustomProperties?.["_Sys_Nav_SimpleLinkUrl"];

    // Check if the term has children (sub-terms)
    const hasChildren = term.Terms && term.Terms.length > 0;

    // If the term has children, map them recursively
    const subMenuItems = hasChildren
      ? term.Terms.map(subTerm => this.mapTermToMenuItem(subTerm, ContextualMenuItemType.Normal))
      : undefined;

    // Log the subMenuItems for debugging purposes
    console.log('Term:', termName, 'Has Children:', hasChildren, 'SubMenuItems:', subMenuItems);

    // Return the IContextualMenuItem for the term
    return {
      key: `term-${term.Id}`,
      name: termName,
      itemType: itemType,
      iconProps: iconName ? { iconName } : undefined,
      href: href || undefined,
      // Only include subMenuProps if the term has children
      subMenuProps: hasChildren && subMenuItems && subMenuItems.length > 0 ? { items: subMenuItems } : undefined,
      isSubMenu: hasChildren,  // Set isSubMenu to true only if there are children
    };
  }

  private mapMyLinkToMenuItem(myLink: IMyLink, itemType: number): IContextualMenuItem {
    return {
      key: `link-${myLink.title}-${myLink.url}`,
      name: myLink.title,
      itemType: itemType as any,
      href: myLink.url,
      subMenuProps: undefined, // Remove this unless sub-items exist
      isSubMenu: false, // Ensure this is false if no sub-items
    };
  }
  

  private async _editMyLinks(): Promise<ICollabFooterEditResult> {
    const result: ICollabFooterEditResult = {
      editResult: null,
      myLinks: null,
    };

    const myLinksDialog = new MyLinksDialog(this._myLinks, async (updatedLinks: IMyLink[]) => {
      try {
        console.log('Updated links from dialog:', updatedLinks);
        this._myLinks = updatedLinks;

        const saveSuccess = await this._saveLinksToUserProfile(this._myLinks);

        if (!saveSuccess) {
          console.error('Failed to save links to user profile');
          result.editResult = false;
        } else {
          console.log('Successfully saved links to user profile');
          result.editResult = true;
          result.myLinks = updatedLinks;
        }
      } catch (error) {
        console.error('Error saving updated links to profile:', error);
        result.editResult = false;
      }
    });

    try {
      await myLinksDialog.show();
    } catch (error) {
      console.error('Error showing MyLinks dialog:', error);
      result.editResult = false;
    }

    return result;
  }

  private async _saveLinksToUserProfile(links: IMyLink[]): Promise<boolean> {
    try {
      const profileService = new SPUserProfileService(this.context);
      const linksJson = JSON.stringify(links);

      const encodedLinksJson = encodeURIComponent(linksJson);

      await profileService.setUserProfileProperty(this.properties.personalItemsStorageProperty, "String", encodedLinksJson);
      console.log('Successfully saved links to user profile');
      return true;
    } catch (error) {
      console.error('Error saving personal links to user profile:', error);
      return false;
    }
  }

  private async _renderPlaceHolders(): Promise<void> {
    if (this._footerPlaceholder) return;

    this._footerPlaceholder = this.context.placeholderProvider.tryCreateContent(
      PlaceholderName.Bottom,
      { onDispose: this._onDispose }
    );

    if (!this._footerPlaceholder) {
      console.error('The expected placeholder (Bottom) was not found.');
      return;
    }

    try {
      const taxonomyService: SPTaxonomyService = new SPTaxonomyService(this.context);

      // Wait until all shared menu items and personal menu items are fetched
      const sharedMenuItems: IContextualMenuItem[] = await this.getSharedMenuItems(taxonomyService);
      const personalMenuItems: IContextualMenuItem[] = await this.getPersonalMenuItems();

      const element: React.ReactElement<ICollabFooterProps> = React.createElement(
        CollabFooter,
        {
          sharedLinks: sharedMenuItems,
          myLinks: personalMenuItems,
          editMyLinks: this._editMyLinks.bind(this)
        }
      );

      ReactDom.render(element, this._footerPlaceholder.domElement);
    } catch (error) {
      console.error('Error initializing footer:', error);
    }
  }

  private _onDispose(): void {
    console.log('[CollabFooterApplicationCustomizer._onDispose] Disposed custom bottom placeholder.');
    if (this._footerPlaceholder?.domElement) {
      ReactDom.unmountComponentAtNode(this._footerPlaceholder.domElement);
    }
  }
}
