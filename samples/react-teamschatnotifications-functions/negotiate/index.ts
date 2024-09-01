import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest, connectionInfo:any): Promise<void> {
    context.log('HTTP trigger function processed a request.');
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: connectionInfo
        };
    }
   
export default httpTrigger;
