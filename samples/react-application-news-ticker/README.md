# react-application-news-ticker

## Summary

An SPFx Extension that displays news as a running text at the top of every modern page.

## Used SharePoint Framework Version

![version](https://img.shields.io/badge/version-1.11-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

Create list as the data source for the app with below details:
1. Title: **News**
2. Required Columns: 
   - **Title**: single line text
   - **Content**: multiline text
   - **PublishDate**: date
3. Required View:
   - Title: **Published News**
   - Configure the view as you like. The app will get the data based on the view. Below is the example of the configuration for the view:
      - Filter: PublishDate <= [TODAY] AND ExpiryDate > [TODAY]
      - Sort: PublishDate Ascending
      - Limit: 10

## Solution

Solution|Author(s)
--------|---------
react-application-news-ticker | Ari Gunawan ([@arigunawan3023](https://twitter.com/arigunawan3023))

## Version history

Version|Date|Comments
-------|----|--------
1.0|April 04, 2021|Initial release

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Ensure that you are at the solution folder
- in the command-line run:
  - **npm install**
  - **gulp serve**

## Features

This extension illustrates the following concepts:

- Display news as a running text at the top of every modern page where the app installed
- Get news items from a SharePoint list view using PnPJS
- The running text will be stopped when user hover it

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
