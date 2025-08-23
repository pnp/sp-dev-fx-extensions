import { BaseComponentContext } from '@microsoft/sp-component-base';
import { Log } from '@microsoft/sp-core-library';
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/fields';
import '@pnp/sp/site-users/web';
import { IFooterService } from '../ServiceFactory';
import { IPersonalLink, IGlobalLink, IUserLinkSelection, ISharedLink } from '../types/FooterTypes';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';

const LOG_SOURCE: string = 'GlobalLinksService';

/**
 * Service to manage global links stored in SharePoint List on root site
 * Supports mandatory links and optional links that users can select via dashboard
 */
export class GlobalLinksService implements IFooterService {
  private sp: ReturnType<typeof spfi>;
  private homeSiteSp: ReturnType<typeof spfi>;
  private globalLinksListTitle: string = 'Global Footer Links';
  private userSelectionsListTitle: string = 'User Link Selections';
  private homeSiteUrl: string;
  constructor(context: BaseComponentContext, homeSiteUrl?: string) {
    this.sp = spfi().using(SPFx(context));
    
    // Determine home site URL - use provided URL, or fallback to tenant root
    if (homeSiteUrl) {
      this.homeSiteUrl = homeSiteUrl;
    } else {
      // Extract tenant root URL from current context
      const currentUrl = context.pageContext.web.absoluteUrl;
      const tenantUrl = new URL(currentUrl);
      this.homeSiteUrl = `${tenantUrl.protocol}//${tenantUrl.hostname}`;
    }
    
    // Create separate SP instance for home site operations
    this.homeSiteSp = spfi(this.homeSiteUrl).using(SPFx(context));
    
    Log.info(LOG_SOURCE, `GlobalLinksService initialized with PnP JS - Home site: ${this.homeSiteUrl}`);
  }

  /**
   * Get shared/global links that are either mandatory or selected by the current user
   */
  public async getSharedLinks(): Promise<ISharedLink[]> {
    try {
      const currentUser = await this.sp.web.currentUser();
      Log.info(LOG_SOURCE, `Getting global links for user: ${currentUser.Id}`);

      // Get all active global links
      const globalLinks = await this.getAllGlobalLinks();
      
      // Get user's link selections
      const userSelections = await this.getUserLinkSelections(currentUser.Id);
      const selectedLinkIds = new Set(
        userSelections
          .filter(selection => selection.isSelected)
          .map(selection => selection.globalLinkId)
      );

      // Return mandatory links + user selected optional links
      const applicableLinks = globalLinks.filter(link => 
        link.isMandatory || selectedLinkIds.has(link.id)
      );

      Log.info(LOG_SOURCE, `Retrieved ${applicableLinks.length} applicable global links (${globalLinks.filter(l => l.isMandatory).length} mandatory, ${applicableLinks.length - globalLinks.filter(l => l.isMandatory).length} selected)`);
      
      // Convert IGlobalLink[] to ISharedLink[] for compatibility
      const sharedLinks: ISharedLink[] = applicableLinks.map(link => ({
        id: link.id,
        title: link.title,
        url: link.url,
        description: link.description,
        iconName: link.iconName,
        iconUrl: link.iconUrl,
        order: link.order,
        isActive: link.isActive
      }));

      return sharedLinks;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }

  /**
   * This service handles shared/global links, not personal links
   */
  public async getPersonalLinks(): Promise<IPersonalLink[]> {
    // Personal links are handled by OneDrivePersonalLinksService
    Log.info(LOG_SOURCE, 'GlobalLinksService does not provide personal links');
    return [];
  }

  /**
   * This service doesn't save personal links
   */
  public async savePersonalLinks(links: IPersonalLink[]): Promise<boolean> {
    Log.warn(LOG_SOURCE, 'GlobalLinksService does not handle personal links');
    return false;
  }

  /**
   * Get all global links from SharePoint list
   */
  public async getAllGlobalLinks(): Promise<IGlobalLink[]> {
    try {
      // Check if list exists on home site - DO NOT create automatically
      let listExists = false;
      try {
        await this.homeSiteSp.web.lists.getByTitle(this.globalLinksListTitle)();
        listExists = true;
        Log.info(LOG_SOURCE, `Global links list '${this.globalLinksListTitle}' found on home site: ${this.homeSiteUrl}`);
      } catch (listError) {
        Log.info(LOG_SOURCE, `Global links list '${this.globalLinksListTitle}' not found on home site - will return empty array`);
        listExists = false;
      }

      if (!listExists) {
        Log.warn(LOG_SOURCE, 'Global links list is not available on home site, returning empty array');
        return [];
      }

      const list = this.homeSiteSp.web.lists.getByTitle(this.globalLinksListTitle);
      let items: any[] = [];
      
      try {
        // Try basic query first to test if list is accessible
        items = await list.items
          .select('Id', 'Title')
          .top(5)();
        
        // If basic query works, try full query with correct internal field names
        if (items.length >= 0) {
          items = await list.items
            .select('Id', 'Title', 'Footer_x0020_URL', 'Description', 'Icon_x0020_Name', 'Icon_x0020_URL', 'Sort_x0020_Order', 'Category', 'Is_x0020_Mandatory', 'Is_x0020_Active', 'Target_x0020_Audience', 'Valid_x0020_From', 'Valid_x0020_To')
            .filter('(Is_x0020_Active eq 1) or (Is_x0020_Active eq null)')
            .orderBy('Is_x0020_Mandatory', false)
            .orderBy('Sort_x0020_Order', true)
            .orderBy('Title', true)();
        }
      } catch (queryError) {
        Log.warn(LOG_SOURCE, `Query failed: ${(queryError as Error).message}, returning empty array`);
        return [];
      }

      const globalLinks: IGlobalLink[] = items.map(item => ({
        id: item.Id,
        title: item.Title || '',
        url: item.Footer_x0020_URL?.Url || item.Footer_x0020_URL || '',
        description: item.Description || '',
        iconName: item.Icon_x0020_Name || 'Link',
        iconUrl: item.Icon_x0020_URL?.Url || item.Icon_x0020_URL || undefined,
        order: item.Sort_x0020_Order || 0,
        category: item.Category || 'General',
        isMandatory: item.Is_x0020_Mandatory === true,
        isActive: item.Is_x0020_Active !== false,
        targetAudience: item.Target_x0020_Audience ? item.Target_x0020_Audience.split(';') : [],
        validFrom: item.Valid_x0020_From,
        validTo: item.Valid_x0020_To
      }));

      Log.info(LOG_SOURCE, `Successfully retrieved ${globalLinks.length} global links`);
      return globalLinks;
    } catch (error) {
      Log.error(LOG_SOURCE, new Error(`Error in getAllGlobalLinks: ${(error as Error).message}`));
      return [];
    }
  }

  /**
   * Get user's link selections
   */
  public async getUserLinkSelections(userId: number): Promise<IUserLinkSelection[]> {
    try {
      // Check if list exists - DO NOT create automatically  
      let listExists = false;
      try {
        await this.sp.web.lists.getByTitle(this.userSelectionsListTitle)();
        listExists = true;
        Log.info(LOG_SOURCE, `User selections list '${this.userSelectionsListTitle}' found`);
      } catch (listError) {
        Log.info(LOG_SOURCE, `User selections list '${this.userSelectionsListTitle}' not found - will return empty array`);
        listExists = false;
      }

      if (!listExists) {
        Log.warn(LOG_SOURCE, 'User selections list is not available, returning empty array');
        return [];
      }

      const list = this.sp.web.lists.getByTitle(this.userSelectionsListTitle);
      let items: any[] = [];
      
      try {
        items = await list.items
          .select('Id', 'User_x0020_Id', 'Global_x0020_Link_x0020_Id', 'Is_x0020_Selected', 'Date_x0020_Selected')
          .filter(`User_x0020_Id eq ${userId}`)();
      } catch (queryError) {
        Log.warn(LOG_SOURCE, `User selections query failed: ${(queryError as Error).message}, returning empty array`);
        return [];
      }

      const selections: IUserLinkSelection[] = items.map(item => ({
        id: item.Id,
        userId: item.User_x0020_Id?.toString() || '',
        globalLinkId: item.Global_x0020_Link_x0020_Id,
        isSelected: item.Is_x0020_Selected === true,
        dateSelected: item.Date_x0020_Selected
      }));

      Log.info(LOG_SOURCE, `Retrieved ${selections.length} link selections for user ${userId}`);
      return selections;
    } catch (error) {
      Log.error(LOG_SOURCE, new Error(`Error in getUserLinkSelections: ${(error as Error).message}`));
      return [];
    }
  }

  /**
   * Save user's link selections
   */
  public async saveUserLinkSelections(userId: number, selectedLinkIds: number[]): Promise<boolean> {
    try {
      Log.info(LOG_SOURCE, `Saving link selections for user ${userId}: ${selectedLinkIds.length} links selected`);
      
      const list = this.sp.web.lists.getByTitle(this.userSelectionsListTitle);
      
      // Get all global links to know which are optional
      const globalLinks = await this.getAllGlobalLinks();
      const optionalLinks = globalLinks.filter(link => !link.isMandatory);
      
      // Get current user selections
      const currentSelections = await this.getUserLinkSelections(userId);
      const currentSelectionMap = new Map(currentSelections.map(s => [s.globalLinkId, s]));

      // Update selections for each optional link
      for (const link of optionalLinks) {
        const isSelected = selectedLinkIds.includes(link.id);
        const existingSelection = currentSelectionMap.get(link.id);
        
        if (existingSelection) {
          // Update existing selection
          if (existingSelection.isSelected !== isSelected) {
            await list.items.getById(existingSelection.id!).update({
              Is_x0020_Selected: isSelected,
              Date_x0020_Selected: new Date().toISOString()
            });
          }
        } else {
          // Create new selection record
          await list.items.add({
            User_x0020_Id: userId,
            Global_x0020_Link_x0020_Id: link.id,
            Is_x0020_Selected: isSelected,
            Date_x0020_Selected: new Date().toISOString()
          });
        }
      }

      Log.info(LOG_SOURCE, `Successfully saved link selections for user ${userId}`);
      return true;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return false;
    }
  }

  /**
   * Initialize the service (does NOT create lists automatically)
   */
  public async initialize(): Promise<void> {
    try {
      // Only log that service is initialized - DO NOT create lists automatically
      Log.info(LOG_SOURCE, 'GlobalLinksService initialized - lists will be created manually via admin dialog');
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }

  /**
   * Create only the Global Footer Links list (called from admin dialog)
   */
  public async createGlobalLinksListOnly(): Promise<boolean> {
    try {
      Log.info(LOG_SOURCE, 'Creating Global Footer Links list manually via admin dialog');
      await this.createGlobalLinksListIfNotExists();
      
      // Add sample data if list is empty
      const globalLinks = await this.getAllGlobalLinks();
      if (globalLinks.length === 0) {
        Log.info(LOG_SOURCE, 'Adding sample data to newly created list');
        await this.addSampleGlobalLinks();
      }
      
      Log.info(LOG_SOURCE, 'Global Footer Links list created successfully via admin dialog');
      return true;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return false;
    }
  }

  /**
   * Create global links list if it doesn't exist
   */
  private async createGlobalLinksListIfNotExists(): Promise<void> {
    try {
      const web = this.sp.web;
      
      try {
        await web.lists.getByTitle(this.globalLinksListTitle)();
        Log.info(LOG_SOURCE, `Global links list '${this.globalLinksListTitle}' already exists`);
        return;
      } catch {
        // List doesn't exist, create it
      }

      Log.info(LOG_SOURCE, `Creating global links list: ${this.globalLinksListTitle}`);
      
      // Check if user has permissions to create lists
      try {
        const currentUser = await web.currentUser();
        Log.info(LOG_SOURCE, `Current user: ${currentUser.Title} (${currentUser.LoginName})`);
      } catch (userError) {
        Log.error(LOG_SOURCE, new Error(`Cannot get current user info: ${(userError as Error).message}`));
        throw new Error('Insufficient permissions to access SharePoint');
      }
      
      await web.lists.add(this.globalLinksListTitle, 'Global footer links with mandatory/optional flags', 100, false);
      const list = this.sp.web.lists.getByTitle(this.globalLinksListTitle);

      // Add custom fields with display names - SharePoint will create internal names
      await list.fields.addUrl('Footer URL', { Title: 'Footer URL' });
      await list.fields.addMultilineText('Description', { Title: 'Description' });
      await list.fields.addText('Icon Name', { Title: 'Icon Name' });
      await list.fields.addNumber('Sort Order', { Title: 'Sort Order' });
      await list.fields.addText('Category', { Title: 'Category' });
      await list.fields.addBoolean('Is Mandatory', { Title: 'Is Mandatory' });
      await list.fields.addBoolean('Is Active', { Title: 'Is Active' });
      await list.fields.addMultilineText('Target Audience', { Title: 'Target Audience' });
      await list.fields.addDateTime('Valid From', { Title: 'Valid From' });
      await list.fields.addDateTime('Valid To', { Title: 'Valid To' });

      // Note: All fields are automatically available in SharePoint list views
      // Users can manually add fields to views as needed via SharePoint UI

      Log.info(LOG_SOURCE, `Successfully created global links list with all fields in default view: ${this.globalLinksListTitle}`);
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
    }
  }

  /**
   * Create User Link Selections list if it doesn't exist (called from admin dialog)
   */
  public async createUserSelectionsListOnly(): Promise<boolean> {
    try {
      await this.createUserSelectionsListIfNotExists();
      Log.info(LOG_SOURCE, 'User Link Selections list created successfully');
      return true;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return false;
    }
  }

  /**
   * Create user selections list if it doesn't exist
   */
  private async createUserSelectionsListIfNotExists(): Promise<void> {
    try {
      const web = this.sp.web;
      
      try {
        await web.lists.getByTitle(this.userSelectionsListTitle)();
        Log.info(LOG_SOURCE, `User selections list '${this.userSelectionsListTitle}' already exists`);
        return;
      } catch {
        // List doesn't exist, create it
      }

      Log.info(LOG_SOURCE, `Creating user selections list: ${this.userSelectionsListTitle}`);
      
      await web.lists.add(this.userSelectionsListTitle, 'User selections for global footer links', 100, false);
      const list = this.sp.web.lists.getByTitle(this.userSelectionsListTitle);

      // Add custom fields with display names - SharePoint will create internal names
      await list.fields.addNumber('User Id', { Title: 'User Id' });
      await list.fields.addNumber('Global Link Id', { Title: 'Global Link Id' });
      await list.fields.addBoolean('Is Selected', { Title: 'Is Selected' });
      await list.fields.addDateTime('Date Selected', { Title: 'Date Selected' });

      Log.info(LOG_SOURCE, `Successfully created user selections list: ${this.userSelectionsListTitle}`);
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
    }
  }

  /**
   * Add a new global link to SharePoint
   */
  public async addGlobalLink(link: Partial<IGlobalLink>): Promise<boolean> {
    try {
      Log.info(LOG_SOURCE, `Adding new global link to home site: ${link.title}`);
      
      const list = this.homeSiteSp.web.lists.getByTitle(this.globalLinksListTitle);
      
      const itemData: any = {
        Title: link.title,
        Footer_x0020_URL: {
          Url: link.url,
          Description: link.title || link.description || ''
        },
        Description: link.description || '',
        Icon_x0020_Name: link.iconName || 'Link',
        Sort_x0020_Order: link.order || 0,
        Category: link.category || 'General',
        Is_x0020_Mandatory: link.isMandatory || false,
        Is_x0020_Active: link.isActive !== false,
        Target_x0020_Audience: link.targetAudience ? link.targetAudience.join(';') : '',
        Valid_x0020_From: link.validFrom,
        Valid_x0020_To: link.validTo
      };

      // Add Icon URL if provided
      if (link.iconUrl) {
        itemData.Icon_x0020_URL = {
          Url: link.iconUrl,
          Description: `Icon for ${link.title}`
        };
      }

      await list.items.add(itemData);
      
      Log.info(LOG_SOURCE, `Successfully added global link: ${link.title}`);
      return true;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return false;
    }
  }

  /**
   * Add sample global links (for testing)
   */
  public async addSampleGlobalLinks(): Promise<void> {
    try {
      const sampleLinks: Partial<IGlobalLink>[] = [
        {
          title: 'Company Portal',
          url: 'https://portal.company.com',
          description: 'Main company portal - mandatory for all users',
          iconName: 'Home',
          order: 1,
          category: 'Essential',
          isMandatory: true,
          isActive: true
        },
        {
          title: 'Help & Support',
          url: 'https://support.company.com',
          description: 'Get help and support - mandatory for all users',
          iconName: 'Help',
          order: 2,
          category: 'Essential',
          isMandatory: true,
          isActive: true
        },
        {
          title: 'Employee Benefits',
          url: 'https://benefits.company.com',
          description: 'Employee benefits portal - optional',
          iconName: 'Heart',
          order: 3,
          category: 'HR',
          isMandatory: false,
          isActive: true
        },
        {
          title: 'Learning & Development',
          url: 'https://learning.company.com',
          description: 'Training and development resources - optional',
          iconName: 'Education',
          order: 4,
          category: 'Professional Development',
          isMandatory: false,
          isActive: true
        },
        {
          title: 'Travel Booking',
          url: 'https://travel.company.com',
          description: 'Corporate travel booking system - optional',
          iconName: 'Airplane',
          order: 5,
          category: 'Business Tools',
          isMandatory: false,
          isActive: true
        }
      ];

      const list = this.sp.web.lists.getByTitle(this.globalLinksListTitle);
      
      for (const link of sampleLinks) {
        await list.items.add({
          Title: link.title,
          Footer_x0020_URL: link.url,
          Description: link.description,
          Icon_x0020_Name: link.iconName,
          Sort_x0020_Order: link.order,
          Category: link.category,
          Is_x0020_Mandatory: link.isMandatory,
          Is_x0020_Active: link.isActive
        });
      }

      Log.info(LOG_SOURCE, `Added ${sampleLinks.length} sample global links`);
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
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
        target: '_blank',
        data: link
      }));
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }

  public async getPersonalMenuItems(): Promise<IContextualMenuItem[]> {
    return []; // GlobalLinksService does not provide personal menu items
  }
}