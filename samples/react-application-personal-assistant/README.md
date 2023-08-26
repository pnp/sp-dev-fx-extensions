# Personal Assistant - OpenAI Function Calling with Microsoft Graph

## Summary

- This sample is chatbot that provides information to the current logged in user.
- The information can be the user's basic details or user's calendar details or user's tasks. - The information exchanged between the user and the chatbot is in natural language. 
- The chatbot uses [OpenAI's function calling feature](https://openai.com/blog/function-calling-and-other-api-updates) to understand whether a function in the code needs to be called based on user's query. 
- The chatbot uses Microsoft Graph API to get the user's details or details from calendar or tasks.
- That JSON response is then transformed into a natural language response by OpenAI and sent back to the user.

![Chatbot](./assets/demo.gif)

## Used SharePoint Framework Version

![SPFx 1.17.3](https://img.shields.io/badge/version-1.17.3-green.svg)
16.13.0![Node.js v16 | v14 | v12](https://img.shields.io/badge/Node.js-v16%20%7C%20v14%20%7C%20v12-green.svg)
![Compatible with SharePoint Online](https://img.shields.io/badge/SharePoint%20Online-Compatible-green.svg)
![Does not work with SharePoint 2019](https://img.shields.io/badge/SharePoint%20Server%202019-Incompatible-red.svg "SharePoint Server 2019 requires SPFx 1.4.1 or lower")
![Does not work with SharePoint 2016 (Feature Pack 2)](https://img.shields.io/badge/SharePoint%20Server%202016%20(Feature%20Pack%202)-Incompatible-red.svg "SharePoint Server 2016 Feature Pack 2 requires SPFx 1.1")
![Local Workbench Unsupported](https://img.shields.io/badge/Local%20Workbench-Unsupported-red.svg "Local workbench is no longer available as of SPFx 1.13 and above")
![Hosted Workbench Compatible](https://img.shields.io/badge/Hosted%20Workbench-Compatible-green.svg)

Tested with Node.js v16.13.0

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

> Open AI API key. You can get a key from <https://platform.openai.com/account/api-keys>

## Contributors

* [Anoop Tatti](https://github.com/anoopt)

## Version history

| Version | Date             | Comments        |
| ------- | ---------------- | --------------- |
| 1.0     | June 23, 2023 | Initial release |

## Disclaimer

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

> This sample calls OpenAI API from client side code. This is not recommended. You should call OpenAI API from server side code. This sample is only for demonstration purposes.

---

## Minimal Path to Awesome

- Clone this repository
- Ensure that you are at the solution folder
- In the command-line run:
  - **npm install**
  - **gulp bundle --ship**
  - **gulp package-solution --ship**
- Upload the **personal-assistant.sppkg** from the **sharepoint/solution** folder to your SharePoint tenant's app catalog
- In the API access page approve the following
  - `User.Read`, `Calendars.Read` and `Tasks.Read` permission for the Microsoft Graph API
- In the command-line run:
  - **gulp serve --nobrowser**
- Open your SharePoint Online site
- Append the following query string parameters to the URL: `?debugManifestsFile=https://localhost:4321/temp/manifests.js&loadSPFX=true&customActions={"a4c9460d-77b2-4864-8fb7-183bf668c222":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{"show":true}}}`
- You should now see the chatbot in the bottom right corner of the page

## Features

- This sample shows how use [OpenAI's function calling feature](https://openai.com/blog/function-calling-and-other-api-updates). A personal assistant chatbot (an SPFx application customiser) is used to show this feature in action. 
- The chatbot sends the user's message to [OpenAI API](https://platform.openai.com/docs/api-reference). 
- Based on user's message, OpenAI determines whether a function needs to be called. 
- If so, based on the response from OpenAI, the chatbot calls the function - which in turn uses [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/overview) to get the user's details or details from calendar or tasks. 
- The result of the function is then sent back to OpenAI. OpenAI then uses the result to generate a response to the user.

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development


## Help

We do not support samples, but we this community is always willing to help, and we want to improve these samples. We use GitHub to track issues, which makes it easy for  community members to volunteer their time and help resolve issues.

If you encounter any issues while using this sample, [create a new issue](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=bug-report.yml&sample=react-application-personal-assistant&authors=@anoopt&title=react-application-personal-assistant%20-%20).

For questions regarding this sample, [create a new question](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=question.yml&sample=react-application-personal-assistant&authors=@anoopt&title=react-application-personal-assistant%20-%20).

Finally, if you have an idea for improvement, [make a suggestion](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=suggestion.yml&sample=react-application-personal-assistant&authors=@anoopt&title=react-application-personal-assistant%20-%20).

<img src="https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/samples/react-application-personal-assistant" />