import { WebPartContext } from '@microsoft/sp-webpart-base';
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/folders';
import '@pnp/sp/files';
import '@pnp/sp/fields';
import '@pnp/sp/views';
import { Log } from '@microsoft/sp-core-library';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';

const LOG_SOURCE = 'SharePointListService';

export interface IListValidationResult {
  exists: boolean;
  listId?: string;
  title?: string;
  error?: string;
}

export interface IListCreationResult {
  success: boolean;
  listId?: string;
  error?: string;
  listUrl?: string;
}

export interface ISharePointFieldConfig {
  name: string;
  displayName: string;
  fieldType: 'Text' | 'Note' | 'Boolean' | 'Number' | 'DateTime' | 'Choice' | 'Lookup' | 'URL' | 'User' | 'UserMulti';
  required: boolean;
  choices?: string[];
  defaultValue?: string | number | boolean;
}

export class SharePointListService {
  private context: WebPartContext;
  private sp: ReturnType<typeof spfi>;

  constructor(context: WebPartContext) {
    this.context = context;
    this.sp = spfi().using(SPFx(this.context));
  }


  /**
   * Check if a SharePoint list exists
   */
  public async checkListExists(listTitle: string, siteUrl?: string): Promise<IListValidationResult> {
    try {
      const targetUrl = siteUrl || this.context.pageContext.web.absoluteUrl;
      const encodedListTitle = encodeURIComponent(listTitle.replace(/'/g, "''"));
      
      const response = await fetch(`${targetUrl}/_api/web/lists/getbytitle('${encodedListTitle}')?$select=Title,Id`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { exists: false };
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const listExists = result.d && result.d.Title;
      
      return {
        exists: !!listExists,
        listId: result.d?.Id,
        title: result.d?.Title
      };
    } catch (error) {
      Log.warn(LOG_SOURCE, `Error checking list existence for "${listTitle}": ${(error as Error).message}`);
      return {
        exists: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Create Global Footer Links list with all required fields
   */
  public async createGlobalLinksListSchema(listTitle: string, targetSiteUrl?: string): Promise<IListCreationResult> {
    try {
      let targetUrl = targetSiteUrl;
      
      if (!targetUrl) {
        // Try to get home site URL from context
        if (this.context.pageContext.legacyPageContext?.hubSiteId) {
          targetUrl = this.context.pageContext.site.absoluteUrl;
        } else {
          // Fallback to tenant root URL
          const currentUrl = this.context.pageContext.web.absoluteUrl;
          const tenantUrl = new URL(currentUrl);
          targetUrl = `${tenantUrl.protocol}//${tenantUrl.hostname}`;
        }
      }

      // Create SP instance for the target site
      const sp = spfi(targetUrl).using(SPFx(this.context));
      
      Log.info(LOG_SOURCE, `Creating SharePoint list '${listTitle}' on site: ${targetUrl}`);

      // Create the list
      const listCreateResult = await sp.web.lists.add(listTitle, 'Custom footer links for the organization', 100, false);
      
      if (!listCreateResult) {
        throw new Error('Failed to create list - no data returned');
      }

      Log.info(LOG_SOURCE, `List created successfully: ${listTitle}`);
      
      const list = sp.web.lists.getByTitle(listTitle);
      
      // Add the required fields sequentially to avoid conflicts
      const fieldsToAdd: ISharePointFieldConfig[] = [
        {
          name: 'FooterLinkUrl',
          displayName: 'URL',
          fieldType: 'URL',
          required: true
        },
        {
          name: 'FooterLinkDescription',
          displayName: 'Description',
          fieldType: 'Note',
          required: false
        },
        {
          name: 'FooterLinkIcon',
          displayName: 'Icon',
          fieldType: 'Text',
          required: false
        },
        {
          name: 'FooterLinkCategory',
          displayName: 'Category',
          fieldType: 'Text',
          required: false
        },
        {
          name: 'FooterLinkOrder',
          displayName: 'Display Order',
          fieldType: 'Number',
          required: false
        },
        {
          name: 'FooterLinkTargetUsers',
          displayName: 'Target Users',
          fieldType: 'UserMulti',
          required: false
        },
        {
          name: 'FooterLinkIsMandatory',
          displayName: 'Is Mandatory',
          fieldType: 'Boolean',
          required: false
        },
        {
          name: 'FooterLinkValidFrom',
          displayName: 'Valid From',
          fieldType: 'DateTime',
          required: false
        },
        {
          name: 'FooterLinkValidTo',
          displayName: 'Valid To',
          fieldType: 'DateTime',
          required: false
        }
      ];

      // Add fields one by one
      for (const field of fieldsToAdd) {
        try {
          await this.addFieldToList(list, field);
          Log.info(LOG_SOURCE, `Added field: ${field.name}`);
        } catch (fieldError) {
          Log.warn(LOG_SOURCE, `Warning: Could not add field ${field.name}: ${(fieldError as Error).message}`);
        }
      }

      // Update the default view to include new fields
      try {
        const views = await list.views();
        const defaultView = views.find(v => v.DefaultView) || views[0];
        
        if (defaultView) {
          const view = list.views.getById(defaultView.Id);
          const fieldsToAdd = [
            'FooterLinkUrl', 'FooterLinkDescription', 'FooterLinkIcon', 
            'FooterLinkCategory', 'FooterLinkOrder', 'FooterLinkIsMandatory'
          ];
          
          for (const fieldName of fieldsToAdd) {
            try {
              await view.fields.add(fieldName);
            } catch (viewFieldError) {
              // Field might already exist in view, continue
              Log.info(LOG_SOURCE, `Field ${fieldName} might already exist in view`);
            }
          }
        }
      } catch (viewError) {
        Log.warn(LOG_SOURCE, `Warning: Could not update default view: ${(viewError as Error).message}`);
      }

      return {
        success: true,
        listId: (listCreateResult as any).Id || (listCreateResult as any).data?.Id,
        listUrl: `${targetUrl}/Lists/${listTitle.replace(/\s+/g, '')}`
      };
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Create User Link Selections list
   */
  public async createUserSelectionsListSchema(listTitle: string = 'User Link Selections'): Promise<IListCreationResult> {
    try {
      Log.info(LOG_SOURCE, `Creating User Link Selections list: ${listTitle}`);
      
      // Create the list
      const listCreateResult = await this.sp.web.lists.add(listTitle, 'User selections for footer links', 100, false);
      
      if (!listCreateResult) {
        throw new Error('Failed to create User Link Selections list');
      }

      const list = this.sp.web.lists.getByTitle(listTitle);
      
      // Add required fields
      const fieldsToAdd: ISharePointFieldConfig[] = [
        {
          name: 'SelectedLinkIds',
          displayName: 'Selected Link IDs',
          fieldType: 'Note',
          required: false
        },
        {
          name: 'UserEmail',
          displayName: 'User Email',
          fieldType: 'Text',
          required: true
        },
        {
          name: 'LastUpdated',
          displayName: 'Last Updated',
          fieldType: 'DateTime',
          required: false
        }
      ];

      for (const field of fieldsToAdd) {
        try {
          await this.addFieldToList(list, field);
          Log.info(LOG_SOURCE, `Added field to User Selections: ${field.name}`);
        } catch (fieldError) {
          Log.warn(LOG_SOURCE, `Warning: Could not add field ${field.name}: ${(fieldError as Error).message}`);
        }
      }

      return {
        success: true,
        listId: (listCreateResult as any).Id || (listCreateResult as any).data?.Id
      };
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Add a field to a SharePoint list
   */
  private async addFieldToList(list: any, fieldConfig: ISharePointFieldConfig): Promise<void> {
    const { name, displayName, fieldType, required } = fieldConfig;
    
    let fieldXml = '';
    
    switch (fieldType) {
      case 'Text':
        fieldXml = `<Field Type="Text" Name="${name}" DisplayName="${displayName}" Required="${required}" MaxLength="255" />`;
        break;
      case 'Note':
        fieldXml = `<Field Type="Note" Name="${name}" DisplayName="${displayName}" Required="${required}" RichText="FALSE" />`;
        break;
      case 'URL':
        fieldXml = `<Field Type="URL" Name="${name}" DisplayName="${displayName}" Required="${required}" Format="Hyperlink" />`;
        break;
      case 'Number':
        fieldXml = `<Field Type="Number" Name="${name}" DisplayName="${displayName}" Required="${required}" />`;
        break;
      case 'Boolean':
        fieldXml = `<Field Type="Boolean" Name="${name}" DisplayName="${displayName}" Required="${required}"><Default>0</Default></Field>`;
        break;
      case 'DateTime':
        fieldXml = `<Field Type="DateTime" Name="${name}" DisplayName="${displayName}" Required="${required}" Format="DateOnly" />`;
        break;
      case 'UserMulti':
        fieldXml = `<Field Type="UserMulti" Name="${name}" DisplayName="${displayName}" Required="${required}" Mult="TRUE" UserSelectionMode="PeopleAndGroups" UserSelectionScope="0" />`;
        break;
      default:
        throw new Error(`Unsupported field type: ${fieldType}`);
    }
    
    await list.fields.createFieldAsXml(fieldXml);
  }

  /**
   * Upload custom icon to SharePoint document library
   */
  public async uploadCustomIcon(file: File, folderName: string = 'Global Footer Icons'): Promise<string> {
    try {
      // Ensure folder exists
      try {
        await this.sp.web.folders.addUsingPath(folderName);
        Log.info(LOG_SOURCE, `${folderName} folder created or already exists`);
      } catch (folderError) {
        // Folder might already exist, continue
        Log.info(LOG_SOURCE, `${folderName} folder handling completed`);
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `icon-${timestamp}.${fileExtension}`;

      // Upload file to SharePoint
      const fileBuffer = await file.arrayBuffer();
      const uploadResult = await this.sp.web.getFolderByServerRelativePath(
        `${this.context.pageContext.web.serverRelativeUrl}/${folderName}`
      ).files.addUsingPath(uniqueFileName, fileBuffer, { Overwrite: true });

      if (uploadResult) {
        const fileUrl = `${this.context.pageContext.web.absoluteUrl}/${folderName}/${uniqueFileName}`;
        Log.info(LOG_SOURCE, `Custom icon uploaded successfully: ${fileUrl}`);
        return fileUrl;
      } else {
        throw new Error('Upload failed - no file data returned');
      }
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }

  /**
   * Get list items with optional filtering
   */
  public async getListItems(listTitle: string, select?: string[], filter?: string, orderBy?: string): Promise<any[]> {
    try {
      let query = this.sp.web.lists.getByTitle(listTitle).items;
      
      if (select && select.length > 0) {
        query = query.select(...select);
      }
      
      if (filter) {
        query = query.filter(filter);
      }
      
      if (orderBy) {
        query = query.orderBy(orderBy);
      }
      
      const items = await query();
      return items || [];
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }

  /**
   * Add item to SharePoint list
   */
  public async addListItem(listTitle: string, itemData: any): Promise<any> {
    try {
      const result = await this.sp.web.lists.getByTitle(listTitle).items.add(itemData);
      Log.info(LOG_SOURCE, `Item added to ${listTitle} successfully`);
      return result;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }

  /**
   * Update item in SharePoint list
   */
  public async updateListItem(listTitle: string, itemId: number, itemData: any): Promise<any> {
    try {
      const result = await this.sp.web.lists.getByTitle(listTitle).items.getById(itemId).update(itemData);
      Log.info(LOG_SOURCE, `Item ${itemId} updated in ${listTitle} successfully`);
      return result;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }

  /**
   * Delete item from SharePoint list
   */
  public async deleteListItem(listTitle: string, itemId: number): Promise<void> {
    try {
      await this.sp.web.lists.getByTitle(listTitle).items.getById(itemId).delete();
      Log.info(LOG_SOURCE, `Item ${itemId} deleted from ${listTitle} successfully`);
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }

  public async getSharedMenuItems(listTitle: string): Promise<IContextualMenuItem[]> {
    try {
      
      const items = await this.getListItems(listTitle, [
        'Id', 'Title', 'FooterLinkUrl', 'FooterLinkDescription', 'FooterLinkIcon',
        'FooterLinkCategory', 'FooterLinkIsMandatory', 'FooterLinkOrder', 'FooterLinkTargetUsersId',
        'FooterLinkValidFrom', 'FooterLinkValidTo'
      ]);


      const menuItems = items.map(item => this.mapSharePointItemToMenuItem(item, 'shared'));
      

      return menuItems;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }

  public async getPersonalMenuItems(listTitle: string): Promise<IContextualMenuItem[]> {
    try {
      const items = await this.getListItems(listTitle, [
        'Id', 'Title', 'FooterLinkUrl', 'FooterLinkDescription', 'FooterLinkIcon',
        'FooterLinkCategory', 'FooterLinkOrder', 'FooterLinkLastUsed', 'FooterLinkClickCount'
      ]);

      return items.map(item => this.mapSharePointItemToMenuItem(item, 'personal'));
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }

  private mapSharePointItemToMenuItem(item: any, type: 'shared' | 'personal'): IContextualMenuItem {
    const iconName = item.FooterLinkIcon || 'Link';
    const url = item.FooterLinkUrl?.Url || item.FooterLinkUrl;
    const title = item.Title;
    const description = item.FooterLinkDescription;
    const category = item.FooterLinkCategory;

    const menuItem: IContextualMenuItem = {
      key: `${type}-${item.Id}`,
      name: title,
      href: url,
      title: description,
      iconProps: { iconName: iconName },
      target: '_blank',
      data: {
        id: item.Id,
        category: category,
        isMandatory: item.FooterLinkIsMandatory || false,
        targetUsers: item.FooterLinkTargetUsersId || [],
        validFrom: item.FooterLinkValidFrom,
        validTo: item.FooterLinkValidTo,
        order: item.FooterLinkOrder,
        lastUsed: item.FooterLinkLastUsed,
        clickCount: item.FooterLinkClickCount
      }
    };

    return menuItem;
  }
}