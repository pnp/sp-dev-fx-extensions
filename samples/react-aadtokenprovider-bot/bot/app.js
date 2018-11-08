/*-----------------------------------------------------------------------------
Name: react-msal-bot
Author: Franck Cornu (aequos) - Twitter @FranckCornu
Date: August 4th, 2018
Description: This sample shows how to handle Microsoft graph queries with an access token retrieved from a SharePoint site via the backchannel
-----------------------------------------------------------------------------*/
const restify = require('restify');
const builder = require('botbuilder');
const fetch = require('node-fetch');

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
const connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    stateEndpoint: process.env.BotStateEndpoint,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Create an "in memory" bot storage. 
// In production scenario, Microsoft provides adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
// For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
const botStorage = new builder.MemoryBotStorage();
const bot = new builder.UniversalBot(connector);

// Register in-memory storage for the bot
bot.set('storage', botStorage); 

//=========================================================
// Bot events
//=========================================================
bot.on("event", (event) => {

    switch (event.name) {

        // Event when an access token has been received for an user
        case "userAuthenticated": 

            if (event.value) {

                // Save user data in the in bot storage to be able to retrieve it later via the session object
                const botStorageContext = {
                    userId: event.address.user.id,
                    conversationId: event.address.conversation.id,
                    persistUserData: true,
                    persistConversationData: true,
                }     
                
                // Send welcome message on first bot connection
                botStorage.getData(botStorageContext, (error, data) => {
                    if (!data.privateConversationData) {
                        // We display a welcome message if this is the first conversation
                        const msg = new builder.Message().address(event.address);
                        msg.data.text = `Hi ${event.value.userDisplayName}, what can I do your you?`;
                        bot.send(msg); 
                    }
                });
  
                botStorage.saveData(botStorageContext, { 
                    privateConversationData: { 
                        accessToken: event.value.accessToken,
                        userDisplayName: event.value.userDisplayName,
                    }}, (error) => {
                });       
            }

            break;
        
        default: 
            break;
    }
});

//=========================================================
// LUIS settings
//=========================================================
// In development, set these fields in the node.js environement first (ex: in the lauch.json file in Visual Studio Code)
// In production, set these fields in the Web App settings
const luisAppId = process.env.LuisAppId;
const luisAPIKey = process.env.LuisAPIKey;
const luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';
const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;

//=========================================================
// Bot dialogs
//=========================================================
const recognizer = new builder.LuisRecognizer(LuisModelUrl);
const intents = new builder.IntentDialog({ recognizers: [recognizer], recognizeMode: builder.RecognizeMode.onBegin, intentThreshold: 0.8 })
.onDefault((session) => {
    session.send('Sorry, I did not understand \'%s\'.', session.message.text);
})
/* LUIS Intent: "GetMyGroups" */
.matches('GetMyGroups',
    (session, args, next) => {        
        getMyGroups(session.privateConversationData.accessToken).then((groups) => {
 
            let cards = [];
            groups.map((group => {
                 cards.push(new builder.ThumbnailCard(session).title(group.displayName));
            }));

            const reply = new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.list)
            .attachments(cards);

            session.send(reply);
        }).catch(error => {
            console.log(error.message);
        });
    }
)
/* LUIS Intent: "GetMyManager" */
.matches('GetMyManager',
    (session, args, next) => {        
        getMyManager(session.privateConversationData.accessToken).then((manager) => {
                
            let message;

            if (!manager) {
                message = "You don't have any manager. It looks like you're the boss."
            } else {
                message = `Your manager is ${manager}.`;
            }
            
            session.send(message);

        }).catch(error => {
            console.log(error.message);
        });
    }
);
/* LUIS Intent: <put_your_intents_here`> 
.matches('<your_intent>',
    [   getUserAccessTokenFromStorage, 
        (session, args, next) => {
        
           <your_graph_query_using_access_token>
        });
}]);
*/

// Bot dialog entry point
bot.dialog('/', intents); 

//=========================================================
// Microsoft Graph queries (examples)
//=========================================================

/**
 * Get user groups (example).
 * In real case scenario, you would map your intents to corresponding graph queries here
 */
const getMyGroups = (accessToken) => {
    
    const p = new Promise((resolve, reject) => {

        const endpointUrl = "https://graph.microsoft.com/v1.0/me/memberOf";
        
        fetch(endpointUrl, {
            method: 'GET',
            headers: {
                // The APIs require an OAuth access token in the Authorization header, formatted like this: 'Authorization: Bearer <token>'. 
                "Authorization" :  "Bearer " + accessToken,
                // Needed to get the results as JSON instead of Atom XML (default behavior)
                "Accept" : "application/json;odata.metadata=full"
            }           
        }).then((response) => {
            if (!response.ok) {
                throw Error(response.statusText);
            } 
            return response.json();
        }).then((json) => {
            const groups = json.value.filter((group) => { return group["@odata.type"] === "#microsoft.graph.group"});
            resolve(groups);
        }).catch((error) => {
            reject(error);
        });
    });

    return p;
}

/**
 * Get the current user manager in the organization 
 */
const getMyManager = (accessToken) => {

    const p = new Promise((resolve, reject) => {

        const endpointUrl = "https://graph.microsoft.com/v1.0/me/manager";
        
        fetch(endpointUrl, {
            method: 'GET',
            headers: {
                // The APIs require an OAuth access token in the Authorization header, formatted like this: 'Authorization: Bearer <token>'. 
                "Authorization" :  "Bearer " + accessToken,
                // Needed to get the results as JSON instead of Atom XML (default behavior)
                "Accept" : "application/json;odata.metadata=full"
            }           
        }).then((response) => {
            if (!response.ok) {

                if (response.status === 404) {
                    // No manager
                    resolve(null);
                } else {
                    throw Error(response.statusText);
                }                
            } 
            return response.json();
        }).then((json) => {
            resolve(json.displayName);
        }).catch((error) => {
            reject(error);
        });
    });

    return p;
}
