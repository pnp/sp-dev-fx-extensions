import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { SPHttpClient, SPHttpClientResponse, ODataVersion, ISPHttpClientConfiguration } from '@microsoft/sp-http';
import { ISharePointSearchResults, ISharePointSearchResultsTable } from "../models/ISearchHandler";
import { IMenuItem } from "../models/IMenuItem";
import { IPermissionItem } from "../models/IPermissionItem";
import { ISharingLink } from "../models/ISharingLink";
import GraphService from "./GraphService";

export interface ISPService {
  readTeamsites(searchText: string, start: number, currentSiteUrl: string): Promise<IMenuItem[]>;
}

export class SPService implements ISPService {
  public static readonly serviceKey: ServiceKey<SPService> =
    ServiceKey.create<SPService>('react-application-nav', SPService);
  private serviceScope: ServiceScope;
  private _spHttpClient: SPHttpClient;
  private currentSiteUrl: string;
  private pagesize: number = 15;

  constructor(serviceScope: ServiceScope) { 
    this.serviceScope = serviceScope; 
    serviceScope.whenFinished(() => {
      this._spHttpClient = serviceScope.consume(SPHttpClient.serviceKey);
    });
  }

  /**
   * This functions executes a SP search for sites and returns a non transformed search result
   * @param queryText Keqword query text for site search
   */
  private searchSites(queryText: string, start: number): Promise<ISharePointSearchResults> {
    const spSearchConfig: ISPHttpClientConfiguration = {
      defaultODataVersion: ODataVersion.v3
    };
    const requestUrl = this.currentSiteUrl + `/_api/search/query?querytext='${queryText}'&selectproperties='Title,Path,SiteLogo,Description,SiteId'&startrow=${start}&rowlimit=${this.pagesize}&sortlist='Created:descending'`;
    return this._spHttpClient.get(requestUrl, SPHttpClient.configurations.v1.overrideWith(spSearchConfig))
        .then((response: SPHttpClientResponse) => {
            return response.json();
        });
  }

  /**
   * This functions transforms a standard SP search result to custom data model
   * @param response: ISharePointSearchResults The standard SP search result
   */
  private transformSearchSites(response:ISharePointSearchResults): IMenuItem[] {
    const relevantResults: ISharePointSearchResultsTable | null = (response.PrimaryQueryResult !== null) ? response.PrimaryQueryResult.RelevantResults.Table : null;     
    const items: Array<IMenuItem> = new Array<IMenuItem>();
    if (relevantResults !== null){
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      relevantResults.Rows.forEach((r: any) => {          
        items.push({ displayName: r.Cells[0].Value, url: r.Cells[1].Value, iconUrl: r.Cells[2].Value, description: r.Cells[3].Value, key: r.Cells[4].Value });        
      });
      return items;
    }
    else {
      return [];
    }
  }
  
  public async readTeamsites(searchText: string, start: number, currentSiteUrl: string): Promise<IMenuItem[]> {
    let queryText = `contentclass:STS_Site AND WebTemplate:Group`;
    this.currentSiteUrl = currentSiteUrl;
    if (searchText !== null && searchText !== '') {
      queryText += ` AND ${searchText}`;
    }
    const searchResponse = await this.searchSites(queryText, start);
    return this.transformSearchSites(searchResponse);
  }

  public async readCommsites(searchText: string, start: number, currentSiteUrl: string): Promise<IMenuItem[]> {
    let queryText = `contentclass:STS_Site AND WebTemplate:SITEPAGEPUBLISHING`;
    this.currentSiteUrl = currentSiteUrl;
    if (searchText !== null && searchText !== '') {
      queryText += ` AND ${searchText}`;
    }
    const searchResponse = await this.searchSites(queryText, start);
    return this.transformSearchSites(searchResponse);
  }
  
  public async readHubsites(searchText: string, start: number, currentSiteUrl: string): Promise<IMenuItem[]> {
    let queryText = `contentclass:STS_Site AND IsHubSite:true`;
    this.currentSiteUrl = currentSiteUrl;
    if (searchText !== null && searchText !== '') {
      queryText += ` AND ${searchText}`;
    }
    const searchResponse = await this.searchSites(queryText, start);
    return this.transformSearchSites(searchResponse);
  }
  /**
   * This function evaluates if the given site belongs to a hub site and if so returns the HubSiteId ales null
   * @returns string|
   */
  // eslint-disable-next-line @rushstack/no-new-null
  public getHubSiteId(currentSiteUrl: string): Promise<string|null> {
    const requestUrl = `${currentSiteUrl}/_api/site/HubSiteId`;
    return this._spHttpClient.get(requestUrl, SPHttpClient.configurations.v1)
      .then((response) => {
        return response.json();
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((jsonResponse: any): string|null => {
        const hubSiteId: string = jsonResponse.value;
        if (hubSiteId !== '00000000-0000-0000-0000-000000000000') {
          return hubSiteId;
        }
        else {
          return null;
        }
      });
  }

  /**
   * This function evaluates if external sharing is enabled for the current site
   * @returns Promise<boolean> If external sharing enabled
   */
  public async evalExternalSharingEnabled(currentSiteUrl: string): Promise<boolean> {
    const requestUrl = currentSiteUrl + '/_api/site?$select=ShareByEmailEnabled';
    return this._spHttpClient.get(requestUrl, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((jsonResponse: any): boolean => {
        return jsonResponse.ShareByEmailEnabled;
      });
  }

  public async getSitePermissions(currentSiteUrl: string): Promise<IPermissionItem[]> {
    const requestUrl = currentSiteUrl + '/_api/web/roleassignments?$expand=Member/users,RoleDefinitionBindings';
    const defaultGroups = await this.getassociatedStdGroups(currentSiteUrl);
    return this._spHttpClient.get(requestUrl, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((jsonResponse: any) => {
        const permissionItems: IPermissionItem[] = [];        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jsonResponse.value.forEach((l: any) => {
          let isDefault: boolean = false;
          defaultGroups.forEach((g) => {
            if (g === l.PrincipalId) {
              isDefault = true;
            }
          })
          permissionItems.push({ key: l.PrincipalId, name: l.Member.Title, permission: l.RoleDefinitionBindings[0].Name, isDefault: isDefault, description: l.RoleDefinitionBindings[0].Description, url: this.currentSiteUrl + `/_layouts/15/people.aspx?MembershipGroupId=${l.PrincipalId}` });
        });        
        return permissionItems;
      });
  }

  public async removeSitePermission(currentSiteUrl: string, principalId: string): Promise<boolean> {
    const requestUrl = currentSiteUrl + `/_api/web/roleassignments/getbyprincipalid(${principalId})`;
    const response = await this._spHttpClient.post(requestUrl, 
      SPHttpClient.configurations.v1,
      {  
        headers: {  
          'Accept': 'application/json;odata=nometadata',  
          'Content-type': 'application/json;odata=verbose',  
          'odata-version': '',  
          'IF-MATCH': '*',  
          'X-HTTP-Method': 'DELETE'  
        }  
      });
    if (response.ok) {
      return true;
    }
    else {
      return false;
    }    
  }

  private async getassociatedStdGroups(currentSiteUrl: string): Promise<string[]> {
    const requestUrl = currentSiteUrl + '/_api/web?$expand=associatedOwnerGroup,associatedMemberGroup,associatedVisitorGroup';
    const response = await this._spHttpClient.get(requestUrl, SPHttpClient.configurations.v1);
    const principlaIds: string[] = [];
    if (response.ok) {
      const jsonResponse = await response.json();
      principlaIds.push(jsonResponse.AssociatedOwnerGroup.Id);
      principlaIds.push(jsonResponse.AssociatedMemberGroup.Id);
      principlaIds.push(jsonResponse.AssociatedVisitorGroup.Id);
    }
    return principlaIds;
  }
  public async evalSiteListsPermInheritance(currentSiteUrl: string): Promise<IPermissionItem[]> {
    this.currentSiteUrl = currentSiteUrl;
    const requestUrl = this.currentSiteUrl + '/_api/web/lists?$select=HasUniqueRoleAssignments,Title,Id,BaseTemplate,RootFolder/ServerRelativeUrl&$expand=RootFolder&$filter=BaseTemplate eq 101 or BaseTemplate eq 100';
    return this._spHttpClient.get(requestUrl, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((jsonResponse: any) => {
        const permissionItems: IPermissionItem[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jsonResponse.value.forEach((l: any) => {
          permissionItems.push({ key: l.Id, name: l.Title, permission: l.HasUniqueRoleAssignments ? 'Unique':'Inherits', isDefault: false, description: '', url: l.RootFolder.ServerRelativeUrl });
        });
        return permissionItems;
      });
  }

  public async breakInheritListPermissions(currentSiteUrl: string, listID: string): Promise<boolean> {
    this.currentSiteUrl = currentSiteUrl;
    const requestUrl = this.currentSiteUrl + `/_api/web/lists(guid'${listID}')/breakroleinheritance(copyRoleAssignments=true, clearSubscopes=true)`;
    return this._spHttpClient.post(requestUrl, SPHttpClient.configurations.v1, {})
    .then((response: SPHttpClientResponse) => {
      if (response.ok) {
        return true;
      }
      else {
        return false;
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .catch((err: any) => {
      console.log(err);
      return false;
    });
  }

  public async reInheritListPermissions(currentSiteUrl: string, listID: string): Promise<boolean> {
    this.currentSiteUrl = currentSiteUrl;
    const requestUrl = this.currentSiteUrl + `/_api/web/lists(guid'${listID}')/ResetRoleInheritance()`;
    return this._spHttpClient.post(requestUrl, SPHttpClient.configurations.v1, {})
    .then((response: SPHttpClientResponse) => {
      if (response.ok) {
        return true;
      }
      else {
        return false;
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .catch((err: any) => {
      console.log(err);
      return false;
    });
  }

  public async getSharingLinks(currentSiteUrl: string, siteId: string): Promise<ISharingLink[]> {
    let requestUrl = currentSiteUrl + `/_api/web/lists/GetByTitle('Sharing Links')`;
    const response = await this._spHttpClient.get(requestUrl, SPHttpClient.configurations.v1);
    if (response.ok) {
      requestUrl += `/items?$select=SharingDocId,CurrentLink,AvailableLinks`;
      const itemsResponse = await this._spHttpClient.get(requestUrl, SPHttpClient.configurations.v1);
      const itemsResponseJson = await itemsResponse.json();
      const sharingLinks: ISharingLink[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      itemsResponseJson.value.forEach((l: any) => {        
        const lJson = JSON.parse(l.AvailableLinks);
        if (Array.isArray(lJson) && lJson.length > 0) {
          const currLink = parseInt(l.CurrentLink);
          const docUrl = `${currentSiteUrl}/_layouts/15/Doc.aspx?sourcedoc={${l.SharingDocId}}`;
          const emails: string[] = [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          lJson[currLink].Invitees.forEach((i: any) => emails.push(i.Email));
          sharingLinks.push({ key: lJson[currLink].ShareId, docId: l.SharingDocId, name: l.SharingDocId, description: emails.join(), roleid: lJson[currLink].RoleDefinitionId, url: docUrl })
        }        
      });      
      const graphService = new GraphService(this.serviceScope);
      // Sample assumption: sharingLinks <= 20 
      // Otherwise page, as Graph batching only supports up to 20 requests per batch
      const enrichedSharingLinks = await graphService.evalSharingLinks(siteId, sharingLinks);
      return enrichedSharingLinks;
    }
    else {
      return []; // List not created yet, so nothing shared, yet
    }
  }
}