# Alert Banner SPFx Extension

## Summary

The **Alert Banner SPFx Extension** is a comprehensive notification system for modern SharePoint sites, providing a flexible and user-friendly way to display important alerts across your organization. The extension retrieves alert data from SharePoint lists using Microsoft Graph API and displays them prominently at the top of SharePoint pages.

![screenshot](./assets/Screenshot2024-08-17170932.png)

This project is inspired by Thomas Daly's original alert banner concept.
Special thanks to Thomas Daly for the initial foundation!

[Thomas Daly alert banner](https://github.com/tom-daly/alerts-banner)

## Key Features

- **Multi-Site Aggregation**: Retrieves alerts from local, hub, and root sites, providing a comprehensive alert experience
- **Alert Prioritization**: Categorize alerts as Low, Medium, High, or Critical with distinct visual styling
- **Targeted Notifications**: Show alerts to specific users based on their properties and group memberships
- **Rich Content Support**: Include images, videos, HTML, and markdown for engaging communications
- **Interactive Elements**: Add quick action buttons for direct user engagement
- **Modern Dialog Experience**: Enhanced detail view with full rich content rendering
- **Browser & Email Notifications**: Send notifications for critical alerts to ensure visibility
- **Flexible Alert Types**: Dynamically configure alert types through JSON without code changes
- **Accessibility Features**: Built with keyboard navigation, screen reader support, and WCAG compliance
- **Caching & Performance Optimization**: Smart caching and rendering strategies for optimal performance

## Compatibility

| :warning: Important          |
|:---------------------------|
| Every SPFx version is optimally compatible with specific versions of Node.js. In order to be able to build this sample, you need to ensure that the version of Node on your workstation matches one of the versions listed in this section. This sample will not work on a different version of Node.|
|Refer to <https://aka.ms/spfx-matrix> for more information on SPFx compatibility.   |

This sample is optimally compatible with the following environment configuration:

![SPFx 1.20.2](https://img.shields.io/badge/SPFx-1.20.2-green.svg)
![Node.js v18](https://img.shields.io/badge/Node.js-v18-green.svg)
![Compatible with SharePoint Online](https://img.shields.io/badge/SharePoint%20Online-Compatible-green.svg)
![Does not work with SharePoint 2019](https://img.shields.io/badge/SharePoint%20Server%202019-Incompatible-red.svg "SharePoint Server 2019 requires SPFx 1.4.1 or lower")
![Does not work with SharePoint 2016 (Feature Pack 2)](https://img.shields.io/badge/SharePoint%20Server%202016%20(Feature%20Pack%202)-Incompatible-red.svg "SharePoint Server 2016 Feature Pack 2 requires SPFx 1.1")
![Local Workbench Unsupported](https://img.shields.io/badge/Local%20Workbench-Unsupported-red.svg "Local workbench is no longer available as of SPFx 1.13 and above")
![Hosted Workbench Compatible](https://img.shields.io/badge/Hosted%20Workbench-Compatible-green.svg)
![Compatible with Remote Containers](https://img.shields.io/badge/Remote%20Containers-Compatible-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to the [Microsoft 365 developer program](http://aka.ms/o365devprogram).

## Prerequisites

- Node.js (v18.x or later)
- React 17
- SPFx (v1.20.x or later)
- SharePoint Online site collection with appropriate permissions
- Access to configure the tenant App Catalog

## Contributors

- [Nicolas Kheirallah](https://github.com/nicolasKheirallah)

## Version History

| Version | Date            | Comments                                        |
| ------- | --------------- | ----------------------------------------------- |
| 1.4     | March 5, 2025   | Enhanced UI with modern dialog and improved link styling |
| 1.3     | March 3, 2025   | Added alert prioritization, user targeting, notifications, rich media support |
| 1.2     | October 11, 2024| Added dynamic alert types, added support for homesite, hubsite and local site |
| 1.1     | August 17, 2024 | Added caching and session management for alerts |
| 1.0     | July 15, 2024   | Initial release                                 |

## Minimal Path to Awesome

- Clone this repository
- Navigate to the solution folder
- In the command line, run:
  - **npm install**
  - **./buildProject.cmd**
  - **Deploy to app catalog**

> Note: After deployment, create an "Alerts" list in SharePoint with the required fields described below.

## Technical Details

### Data Architecture

The Alert Banner retrieves alerts from a SharePoint list named "Alerts." This list contains the following key fields:

| Field Name      | Field Type                     | Description                                        |
|-----------------|--------------------------------|----------------------------------------------------|
| Title           | Single line of text            | The main heading of the alert                      |
| Description     | Multiple lines of text (Rich)  | Detailed message content                           |
| AlertType       | Choice                         | Type of alert (Info, Warning, etc.)                |
| Priority        | Choice                         | Low, Medium, High, Critical                        |
| IsPinned        | Yes/No                         | Whether the alert should be pinned to the top      |
| StartDateTime   | Date and Time                  | When the alert should begin displaying             |
| EndDateTime     | Date and Time                  | When the alert should stop displaying              |
| TargetUsers     | Person or Group (People only)  | Specific users who should see the alert            |
| TargetGroups    | Person or Group (Groups only)  | Specific groups who should see the alert           |
| TargetingOperation | Choice                      | anyOf, allOf, noneOf - how to apply targeting rules |
| TargetingRules  | Multiple lines of text (Plain) | JSON defining which users should see the alert     |
| NotificationType| Choice                         | None, Browser, Email, Both                         |
| RichMedia       | Multiple lines of text (Plain) | JSON defining embedded media content               |
| QuickActions    | Multiple lines of text (Plain) | JSON defining interactive buttons for the alert    |
| Link            | Hyperlink or Picture           | URL for additional information                     |

### Component Architecture

The extension uses a component-based approach with these key elements:

1. **AlertsBannerApplicationCustomizer**: Main extension that initializes the alert system and renders it in the top placeholder
2. **Alerts**: Container component that fetches, processes, and displays alerts
3. **AlertItem**: Individual alert component with expandable content, quick actions, and dialog support
4. **AlertsContext**: React context for global state management of alerts
5. **Service Classes**:
   - **UserTargetingService**: Manages user targeting based on user properties and group membership
   - **NotificationService**: Handles browser and email notifications
   - **StorageService**: Manages local and session storage for caching and user preferences

### User Targeting

The extension supports two methods of targeting alerts to specific users:

#### 1. People and Group Fields

The preferred method uses SharePoint Person fields:
- **TargetUsers**: Target specific individuals
- **TargetGroups**: Target specific SharePoint groups
- **TargetingOperation**: Determines how targeting is applied (anyOf, allOf, noneOf)

#### 2. JSON Targeting Rules (Legacy)

For backward compatibility, JSON targeting rules are still supported:

```json
{
  "audiences": ["HR", "Finance"],
  "operation": "anyOf"
}
```

### Alert Type Configuration

Alert types are fully customizable through a JSON configuration property, allowing for visual differentiation between different alert categories:

```json
[
  {
    "name": "Info",
    "iconName": "Info",
    "backgroundColor": "#389899",
    "textColor": "#ffffff",
    "additionalStyles": "",
    "priorityStyles": {
      "critical": "border: 2px solid #E81123;",
      "high": "border: 1px solid #EA4300;",
      "medium": "",
      "low": ""
    }
  },
  {
    "name": "Warning",
    "iconName": "Warning",
    "backgroundColor": "#f1c40f",
    "textColor": "#000000",
    "additionalStyles": ""
  },
  {
    "name": "Maintenance",
    "iconName": "ConstructionCone",
    "backgroundColor": "#afd6d6",
    "textColor": "#000000",
    "additionalStyles": ""
  },
  {
    "name": "Interruption",
    "iconName": "Error",
    "backgroundColor": "#c54644",
    "textColor": "#ffffff",
    "additionalStyles": ""
  }
]
```

Each alert type can define:
- Visual appearance (colors, icons)
- Default styles
- Priority-specific styles

### Rich Media Support

Alerts can include various types of rich media content:

```json
{
  "type": "image",
  "content": "https://example.com/image.jpg",
  "altText": "Description of image"
}
```

Supported media types:
- **image**: Display an image
- **video**: Embed a video player
- **html**: Include formatted HTML content 
- **markdown**: Include markdown-formatted content

### Quick Actions

Alerts can include interactive buttons for direct user engagement:

```json
[
  {
    "label": "View Documentation",
    "actionType": "link",
    "url": "https://example.com/docs",
    "icon": "Document"
  },
  {
    "label": "Acknowledge",
    "actionType": "acknowledge",
    "icon": "CheckMark"
  },
  {
    "label": "Dismiss",
    "actionType": "dismiss",
    "icon": "Cancel"
  }
]
```

Supported action types:
- **link**: Open a URL
- **dismiss**: Dismiss the alert
- **acknowledge**: Acknowledge and dismiss the alert
- **custom**: Execute a custom JavaScript function

## Advanced Features

### Multi-Site Alert Aggregation

The extension aggregates alerts from multiple sources:
1. **Current Site**: Alerts specific to the current site
2. **Hub Site**: Alerts from the associated hub site (if applicable)
3. **Root Site**: Organization-wide alerts from the root site

Alerts are deduplicated and prioritized to present a unified experience.

### Notification System

Critical and high-priority alerts can trigger notifications:
- **Browser Notifications**: Desktop notifications for immediate attention
- **Email Notifications**: Email alerts sent via Microsoft Graph API

### User Preference Management

The extension remembers user interactions:
- **Dismissed Alerts**: Stored in session storage
- **Hidden Alerts**: Stored in local storage for longer persistence

### Accessibility Considerations

- **Keyboard Navigation**: Full keyboard support with proper tab order
- **Screen Reader Support**: ARIA attributes for better accessibility
- **Focus Management**: Managed focus trap in dialogs
- **Color Contrast**: Meets WCAG standards
- **RTL Language Support**: Right-to-left language layout

## Customization Options

### Extension Properties

The extension can be configured through these properties:
- **alertTypesJson**: JSON configuration for alert types
- **userTargetingEnabled**: Enable/disable user targeting
- **notificationsEnabled**: Enable/disable notifications
- **richMediaEnabled**: Enable/disable rich media support

## Performance Optimizations

- **Caching Strategy**: Efficient local storage caching
- **User Experience**: Loading states and error handling
- **Render Optimization**: React memo and callback patterns
- **Error Resilience**: Graceful fallbacks for API failures

## Current Limitations

- No built-in multi-language support (planned for future)
- Limited animation capabilities for cross-browser compatibility
- Graph API permission requirements may need tenant-level approval
- Maximum of 20 alerts displayed at once for performance reasons

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft Teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp)
- [FluentUI React Components](https://developer.microsoft.com/en-us/fluentui#/controls/web)

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

<img src="https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/samples/react-application-alert-banner" />