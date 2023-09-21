import { SPHttpClient } from "@microsoft/sp-http";
import { ListViewCommandSetContext } from "@microsoft/sp-listview-extensibility";
import { SubscriptionModel } from "../ManageSubscriptionsCommandSet";
import { Log } from '@microsoft/sp-core-library';

const LOG_SOURCE: string = 'ManageSubscriptionsCommandSet - Component';

export class SubscriptionService{

    public async GetMethod(context:ListViewCommandSetContext, endPoint:string, headers:Headers){
        try{
            const response = await context.spHttpClient.get(endPoint, SPHttpClient.configurations.v1,{
                headers: headers
            });
            if (!response || !response.ok) {
                throw new Error(`Something went wrong when executing GetMethod at Rest Service. Status='${response.status}'`);
            }
            if(response.ok){
                const results = await response.json();
                return results;
            }else {
                throw new Error(response.statusText);
            }
        }catch (error) {
          Log.error(LOG_SOURCE, error);
          throw error;
        }
    }


    //Update-Patch Method Implementation
    public async PatchMethod(context:ListViewCommandSetContext, endPoint:string, headers:Headers, body:any){
        try{
            const response = await context.spHttpClient.fetch(endPoint, SPHttpClient.configurations.v1,{
                method: "PATCH",
                body:JSON.stringify(body),
                headers: headers
            });
            if (!response || !response.ok) {
                throw new Error(`Something went wrong when executing PatchMethod at Rest Service. Status='${response.status}'`);
            }
            if(response.ok){
                //If the subscription is found and successfully updated, a 204 No Content response is returned.
                return response.status;
            }else {
                throw new Error(response.statusText);
            }
        }
        catch (error) {
            Log.error(LOG_SOURCE, error);
            throw error;
        }
    }

    public async GetSubscriptions(context:ListViewCommandSetContext, selectedSite : string, selectedListID: string | undefined):Promise<SubscriptionModel[]>{
        const subscriptions : SubscriptionModel[] = [];
        const subscriptionEndpoint = selectedSite+`/_api/web/lists('${selectedListID}')/subscriptions`; 
        
        const subscriptionRequestHeaders: Headers = new Headers();
        subscriptionRequestHeaders.append('accept', 'application/json;odata=verbose');
        subscriptionRequestHeaders.append('content-type', 'application/json;odata=verbose');
        subscriptionRequestHeaders.append('odata-version', '3.0');
    
        const subcriptionResults = await this.GetMethod(context, subscriptionEndpoint, subscriptionRequestHeaders);
        subcriptionResults.d.results.forEach((subscription:any) =>{
          subscriptions.push({
            clientState:subscription.clientState,
            expirationDateTime:subscription.expirationDateTime,
            notificationUrl:subscription.notificationUrl,
            id:subscription.id,
            resource:subscription.resource
          });
        });
        return subscriptions;
    }
}

