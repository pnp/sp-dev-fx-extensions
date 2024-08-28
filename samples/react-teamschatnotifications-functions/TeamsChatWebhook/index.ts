
// Teams Chat Webhook 
//
import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const validationToken = (req.query.validationToken || (req.body && req.body.validationToken));
   // Validate Token on activate webhook
    if (validationToken) {
       
        context.log(validationToken);
        context.res = {
            // status: 200, /* Defaults to 200 */
            body:   (req.query.validationToken || req.body.validationToken)
        };
    }
    else { // send change to signalR to boardcast change to clients
        
       if ( req.body.value.length > 0) {
        context.log(req.body.value);
        context.res = {
            status: 200
        }
        context.bindings.signalR = [{
            "target": "newMessage",
            "arguments": [ req.body ]
          }];
       }      
    }  
};

export default httpTrigger;
