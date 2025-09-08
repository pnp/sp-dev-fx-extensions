import { MSGraphClientV3, SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
import { News } from "../models/News";
import RssService from "./RssService";

export default class GraphService {
  private _graphClient: MSGraphClientV3;
  private _spHttpClient: SPHttpClient;
  private _rssService: RssService;

  constructor(graphClient: MSGraphClientV3, spHttpClient: SPHttpClient) {
    this._graphClient = graphClient;
    this._spHttpClient = spHttpClient;
    this._rssService = new RssService();
  }

  /**
   * Fetch news items from the SharePoint list using Microsoft Graph API.
   * Checks the current site, home site, and hub site (if connected) and combines the results.
   * @param siteID - The current site ID.
   * @param listTitle - The title of the SharePoint list.
   */
  public async getNewsItems(siteID: string, siteName: string, listTitle: string): Promise<News[]> {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    try {
      const currentSiteNews = await this._fetchNewsItemsFromSite(siteID, listTitle, today.toISOString().split("T")[0]);
      const homeSiteId = await this._getHomeSiteID();
      const homeSiteNews = homeSiteId ? await this._fetchNewsItemsFromSite(homeSiteId, listTitle, today.toISOString().split("T")[0]) : [];

      const hubSiteId = await this._getHubSiteID(siteName);
      const hubSiteNews = hubSiteId ? await this._fetchNewsItemsFromSite(hubSiteId, listTitle, today.toISOString().split("T")[0]) : [];

      const allSharePointNews = [...currentSiteNews, ...homeSiteNews, ...hubSiteNews];

      const rssUrls = this._extractRssUrls(allSharePointNews);
      const rssNews = rssUrls.length > 0 ? await this._rssService.fetchMultipleRssFeeds(rssUrls, startDate, endDate) : [];

      const allNews = [...allSharePointNews, ...rssNews];

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
      const apiUrl = `/sites/${siteId}/lists/${listTitle}/items?expand=fields&$filter=fields/PublishDate le '${today}' and fields/ExpiryDate gt '${today}'&$orderby=fields/PublishDate asc&$top=10`;

      const response = await this._graphClient
        .api(apiUrl)
        .header("Prefer", "HonorNonIndexedQueriesWarningMayFailRandomly")
        .get();

      return response.value.map((item: any) => ({
        title: item.fields.Title,
        content: item.fields.Content,
        publishDate: new Date(item.fields.PublishDate),
        rssUrl: item.fields.RssUrl || undefined,
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

  private _extractRssUrls(newsItems: News[]): string[] {
    const rssUrls: string[] = [];
    newsItems.forEach(item => {
      if (item.rssUrl && item.rssUrl.trim() !== '') {
        const url = item.rssUrl.trim();
        if (!rssUrls.includes(url)) {
          rssUrls.push(url);
        }
      }
    });
    return rssUrls;
  }
}
