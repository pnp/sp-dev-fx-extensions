import { SPHttpClient } from "@microsoft/sp-http";
import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import { ICustomAction } from "../models/ICustomAction";
import { IMessageBannerProperties } from "../models/IMessageBannerProperties";
import { IHostProperties } from "../models/IHostProperties";

class ClientSideComponentService {
  private _context: ApplicationCustomizerContext;

  constructor(context: ApplicationCustomizerContext) {
    this._context = context;
  }

  public setProperties = async (properties?: IMessageBannerProperties, hostProperties?: IHostProperties): Promise<void> => {
    const componentId = this._context.manifest.id;
    const customAction = await this._getCustomActionByComponentId(componentId);
    if (!customAction) return;

    try {
      const body : { [key: string]: string} = {} ;
      if (properties)     body["ClientSideComponentProperties"] = JSON.stringify(properties);
      if (hostProperties) body["HostProperties"] = JSON.stringify(hostProperties);

      await this._context.spHttpClient.post(customAction["@odata.id"], SPHttpClient.configurations.v1, {
        headers: {
          "X-HTTP-Method": "MERGE",
          "content-type": "application/json; odata=nometadata"
        },
        body: JSON.stringify(body)
      });
    } catch (error) {
      const errorMessage = `Unable to update custom action with componentId ${componentId}. ${error.message}`;

      console.log(`ERROR: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  }

  private _getCustomActionByComponentId = async (componentId: string): Promise<ICustomAction> => {
    let result: ICustomAction = null;

    try {
      //Check both SITE and WEB scoped custom actions since we don't know how we were registered
      const customActionFilter = `$filter=ClientSideComponentId eq guid'${componentId}'`;
      const webCustomActionUrl = `${this._context.pageContext.web.absoluteUrl}/_api/Web/UserCustomActions?${customActionFilter}`;
      const siteCustomActionUrl = `${this._context.pageContext.site.absoluteUrl}/_api/Site/UserCustomActions?${customActionFilter}`;

      const [ webScopeResponse, siteScopeResponse ] = await Promise.all([
        this._context.spHttpClient.get(webCustomActionUrl, SPHttpClient.configurations.v1),
        this._context.spHttpClient.get(siteCustomActionUrl, SPHttpClient.configurations.v1)
      ]);

      //First, check WEB-scoped response
      if (webScopeResponse.ok) {
        const webResult = await webScopeResponse.json();
        result = webResult && webResult.value.length > 0 ? webResult.value[0] : null;
      }
      else {
        throw new Error(`Unable to check web-scoped custom actions. ${webScopeResponse.status} ${webScopeResponse.statusText}`);
      }

      //Second, check SITE-scoped response
      if (siteScopeResponse.ok) {
        //If we haven't found the custom action at WEB-scope, check SITE-scope
        if (!result) {
          const siteResult = await siteScopeResponse.json();
          result = siteResult && siteResult.value.length > 0 ? siteResult.value[0] : null;
        }
      }
      else {
        throw new Error(`Unable to check site-scoped custom actions. ${siteScopeResponse.status} ${siteScopeResponse.statusText}`);
      }
    }
    catch (error) {
      console.log(`ERROR: Unable to fetch custom action with ClientSideComponentId ${componentId}. ${error.message}`);
    }

    return result;
  }
}

export default ClientSideComponentService;
