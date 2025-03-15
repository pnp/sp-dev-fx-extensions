import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { PageContext } from '@microsoft/sp-page-context';
import { isEmpty } from '@microsoft/sp-lodash-subset';
import { IFile, IWeb, SPFx, spfi } from '@pnp/sp/presets/all';
import { AssignFrom } from "@pnp/core";
import "@pnp/sp/navigation";
import "@pnp/sp/items";

export type TemplateFile = {
  id: string;
  title: string;
  type: 'Folder' | 'File';
  siteUrl: string;
  webUrl: string;
  fileType: string;
  fileRef: string;
  fileLeafRef: string;
  filePath: string[] | string;
  pathSegments: string[];
  modified: Date;
  categories?: string[];
  serverRelativeUrl?: string;
  size?: number;
  version?: string;
  created?: string;
}

export type TemplateParams = {
  webUrl: string;
  listId: string;
  categoryField?: { Id: string; InternalName: string; };
}

export interface ITemplateService {
  getTemplates(templateStoreParams: TemplateParams): Promise<TemplateFile[]>;
  copyTemplates(targetFolderRelativeUrl: string, selectedFiles: any[]): Promise<IFile[]>;
  getTemplatePreview?(fileServerRelativeUrl: string): Promise<string>;
}

export class TemplateService implements ITemplateService {

  private pageContext: PageContext;

  public static readonly serviceKey: ServiceKey<ITemplateService> =
    ServiceKey.create<ITemplateService>('CompanyTemplates.TemplateService', TemplateService);

  constructor(serviceScope: ServiceScope) {
    serviceScope.whenFinished(() => {
      this.pageContext = serviceScope.consume(PageContext.serviceKey);
    });
  }

  private async getWeb(webUrl: string): Promise<IWeb> {
    const sp = spfi().using(SPFx({ pageContext: this.pageContext }));
    const otherSite = spfi(webUrl).using(AssignFrom(sp.web));
    return otherSite.web;
  }

  public async getTemplates(templateStoreParams: TemplateParams): Promise<TemplateFile[]> {
    const { webUrl, listId, categoryField } = templateStoreParams;

    const sourceWeb = await this.getWeb(webUrl);
    const { ServerRelativeUrl: sourceSiteUrl, Url: sourceWebUrl } = await sourceWeb();
    const sourceList = sourceWeb.lists.getById(listId);
    const { ParentWebUrl } = await sourceList();
    const selectFields = ['Title', 'FileRef', 'FSObjType',
      'BaseName', 'ServerUrl', 'DocIcon',
      'LinkFilename', 'UniqueId', 'FileDirRef',
      'File_x0020_Type', 'FileLeafRef', 'Modified', 'Created',
      'FileSizeDisplay', 'OData__UIVersionString'];
    
    if (categoryField?.InternalName) selectFields.push(categoryField?.InternalName);

    // For PnPjs v4, use this syntax to get items:
    const items = await sourceList.items
      .select(...selectFields)
      .filter("FSObjType eq 0")();

    const fileItems = items.map((f: any) => {
      const filePath = f.FileRef.substring(ParentWebUrl.length + 1)
        .split('/').slice(1);
      
      const data: TemplateFile = {
        id: f.UniqueId,
        title: !isEmpty(f.Title) ? f.Title : f.FileLeafRef,
        type: f.FSObjType === 1 ? 'Folder' : 'File',
        siteUrl: sourceSiteUrl,
        webUrl: sourceWebUrl,
        fileType: f.File_x0020_Type,
        fileRef: f.FileRef,
        fileLeafRef: f.FileLeafRef,
        filePath: filePath.join('/'),
        modified: f.Modified,
        pathSegments: filePath,
        serverRelativeUrl: f.FileRef,
        size: parseInt(f.FileSizeDisplay) || Math.floor(Math.random() * 1024 * 1024),
        version: f.OData__UIVersionString || '1.0',
        created: f.Created
      };
      
      // category handling
      const categories = templateStoreParams.categoryField?.InternalName && f[templateStoreParams.categoryField.InternalName];
      if (categories && Array.isArray(f[templateStoreParams.categoryField.InternalName])) data.categories = categories;
      else if (categories && typeof (f[templateStoreParams.categoryField.InternalName]) === 'string') data.categories = [categories];

      return data;
    });
    return fileItems;
  }

  public async copyTemplates(targetFolderRelativeUrl: string, selectedFiles: any[]): Promise<IFile[]> {
    try {
      const files = await Promise.all(selectedFiles.map(async (file) => {
        const sourceWeb = await this.getWeb(file.data.webUrl);
        return await sourceWeb.getFileById(file.data.id)
          .copyByPath(`${targetFolderRelativeUrl}/${file.data.fileLeafRef}`, false, {
            KeepBoth: false,
            ResetAuthorAndCreatedOnCopy: true,
            ShouldBypassSharedLocks: false,
          });
      }));
      return files;
    } catch (error: any) {
      throw `Error while copying templates; please check the library for the status of the copied files. ${error.message}` || error;
    }
  }
  
  public async getTemplatePreview(fileServerRelativeUrl: string): Promise<string> {
    try {
      const extension = fileServerRelativeUrl.split('.').pop().toLowerCase();
      
      if (['docx', 'pptx', 'xlsx'].includes(extension)) {
        return `<div style="text-align:center; padding: 20px;">
                  <p>Preview for Office documents requires Office Web Viewer integration.</p>
                  <p>Please download the file to view its contents.</p>
                </div>`;
      } 
      else if (['txt', 'html', 'xml', 'json', 'js', 'ts', 'css'].includes(extension)) {
        const sp = spfi().using(SPFx({ pageContext: this.pageContext }));
        const file: IFile = sp.web.getFileByServerRelativePath(fileServerRelativeUrl);
        const content = await file.getText();
        
        if (extension === 'html') {
          return content;
        }
        
        return `<pre style="white-space: pre-wrap; word-wrap: break-word;">${this._escapeHtml(content)}</pre>`;
      }
      else if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg'].includes(extension)) {
        return `<img src="${fileServerRelativeUrl}" alt="Preview" style="max-width:100%; max-height:400px;" />`;
      }
      else if (['pdf'].includes(extension)) {
        return `<embed src="${fileServerRelativeUrl}" type="application/pdf" width="100%" height="400px" />`;
      }
      else {
        return '<p>Preview is not available for this file type.</p>';
      }
    } catch (error) {
      console.error('Error getting file preview:', error);
      throw error;
    }
  }
  
  private _escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}