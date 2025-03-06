# Alert Banner SPFx Extension
## Summary

The **Alert Banner SPFx Extension** is a custom SharePoint Framework (SPFx) extension designed to display alert notifications prominently in the Banner of Modern SharePoint sites. These alerts are dynamically retrieved from a SharePoint list using the Microsoft Graph API, ensuring users receive important updates and information seamlessly integrated with Microsoft 365 services.

![screenshot](./assets/Screenshot2024-08-17170932.png)

This project based and draws inspiration from the work of Thomas Daly on this alerts banner! 
Special thanks to Thomas Daly for the original concept!

[Thomas Daly alert banner](https://github.com/tom-daly/alerts-banner)

## Goal of this Project

Alert banners are frequently requested by organizations such as IT departments but are not readily available out-of-the-box. This extension aims to provide a flexible and reusable alert system that any organization can deploy with ease.

Additionally, this project serves as an opportunity to refresh and enhance coding skills within the SPFx ecosystem.

## Used SharePoint Framework Version

![SPFx 1.20](https://img.shields.io/badge/version-1.20.0-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to the [Microsoft 365 developer program](http://aka.ms/o365devprogram).

## Prerequisites

- Node.js (v18.x or later)
- React 17
- SPFx (v1.19.x or later)
- A SharePoint Online site collection
- Appropriate permissions to access and configure the tenant App Catalog

## Solution

| Solution     | Author(s)                                         |
| ------------ | ------------------------------------------------- |
| alert-banner | [Nicolas Kheirallah](https://github.com/nicolasKheirallah) |

## Version History

| Version | Date            | Comments                                        |
| ------- | --------------- | ----------------------------------------------- |
| 1.4     | March 5, 2025   | Enhanced UI with modern dialog and improved link styling |
| 1.3     | March 3, 2025   | Added alert prioritization, user targeting, notifications, rich media support |
| 1.2     | October 11, 2024| Added dynamic alerttypes, added support for homesite, hubsite and local site |
| 1.1     | August 17, 2024 | Added caching and session management for alerts |
| 1.0     | July 15, 2024   | Initial release                                 |

## Disclaimer

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository.
- Navigate to the solution folder.
- In the command line, run:
  - **npm install**
  - **./buildProject.cmd**
  - **Deploy to app catalog**

> Additional steps may be required depending on your environment configuration.

## Features

This SPFx extension offers the following capabilities:

- **Fetch Alerts**: Retrieves alerts from a designated SharePoint list using the Microsoft Graph API.
- **Display Alerts**: Show alerts prominently in the banner of Modern SharePoint pages.
- **Dynamic Alert Type Configuration**: Configure alert types dynamically using a JSON property, allowing easy customization and scalability.
- **User Interaction Handling**: Allows users to dismiss alerts, with the option to prevent dismissed alerts from reappearing.
- **Performance Optimization**: Utilizes local storage for caching alerts, improving performance.
- **Multi-Site Support**: Support for Root, Local, and Hub sites.
- **Alert Prioritization**: Categorize alerts as Low, Medium, High, or Critical with visual differentiation.
- **User Targeting**: Target alerts to specific departments, job titles, or SharePoint groups.
- **Notification System**: Send browser and email notifications for important alerts.
- **Rich Media Support**: Include images, videos, HTML, and markdown content in alerts.
- **Quick Actions**: Add interactive buttons to alerts for direct user engagement.
- **Modern Dialog Interface**: Enhanced dialog experience with FluentUI components and improved usability.
- **Clickable Alerts**: Click anywhere on an alert to open a detailed dialog view.
- **Stylized Action Links**: Buttons-styled links for better visibility and user interaction.

## Managing Alerts

- **Global Alerts**: Deployed across all sites, fetching alerts from the root site where the extension is installed.
- **Local Alerts**: After the extension is added to a site collection, a new list titled "Alerts" is automatically created in the Site Contents. To create a new alert, simply add a new item to this list.

### Alert List Fields & Configuration:

When creating the "Alerts" list in SharePoint, you should configure the following fields:

| Field Name      | Field Type                     | Description                                        |
|-----------------|--------------------------------|----------------------------------------------------|
| Title           | Single line of text            | The main heading of the alert                      |
| Description     | Multiple lines of text (Rich)  | Detailed message content                           |
| AlertType       | Choice                         | Type of alert (Info, Warning, etc.)                |
| Priority        | Choice                         | Low, Medium, High, Critical                        |
| IsPinned        | Yes/No                         | Whether the alert should be pinned to the top      |
| StartDateTime   | Date and Time                  | When the alert should begin displaying             |
| EndDateTime     | Date and Time                  | When the alert should stop displaying              |
| TargetingRules  | Multiple lines of text (Plain) | JSON defining which users should see the alert     |
| NotificationType| Choice                         | None, Browser, Email, Both                         |
| RichMedia       | Multiple lines of text (Plain) | JSON defining embedded media content               |
| QuickActions    | Multiple lines of text (Plain) | JSON defining interactive buttons for the alert    |
| Link            | Hyperlink or Picture           | URL for additional information                     |

#### Choice Field Options:

- **AlertType**: Create choice values matching your alert type configurations (Info, Warning, Maintenance, Interruption, etc.)
- **Priority**: Create these choice values: Low, Medium, High, Critical
- **NotificationType**: Create these choice values: none, browser, email, both

### User Interface Components

#### Alert Card
- **Clickable Interface**: The entire alert card is clickable, opening a detailed dialog view.
- **Visual Priority Indicators**: Color-coded borders and backgrounds based on alert priority.
- **Collapsible Content**: Toggle between condensed and expanded views.
- **Quick Action Buttons**: Customizable action buttons for direct user engagement.

#### Dialog
- **Enhanced Viewing Experience**: Modern FluentUI dialog for detailed alert content.
- **Rich Content Support**: Properly formatted HTML, Markdown, and rich media content.
- **Action Links**: Button-styled links with icons for better usability.
- **Focus Management**: Improved keyboard navigation and screen reader support.

#### Action Links
- **Context-Aware Styling**: Different styling in alerts vs. dialogs.
- **Icon Integration**: Link icon for visual clarity.
- **Button-Like Appearance**: Enhanced clickability compared to traditional text links.
- **Responsive Design**: Adapts to different screen sizes.

### Dynamic Alert Type Configuration:

Alert types can be customized dynamically using a JSON configuration property. This allows administrators to add, modify, or remove alert types without altering the codebase. The JSON structure defines the appearance and behavior of each alert type, including icons, colors, and additional styles.

**Example JSON Structure:**

```json
[
    {
       "name":"Info",
       "iconName":"Info12",
       "backgroundColor":"#389899",
       "textColor":"#ffffff",
       "additionalStyles":"",
       "priorityStyles": {
          "critical": "border: 2px solid #E81123;",
          "high": "border: 1px solid #EA4300;",
          "medium": "",
          "low": ""
       }
    },
    {
       "name":"Warning",
       "iconName":"ShieldAlert",
       "backgroundColor":"#f1c40f",
       "textColor":"#ffffff",
       "additionalStyles":""
    },
    {
       "name":"Maintenance",
       "iconName":"CRMServices",
       "backgroundColor":"#afd6d6",
       "textColor":"#ffffff",
       "additionalStyles":""
    },
    {
       "name":"Interruption",
       "iconName":"IncidentTriangle",
       "backgroundColor":"#c54644",
       "textColor":"#ffffff",
       "additionalStyles":""
    }
 ]
```

### User Targeting Configuration:

Alerts can be targeted to specific users based on their properties. This allows administrators to ensure that alerts are only shown to relevant audiences.

**Example Targeting Rules JSON (for TargetingRules field):**

```json
{
  "audiences": ["HR", "Finance"],
  "operation": "anyOf"
}
```

Operations supported:
- `anyOf`: User must match any of the audiences
- `allOf`: User must match all of the audiences
- `noneOf`: User must not match any of the audiences

### Rich Media Configuration:

Alerts can include various types of rich media content for enhanced communication.

**Example Rich Media JSON (for RichMedia field):**

```json
{
  "type": "markdown",
  "content": "# Important Update\n\nPlease review the [latest guidelines](https://example.com)",
  "altText": "Important update about new guidelines"
}
```

Media types supported:
- `image`: Display an image with the alert
- `video`: Embed a video player
- `html`: Include formatted HTML content
- `markdown`: Include markdown-formatted content

### Quick Actions Configuration:

Alerts can include interactive buttons for direct user engagement.

**Example Quick Actions JSON (for QuickActions field):**

```json
[
  {
    "label": "Add to Calendar",
    "actionType": "link",
    "url": "https://example.com/calendar",
    "icon": "Calendar"
  },
  {
    "label": "Acknowledge",
    "actionType": "acknowledge",
    "icon": "CheckMark"
  }
]
```

Action types supported:
- `link`: Open a URL
- `dismiss`: Dismiss the alert
- `acknowledge`: Acknowledge and dismiss the alert
- `custom`: Execute a custom JavaScript function

## Accessibility Features

The Alert Banner is designed with accessibility in mind:

- **Keyboard Navigation**: Full keyboard support for all interactive elements.
- **Screen Reader Support**: Proper ARIA attributes for better screen reader integration.
- **Focus Management**: Managed focus trap in dialogs to improve keyboard accessibility.
- **Color Contrast**: Meets WCAG 2.1 AA standards for color contrast.
- **Text Scaling**: Supports browser text scaling for vision impairments.
- **RTL Language Support**: Right-to-left language layout support for global accessibility.

## Performance Considerations

The Alert Banner is optimized for performance:

- **Efficient Rendering**: Uses React memo and callback optimizations to reduce render cycles.
- **Caching Strategy**: Implements local and session storage for efficient alert management.
- **Lazy Loading**: Dialog content is loaded only when needed.
- **Component Splitting**: Modular design allows for better code splitting.
- **CSS Optimization**: Carefully organized SCSS with variables for minimal CSS output.

## Current Limitations

- Translation/multi-language support is currently not implemented but is planned for a future release.
- Animations and transitions are limited for cross-browser compatibility.
- Outlook web integration is in development for a future release.

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft Teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples, and open-source controls for your Microsoft 365 development.
- [FluentUI React Components](https://developer.microsoft.com/en-us/fluentui#/controls/web)

## Concepts Demonstrated

This extension showcases:

- **Integration of the Microsoft Graph API** within SPFx extensions for efficient data retrieval.
- **Dynamic Configuration Management**: Utilizing JSON properties to configure alert types, enhancing flexibility and maintainability.
- **Customizing the banner Section** of Modern SharePoint pages to provide a consistent and visible alerting mechanism.
- **Efficient State Management and Caching** using local and session storage to optimize performance and reduce redundant data fetching.
- **Responsive Design and User Interaction Handling** to ensure alerts are accessible and user-friendly across various devices and screen sizes.
- **Advanced User Targeting** based on user properties and group membership.
- **Notification Integration** with browser notification API and Microsoft Graph email functionality.
- **Rich Media Content Rendering** with proper sanitization and responsive design.
- **Modern FluentUI Implementation** with proper component hierarchy and styling patterns.
- **Accessibility-First Design** ensuring usability for all users regardless of ability.


<img src="https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/samples/react-application-alert-banner" />




