# SPFxAppCustomizer

Application customizer that adds a header and a footer to modern pages.

This project is the completed solution for the exercise **Create an application customizer extension** in the Microsoft Learn module [Extend the SharePoint user interface with SharePoint Framework extensions](https://learn.microsoft.com/training/modules/sharepoint-spfx-extensions/). For compatibility, prerequisites, and help, see the [tutorial README](../README.md).

![Modern SharePoint page with the header and footer added by the application customizer](../assets/preview-spfxappcustomizer.png)

## Minimal path to awesome

* Clone this repository, or [download this tutorial as a .ZIP file](https://pnp.github.io/download-partial/?url=https://github.com/pnp/sp-dev-fx-extensions/tree/main/tutorials/mslearn-module-extensions) and unzip it.
* From your command line, change to the `tutorials/mslearn-module-extensions/SPFxAppCustomizer` folder.
* Ensure that you're using a supported Node.js version. If you use nvm, run `nvm use`.
* In `config/serve.json`, replace the page URL (`initialPage`, or `pageUrl` for extensions) with a page in a site you can test on. Set the `SPFX_SERVE_TENANT_DOMAIN` environment variable to your SharePoint Online domain, for example `contoso.sharepoint.com`.
* In the command line, run:
  * `npm install`
  * `npm run start`
* To build a deployable package, run `npm run build`. The package is saved in the `sharepoint/solution` folder.
