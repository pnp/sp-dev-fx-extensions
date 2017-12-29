# React Graph Bot Extension #

## Summary

When to use this pattern?
- If you need to add a bot only in the Web Chat channel, for example integrate a bot assistant in your intranet portal. 
- If you need to access protected APIs in your bot but also want mutliples channels, use the OAuth2 authorization grant flow implementation for Node.js instead: [https://github.com/FranckyC/SharePointBot](https://github.com/FranckyC/SharePointBot) 

<p align="center">
  <img src="./images/react-graph-bot.gif"/>
</p>

## Used SharePoint Framework Version 
![drop](https://img.shields.io/badge/drop-1.4.0-green.svg)

## Applies to

* [SharePoint Framework](https:/dev.office.com/sharepoint)
* [Office 365 tenant](https://dev.office.com/sharepoint/docs/spfx/set-up-your-development-environment)

## Solution

Solution|Author(s)
--------|---------
react-graph-bot | Franck Cornu (MVP Office Development at aequos) - Twitter @FranckCornu

## Version history

Version|Date|Comments
-------|----|--------
1.0 | January 7, 2018 | Initial release

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Setup the environment (see below)
- In the command line run:
  - `npm install`
  - `gulp bundle`
  - `gulp package-solution`
- Upload the generated package to the SharePoint app catalog
- Install the *PnP - Graph Bot* app in your site
- In the command line run:
  - `gulp serve --nobrowser`
- Play with the bot!

### Prerequisites

#### 1- Setup the Azure AD application ####

To access the Microsoft Graph API, you will need to register a new app in the Azure Active Directory behind your Office 365 tenant using the new registration portal for Azure AD v2:
- Go to https://apps.dev.microsoft.com. Log in with a administrator account in the tenant you want to give access to and create a new app.
- Generate a new password ad copy this value (we will reuse it later in the process)
- Add a new "Web" platform and make sure the option "Allow Implicit Flow" is checked. In the "Redirect URLs" option, specify the URL of the **root** site of the site collection you want to deploy this sample.
<p align="center">
  <img src="./images/AAD_App_Setup.png"/>
</p>
- Keep the permissions as is

#### 2- Create the LUIS Model ####
- Go to the LUIS portal [https://www.luis.ai](https://www.luis.ai) 
- Import a new application by reusing the **./bot/luis_sample_model.json** file. It will import intents and utterances automatically. In this sample, intents are matched to a specific graph query as follow. This is a very basic example so you can use your own intent/query combinations based on your requirements.

  | LUIS Intent                |Graph Query
  | ---------------------------| -------------------------------------------------------------|
  | GetMyGroups                | https://graph.microsoft.com/v1.0/me/memberOf
  | GetMyManager               | https://graph.microsoft.com/v1.0/me/manager                        
  | ...                        | ...

- Train and publish the application to the production slot.

#### 3- Create the bot in Azure ####
- In an Azure tenant (can be different from your Office 365 account), create a new *"Web App Bot"* (you can use a *"Functions Bot"* as well depending your requirements).
<p align="center">
  <img width="70%" src="./images/Azure_Bot.png"/>
</p>

- In the bot template, select a basic Node.js bot.
- In the bot *"Build"* setting, open the online code editor:
  - Replace the **app.js** code by the one of this sample contained in the **server.js**
  - Same thing for the **package.json** file
<p align="center">
  <img width="50%" src="./images/Online_CodeEditor.png"/>
</p>

- Open the console and type the following command line:
  - `npm install`
<p align="center">
  <img width="50%" src="./images/npm.png"/>
</p>

- In the application settings, add the follwoing key/value pairs for the LUIS application:

  <p align="center">
    <img width="50%" src="./images/App_Settings.png"/>
  </p>

  - **LuisAppId**: you can get this value directly in the URL on your LUIS application

  <p align="center">
    <img width="50%" src="./images/LUIS_app_id.png"/>
  </p>

  - **LuisAPIKey**: you can get this value in the publish settings.

  <p align="center">
    <img width="50%" src="./images/LUIS_key.png"/>
  </p>  

#### 4- Store your environement settings in the tenant property bag ####

- Configure 

  | Setting                   | Value
  | --------------------------| -------------------------------------------------------------|
  | Client Id                 |
  | Bot Id
  | Direct Line Secret
  | Tenant Id

#### Debug the bot locally ####

- ngrok

The SPFx extension cannot be debugged in the local workbench.

## Features
This Web Part illustrates the following concepts on top of the SharePoint Framework and Bot Framework:

- *SharePoint Framework concepts*
    - Use the new [**M**icro**S**oft **A**uthentication **L**ibrary](https://github.com/AzureAD/microsoft-authentication-library-for-js) library (instead of ADAL) to access Azure AD protected APIs (ex: Microsoft Graph API) using the [OAuth2 implicit grant flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-dev-understanding-oauth2-implicit-grant).
    - Store and read settings in the tenant property bag using REST
    - Integrate and configure the [Bot Framework Web Chat](https://github.com/Microsoft/BotFramework-WebChat) React control with Direct Line
        - Retrieve the bot conversation history for the current user
    - Use the PnP JavaScript sotrage utilities
- *Bot Framework concepts*
    - Use the [backchannel](https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-backchannel) to send data between a JavaScript application (i.e SPFx extension) and the bot.
    - Store and use private conversation data for the current using in the ["in memory"](https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-state) bot storage

<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/samples/react-graph-bot" />

