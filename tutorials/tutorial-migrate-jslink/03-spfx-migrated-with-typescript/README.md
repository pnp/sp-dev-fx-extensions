# Tutorial: Migrating from JSLink to SharePoint Framework Extensions

Final step of "modern" Field Customizer built using SharePoint Framework fully based on TypeScript.

![The "modern" custom Field Customizer in action](./images/spfx-field-customizer-output.png)

More information about the solution is available at [https://docs.microsoft.com/en-us/sharepoint/dev/spfx/extensions/guidance/migrate-from-jslink-to-spfx-extensions](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/extensions/guidance/migrate-from-jslink-to-spfx-extensions).

## Minimal Path to Awesome

- In the command line run:
  - `npm i`
  - `gulp serve --nobrowser`
- In the web browser navigate to a "modern" site and append the following querystring to the URL:

```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&fieldCustomizers={"Color":{"id":"c3070978-d85e-4298-8758-70b5b5933076"}}
```

[More information](../README.md)

<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/tutorial-migrate-jslink/03" />