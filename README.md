# Modern Page Template with PnP/PnPjs

## Summary
A SPFx extension using [@pnp/sp](https://pnp.github.io/pnpjs/sp/docs/client-side-pages/) that allow to create Modern Pages based on prefilled modern pages marked as "Page Template", inside the Site Pages Library, and code defined pages.
Users can select a Modern page as Template just setting a custom property page named "Is Template"  to "Yes".
People often need to create periodically editorial pages with the same composition, sections structure and webpart configuration, in order to give users the same users experience between pages with different contents but with the same communicative purpose.
e.g.
* Employee of the month
* Weekly post from General Manager
* New hires list

This SPFX extension allows users to define their own page templates and reuse them easily.

## Modern Page Template with PnP/PnPjs in action
![WebPartInAction](./assets/use-Modern-Page-Template-extension.gif)

## How to build a Modern Page Template
![WebPartInAction](./assets/how-to-make-a-page-template-pnp.gif)

## Future improvements
* Deploy "Is Template" site column as an asset from this SPFx extension solution
* Hide pages template from search results
* Host pages template in a different site / library in order to share them cross site or just for isolate site pages from site template.

## Used SharePoint Framework Version 
![drop](https://camo.githubusercontent.com/76987ab657772dcca5321aba68f3ee6b993fd651/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f535046782d312e372e312d677265656e2e737667)

## Applies to

* [SharePoint Framework](https://dev.office.com/sharepoint)
* [Office 365 tenant](https://dev.office.com/sharepoint/docs/spfx/set-up-your-development-environment)

## Prerequisites
 
* @pnp/sp ![drop](https://d25lcipzij17d.cloudfront.net/badge.svg?id=js&type=6&v=1.3.0&x2=0)
in 1.3.0 pnp/sp team introduce ClientSidePage copyPage extension method

## Solution

Solution|Author
--------|---------
react-command-modern-page-pnpjs | [Federico Porceddu](https://www.federicoporceddu.com)

## Version history

Version|Date|Comments
-------|----|--------
1.0|March 16, 2019|Initial release

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Move to right solution folder 
- in the command line run:
  - `npm install`
  - `gulp serve`
- create in your SharePoint Modern Site a choice site column named "Is Template" in Site Pages Library


## Features
This SPFx extension illustrates the following concepts:

- [@pnp/sp/clientsidepages](https://pnp.github.io/pnpjs/sp/docs/client-side-pages/) 
- [Office UI Fabric React Component Modal](https://developer.microsoft.com/en-us/fabric/#/components/modal)
- [Office UI Fabric React Component ComboBox](https://developer.microsoft.com/en-us/fabric/#/components/ComboBox)
- [Office UI Fabric React Component ChoiceGroup](https://developer.microsoft.com/en-us/fabric/#/components/choicegroup)
- [Office UI Fabric React Component SpinnerSize](https://developer.microsoft.com/en-us/fabric/#/components/Spinner)

