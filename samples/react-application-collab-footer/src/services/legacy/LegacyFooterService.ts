import { BaseComponentContext } from '@microsoft/sp-component-base';
import { Log } from '@microsoft/sp-core-library';
import { IFooterService } from '../ServiceFactory';
import { ISharedLink, IPersonalLink } from '../types/FooterTypes';
import { IFooterConfiguration } from '../configuration/ConfigurationService';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';

const LOG_SOURCE: string = 'LegacyFooterService';

/**
 * Legacy footer service using Taxonomy and User Profile services
 * This provides backward compatibility for existing implementations
 */
export class LegacyFooterService implements IFooterService {
  constructor(
    private context: BaseComponentContext,
    private config: IFooterConfiguration
  ) {
    Log.info(LOG_SOURCE, 'LegacyFooterService initialized for backward compatibility');
  }

  public async getSharedLinks(): Promise<ISharedLink[]> {
    try {
      if (!this.config.sourceTermSet) {
        Log.warn(LOG_SOURCE, 'No sourceTermSet configured for legacy taxonomy service');
        return [];
      }

      // Use the existing SPTaxonomyService
      const SPTaxonomyService = require('../taxonomy/SPTaxonomyService').default;
      const taxonomyService = new SPTaxonomyService(this.context);
      const terms = await taxonomyService.getTermsFromTermSet(this.config.sourceTermSet);

      // Convert taxonomy terms to shared links
      const sharedLinks: ISharedLink[] = terms.map((term: any, index: number) => ({
        id: parseInt(term.Id) || index,
        title: term.Name || 'Unnamed Link',
        url: term.LocalCustomProperties?.["_Sys_Nav_SimpleLinkUrl"] || '#',
        description: term.Description || '',
        iconName: term.LocalCustomProperties?.["PnP-CollabFooter-Icon"] || 'Link',
        order: index,
        isActive: true
      }));

      Log.info(LOG_SOURCE, `Retrieved ${sharedLinks.length} shared links from taxonomy`);
      return sharedLinks;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }

  public async getPersonalLinks(): Promise<IPersonalLink[]> {
    try {
      if (!this.config.personalItemsStorageProperty) {
        Log.warn(LOG_SOURCE, 'No personalItemsStorageProperty configured for legacy user profile service');
        return [];
      }

      // Use the existing SPUserProfileService
      const SPUserProfileService = require('../userProfile/SPUserProfileService').default;
      const profileService = new SPUserProfileService(this.context);
      const linksJson = await profileService.getUserProfileProperty(this.config.personalItemsStorageProperty);

      if (!linksJson) {
        Log.info(LOG_SOURCE, 'No personal links found in user profile');
        return [];
      }

      // Parse personal links from user profile
      const decodedLinks = decodeURIComponent(linksJson);
      const rawLinks = JSON.parse(decodedLinks);

      const personalLinks: IPersonalLink[] = rawLinks.map((link: any, index: number) => ({
        id: index,
        userId: 'current-user', // We don't have user ID in legacy format
        title: link.title || link.name || 'Unnamed Link',
        url: link.url || link.href || '#',
        description: link.description || '',
        iconName: link.iconName || 'Link',
        order: index,
        isActive: true
      }));

      Log.info(LOG_SOURCE, `Retrieved ${personalLinks.length} personal links from user profile`);
      return personalLinks;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }

  public async savePersonalLinks(links: IPersonalLink[]): Promise<boolean> {
    try {
      if (!this.config.personalItemsStorageProperty) {
        Log.warn(LOG_SOURCE, 'No personalItemsStorageProperty configured for saving');
        return false;
      }

      // Convert to legacy format
      const legacyLinks = links.map(link => ({
        key: `link-${link.title}-${link.url}-${Date.now()}`,
        title: link.title,
        url: link.url
      }));

      // Use the existing SPUserProfileService
      const SPUserProfileService = require('../userProfile/SPUserProfileService').default;
      const profileService = new SPUserProfileService(this.context);
      
      const linksJson = JSON.stringify(legacyLinks);
      const encodedLinks = encodeURIComponent(linksJson);
      
      await profileService.setUserProfileProperty(
        this.config.personalItemsStorageProperty,
        "String",
        encodedLinks
      );

      Log.info(LOG_SOURCE, `Successfully saved ${links.length} personal links to user profile`);
      return true;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return false;
    }
  }

  public async getSharedMenuItems(): Promise<IContextualMenuItem[]> {
    try {
      const sharedLinks = await this.getSharedLinks();
      return sharedLinks.map(link => ({
        key: `shared-${link.id}`,
        name: link.title,
        href: link.url,
        title: link.description,
        iconProps: { iconName: link.iconName || 'Link' },
        target: '_blank'
      }));
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }

  public async getPersonalMenuItems(): Promise<IContextualMenuItem[]> {
    try {
      const personalLinks = await this.getPersonalLinks();
      return personalLinks.map(link => ({
        key: `personal-${link.id || link.title}`,
        name: link.title,
        href: link.url,
        title: link.description,
        iconProps: { iconName: link.iconName || 'Link' },
        target: '_blank'
      }));
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }
}