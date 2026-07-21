# SPFx Global Navigation Header Customizer

A global header and footer solution for SharePoint Online modern portals, built using the SharePoint Framework (SPFx), React, and Fluent UI React Components (v9). It connects to either the SharePoint Term Store (Managed Navigation) or a JSON file hosted in your site assets library, allowing you to manage navigation links and configurations dynamically.

## Summary

This extension mounts into the SharePoint Online `Top` placeholder to render a responsive global header with a customizable brand area, desktop mega-menu navigation, and a mobile drawer. It includes built-in tools for search, profile info, bookmarks, notifications, and accessibility controls. You can also enable an optional HTML footer in the `Bottom` placeholder and inject SEO metadata dynamically from your navigation terms.

## Compatibility

| :warning: Important |
|:---------------------------|
| Every SPFx version is compatible with specific versions of Node.js. To compile this project, ensure that the version of Node.js on your workstation matches the version listed below. |
| Refer to <https://aka.ms/spfx-matrix> for more information on SPFx compatibility. |

This sample is optimally compatible with the following environment configuration:

![SPFx 1.23.2](https://img.shields.io/badge/SPFx-1.23.2-green.svg)
![Node.js v22](https://img.shields.io/badge/Node.js-v22-green.svg)
![Toolchain: Heft](https://img.shields.io/badge/Toolchain-Heft-green.svg)
![Compatible with SharePoint Online](https://img.shields.io/badge/SharePoint%20Online-Compatible-green.svg)
![Does not work with SharePoint Server](https://img.shields.io/badge/SharePoint%20Server-Incompatible-red.svg)
![Hosted Workbench Compatible](https://img.shields.io/badge/Hosted%20Workbench-Compatible-green.svg)

## Applies to

- SharePoint Online
- SharePoint Framework (SPFx) v1.23.2

## Contributors

- [Nicolas Kheirallah](https://github.com/NicolasKheirallah)

## Version history

| Version | Date | Comments |
| :--- | :--- | :--- |
| **2.1.0** | 2026-07-07 | Refactored accessibility features (disclosure pattern), debounced suite-bar MutationObserver, resolved React 18 async unmounting race conditions, and stripped unnecessary comments. |
| **2.0.0** | 2026-06-15 | Upgraded project to SPFx v1.23.2, React 18, and Fluent UI v9. |

## Minimal Path to Awesome

1. Clone this repository.
2. Ensure you are using Node.js v22 (e.g. `nvm use 22`).
3. Run `npm install` to restore dependencies.
4. Run `npm run build` to compile and package the solution.
5. Configure your local debugging parameters in `config/serve.json`, then run:

   ```bash
   npm run start
   ```

## Tech Stack

- SharePoint Framework `1.23.2`
- Heft build toolchain
- TypeScript `~5.8.0`
- React `18.2.0`
- ReactDOM `18.2.0`
- Fluent UI React Components (v9) `^9.74.3`
- PnPjs v4 `^4.20.0`
- ESLint-based linting (SPFx config)

Node requirement: `>=22.14.0 <23.0.0`

---

## Detailed Technical Reference

### Contents

- [Overview](#overview)
- [How it Works (Runtime Behavior)](#how-it-works-runtime-behavior)
- [Key Technical Decisions](#key-technical-decisions)
- [Configuration Reference](#configuration-reference)
- [Provisioning via PowerShell](#provisioning-via-powershell)
- [Accessibility & Security](#accessibility--security)

---

## Screenshots

### Navigation Features

**Desktop Navigation with Mega-Menu**
![Navigation Items](./assets/NavItems.png)

**Mobile Navigation Drawer**
![Mobile Navigation](./assets/MobileNav.png)
![Mobile Navigation 2](./assets/MobileNav2.png)

**Fullscreen Panel**
![Fullscreen Panel](./assets/FullscreenPanel.png)

### Admin Settings Panel

**Admin Panel - Overview & Configuration**
![Admin Panel 1](./assets/AdminPanel1.png)
![Admin Panel 2](./assets/AdminPanel2.png)
![Admin Panel 3](./assets/AdminPanel3.png)

**Admin Panel - Styling & Colors**
![Admin Panel 4](./assets/AdminPanel4.png)
![Admin Panel 5](./assets/AdminPanel5.png)
![Admin Panel 6](./assets/AdminPanel6.png)

### User Experience

**Settings Panel - User Profile**
![Settings Panel User](./assets/SettingsPanelUser.png)

---

## Overview

The solution mounts directly into SharePoint's placeholders to provide:

- A responsive header bar that condenses automatically on scroll.
- A desktop mega-menu supporting column groupings, featured items, and custom overview cards.
- A mobile navigation panel (lazy-loaded to keep the main bundle light) with drill-down navigation.
- An admin settings panel with a visual editor for navigation structures, color schemes, and feature flags.
- An optional HTML footer that inherits the portal's theme variables.

---

## How it Works (Runtime Behavior)

### 1. Fast Initial Render

To avoid layout shifts or blank areas during page load, the header checks for a cached snapshot of the navigation structure. If a cached version (5-minute TTL) is not available, it displays a fallback layout immediately while fetching the fresh structure asynchronously.

### 2. Managed Navigation & Lazy Loading

The Term Store navigation provider queries the SharePoint Term Store. Deeper sub-menus are hydrated lazily on demand when a user opens them, keeping initial payload sizes minimal.

### 3. Dynamic Configuration Updates

Configurations are resolved from three cascading sources (highest priority wins):

1. A `settings.json` file uploaded to the site collection's document library.
2. Deploy-time component properties (`ClientSideComponentProperties`).
3. Built-in code defaults.

This allows administrators to modify links, disable features, or change colors on the fly using the in-header editor without having to repackage or redeploy the `.sppkg` file.

---

## Key Technical Decisions

### 1. The Suite Bar Probe

SharePoint Online does not expose the suite bar's current background color through the standard `ThemeProvider` API. To ensure the header blends in with the top Microsoft 365 bar, the engine probes the live DOM at runtime to read the computed background style. A debounced `MutationObserver` watches for slow-loading suite bar elements on initial load and schedules a paint as soon as it appears.

### 2. Performance & Thread Optimization

To prevent UI lag during page scrolls and window resizing:

- Sub-components are wrapped in `React.memo()` to prevent unnecessary re-renders.
- Context values destructured from raw properties are memoized to keep reference identities stable.
- Resize calculations are throttled using animation frames.

### 3. React 18 Async Unmounting

SPFx customizers can be mounted and unmounted dynamically during client-side navigation. Since React 18's `root.unmount()` is asynchronous, host DOM elements are removed inside a microtask block to prevent detached nodes, memory leaks, and warning messages in the browser console.

---

## Configuration Reference

The Application Customizer accepts the following properties via `ClientSideComponentProperties` or `settings.json`:

| Property | Description | Default |
| :--- | :--- | :--- |
| `homeUrl` | Target URL for the brand logo link. | Web absolute URL |
| `logoUrl` | Absolute URL to the brand logo image. | None (no logo rendered) |
| `logoAltText` | Accessibility label for the brand logo. | `"Logo"` |
| `navigationSource` | Choose between `"taxonomy"` (Term Store) or `"jsonFile"` (Document library file). | `"taxonomy"` |
| `termSetId` | Specific GUID of the term store set to load navigation from. | None |
| `navigationFileName` | Custom filename for the JSON navigation source. | `"navigation.json"` |
| `navigationFileFolder` | Server-relative folder path where configuration files are stored. | `"SiteAssets"` |
| `features.adminSettingsEnabled` | Shows the settings gear icon in the header when the page is in edit mode. | `false` |
| `features.footerEnabled` | Enables the bottom HTML footer placeholder. | `false` |
| `features.themeSwitcherEnabled` | Enables the user-toggleable light/dark mode switcher. | `false` |
| `features.searchEnabled` | Enables the search tool callout in the header. | `true` |

### Color Overrides

Admins can define a custom `colors` object in the properties. Any specified key will override the corresponding theme-derived value:

- `chromeBackground`: Main header background color.
- `chromeText`: Text and icon color on the header bar.
- `accent`: Active underlines, border highlights, and brand markers.
- `surface`: Dropdown panels and slide-out panel backgrounds.
- `border`: Divider lines.

---

## Provisioning via PowerShell

We provide a PnP PowerShell script to provision a term store set with all the custom properties required by the extension.

### Files

- `scripts/navigation.json`: Defines the navigation hierarchy, SEO meta-tags, and custom layouts.
- `scripts/Provision-Navigation.ps1`: Creates or updates the term set in your SharePoint Term Store.

### Usage

```powershell
# Authenticate and run a dry-run test
.\scripts\Provision-Navigation.ps1 -SiteUrl "https://contoso.sharepoint.com" -ClientId "YOUR_CLIENT_ID" -DryRun

# Provision into your tenant's Term Store
.\scripts\Provision-Navigation.ps1 -SiteUrl "https://contoso.sharepoint.com" -ClientId "YOUR_CLIENT_ID"
```

---

## Accessibility & Security

### Accessibility (WCAG 2.2 AA)

- **Disclosure Menus**: Top-level menu triggers use modern disclosure button patterns instead of nested menus. This keeps the tab order simple and matches screen-reader keyboard patterns.
- **High Contrast**: Includes media overrides for `forced-colors: active` to match standard OS high-contrast themes.
- **Reduced Motion**: Respects browser preferences (`prefers-reduced-motion: reduce`) by disabling logo parallax effects and menu transitions.
- **Semantic Landmarks**: Uses standard HTML5 landmarks (`<nav>`, `<section>`, `<aside>`) with explicit labels.

### Security

- **URL Whitelisting**: All navigation links are validated against an allowed protocol list (`http:`, `https:`, `mailto:`). Unsafe links (such as `javascript:` execution strings) are discarded.
- **PII Protection**: Telemetry payloads send item IDs and link labels only; no user details or page context values are collected.
- **HTML Sanitization**: Custom footer templates are sanitized using `DOMPurify` to prevent cross-site scripting (XSS) vectors.

<img src="https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/samples/react-application-navigation-header" />
