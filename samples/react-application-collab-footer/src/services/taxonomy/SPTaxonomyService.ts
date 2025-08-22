/**
 * DISCLAIMER
 *
 * As there is not yet an OData end-point for managed metadata, this service makes use of the ProcessQuery end-points.
 * The service will get updated once the APIs are in place for managing managed metadata.
 */

import { ExtensionContext } from '@microsoft/sp-extension-base';
import { Environment, EnvironmentType, Log } from '@microsoft/sp-core-library';
import {
  SPHttpClient,
  SPHttpClientResponse,
  ISPHttpClientOptions,
} from '@microsoft/sp-http';
import { ITermSets, ITermSet, ITerms, ITerm } from './SPTaxonomyTypes'; // Assuming these types are already defined

const LOG_SOURCE: string = 'SPTaxonomyService';

export default class SPTaxonomyService {
  // Endpoint URLs for the ProcessQuery and ContextInfo APIs
  private clientServiceUrl: string;
  private contextInfoUrl: string;

  // FormDigestValue for SharePoint operations
  private formDigest: string = '';
  private formDigestExpiry: number = 0; // Timestamp in milliseconds

  /**
   * Constructor for SPTaxonomyService
   * @param context - The web part or extension context
   */
  constructor(private context: ExtensionContext) {
    const webUrl = this.context.pageContext.web.absoluteUrl;
    this.clientServiceUrl = `${webUrl}/_vti_bin/client.svc/ProcessQuery`;
    this.contextInfoUrl = `${webUrl}/_api/contextinfo`;
  }

  /**
   * Retrieves a new value for the Form Digest for SharePoint Online, with caching to optimize performance.
   */
  private async getFormDigest(): Promise<string> {
    const currentTime = Date.now();

    // Check if the formDigest is still valid
    if (this.formDigest && currentTime < this.formDigestExpiry) {
      return this.formDigest;
    }

    const httpPostOptions: ISPHttpClientOptions = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    try {
      const response: SPHttpClientResponse = await this.context.spHttpClient.post(
        this.contextInfoUrl,
        SPHttpClient.configurations.v1,
        httpPostOptions
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching context info: ${response.status} ${response.statusText}`
        );
      }

      const contextInfoJson = await response.json();
      const formDigest = contextInfoJson.FormDigestValue as string;
      const timeoutSeconds = contextInfoJson.FormDigestTimeoutSeconds || 1800; // Default to 30 minutes if not provided

      if (!formDigest) {
        throw new Error('FormDigestValue is missing in the context info response.');
      }

      this.formDigest = formDigest;
      this.formDigestExpiry = currentTime + timeoutSeconds * 1000; // Convert to milliseconds

      return this.formDigest;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }

  /**
   * Retrieves the collection of terms for a term set in the current SharePoint environment, including nested terms.
   * @param termSetName - The name of the term set
   * @param locale - The locale identifier (default is 1033 for English)
   */
  public async getTermsFromTermSet(termSetName: string, locale: number = 1033): Promise<ITerm[]> {
    // Check if running in a SharePoint environment
    if (
      Environment.type !== EnvironmentType.SharePoint &&
      Environment.type !== EnvironmentType.ClassicSharePoint
    ) {
      Log.warn(LOG_SOURCE, 'Not running in a SharePoint environment');
      return [];
    }

    try {
      await this.getFormDigest();

      // Build the Client Service Request XML
      const requestBody: string = this.buildTermSetRequest(termSetName, locale);

      const httpPostOptions: ISPHttpClientOptions = {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'text/xml',
          'X-RequestDigest': this.formDigest,
        },
        body: requestBody,
      };

      const serviceResponse: SPHttpClientResponse = await this.context.spHttpClient.post(
        this.clientServiceUrl,
        SPHttpClient.configurations.v1,
        httpPostOptions
      );

      if (!serviceResponse.ok) {
        throw new Error(
          `Error fetching terms from term set: ${serviceResponse.status} ${serviceResponse.statusText}`
        );
      }

      const serviceJSONResponse: any[] = await serviceResponse.json();
      return await this.processTermSetResponse(serviceJSONResponse);
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }

  /**
   * Builds the ProcessQuery XML request body to fetch the terms from a term set
   * @param termSetName - The name of the term set
   * @param locale - The locale identifier
   */
  private buildTermSetRequest(termSetName: string, locale: number): string {
    // Escape XML special characters in termSetName to prevent XML injection
    const escapedTermSetName = this.escapeXml(termSetName);

    return `
      <Request AddExpandoFieldTypeSuffix="true" SchemaVersion="15.0.0.0"
        LibraryVersion="16.0.0.0" ApplicationName="JavaScript Client"
        xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009">
        <Actions>
          <ObjectPath Id="2" ObjectPathId="1" />
          <ObjectIdentityQuery Id="3" ObjectPathId="1" />
          <ObjectPath Id="5" ObjectPathId="4" />
          <ObjectIdentityQuery Id="6" ObjectPathId="4" />
          <ObjectPath Id="8" ObjectPathId="7" />
          <Query Id="9" ObjectPathId="7">
            <Query SelectAllProperties="false">
              <Properties />
            </Query>
            <ChildItemQuery SelectAllProperties="false">
              <Properties>
                <Property Name="Terms" SelectAll="true">
                  <Query SelectAllProperties="false">
                    <Properties />
                  </Query>
                </Property>
              </Properties>
            </ChildItemQuery>
          </Query>
        </Actions>
        <ObjectPaths>
          <StaticMethod Id="1" Name="GetTaxonomySession" TypeId="{981cbc68-9edc-4f8d-872f-71146fcbb84f}" />
          <Method Id="4" ParentId="1" Name="GetDefaultSiteCollectionTermStore" />
          <Method Id="7" ParentId="4" Name="GetTermSetsByName">
            <Parameters>
              <Parameter Type="String">${escapedTermSetName}</Parameter>
              <Parameter Type="Int32">${locale}</Parameter>
            </Parameters>
          </Method>
        </ObjectPaths>
      </Request>`;
  }

  /**
   * Processes the JSON response from the ProcessQuery request and extracts the terms from the term set.
   * @param response - The JSON response from SharePoint
   */
  private async processTermSetResponse(response: any): Promise<ITerm[]> {
    const termSetsCollection: ITermSets[] = response.filter(
      (child: any) => child && child['_ObjectType_'] === 'SP.Taxonomy.TermSetCollection'
    );

    if (termSetsCollection.length > 0) {
      const termSet: ITermSet = termSetsCollection[0]._Child_Items_[0]; // Assuming you need the first term set

      const childItems: ITerm[] = termSet.Terms._Child_Items_;

      // Recursively fetch and expand all terms and their child terms
      return await Promise.all(childItems.map(async (term: ITerm) => this.expandTerm(term)));
    }

    Log.warn(LOG_SOURCE, 'No term sets found in the response');
    return [];
  }

  /**
   * Expands a term to include its child terms recursively.
   * @param term - The term to expand
   */
  private async expandTerm(term: ITerm): Promise<ITerm> {
    const childTerms = await this.getChildTerms(term);
    term.CustomProperties = term.CustomProperties ?? null;
    term.Id = this.cleanGuid(term.Id);
    term.LocalCustomProperties = term.LocalCustomProperties ?? null;
    term.Terms = childTerms;
    term.TermsCount = childTerms.length;
    term.PathDepth = term.PathOfTerm.split(';').length;

    return term;
  }

  /**
   * Retrieves the child terms of a given term in the Term Store.
   * @param term - The parent term
   */
  private async getChildTerms(term: ITerm): Promise<ITerm[]> {
    if (term.TermsCount > 0) {
      const requestBody: string = this.buildChildTermsRequest(term._ObjectIdentity_);

      const httpPostOptions: ISPHttpClientOptions = {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'text/xml',
          'X-RequestDigest': this.formDigest,
        },
        body: requestBody,
      };

      try {
        const serviceResponse: SPHttpClientResponse = await this.context.spHttpClient.post(
          this.clientServiceUrl,
          SPHttpClient.configurations.v1,
          httpPostOptions
        );

        if (!serviceResponse.ok) {
          throw new Error(
            `Error fetching child terms: ${serviceResponse.status} ${serviceResponse.statusText}`
          );
        }

        const serviceJSONResponse: any[] = await serviceResponse.json();

        const termCollection: ITerms[] = serviceJSONResponse.filter(
          (child: any) => child && child['_ObjectType_'] === 'SP.Taxonomy.TermCollection'
        );

        if (termCollection.length > 0) {
          return await Promise.all(
            termCollection[0]._Child_Items_.map(async (t: ITerm) => this.expandTerm(t))
          );
        }

        Log.warn(LOG_SOURCE, 'No child terms found in the response');
        return [];
      } catch (error) {
        Log.error(LOG_SOURCE, error as Error);
        return [];
      }
    }

    return [];
  }

  /**
   * Builds the ProcessQuery XML request body to fetch the child terms for a term
   * @param objectIdentity - The object identity string of the parent term
   */
  private buildChildTermsRequest(objectIdentity: string): string {
    // Escape XML special characters in objectIdentity to prevent XML injection
    const escapedObjectIdentity = this.escapeXml(objectIdentity);

    return `
      <Request AddExpandoFieldTypeSuffix="true" SchemaVersion="15.0.0.0" LibraryVersion="16.0.0.0" ApplicationName=".NET Library"
        xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009">
        <Actions>
          <ObjectPath Id="20" ObjectPathId="19" />
          <Query Id="21" ObjectPathId="19">
            <Query SelectAllProperties="false">
              <Properties />
            </Query>
            <ChildItemQuery SelectAllProperties="true">
              <Properties>
                <Property Name="CustomSortOrder" ScalarProperty="true" />
                <Property Name="CustomProperties" ScalarProperty="true" />
                <Property Name="LocalCustomProperties" ScalarProperty="true" />
              </Properties>
            </ChildItemQuery>
          </Query>
        </Actions>
        <ObjectPaths>
          <Property Id="19" ParentId="16" Name="Terms" />
          <Identity Id="16" Name="${escapedObjectIdentity}" />
        </ObjectPaths>
      </Request>`;
  }

  /**
   * Cleans the GUID string returned from the web service response
   * @param guid - The GUID string to clean
   */
  private cleanGuid(guid: string): string {
    if (guid) {
      return guid.replace('/Guid(', '').replace('/', '').replace(')', '');
    }
    return '';
  }

  /**
   * Escapes XML special characters in a string to prevent injection vulnerabilities.
   * @param unsafe - The string to escape
   */
  private escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
