/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    stateEndpoint: process.env.BotStateEndpoint,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

// Create your bot with a function to receive messages from the user
// var bot = new builder.UniversalBot(connector);

var inMemoryStorage = new builder.MemoryBotStorage();
var bot = new builder.UniversalBot(connector)
                    .set('storage', inMemoryStorage); // Register in-memory storage 

bot.on("event", function (event) {

    var botStorageContext = {
        userId: event.address.user.id,
        conversationId: event.address.conversation.id,
        // address: event.address,
        persistUserData: true,
        persistConversationData: true,
    }     

    // Save user data in the in memory storage
    inMemoryStorage.saveData(botStorageContext, { 
        privateConversationData: { 
            accessToken: event.value 
        }}, function(err) {
            var msg = new builder.Message().address(event.address);
            msg.data.text = "Hi, how are you?";
            bot.send(msg); 
    });
});

// Make sure you add code to validate these fields
var luisAppId = "7bd9789f-c786-4e4b-8d83-32e29c1c84c2";
var luisAPIKey = "e26d277b6c8b4d02b549d5088045e3c3";
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
.onDefault((session) => {
    

    var botStorageContext = {
        conversationId: session.message.address.conversation.id,
        userId: session.message.address.user.id,
        // address: session.message.address,
        persistUserData: true,
        persistConversationData: true,
    }

    inMemoryStorage.getData(botStorageContext, function(e, data) {
        session.send('Sorry, I did not understand \'%s\'.', data.privateConversationData.accessToken);

        searchForExpertise("toto", data.privateConversationData.accessToken).then((res) => {
            
                if (res.error) {
                    session.send("Error: %s", res.error.message.value);
                } else {
                    session.send(res);
                }
        });
    });
});

bot.dialog('/', intents);    

//=========================================================
// SharePoint utilities
//=========================================================
var searchForExpertise = (query, accessToken) => {
    
        var p = new Promise((resolve, reject) => {

            var endpointUrl = "https://graph.microsoft.com/v1.0/me"
    
            // Node fetch is the server version of whatwg-fetch
            var fetch = require('node-fetch');
    
            fetch(endpointUrl, {
                method: 'GET',
                headers: {
                    // The APIs require an OAuth access token in the Authorization header, formatted like this: 'Authorization: Bearer <token>'. 
                    "Authorization" :  "Bearer " + accessToken,
                    // Needed to get the results as JSON instead of Atom XML (default behavior)
                    "Accept" : "application/json;odata=verbose"
                }           
            }).then(function(res) {
                return res.json();
            }).then(function(json) {
                resolve(json);
            }).catch(function(err) {
                reject(err);
            });
        });
    
        return p;
    }

