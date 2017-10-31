# Tutorial: Migrating from Edit Control Block (ECB) menu item to SharePoint Framework Extensions

Sample "modern" custom footer solution migrated from a jQuery/JavaScript user CustomAction to the SharePoint Framework Extensions.

![The "modern" ECB menu item in action](../images/spfx-ecb-extension-output.png)

More information about the solution is available at [https://docs.microsoft.com/en-us/sharepoint/dev/spfx/extensions/guidance/migrate-from-ecb-to-spfx-extensions](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/extensions/guidance/migrate-from-ecb-to-spfx-extensions).

## Minimal Path to Awesome

- In the command line run:
  - `npm i`
  - `gulp serve --nobrowser`
- In the web browser navigate to a "modern" site and append the following querystring to the URL:

```
?loadSpfx=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"6c5b8ee9-43ba-4cdf-a106-04857c8307be":{"location":"ClientSideExtension.ListViewCommandSet.ContextMenu","properties":{"targetUrl":"ShowDetail.aspx"}}}
```

[More information](../README.md)

<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/tutorial-migrate-ecbmenu/02" />