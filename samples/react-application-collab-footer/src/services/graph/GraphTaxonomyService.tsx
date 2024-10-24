import { AadHttpClient, HttpClientResponse } from '@microsoft/sp-http';
import { ITermSet, ITerm, ILocalizedName, ITerms } from './GraphTaxonomyTypes';

export default class SPTaxonomyService {
  private aadClient: AadHttpClient;
  private siteId: string;

  /**
   * Constructor for the Taxonomy Service
   * @param aadClient The AadHttpClient instance for making authenticated requests.
   * @param siteId The ID of the SharePoint site.
   */
  constructor(aadClient: AadHttpClient, siteId: string) {
    this.aadClient = aadClient;
    this.siteId = siteId;
  }

  /**
   * Generalized method to perform a GET request to Microsoft Graph API.
   * @param url The API endpoint to call.
   * @returns The JSON response or throws an error if failed.
   */
  private async fetchGraphAPI(url: string): Promise<any> {
    const response: HttpClientResponse = await this.aadClient.get(url, AadHttpClient.configurations.v1);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Graph API request failed: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Fetches term store groups for the current site.
   * @returns An array of term store groups.
   */
  public async getTermStoreGroups(): Promise<ITermSet[]> {
    const groupsUrl = `https://graph.microsoft.com/beta/sites/${this.siteId}/termStore/groups`;

    try {
      const groupsData = await this.fetchGraphAPI(groupsUrl);
      return groupsData.value as ITermSet[];
    } catch (error) {
      console.error('Error fetching term store groups:', error);
      return [];
    }
  }

  /**
   * Retrieves the Term Set ID by name from the Microsoft Graph API within a specific group and site.
   * @param termSetName The name of the term set to retrieve.
   * @param groupId The ID of the term store group.
   * @returns The ID of the term set or null if not found.
   */
  public async getTermSetIdByName(termSetName: string, groupId: string): Promise<ITerm[]> {
    const termSetsUrl = `https://graph.microsoft.com/beta/sites/${this.siteId}/termStore/groups/${groupId}/sets`;
    console.log("termSetsUrl",termSetsUrl)

    try {
      const termSetsData = await this.fetchGraphAPI(termSetsUrl);
      console.log("termSetsData",termSetsData)
      // Filter term sets to find the one with the localized name "PnP-CollabFooter-SharedLinks"
      const filteredTermSets = termSetsData.value.filter((termSet: ITerms) =>
        termSet.localizedNames.some((localizedName: ILocalizedName) => localizedName.name === "PnP-CollabFooter-SharedLinks")
      );

      // Save the id of the filtered term set as a variable (assuming there's only one match)
      const termSetId = filteredTermSets.length > 0 ? filteredTermSets[0].id : null;


      const termsUrl = `https://graph.microsoft.com/beta/sites/${this.siteId}/termStore/groups/${groupId}/sets/${termSetId}/terms`;
      const termsData = await this.fetchGraphAPI(termsUrl);
      console.log("termsData",termsData)
    return termsData.value as ITerm[];
    } catch (error) {
      console.error('Error fetching terms from term set:', error);
      return [];
    }
  }
}
