/**
 * DISCLAIMER
 *
 * As there is not yet an OData end-point for managed metadata, this service makes use of the ProcessQuery end-points.
 * The service will get updated once the APIs are in place for managing managed metadata.
 */

import { ExtensionContext } from '@microsoft/sp-extension-base';
import { Environment, EnvironmentType, Log } from '@microsoft/sp-core-library';

const LOG_SOURCE: string = 'SPUserProfileService';
import {
  SPHttpClient,
  SPHttpClientResponse,
  ISPHttpClientOptions,
} from '@microsoft/sp-http';
import { IPersonProperties, ISetPropertyResponse } from './SPUserProfileTypes';

export default class SPUserProfileService {
  
  // URLs for SharePoint endpoints
  private clientServiceUrl: string;
  private contextInfoUrl: string;

  // FormDigestValue for SharePoint operations
  private formDigest: string = '';

  /**
   * Main constructor for the User Profile Service
   * @param context - The extension context
   */
  constructor(private context: ExtensionContext) {
    const webUrl = this.context.pageContext.web.absoluteUrl;
    this.clientServiceUrl = `${webUrl}/_vti_bin/client.svc/ProcessQuery`;
    this.contextInfoUrl = `${webUrl}/_api/contextinfo`;
  }

  /**
   * Retrieves a new value for the Form Digest for SPO
   */
  private async getFormDigest(): Promise<string> {
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
        throw new Error(`Error fetching context info: ${response.status} ${response.statusText}`);
      }

      const contextInfoJson = await response.json();
      const formDigest = contextInfoJson.FormDigestValue as string;

      if (!formDigest) {
        throw new Error('FormDigestValue is missing in the context info response.');
      }

      this.formDigest = formDigest;
      return formDigest;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }

  /**
   * Retrieves the value of a User Profile property for the current user
   * @param propertyName - The name of the user profile property
   */
  public async getUserProfileProperty(propertyName: string): Promise<any> {
    // Check if running in a SharePoint environment
    if (
      Environment.type !== EnvironmentType.SharePoint &&
      Environment.type !== EnvironmentType.ClassicSharePoint
    ) {
      Log.warn(LOG_SOURCE, 'Not running in a SharePoint environment');
      return null;
    }

    try {
      await this.getFormDigest();

      // Build the Client Service Request XML
      const data: string = `
        <Request AddExpandoFieldTypeSuffix="true"
                 SchemaVersion="15.0.0.0"
                 LibraryVersion="16.0.0.0"
                 ApplicationName=".NET Library"
                 xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009">
          <Actions>
            <ObjectPath Id="2" ObjectPathId="1" />
            <ObjectPath Id="4" ObjectPathId="3" />
            <Query Id="5" ObjectPathId="3">
              <Query SelectAllProperties="false">
                <Properties>
                  <Property Name="AccountName" ScalarProperty="true" />
                  <Property Name="UserProfileProperties" ScalarProperty="true" />
                </Properties>
              </Query>
            </Query>
          </Actions>
          <ObjectPaths>
            <Constructor Id="1" TypeId="{cf560d69-0fdb-4489-a216-b6b47adf8ef8}" />
            <Method Id="3" ParentId="1" Name="GetMyProperties" />
          </ObjectPaths>
        </Request>`;

      const httpPostOptions: ISPHttpClientOptions = {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'text/xml',
          'X-RequestDigest': this.formDigest,
        },
        body: data,
      };

      const serviceResponse: SPHttpClientResponse = await this.context.spHttpClient.post(
        this.clientServiceUrl,
        SPHttpClient.configurations.v1,
        httpPostOptions
      );

      if (!serviceResponse.ok) {
        throw new Error(`Error fetching user profile property: ${serviceResponse.status} ${serviceResponse.statusText}`);
      }

      const serviceJSONResponse: any[] = await serviceResponse.json();

      // Extract the PersonProperties object from the response
      const personPropertiesCollection: IPersonProperties[] = serviceJSONResponse.filter(
        (child: any) => child?._ObjectType_ === 'SP.UserProfiles.PersonProperties'
      );

      if (personPropertiesCollection.length > 0) {
        const personProperties: IPersonProperties = personPropertiesCollection[0];
        return personProperties.UserProfileProperties[propertyName] ?? null;
      }

      Log.warn(LOG_SOURCE, `User profile property "${propertyName}" not found in the response`);
      return null;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return null;
    }
  }

  /**
   * Sets the value of a User Profile property for the current user
   * @param propertyName - The name of the user profile property
   * @param propertyType - The type of the property (e.g., "String")
   * @param value - The value to set
   */
  public async setUserProfileProperty(propertyName: string, propertyType: string, value: any): Promise<boolean> {
    // Check if running in a SharePoint environment
    if (
      Environment.type !== EnvironmentType.SharePoint &&
      Environment.type !== EnvironmentType.ClassicSharePoint
    ) {
      Log.warn(LOG_SOURCE, 'Not running in a SharePoint environment');
      return false;
    }

    try {
      await this.getFormDigest();

      // Encode the current user's login name
      const encodedUserName: string = encodeURIComponent(this.context.pageContext.user.loginName);
      const currentUserName: string = `i:0#.f|membership|${encodedUserName}`;

      // Build the Client Service Request XML
      const data: string = `
        <Request AddExpandoFieldTypeSuffix="true"
                 SchemaVersion="15.0.0.0"
                 LibraryVersion="16.0.0.0"
                 ApplicationName=".NET Library"
                 xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009">
          <Actions>
            <Method Name="SetSingleValueProfileProperty" Id="7" ObjectPathId="1">
              <Parameters>
                <Parameter Type="String">${currentUserName}</Parameter>
                <Parameter Type="String">${this.escapeXml(propertyName)}</Parameter>
                <Parameter Type="${this.escapeXml(propertyType)}">${this.escapeXml(value)}</Parameter>
              </Parameters>
            </Method>
          </Actions>
          <ObjectPaths>
            <Constructor Id="1" TypeId="{cf560d69-0fdb-4489-a216-b6b47adf8ef8}" />
          </ObjectPaths>
        </Request>`;

      const httpPostOptions: ISPHttpClientOptions = {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'text/xml',
          'X-RequestDigest': this.formDigest,
        },
        body: data,
      };

      const serviceResponse: SPHttpClientResponse = await this.context.spHttpClient.post(
        this.clientServiceUrl,
        SPHttpClient.configurations.v1,
        httpPostOptions
      );

      if (!serviceResponse.ok) {
        throw new Error(`Error setting user profile property: ${serviceResponse.status} ${serviceResponse.statusText}`);
      }

      const serviceJSONResponse: any[] = await serviceResponse.json();

      // Extract the response to check for errors
      const response: ISetPropertyResponse = serviceJSONResponse[0];
      return response?.ErrorInfo === null;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return false;
    }
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
