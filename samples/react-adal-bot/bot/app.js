
const restify = require('restify');
const builder = require('botbuilder');
const fetch = require('node-fetch');
var AuthenticationContext = require('adal-node').AuthenticationContext;
var Promise = require('es6-promise').Promise;

//=========================================================
// ADAL Configuration
//=========================================================
var adalConfig = {
    'clientId' : process.env.AAD_CLIENT_ID, // The client Id retrieved from the Azure AD App
    'clientSecret' : process.env.AAD_CLIENT_SECRET, // The client secret retrieved from the Azure AD App
    'authorityHostUrl' : 'https://login.microsoftonline.com/', // The host URL for the Microsoft authorization server
    'tenant' : process.env.TENANT, // The tenant Id or domain name (e.g mydomain.onmicrosoft.com)
    'redirectUri' : process.env.REDIRECT_URI, // This URL will be used for the Azure AD Application to send the authorization code.
    'resource' : process.env.RESOURCE, // The resource endpoint we want to give access to (in this case, SharePoint Online)
}

adalConfig.authorityUrl = adalConfig.authorityHostUrl + adalConfig.tenant;
adalConfig.templateAuthzUrl =  adalConfig.authorityUrl +
                        '/oauth2/authorize?response_type=code&client_id=' + // Optionally, we can get an Open Id Connect id_token to get more info on the user (some additional parameters are required if so https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-protocols-openid-connect-code)
                        adalConfig.clientId + 
                        '&state=<state>&resource=' + 
                        adalConfig.resource + 
                        '&response_mode=form_post' + //We want response as POST http request (see callback to see why)
                        '&redirect_uri=' + adalConfig.redirectUri + // If not specified, the adalConfigured reply URL of the Azure AD App will be used 
                        '&prompt=select_account'


// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// To be able to get the authorization code (req.params.code)
server.use(restify.plugins.bodyParser({
    mapParams: true
}));

// Create chat connector for communicating with the Bot Framework Service
const connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    stateEndpoint: process.env.BotStateEndpoint,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Create a route for the Azure AD App callback
// Be careful here: if you specfify a GET request for the OAuth callback, IISNODE will interpret the response as a static file due to the query string parameters instead of redirect it to the correct node js server route.
// To avoid modify the web.config, use a POST request instead
server.post('/api/oauthcallback', (req, res, next) => {

    // Get the authorization code from the Azure AD application
    var authorizationCode = req.params.code;
    if(authorizationCode) {

        acquireTokenWithAuthorizationCode(authorizationCode).then((response) => {

            // Add the state to the response to validate the CSRF scenario
            // The state has two utilities here:
            // - Reconnect with the bot to continue dialog
            // - Avoid CRSF attacks
            var state = req.params.state;
            if (state) {
                
                var address = JSON.parse(state);
                response.state = state;

                // Continue the dialog with the bot. Be careful, beginDialog" starts a new conversation.
                // We use the state parameter to save the address and be able to reconnect with the bot after authentication
                // Special thanks to this blog post https://dev-hope.blogspot.ca/2016/09/google-oauth-using-nodejs-and-microsoft.html
                // https://docs.botframework.com/en-us/node/builder/chat/UniversalBot/#navtitle ==> See paragraph "Saving Users Address"
                bot.beginDialog(address, "/oauth-success", response);
            }
        
            // Close the tab automatically
            var body = '<script>window.close();</script>';
            res.writeHead(200, {
                'Content-Length': Buffer.byteLength(body),
                'Content-Type': 'text/html'
            });
            res.write(body);
            res.end();

        }).catch((errorMessage) => {
            
            bot.beginDialog(address, "/error", errorMessage);
        });
        
    } else {
        bot.beginDialog(address, "/error", 'Something went wrong, we didn\'t get an authorization code!');
    }
});

//=========================================================
// Bot authorization delegation middleware
//=========================================================
var getAuthorization = (session, args, next) => {

    // User is not already signed-in
    if (!session.privateConversationData['accessToken']) {

        // Set the arbitrary state as the current session address
        var stateToken = encodeURIComponent(JSON.stringify(session.message.address))
        var authorizationUrl = adalConfig.templateAuthzUrl.replace('<state>', stateToken);

        var actionLabel = 'You need to sign in to Office 365 before playing with this bot!';
        var buttonLabel = 'Sign-in';
        var signInCard = null;

        // The Sign-In card is not supported by Microsoft Teams for now (23/01/2017)
        // https://msdn.microsoft.com/en-us/microsoft-teams/bots#cards-and-buttons
        if (session.message.address.channelId === "msteams") {

             var link = builder.CardAction.openUrl(session, authorizationUrl,buttonLabel)

             signInCard = new builder.ThumbnailCard(session)
             .title("Authorization required!")
             .text(actionLabel)
             .buttons([link]);

        } else {

            // Send sign-in card
            signInCard =  new builder.SigninCard(session)
                .text(actionLabel)
                .button(buttonLabel, authorizationUrl);        
        }

        var msg = new builder.Message(session).attachments([signInCard]);
        session.send(msg);

    } else {

        // If the user is  already signed-in, we check if the access token is expired
        var expiresOn = session.privateConversationData['expiresOn'];
        var refreshToken = session.privateConversationData['refreshToken']

        if (new Date(expiresOn) <= new Date() ) {
            
            acquireTokenWithRefreshToken(refreshToken).then((response) => {

                // Refresh the token infos
                session.privateConversationData['accessToken'] = response.accessToken;
                session.privateConversationData['expiresOn'] = response.expiresOn;
                session.privateConversationData['refreshToken'] = response.refreshToken;
                session.save();
             
                next();

            }).catch((errorMessage) => {
                console.log(errorMessage);
            });
        } else {
            next();
        }             
    }
}

// Create an "in memory" bot storage. 
// In production scenario, Microsoft provides adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
// For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
const botStorage = new builder.MemoryBotStorage();
const bot = new builder.UniversalBot(connector);

// Register in-memory storage for the bot
bot.set('storage', botStorage); 

//=========================================================
// LUIS settings
//=========================================================
// In development, set these fields in the node.js environement first (ex: in the lauch.json file in Visual Studio Code)
// In production, set these fields in the Web App settings
const luisAppId = process.env.LUIS_APP_ID;
const luisAPIKey = process.env.LUIS_API_KEY;
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
            next();
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
            next();

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

//=========================================================
// Bot Dialogs
//=========================================================
bot.dialog('/oauth-success', function (session, response) {

    // Check the state value to avoid CSRF attacks http://www.twobotechnologies.com/blog/2014/02/importance-of-state-in-oauth2.html
    if(encodeURIComponent(JSON.stringify(session.message.address)) !== encodeURIComponent(response.state)) {
        session.send("CSRF scenario detected. Closing the current conversation...");
        session.endDialog();
    } else {

        // Save the token for the current user and for this conversation only (privateConversationData)
        if (!session.privateConversationData['accessToken']) {
            
            session.privateConversationData['accessToken'] = response.accessToken;
            session.privateConversationData['expiresOn'] = response.expiresOn;
            session.privateConversationData['refreshToken'] = response.refreshToken;
            session.save();
        }

        session.send('Hi %s. What can I do for you today?', response.userName);

        // Get back to the main dialog route
        session.beginDialog("/");
    }
});

bot.dialog('/error', function (session, message) {
    session.send(message);
});

bot.dialog('/', 
    [   getAuthorization,
        (session) => {

            var message = session.message.text

            // Check if a a message has been typed
            if (message) {

                // For debugging purpose, we add an arbitrary command to reset the bot state (we also could have implement a logout mechanism).
                // Initially the native /deleteprofile command was used but it is not available in the Bot Framework v3 anymore.
                if (message === "reset") {
                    session.privateConversationData = {};
                    session.save()

                    // Get back to the main dialog route and prompt for a sign in
                    session.beginDialog("/");
                } else {

                    session.beginDialog("/intents");
                }
            }
        }
    ]);

bot.dialog('/intents', intents); 

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

//=========================================================
// ADAL Helper Methods
//=========================================================
var acquireTokenWithAuthorizationCode = (authorizationCode) => {

    var authenticationContext = new AuthenticationContext(adalConfig.authorityUrl);

    var p = new Promise((resolve, reject) => {

        authenticationContext.acquireTokenWithAuthorizationCode(
            authorizationCode,
            adalConfig.redirectUri, // This URL must be the same as the redirect_uri of the original request or the reply url of the Azure AD App. Otherwise, it will throw an error.
            adalConfig.resource,
            adalConfig.clientId, 
            adalConfig.clientSecret,
            (err, response) => {

                if (err) {
                    reject('error: ' + err.message + '\n');

                } else {
                    resolve({ 
                        userName: (response.givenName + " " + response.familyName),
                        accessToken: response.accessToken,
                        expiresOn: response.expiresOn.toString(),
                        refreshToken: response.refreshToken,
                    }); 
                }
            });
    });

    return p;
}

var acquireTokenWithRefreshToken = (refreshToken) => {

    var authenticationContext = new AuthenticationContext(adalConfig.authorityUrl);

    var p = new Promise((resolve, reject) => {

        authenticationContext.acquireTokenWithRefreshToken(
            refreshToken,
            adalConfig.clientId,
            adalConfig.clientSecret,
            adalConfig.resource,
            (err, response) => {

                if (err) {
                    reject(errorMessage = 'error: ' + err.message + '\n');

                } else {
                    resolve({ 
                        userName: (response.givenName + " " + response.familyName),
                        accessToken: response.accessToken,
                        expiresOn: response.expiresOn.toString(),
                        refreshToken: response.refreshToken,
                    }); 
                }
            });
    });

    return p;
}