import { IWebPartContext} from '@microsoft/sp-webpart-base';
import { Environment, EnvironmentType } from '@microsoft/sp-core-library';
import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';

/**
 * @interface
 * Interface for SPTermStoreService configuration
 */
export interface ISPTermStoreServiceConfiguration {
  spHttpClient: SPHttpClient;
  siteAbsoluteUrl: string;
}


/**
 * @interface
 * Generic Term Object (abstract interface)
 */
export interface ISPTermObject {
  identity: string;
  isAvailableForTagging: boolean;
  name: string;
  guid: string;
  customSortOrder: string;
  terms: ISPTermObject[];
  localCustomProperties: any;
}

/**
 * @class
 * Service implementation to manage term stores in SharePoint
 * Basic implementation taken from: https://oliviercc.github.io/sp-client-custom-fields/
 */
export class SPTermStoreService {

  private spHttpClient: SPHttpClient;
  private siteAbsoluteUrl: string;
  private formDigest: string;

  /**
   * @function
   * Service constructor
   */
  constructor(config: ISPTermStoreServiceConfiguration){
      this.spHttpClient = config.spHttpClient;
      this.siteAbsoluteUrl = config.siteAbsoluteUrl;
  }

  /**
   * @function
   * Gets the collection of term stores in the current SharePoint env
   */
  public async getTermsFromTermSetAsync(termSetName: string, termSetLocal: Number): Promise<ISPTermObject[]> {
    if (Environment.type === EnvironmentType.SharePoint ||
        Environment.type === EnvironmentType.ClassicSharePoint) {

      //First gets the FORM DIGEST VALUE
      let contextInfoUrl: string = this.siteAbsoluteUrl + "/_api/contextinfo";
      let httpPostOptions: ISPHttpClientOptions = {
        headers: {
          "accept": "application/json",
          "content-type": "application/json"
        }
      };
      let response: SPHttpClientResponse = await this.spHttpClient.post(contextInfoUrl, SPHttpClient.configurations.v1, httpPostOptions);
      let jsonResponse: any = await response.json();
      this.formDigest = jsonResponse.FormDigestValue;

      //Build the Client Service Request
      let clientServiceUrl = this.siteAbsoluteUrl + '/_vti_bin/client.svc/ProcessQuery';
      let data = '<Request AddExpandoFieldTypeSuffix="true" SchemaVersion="15.0.0.0" LibraryVersion="16.0.0.0" ApplicationName="JavaScript Client" xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009"><Actions><ObjectPath Id="2" ObjectPathId="1" /><ObjectIdentityQuery Id="3" ObjectPathId="1" /><ObjectPath Id="5" ObjectPathId="4" /><ObjectIdentityQuery Id="6" ObjectPathId="4" /><ObjectPath Id="8" ObjectPathId="7" /><Query Id="9" ObjectPathId="7"><Query SelectAllProperties="false"><Properties /></Query><ChildItemQuery SelectAllProperties="false"><Properties><Property Name="Terms" SelectAll="true"><Query SelectAllProperties="false"><Properties /></Query></Property></Properties></ChildItemQuery></Query></Actions><ObjectPaths><StaticMethod Id="1" Name="GetTaxonomySession" TypeId="{981cbc68-9edc-4f8d-872f-71146fcbb84f}" /><Method Id="4" ParentId="1" Name="GetDefaultSiteCollectionTermStore" /><Method Id="7" ParentId="4" Name="GetTermSetsByName"><Parameters><Parameter Type="String">' + termSetName + '</Parameter><Parameter Type="Int32">' + termSetLocal + '</Parameter></Parameters></Method></ObjectPaths></Request>';
      httpPostOptions = {
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          "X-RequestDigest": this.formDigest
        },
        body: data
      };

      let serviceResponse: SPHttpClientResponse = await this.spHttpClient.post(clientServiceUrl, SPHttpClient.configurations.v1, httpPostOptions);
      let serviceJSONResponse: Array<any> = await serviceResponse.json();

      let result: Array<ISPTermObject> = new Array<ISPTermObject>();

      // Extract the object of type SP.Taxonomy.TermSetCollection from the array
      let termSetsCollections = serviceJSONResponse.filter(
        (child: any) => (child != null && child['_ObjectType_'] !== undefined && child['_ObjectType_'] === "SP.Taxonomy.TermSetCollection")
      );

      // And if any, process the TermSet objects in it
      if (termSetsCollections != null && termSetsCollections.length > 0) {
        let termSetCollection = termSetsCollections[0];

        let childTermSets = termSetCollection['_Child_Items_'];

        // Extract the object of type SP.Taxonomy.TermSet from the array
        let termSets = childTermSets.filter(
          (child: any) => (child != null && child['_ObjectType_'] !== undefined && child['_ObjectType_'] === "SP.Taxonomy.TermSet")
        );

        // And if any, process the requested TermSet object
        if (termSets != null && termSets.length > 0) {
          let termSet = termSets[0];

          let termsCollection = termSet['Terms'];
          let childItems = termsCollection['_Child_Items_'];

          return(await Promise.all<ISPTermObject>(childItems.map(async (t: any) : Promise<ISPTermObject> => {
            return await this.projectTermAsync(t);
          })));
        }
      }
    }

    // Default empty array in case of any missing data
    return (new Promise<Array<ISPTermObject>>((resolve, reject) => {
      resolve(new Array<ISPTermObject>());
    }));
  }


  /**
   * @function
   * Gets the child terms of another term of the Term Store in the current SharePoint env
   */
  private async getChildTermsAsync(term: any): Promise<ISPTermObject[]> {

    // Check if there are child terms to search for
    if (Number(term['TermsCount']) > 0) {

      //Build the Client Service Request
      let clientServiceUrl = this.siteAbsoluteUrl + '/_vti_bin/client.svc/ProcessQuery';
      let data = '<Request AddExpandoFieldTypeSuffix="true" SchemaVersion="15.0.0.0" LibraryVersion="16.0.0.0" ApplicationName=".NET Library" xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009"><Actions><ObjectPath Id="20" ObjectPathId="19" /><Query Id="21" ObjectPathId="19"><Query SelectAllProperties="false"><Properties /></Query><ChildItemQuery SelectAllProperties="true"><Properties><Property Name="CustomSortOrder" ScalarProperty="true" /><Property Name="LocalCustomProperties" ScalarProperty="true" /></Properties></ChildItemQuery></Query></Actions><ObjectPaths><Property Id="19" ParentId="16" Name="Terms" /><Identity Id="16" Name="' + term['_ObjectIdentity_'] + '" /></ObjectPaths></Request>';
      let httpPostOptions: ISPHttpClientOptions = {
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          "X-RequestDigest": this.formDigest
        },
        body: data
      };
      let serviceResponse: SPHttpClientResponse = await this.spHttpClient.post(clientServiceUrl, SPHttpClient.configurations.v1, httpPostOptions);
      let serviceJSONResponse: Array<any> = await serviceResponse.json();

      // Extract the object of type SP.Taxonomy.TermCollection from the array
      let termsCollections = serviceJSONResponse.filter(
        (child: any) => (child != null && child['_ObjectType_'] !== undefined && child['_ObjectType_'] === "SP.Taxonomy.TermCollection")
      );

      // And if any, get the first and unique Terms collection object
      if (termsCollections != null && termsCollections.length > 0) {
        let termsCollection = termsCollections[0];

        let childItems = termsCollection['_Child_Items_'];

        return(await Promise.all<ISPTermObject>(childItems.map(async (t: any) : Promise<ISPTermObject> => {
          return await this.projectTermAsync(t);
        })));
      }
    }

    // Default empty array in case of any missing data
    return (new Promise<Array<ISPTermObject>>((resolve, reject) => {
      resolve(new Array<ISPTermObject>());
    }));
  }

  /**
   * @function
   * Projects a Term object into an object of type ISPTermObject, including child terms
   * @param guid
   */
  private async projectTermAsync(term: any) : Promise<ISPTermObject> {

    return({
      identity: term['_ObjectIdentity_'] !== undefined ? term['_ObjectIdentity_'] : "",
      isAvailableForTagging: term['IsAvailableForTagging'] !== undefined ? term['IsAvailableForTagging'] : false,
      guid: term['Id'] !== undefined ? this.cleanGuid(term['Id']) : "",
      name: term['Name'] !== undefined ? term['Name'] : "",
      customSortOrder: term['CustomSortOrder'] !== undefined ? term['CustomSortOrder'] : "",
      terms: await this.getChildTermsAsync(term),
      localCustomProperties: term['LocalCustomProperties'] !== undefined ? term['LocalCustomProperties'] : null,
    });
  }

  /**
   * @function
   * Clean the Guid from the Web Service response
   * @param guid
   */
  private cleanGuid(guid: string): string {
    if (guid !== undefined)
      return guid.replace('/Guid(', '').replace('/', '').replace(')', '');
    else
      return '';
  }
}
