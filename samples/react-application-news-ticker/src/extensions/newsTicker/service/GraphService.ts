import { MSGraphClientV3, SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";

export interface News {
  title: string;
  content: string;
  publishDate: Date;
}

export default class GraphService {
  private _graphClient: MSGraphClientV3;
  private _spHttpClient: SPHttpClient;

  constructor(graphClient: MSGraphClientV3, spHttpClient: SPHttpClient) {
    this._graphClient = graphClient;
    this._spHttpClient = spHttpClient;
  }

  /**
   * Fetch news items from the SharePoint list using Microsoft Graph API.
   * Checks the current site, home site, and hub site (if connected) and combines the results.
   * @param siteID - The current site ID.
   * @param listTitle - The title of the SharePoint list.
   */
  public async getNewsItems(siteID: string, siteName: string, listTitle: string): Promise<News[]> {
    const today = new Date().toISOString().split("T")[0]; // Format date as YYYY-MM-DD

    try {
      // Step 1: Fetch news from the current site, home site, and hub site
      const currentSiteNews = await this._fetchNewsItemsFromSite(siteID, listTitle, today);
      const homeSiteId = await this._getHomeSiteID();
      const homeSiteNews = homeSiteId ? await this._fetchNewsItemsFromSite(homeSiteId, listTitle, today) : [];

      const hubSiteId = await this._getHubSiteID(siteName); // Use SharePoint REST API for hubSiteId
      const hubSiteNews = hubSiteId ? await this._fetchNewsItemsFromSite(hubSiteId, listTitle, today) : [];

      // Step 2: Combine the news items from all sources
      const allNews = [...currentSiteNews, ...homeSiteNews, ...hubSiteNews];

      // Step 3: Sort the combined news by publishDate (ascending)
      return allNews.sort((a, b) => a.publishDate.getTime() - b.publishDate.getTime());

    } catch (error) {
      console.error("Error fetching news items:", error);
      return [];
    }
  }

  /**
   * Fetch news items from a specific site.
   * @param siteId - The site ID to fetch news from.
   * @param listTitle - The title of the list.
   * @param today - The current date (formatted as YYYY-MM-DD).
   */
  private async _fetchNewsItemsFromSite(siteId: string, listTitle: string, today: string): Promise<News[]> {
    try {
      // Construct the Graph API URL with filters, sorting, and limiting
      const apiUrl = `/sites/${siteId}/lists/${listTitle}/items?expand=fields&$filter=fields/PublishDate le '${today}' and fields/ExpiryDate gt '${today}'&$orderby=fields/PublishDate asc&$top=10`;

      // Use MSGraphClientV3 to call the Microsoft Graph API
      const response = await this._graphClient
        .api(apiUrl)
        .header("Prefer", "HonorNonIndexedQueriesWarningMayFailRandomly")
        .get();

      // Map the response to the News model
      return response.value.map((item: any) => ({
        title: item.fields.Title,
        content: item.fields.Content,
        publishDate: new Date(item.fields.PublishDate),
      } as News));

    } catch (error) {
      console.error(`Error fetching news items from site ${siteId}:`, error);
      return [];
    }
  }

  /**
   * Get the ID of the home site using the Microsoft Graph API.
   * Returns the site ID if it's a home site, otherwise null.
   */
  private async _getHomeSiteID(): Promise<string | null> {
    try {
      // Call the Graph API to get the home site details
      const response = await this._graphClient
        .api("/sites/root?$select=siteCollection")
        .get();

      if (response && response.siteCollection && response.siteCollection.homeSiteId) {
        return response.siteCollection.homeSiteId;
      }
    } catch (error) {
      console.error("Error fetching home site:", error);
    }
    return null;
  }

  /**
   * Get the hubSiteId using the SharePoint REST API.
   * @param siteUrl - The absolute URL of the current site.
   */
  private async _getHubSiteID(siteUrl: string): Promise<string | null> {
    try {
      const apiUrl = `${siteUrl}/_api/site?$select=hubSiteId`;
      const response: SPHttpClientResponse = await this._spHttpClient.get(apiUrl, SPHttpClient.configurations.v1);
      const result = await response.json();

      if (result && result.hubSiteId) {
        return result.hubSiteId; 
      }

      return null;
    } catch (error) {
      console.error(`Error fetching hub site ID for site ${siteUrl}:`, error);
      return null;
    }
  }
}
