# Tutorial: Migrating from UserCustomAction to SharePoint Framework Extensions

Sample "modern" custom footer solution migrated from a jQuery/JavaScript user CustomAction to the SharePoint Framework Extensions.

![The "modern" custom footer in action](../images/spfx-react-custom-footer-output.png)

More information about the solution is available at [https://docs.microsoft.com/en-us/sharepoint/dev/spfx/extensions/guidance/migrate-from-usercustomactions-to-spfx-extensions](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/extensions/guidance/migrate-from-usercustomactions-to-spfx-extensions).

## Minimal Path to Awesome

- In the command line run:
  - `npm i`
  - `gulp serve --nobrowser`
- In the web browser navigate to a "modern" site and append the following querystring to the URL:

```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"82242bbb-f951-4c71-a978-80eb8f35e4c1":{"location":"ClientSideExtension.ApplicationCustomizer"}}
```

[More information](../README.md)

<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/tutorial-migrate-usercustomaction/02" />