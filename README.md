# SharePoint Framework Extensions Samples & Tutorial Materials

This repository contains the samples that demonstrate different usage patterns for the SharePoint Framework extensions.

SharePoint extensions are controls that appear inside a SharePoint page but run locally in the browser. They're the building blocks of pages that appear on a SharePoint site. You can build extensions using modern script development tools and you can deploy your extensions to modern pages in Office 365 tenants. In addition to plain JavaScript projects, you can build extensions alongside common scripting frameworks, such as AngularJS and React. For example, you can use React along with components from [Office UI Fabric React](http://dev.office.com/fabric#/components) to quickly create experiences based on the same components used in Office 365 natively.

## Have issues or questions?

Please use following logic on submitting your questions or issues to right location to ensure that they are noticed and addressed as soon as possible.

* You have general question or challenge with SPFx - use [sp-dev-docs repository issue list](https://github.com/SharePoint/sp-dev-docs/issues).
* You have issue on specific extension or sample - use [issue list in this repository](https://github.com/SharePoint/sp-dev-fx-extensions/issues).

## Additional resources

* [SharePoint Framework Extensions](https://dev.office.com/sharepoint/docs/spfx/extensions/overview-extensions)
* [Overview of the SharePoint Framework](http://dev.office.com/sharepoint/docs/spfx/sharepoint-framework-overview)
* [SharePoint Framework development tools and libraries](http://dev.office.com/sharepoint/docs/spfx/tools-and-libraries)
* [SharePoint Framework Reference](http://aka.ms/spfx-reference)
* [Visual Studio Extension for SharePoint Framework projects](https://github.com/SharePoint/sp-dev-fx-vs-extension)

## Using the samples

To build and start using these projects, you'll need to clone and build the projects.

Clone this repo by executing the following command in your console:

```shell
git clone https://github.com/SharePoint/sp-dev-fx-extensions.git
```

Navigate to the cloned repository folder which should be the same as the repository name:

```shell
cd sp-dev-fx-extensions
```

To access the samples use the following command, where you replace `sample-folder-name` with the name of the sample you want to access.

```shell
cd samples
cd sample-folder-name
```

and for the tutorials, use the following command:

```shell
cd tutorials
```

Now run the following command to install the npm packages:

```shell
npm install
```

This will install the required npm packages and dependencies to build and run the client-side project.

Once the npm packages are installed, run the following command to start nodejs to host your extension and preview that in the SharePoint Online pages:

```shell
gulp serve
```

## Contributions

These samples are direct from the feature teams, SharePoint PnP core team (http://aka.ms/SharePointPnP) or shared by the community. We welcome your input on issues and suggestions for new samples. We do also welcome community contributions around the extensions. If there's any questions around that, just let us know.

Please have a look on our [Contribution Guidance](./.github/CONTRIBUTING.md) before submitting your pull requests, so that we can get your contribution processed as fast as possible. Thx.

> Sharing is caring!