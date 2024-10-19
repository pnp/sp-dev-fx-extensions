// src/services/userProfile/SPUserProfileService.ts

import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';

export default class SPUserProfileService {
  private spHttpClient: SPHttpClient;
  private siteUrl: string;
  private userPrincipalName: string;

  /**
   * Constructor for the User Profile Service
   * @param context The SPFx context
   */
  constructor(context: any) {
    this.spHttpClient = context.spHttpClient;
    this.siteUrl = context.pageContext.site.absoluteUrl;
    this.userPrincipalName = context.pageContext.user.loginName; // Fetch the user's login name
  }

  /**
   * Retrieves a user profile property.
   * @param propertyName The name of the profile property.
   * @returns The value of the profile property or null.
   */
  public async getUserProfileProperty(propertyName: string): Promise<string | null> {
    const endpoint = `${this.siteUrl}/_api/SP.UserProfiles.PeopleManager/GetMyProperties`;
    try {
      const response: SPHttpClientResponse = await this.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);
      const data = await response.json();
      const property = data.UserProfileProperties.find((prop: any) => prop.Key === propertyName);
      return property ? property.Value : null;
    } catch (error) {
      console.error('Error fetching user profile property:', error);
      return null;
    }
  }

  /**
   * Sets a user profile property.
   * @param propertyName The name of the profile property.
   * @param propertyType The type of the profile property.
   * @param propertyValue The value to set for the profile property.
   * @returns True if successful, false otherwise.
   */
  public async setUserProfileProperty(propertyName: string, propertyValue: string): Promise<boolean> {
    const endpoint = `${this.siteUrl}/_api/SP.UserProfiles.PeopleManager/SetSingleValueProfileProperty`;
  
    const body = JSON.stringify({
      accountName: this.userPrincipalName,
      propertyName: propertyName,
      propertyValue: propertyValue
    });
  
    const options: ISPHttpClientOptions = {
      headers: {
        'Accept': 'application/json;odata=verbose',
        'Content-Type': 'application/json;odata=verbose',
        'X-RequestDigest': await this.getFormDigest()
      },
      body: body
    };
  
    try {
      const response: SPHttpClientResponse = await this.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, options);
  
      if (response.ok) {
        console.log(`Successfully set user profile property ${propertyName}`);
        return true;
      } else {
        const errorText = await response.text();
        console.error('Error setting user profile property:', response.statusText, errorText);
        return false;
      }
    } catch (error) {
      console.error('Error setting user profile property:', error);
      return false;
    }
  }
  
  /**
   * Retrieves the form digest value required for POST requests.
   * @returns The form digest value.
   */
  private async getFormDigest(): Promise<string> {
    const endpoint = `${this.siteUrl}/_api/contextinfo`;
  
    const options: ISPHttpClientOptions = {
      headers: {
        'Accept': 'application/json;odata=verbose',
      },
    };
  
    try {
      const response: SPHttpClientResponse = await this.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, options);
      if (response.ok) {
        const responseJson = await response.json();
        const digestValue = responseJson.d?.GetContextWebInformation?.FormDigestValue;
  
        if (!digestValue) {
          throw new Error('Form digest is empty');
        }
  
        return digestValue;
      } else {
        throw new Error(`Error fetching context info: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error getting form digest:', error);
      throw error;
    }
  }
  
  
}
