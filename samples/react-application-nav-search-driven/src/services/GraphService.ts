import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { MSGraphClientFactory, MSGraphClientV3,  } from "@microsoft/sp-http";
import { ITeam } from "../models/ITeam";
import { IMenuItem } from "../models/IMenuItem";
import { ISharingLink } from "../models/ISharingLink";

interface IGraphBatchRequest {
  id: string;
  method: string;
  url: string;
}

interface IGraphBatchBody {
  requests: IGraphBatchRequest[];
}

export default class GraphService {
	private msGraphClientFactory: MSGraphClientFactory;
  private client: MSGraphClientV3;

  public static readonly serviceKey: ServiceKey<GraphService> =
    ServiceKey.create<GraphService>('react-application-nav-graph', GraphService);

  constructor(serviceScope: ServiceScope) {  
    serviceScope.whenFinished(async () => {
      this.msGraphClientFactory = serviceScope.consume(MSGraphClientFactory.serviceKey);      
    });
  }

  public async readTeamsites(searchText: string, start: number): Promise<IMenuItem[]> {
    let queryText = `WebTemplate:Group`;
    if (searchText !== null && searchText !== '') {
      queryText += ` AND ${searchText}`;
    }
    const searchResponse = await this.searchSites(queryText, start);    
    return this.transformSearchSites(searchResponse);
  }

  public async readCommsites(searchText: string, start: number): Promise<IMenuItem[]> {
    let queryText = `WebTemplate:SITEPAGEPUBLISHING`;
    if (searchText !== null && searchText !== '') {
      queryText += ` AND ${searchText}`;
    }
    const searchResponse = await this.searchSites(queryText, start);
    return this.transformSearchSites(searchResponse);
  }

  public async readHubsites(searchText: string, start: number): Promise<IMenuItem[]> {
    let queryText = `IsHubSite:true`;
    if (searchText !== null && searchText !== '') {
      queryText += ` AND ${searchText}`;
    }
    const searchResponse = await this.searchSites(queryText, start);    
    return this.transformSearchSites(searchResponse);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async searchSites(queryText: string, start: number): Promise<any[]> {
    this.client = await this.msGraphClientFactory.getClient('3');
    const requestBody = {
      requests: [
          {
              entityTypes: [
                  "site"
              ],
              query: {
                  "queryString": `${queryText}`
              }
          }
      ]
    };

    const response = await this.client
            .api(`search/query`)
            .version('v1.0')
            .skip(start)
            .top(20)   // Limit in batching!      
            .post(requestBody);
    if (response.value[0].hitsContainers[0].total > 0) {
      return response.value[0].hitsContainers[0].hits;
    }
    else return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformSearchSites(response: any[]): IMenuItem[] {    
    const items: Array<IMenuItem> = new Array<IMenuItem>();
    if (response !== null && response.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response.forEach((r: any) => {          
        items.push({ displayName: r.resource.displayName, url: r.resource.webUrl, iconUrl: '', description: r.resource.description, key: r.resource.id });
      });
      return items;
    }
    else {
      return [];
    }
  }

  public async getTopTeams(): Promise<IMenuItem[]> {
    const rawTeams = await this.getTeams();
    const teamsMenuItems = await this.transformTeams(rawTeams);
    return teamsMenuItems;
  }
  /**
  * This function retrievs the user's membership teams from Graph
  */
  private async getTeams(): Promise<ITeam[]> {
    this.client = await this.msGraphClientFactory.getClient('3');
    const response = await this.client
            .api(`groups?$filter=resourceProvisioningOptions/Any(x:x eq 'Team')&$expand=members`) // /me/joinedTeams
            .version('v1.0')
            .top(20)   // Limit in batching!      
            .get();
    const teams: Array<ITeam> = new Array<ITeam>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response.value.forEach((item: ITeam|any) => {
      teams.push({ id: item.id, displayName: item.displayName, description: item.description, mailNickname: item.mailNickname, visibility: '', url: `/teams/${item.mailNickname}`, photo: '', members: item.members.length, createdDateTime: '', teamUrl: '', owners: []});
    });      
    return teams;
  }

  /**
   * This functions transforms a standard SP search result to custom data model
   * @param response: ISharePointSearchResults The standard SP search result
   */
  private transformTeams(teams: ITeam[]): IMenuItem[] {    
    const items: Array<IMenuItem> = new Array<IMenuItem>();
    if (teams !== null){
      teams.forEach((t: ITeam) => {          
        items.push({ displayName: t.displayName, url: t.url, iconUrl: '', description: t.description, key: t.id });        
      });
      return items;
    }
    else {
      return [];
    }
  }

  public async evalSharingLinks(siteID: string, sharingLinks: ISharingLink[]): Promise<ISharingLink[]> {
    this.client = await this.msGraphClientFactory.getClient('3');
    const body: IGraphBatchBody = { requests: [] };
    sharingLinks.forEach((l, index) => {
      const requestUrl = `/sites/${siteID}/drive/items/${l.docId}?$expand=permissions`;
      body.requests.push({ id: index.toString(), url: requestUrl, method: 'GET' });
    });
    const response = await this.client
      .api('$batch')
      .version('v1.0')
      .post(body);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response.responses.forEach((docResponse: any) => {
      if (docResponse.status === 200) {
        const respId = parseInt(docResponse.id); 
        sharingLinks[respId].name = docResponse.body.name;
        sharingLinks[respId].url = docResponse.body.webUrl;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let permission: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        docResponse.body.permissions.forEach((p: any) => {
          if (p.id === sharingLinks[respId].key) {
            permission = p;
          }
        });
        sharingLinks[respId].role = permission.roles.join();
        sharingLinks[respId].shareLink = permission.link.webUrl;
      }
    });
    return sharingLinks;
  }

  public async deleteSharingLink(siteID: string, docID: string, shareID: string): Promise<boolean> {
    this.client = await this.msGraphClientFactory.getClient('3');
    const response = await this.client
            .api(`https://graph.microsoft.com/v1.0/sites/${siteID}/drive/items/${docID}/permissions/${shareID}`)
            .version('v1.0')      
            .delete();
    console.log(response);
    return true;
  }
}