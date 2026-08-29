# react-command-live-dashboard-sharepoint

## Summary

This sample shows how to surface a **SharePoint HTML Live Dashboard created using Copilot** in the context of a SharePoint list or library, using a SharePoint Framework **ListView Command Set** extension. It adds a "Show Dashboard" command to the command bar; clicking it opens the Copilot-generated dashboard's embed page in a modal iframe popup, without leaving the list view.

The dashboard URL is not hard-coded: it's configured per list and stored in that list's property bag, so the same extension can be deployed to multiple lists/libraries across a tenant, each pointing at its own Copilot-created dashboard.


![extensin in action](/assets/1.png)

![url configuration](/assets/2.png)

## Used SharePoint Framework Version

![version](https://img.shields.io/badge/version-1.24.0--beta.2-yellow.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

- **Create the dashboard first, with Copilot.** Use Microsoft 365 Copilot to generate the HTML dashboard you want to surface (e.g. ask Copilot to build a live dashboard from a list/library in SharePoint) and save it to a document library.
- **Get its embed URL, not its file URL.** Open the saved dashboard file in SharePoint and use **Embed** to get an `embed.aspx?UniqueId=...` link. Use that link, not the raw document library URL — SharePoint document libraries often force-download or block framing of `.html` files directly, while `embed.aspx` is built for iframing.
- A SharePoint list or library view to attach the command bar extension to, and where you'll paste that embed URL when prompted.
- To configure or change the dashboard URL, the signed-in user needs **Manage Lists** permission on the target list. Users without that permission see the dashboard once it's configured, and a friendly "ask your site owner" message if it isn't configured yet.

## Solution

| Solution                     | Author(s)                                               |
| ----------------------------- | ------------------------------------------------------- |
| react-command-live-dashboard-sharepoint |  [Siddharth Vaghasia](https://github.com/siddharth-vaghasia) |

## Version history

| Version | Date              | Comments                                                                  |
| ------- | ----------------- | -------------------------------------------------------------------------- |
| 1.0     | August 29, 2026    | Initial release|

## Disclaimer

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Ensure that you are at the solution folder
- in the command-line run:
  - `npm install -g @rushstack/heft`
  - `npm install`
  - `heft start`
- This serves the extension against the local workbench configurations in `config/serve.json`. Both configurations
  already include a sample `dashboardUrl` property so `Show Dashboard` works out of the box; edit that value (or
  just let the in-browser prompt configure it the first time you run the command against a real list) to point at
  the `embed.aspx` link of your own Copilot-generated dashboard.
- To deploy for real: run `heft test --clean --production && heft package-solution --production`, upload the
  generated `.sppkg` from `sharepoint/solution` to your tenant/site App Catalog, and add the
  `LiveDashboardExtension` custom action (see `sharepoint/assets/elements.xml`) to any list or library where you
  want the command to appear — no code changes needed per list.

Other build commands can be listed using `heft --help`.

## Features

This extension adds a "Show Dashboard" command to the command bar of a SharePoint list/library, which opens a
Copilot-generated HTML dashboard in an embedded popup dialog — without navigating away from the list.

This extension illustrates the following concepts:

- **ListView Command Set** with two commands: `COMMAND_1` (a sample alert, visible only when exactly one row is
  selected) and `COMMAND_2` — **Show Dashboard** — which opens the dashboard popup.
- **Custom modal dialog with an embedded iframe**: `IFrameDialog` extends `BaseDialog` from `@microsoft/sp-dialog`
  to render a resizable popup containing an `<iframe>`, rather than the built-in alert/prompt dialogs.
- **Per-list configuration, stored server-side**: the dashboard URL for each list is read from and written to
  that list's own property bag (`RootFolder/Properties`, key `LiveDashboardExtension_DashboardUrl`) via
  `SPHttpClient`, in `DashboardUrlStore`. This lets one deployed extension serve a different dashboard per list,
  with no redeploy and no per-list manifest changes.
- **Configure-on-first-use with permission awareness**: if a list has no dashboard URL configured yet, users with
  `Manage Lists` permission are prompted to enter one (which is then saved for everyone); users without that
  permission instead see a message pointing them to a site owner/list administrator.
- **In-dialog "Edit URL" for admins**: when the current user has `Manage Lists` permission, the dashboard popup
  shows an "Edit URL" button that lets them update the stored URL at any time, without leaving the list view.

> Notice that better pictures and documentation will increase the sample usage and the value you are providing for others. Thanks for your submissions advance.

> Share your web part with others through Microsoft 365 Patterns and Practices program to get visibility and exposure. More details on the community, open-source projects and other activities from http://aka.ms/m365pnp.

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development
- [Heft Documentation](https://heft.rushstack.io/)