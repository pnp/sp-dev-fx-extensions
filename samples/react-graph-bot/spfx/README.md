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
- Complete the prerequisites (see below)
- In the command line run:
  - `npm install`
  - `gulp bundle`
  - `gulp package-solution`
- Upload the generated package to the SharePoint app catalog
- Install the *PnP - Graph Bot* app in your site
- In the command line run:
  - `gulp serve --nobrowser`

### Prerequisites

#### 1-Setup the Azure AD application v2.0 ####

To access the Microsoft Graph API, you';l need to register a new app in the Azure Active Directory behind 

#### 2-Setup the Azure Bot Service ####
- Create the bot
- 

#### 3-Create the LUIS Model ####

##### Graph/Intents #####

| LUIS Intent                |Graph Query
| ---------------------------| -------------------------------------------------------------|
| GetMyGroups                | https://graph.microsoft.com/v1.0/me/memberOf
| GetMyManager               | https://graph.microsoft.com/v1.0/me/manager                        
| ...                        | ...

#### Debug the bot locally ####

- ngrok


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

