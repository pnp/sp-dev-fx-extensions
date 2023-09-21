# Manage List Subscriptions

## Summary

With the use of Rest calls, this sample command set shows how to manage list subscriptions (SharePoint webhooks) and take action to extend the webhook expiration date. The command set will be added to the lists and libraries and will only be shown if there are any list subscriptions available on the list. The subscriptions that are accessible are shown when you click on the command set. The 'Renew subscription' action can be used in accordance with the subscription's expiration date. Given that the default number of days is 180, the subscription's (webhook expiration renewal date) renewal date is set to 179 days.

Example use case - Since the webhook subscriptions are only valid to 180 days, and it is usually hard to keep a track on the expiration date and to renew it. Say if the list has subscriptions, this command set allows to manage those subscriptions with a possibility to renew the subscriptions when expired.

![Manage Subscriptions](./assets/ManageSubscription.png)

![Subscription Panel](./assets/SubscriptionPanel.gif)

![Renewing webhook subscriptions](./assets/RenewSubscription.png)

## Compatibility

![SPFx 1.17.4](https://img.shields.io/badge/SPFx-1.17.4-green.svg)
![Node.js v16.13+](https://img.shields.io/badge/Node.js-v16.13+-green.svg)
![Compatible with SharePoint Online](https://img.shields.io/badge/SharePoint%20Online-Compatible-green.svg)
![Does not work with SharePoint 2019](https://img.shields.io/badge/SharePoint%20Server%202019-Incompatible-red.svg "SharePoint Server 2019 requires SPFx 1.4.1 or lower")
![Does not work with SharePoint 2016 (Feature Pack 2)](https://img.shields.io/badge/SharePoint%20Server%202016%20(Feature%20Pack%202)-Incompatible-red.svg "SharePoint Server 2016 Feature Pack 2 requires SPFx 1.1")
![Local Workbench Unsupported](https://img.shields.io/badge/Local%20Workbench-Unsupported-red.svg "Local workbench is no longer available as of SPFx 1.13 and above")
![Hosted Workbench Compatible](https://img.shields.io/badge/Hosted%20Workbench-Compatible-green.svg)
![Compatible with Remote Containers](https://img.shields.io/badge/Remote%20Containers-Compatible-green.svg)

Tested using Node.js v16.13.0

## Applies to

* [SharePoint Framework Extensions](https://dev.office.com/sharepoint/docs/spfx/extensions/overview-extensions)

## Contributors

* [Nishkalank Bezawada](https://github.com/NishkalankBezawada)

## Version history

Version|Date|Comments
-------|----|--------
1.0|September 12, 2023|Initial release

## Minimal Path to Awesome

* Clone this repository
* Update the `pageUrl` properties in the **config/serve.json** file
  * The `pageUrl` should be a modern page
  * This property is only used during development in conjunction with the `gulp serve` command
  * In the command line navigate to the react-command-manage-list-subscriptions folder and run:
  * `npm install`
  * `gulp serve`

## Features

This extension illustrates the following concepts:

* Using **Office fabric UI react** components for the UI.

## Debug URL for testing

Here's a debug querystring for testing this sample:

```url
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&loadSPFX=true&customActions={"038b9697-9b22-4e42-8078-66ec93f546d0":{"location":"ClientSideExtension.ListViewcommand set.CommandBar","properties":{}}}
```

Your URL will look similar to the following (replace with your domain and site address):

```url
https://yourtenant.sharepoint.com/sites/yoursite?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&loadSPFX=true&customActions={"038b9697-9b22-4e42-8078-66ec93f546d0":{"location":"ClientSideExtension.ListViewcommand set.CommandBar","properties":{}}}
```
