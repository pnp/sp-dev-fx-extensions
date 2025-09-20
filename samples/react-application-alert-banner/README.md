# Alert Banner SPFx Extension

## Summary

The **Alert Banner SPFx Extension** is a custom SharePoint Framework (SPFx) extension designed to display alert notifications prominently in the Banner of Modern SharePoint sites. These alerts are dynamically retrieved from a SharePoint list using the Microsoft Graph API, ensuring users receive important updates and information seamlessly integrated with Microsoft 365 services.

![screenshot](https://github.com/NicolasKheirallah/alertbanner/blob/main/Assets/Skärmavbild%202025-08-16%20kl.%2013.51.52.png)
![screenshot](https://github.com/NicolasKheirallah/alertbanner/blob/main/Assets/Skärmavbild%202025-08-16%20kl.%2013.52.10.png)
![screenshot](https://github.com/NicolasKheirallah/alertbanner/blob/main/Assets/Skärmavbild%202025-08-16%20kl.%2013.52.24.png)

This project draws inspiration from the work of Thomas Daly. Special thanks to Thomas Daly for the original concept!

[Thomas Daly alert banner](https://github.com/tom-daly/alerts-banner)

## Goal of this Project

Alert banners are frequently requested by organizations such as IT departments but are not readily available out-of-the-box. This extension aims to provide a flexible and reusable alert system that any organization can deploy with ease.

Additionally, this project serves as an opportunity to refresh and enhance coding skills within the SPFx ecosystem.

## Compatibility

| :warning: Important          |
|:---------------------------|
| Every SPFx version is optimally compatible with specific versions of Node.js. In order to be able to build this sample, you need to ensure that the version of Node on your workstation matches one of the versions listed in this section. This sample will not work on a different version of Node.|
|Refer to <https://aka.ms/spfx-matrix> for more information on SPFx compatibility.   |

This sample is optimally compatible with the following environment configuration:

![SPFx 1.21.1](https://img.shields.io/badge/SPFx-1.21.1-green.svg)
![Node.js v22](https://img.shields.io/badge/Node.js-v22-green.svg)
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
- SPFx (v1.21.1 or later)
- A SharePoint Online site collection
- Appropriate permissions to access and configure the tenant App Catalog

## Contributors

- [Nicolas Kheirallah](https://github.com/nicolasKheirallah)

## Version History

| Version | Date               | Comments                                        |
| ------- | ------------------ | ----------------------------------------------- |
| 3.0 | August 31, 2025 |  Enhanced multi-language support with persistent language selection, improved UI/UX with proper input field containment, streamlined codebase, and robust API consistency improvements |
| 2.4 | August 30, 2025 | Simplified user targeting with SharePoint People/Groups fields (replacing JSON-based rules), removed rich media complexity in favor of HTML description field, enhanced template with better SharePoint integration, comprehensive CRUD operations, and  better logging and error handling |
| 2.3 | August 29, 2025 | Dynamic language targeting with intelligent fallback system, language-aware audience filtering, dynamic SharePoint choice field management, comprehensive multi-language content editing, and full end-to-end language workflow integration |
| 2.2 | August 27, 2025 | Production-Ready Release: Comprehensive logging, accessibility (WCAG 2.1 AA), input validation, error boundaries, performance optimizations, TypeScript enhancements, and responsive UI fixes |
| 2.1     | August 16, 2025   | Enhanced multi-language list creation with UI improvements and error handling refinements |
| 2.0     | August 13, 2025   | Major release: Hierarchical alert system with Home/Hub/Site distribution, automatic list management, multi-language content creation, and enhanced site context awareness |
| 1.6     | August 13, 2025   | Added comprehensive multi-language support with 8 languages, automatic language detection, and localization framework |
| 1.5     | August 12, 2025   | Removed dialog, integrated content directly into banner, added "Read More" functionality |
| 1.4     | March 5, 2025     | Enhanced UI with modern dialog and improved link styling |
| 1.3     | March 3, 2025     | Added alert prioritization, user targeting, notifications, rich media support |
| 1.2     | October 11, 2024  | Added dynamic alerttypes, added support for homesite, hubsite and local site |
| 1.1     | August 17, 2024   | Added caching and session management for alerts |
| 1.0     | July 15, 2024     | Initial release                                 |

## Disclaimer

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository.
- Navigate to the solution folder.
- In the command line, run:
  - `npm install`
  - `./buildProject.cmd`
  - **Deploy to app catalog**

> Additional steps may be required depending on your environment configuration.


## Features

This SPFx extension offers the following capabilities:

- **Fetch Alerts**: Retrieves alerts from a designated SharePoint list using the Microsoft Graph API.
- **Display Alerts**: Show alerts prominently in the banner of Modern SharePoint pages, with detailed content displayed directly within the expanded banner.
- **Dynamic Alert Type Configuration**: Configure alert types dynamically using a JSON property, allowing easy customization and scalability.
- **User Interaction Handling**: Allows users to dismiss alerts, with the option to prevent dismissed alerts from reappearing.
- **Performance Optimization**: Utilizes local storage for caching alerts, improving performance.
- **Multi-Site Support**: Support for Root, Local, and Hub sites.
- **Alert Prioritization**: Categorize alerts as Low, Medium, High, or Critical with visual differentiation.
- **Simplified User Targeting**: Target alerts using SharePoint People/Groups picker - select specific users or groups, or leave empty for everyone to see.
- **Notification System**: Send browser notifications for critical and high-priority alerts.
- **HTML Content Support**: Rich text descriptions with HTML formatting, including images, links, and styled content.
- **Action Links**: Optional action links with customizable descriptions for enhanced user engagement.
- **Advanced Multi-Language System**: Dynamic language targeting with intelligent fallback logic, language-aware audience filtering, and automatic user language detection from SharePoint/browser settings.
- **Dynamic Language Management**: Self-updating SharePoint choice fields that automatically add/remove language options based on administrator configuration.
- **Multi-Language Content Editor**: Comprehensive interface for creating and managing alert content across multiple languages with validation and status tracking.
- **Language-Aware Audience Targeting**: Users automatically see alerts in their preferred language (French users see French, German users see German) with smart fallback to available languages.
- **Hierarchical Alert System**: Intelligent alert distribution based on SharePoint site hierarchy (Home Site → Hub Site → Current Site).
- **Automatic List Management**: Smart detection and one-click creation of alert lists across site hierarchy.
- **Site Context Awareness**: Automatic detection of Home Sites, Hub Sites, and current site relationships.

## Multi-Language Support

The Alert Banner extension now includes comprehensive multi-language support with the following features:

### Supported Languages

- **English (en-us)** - English (Default)
- **French (fr-fr)** - Français
- **German (de-de)** - Deutsch
- **Spanish (es-es)** - Español
- **Swedish (sv-se)** - Svenska
- **Finnish (fi-fi)** - Suomi
- **Danish (da-dk)** - Dansk
- **Norwegian (nb-no)** - Norsk bokmål

### Language Features

- **Automatic Detection**: Detects user's language from SharePoint context or browser settings
- **Manual Selection**: Users can manually change language through the language selector in settings
- **Persistent Preferences**: Language choice is stored in browser local storage
- **Fallback Support**: Falls back to English if requested language is not available
- **Date/Time Localization**: Automatically formats dates and times according to selected locale
- **String Interpolation**: Dynamic content with parameter substitution
- **RTL Ready**: Framework supports right-to-left languages (when needed)

### For Administrators

Access the language selector through the Alert Settings dialog (available when in edit mode). The system will automatically detect the user's preferred language based on their SharePoint/browser settings, but users can manually override this selection.

For detailed information about localization features, development guidelines, and adding new languages, see [LOCALIZATION.md](./LOCALIZATION.md).

## Managing Alerts

The Alert Banner extension uses an intelligent hierarchical system to display alerts based on SharePoint site relationships:

### Alert Hierarchy

- **Home Site Alerts**: Displayed on ALL sites across the tenant - perfect for organization-wide announcements
- **Hub Site Alerts**: Displayed on the hub site and all sites connected to that hub - ideal for department or division updates  
- **Current Site Alerts**: Displayed only on the specific site - best for site-specific notifications

### Automatic Site Detection

The extension automatically detects:
- **Your organization's Home Site** (if configured)
- **Hub Site connections** for the current site
- **Site relationships** and permissions
- **Existing alert lists** across the hierarchy

### Alert List Management

The extension provides intelligent list management:
- **Automatic Detection**: Checks if alert lists exist on relevant sites
- **One-Click Creation**: Create missing alert lists directly from settings
- **Permission Validation**: Shows what you can access and create
- **Visual Status Indicators**: Clear icons show list availability and status

## Creating Multi-Language Content

The Alert Banner extension now supports creating content in multiple languages, allowing organizations to communicate effectively with diverse audiences.

### Using the Multi-Language Content Editor

1. **Access the Editor**: When creating or editing alerts through the Settings interface, you'll see a multi-language content section
2. **Select Languages**: Use the language tabs to switch between different language versions of your content
3. **Add Content**: Fill in the Title, Description, and Link Description for each language
4. **Language Management**: Add custom languages using the "Add Language" button

### Content Creation Workflow

1. **Primary Language**: Start by creating content in your primary language (typically English)
2. **Add Translations**: Use the language tabs to switch to other languages and provide translations
3. **Content Validation**: The system shows a summary of which languages have content
4. **Publish**: Save the alert - users will automatically see content in their preferred language

### Custom Language Support

Beyond the 8 built-in languages, administrators can add custom languages:

1. **Add Language**: Click "Add Language" in the multi-language editor
2. **Language Details**: Provide language code (e.g., 'it-it'), name, and native name
3. **Quick Setup**: Choose from suggested languages or manually configure
4. **Automatic Columns**: The system automatically creates SharePoint list columns for the new language

### Language Fallback System

The extension uses an intelligent fallback system:
- **Primary**: Shows content in user's preferred language
- **Secondary**: Falls back to English if preferred language content is missing  
- **Tertiary**: Uses default Title/Description fields as final fallback

### Best Practices for Multi-Language Content

- **Consistent Messaging**: Ensure translations convey the same meaning and urgency
- **Cultural Adaptation**: Consider cultural context, not just literal translation
- **Testing**: Preview alerts in different languages before publishing
- **Maintenance**: Keep translations updated when primary content changes

## Hierarchical Alert System

The Alert Banner extension implements a sophisticated three-tier alert system that follows SharePoint's natural site hierarchy:

### Alert Distribution Strategy

| Alert Level | Scope | Use Cases | Creation Location |
|-------------|--------|-----------|-------------------|
| **Home Site** | All sites in tenant | Organization announcements, company-wide news, emergency notifications | Home Site alerts list |
| **Hub Site** | Hub and connected sites | Department updates, division-wide communications, shared resources | Hub Site alerts list |
| **Site-Specific** | Individual site only | Team notifications, project updates, site maintenance | Current site alerts list |

### How It Works

1. **Automatic Detection**: The extension scans your SharePoint environment to identify:
   - Home Site (if configured at tenant level)
   - Hub Site connections for the current site
   - Current site context and permissions

2. **Intelligent Querying**: Only queries sites that:
   - Have alert lists created
   - User has permission to access
   - Are relevant to the current site context

3. **Hierarchical Display**: Alerts are displayed in priority order:
   - Home Site alerts (highest priority - shown everywhere)
   - Hub Site alerts (medium priority - shown on hub and connected sites)
   - Site alerts (local priority - shown on specific site only)

### List Management Interface

The Settings dialog includes a comprehensive List Management section that provides:

- **Site Hierarchy Visualization**: See your Home Site, Hub Site, and Current Site relationships
- **List Status Indicators**: Visual status for each site's alert list (✅ Available, ⚠️ Limited Access, ❌ Missing, ➕ Can Create)
- **One-Click List Creation**: Create missing alert lists with full field schema
- **Permission Validation**: Clear indication of what actions are available
- **Real-Time Updates**: Status updates immediately when lists are created

### Best Practices

#### For Home Site Alerts
- Use for critical, tenant-wide communications
- Keep content concise and universally relevant
- Consider multi-language content for global organizations
- Use high priority levels sparingly

#### For Hub Site Alerts  
- Focus on department or division-specific content
- Leverage user targeting for role-specific messages
- Coordinate with hub site owners for content strategy
- Use medium priority for most communications

#### For Site-Specific Alerts
- Perfect for team notifications and project updates
- Use lower priority levels for routine communications
- Use HTML content in descriptions for rich formatting
- Target specific user groups as needed

### Alert List Fields & Configuration:

The Alert Banner extension automatically creates and manages SharePoint lists with the following fields:

#### Core Alert Fields:

| Field Name      | Field Type                     | Description                                        |
|-----------------|--------------------------------|----------------------------------------------------|
| Title           | Single line of text            | The main heading of the alert                      |
| Description     | Multiple lines of text (Rich)  | Detailed message content with HTML support        |
| AlertType       | Choice                         | Type of alert (Info, Warning, etc.)               |
| Priority        | Choice                         | Low, Medium, High, Critical                        |
| IsPinned        | Yes/No                         | Whether the alert should be pinned to the top     |
| ScheduledStart  | Date and Time                  | When the alert should begin displaying             |
| ScheduledEnd    | Date and Time                  | When the alert should stop displaying             |
| TargetUsers     | Person or Group (Multi)        | SharePoint users/groups who can see this alert    |
| NotificationType| Choice                         | None, Browser, Email, Both                         |
| LinkUrl         | Single line of text            | Optional action link URL                           |
| LinkDescription | Single line of text            | Description for the action link                    |
| ItemType        | Choice                         | Alert or Template                                  |
| TargetLanguage  | Choice (Dynamic)               | Language targeting with automatic management       |
| LanguageGroup   | Single line of text            | Groups related language variants                   |
| AvailableForAll | Yes/No                         | Allow content to be shown to other languages      |

#### Language Targeting:

Multi-language support is managed through a simple choice field approach:

- **TargetLanguage Choice Field**: Contains language options (all, en-us, fr-fr, de-de, etc.)
- **Language Group Field**: Groups related language variants of the same content
- **Content Approach**: Each alert targets a specific language using the TargetLanguage choice field
- **Dynamic Management**: The Language Management interface automatically adds new language options to the TargetLanguage choice field

**How it works:**
1. Create separate alert items for each language version
2. Use the same LanguageGroup value to link related language variants
3. Set TargetLanguage to specify which users should see each version
4. Users automatically see the version that matches their language preference

**Note:** The extension automatically manages the TargetLanguage choice field options when administrators add new languages through the interface.

#### Choice Field Options:

- **AlertType**: Create choice values matching your alert type configurations (Info, Warning, Maintenance, Interruption, etc.)
- **Priority**: Create these choice values: Low, Medium, High, Critical
- **NotificationType**: Create these choice values: none, browser, email, both

### User Interface Components

#### Alert Display
- **Banner Integration**: Alerts display prominently in the SharePoint page banner
- **Visual Priority Indicators**: Color-coded styling based on alert priority levels
- **Expandable Content**: Click to expand/collapse detailed alert information
- **Responsive Design**: Adapts seamlessly to desktop, tablet, and mobile devices
- **Accessibility First**: Full keyboard navigation and screen reader support

#### Management Interface
- **Comprehensive Settings Panel**: All configuration options accessible through intuitive interface
- **CRUD Operations**: Create, read, update, and delete alerts with full form validation
- **Multi-Language Content Editor**: Tabbed interface for managing content across multiple languages
- **List Management**: One-click creation of alert lists across site hierarchy
- **Language Management**: Dynamic addition of new languages with automatic field creation

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

### User Targeting:

Version 3.0 features simplified user targeting using SharePoint's built-in People and Groups picker:

- **Simple Selection**: Use the intuitive SharePoint People/Groups field to select target audiences
- **Individual Users**: Select specific users by name or email
- **SharePoint Groups**: Target entire SharePoint groups or security groups
- **Universal Access**: Leave the field empty for alerts visible to everyone
- **No JSON Required**: Eliminated complex JSON-based targeting rules for ease of use

### Content Management:

Alerts support rich HTML content directly in the Description field:

- **Rich Text Editor**: Built-in SharePoint rich text editor with formatting options
- **HTML Support**: Full HTML content including images, links, and styling
- **Media Integration**: Embed images and links directly in the description
- **Responsive Design**: Content automatically adapts to different screen sizes
- **Content Sanitization**: Built-in security measures prevent malicious content

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

- **Component Splitting**: Modular design allows for better code splitting.
- **CSS Optimization**: Carefully organized SCSS with variables for minimal CSS output.

## Deployment Guide

### Prerequisites for Deployment

1. **SharePoint Administrator Access**: Required to deploy to the tenant App Catalog
2. **Site Collection Administrator**: Needed for site-specific configurations
3. **Development Environment**: Node.js, SPFx CLI, and Visual Studio Code (recommended)

### Step-by-Step Deployment

#### 1. Build and Package
```bash
# Clone the repository
git clone https://github.com/NicolasKheirallah/AlertBanner.git
cd AlertBanner

# Install dependencies
npm install

# Build the solution
npm run build

# Bundle and package for production
gulp bundle --ship
gulp package-solution --ship
```

#### 2. Deploy to App Catalog
1. Navigate to your SharePoint tenant App Catalog
2. Upload the `.sppkg` file from the `/sharepoint/solution/` folder
3. When prompted, check "Make this solution available to all sites in the organization"
4. Click "Deploy"

#### 3. Add Extension to Sites
The extension can be deployed in three ways:

**Option A: Tenant-wide Deployment (Recommended)**
1. Go to SharePoint Admin Center
2. Navigate to "Advanced" > "Extensions"
3. Add the Alert Banner extension with appropriate scoping

**Option B: Site Collection Feature**
1. Go to Site Settings > Site Collection Features
2. Activate "Alert Banner Application Customizer"

**Option C: Manual Property Configuration**
Add the following to the site's User Custom Actions via PowerShell/CLI for Microsoft 365:

```powershell
m365 spo customaction add --webUrl "https://yourtenant.sharepoint.com/sites/yoursite" --location "ClientSideExtension.ApplicationCustomizer" --name "AlertBannerApplicationCustomizer" --clientSideComponentId "12345678-1234-1234-1234-123456789012"
```

### Configuration and Usage

#### Initial Setup
1. **Automatic Site Detection**: The extension detects your site hierarchy (Home Site, Hub Site, Current Site)
2. **List Status Check**: Verifies which sites have alert lists and your permissions
3. **Settings Access**: Open the Settings dialog in edit mode to manage the extension
4. **List Creation**: Use the integrated List Management to create missing alert lists with one click

#### Alert List Configuration
Use the field configuration table in the [Managing Alerts](#managing-alerts) section to set up your SharePoint list fields correctly.

#### User Permissions
- **Read permissions**: Required for viewing alerts
- **Contribute permissions**: Needed for dismissing alerts  
- **Design/Full Control**: Required for configuring alert settings

## Troubleshooting

### Common Issues and Solutions

#### Extension Not Visible After Deployment
1. **Clear browser cache**: Hard refresh (Ctrl+F5) or clear SharePoint cache
2. **Check deployment status**: Verify the .sppkg file was successfully deployed in App Catalog
3. **Verify feature activation**: Ensure the site collection feature is activated
4. **Check permissions**: User needs at least read access to the site

#### Alerts Not Displaying
1. **Site Hierarchy**: Check if alerts exist at the appropriate level (Home/Hub/Current site)
2. **List Management**: Use Settings → List Management to verify alert lists exist
3. **List fields**: Ensure all required fields exist with correct types
4. **Alert dates**: Check ScheduledStart and ScheduledEnd fields
5. **User targeting**: Verify TargetUsers field contains appropriate users/groups
6. **Hub connections**: Verify site is connected to expected hub (if applicable)
7. **Home site**: Confirm organization has a configured Home Site (for tenant-wide alerts)
8. **Browser console**: Check for JavaScript errors or network issues

#### Language/Localization Issues
1. **Missing translations**: Check browser console for warnings about missing string keys
2. **Language not switching**: Clear browser local storage for the site
3. **Date format issues**: Verify browser locale settings
4. **Text overflow**: Some languages require more space - check responsive layout

#### Performance Issues
1. **Large alert lists**: Consider archiving old alerts or implementing pagination
2. **HTML content**: Optimize embedded images and media in descriptions
3. **Network latency**: Check SharePoint service health and connectivity

### Diagnostic Steps

1. **Site Hierarchy Check**: Use Settings → List Management to view detected site hierarchy
2. **List Status Verification**: Check which sites have alert lists and permission status
3. **Enable debug mode**: Add `#debug=1` to the URL to see additional console logging
4. **Check Network tab**: Monitor API calls to SharePoint in browser developer tools
5. **Hub Site Verification**: Confirm expected hub site connections in Site Settings
6. **Home Site Configuration**: Verify Home Site is configured at tenant level
7. **Inspect local storage**: Look for cached data and language preferences
8. **Review SharePoint logs**: Check tenant admin center for any error reports

### Getting Help

- **GitHub Issues**: Report bugs at [https://github.com/pnp/sp-dev-fx-extensions/issues](https://github.com/pnp/sp-dev-fx-extensions/issues) or


sp-dev-fx-extensions/tree/react-application-alert-banner
- **Documentation**: Refer to [LOCALIZATION.md](./LOCALIZATION.md) for language-specific help
- **Community**: SharePoint development community forums and Microsoft Tech Community

## Current Limitations

- Animations and transitions are limited for cross-browser compatibility
- Outlook web integration is in development for a future release
- Custom notification sounds are not currently supported

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft Teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples, and open-source controls for your Microsoft 365 development.
- [FluentUI React Components](https://developer.microsoft.com/en-us/fluentui#/controls/web)

<img src="https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/samples/react-application-alert-banner" />