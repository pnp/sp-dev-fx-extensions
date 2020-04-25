# js-command-hide-commands

## Summary
This commamnd-set can be used to hide other 'out-of-the-box' commands on list views.
We were rolling out a solution that included several custom listview-commands and they we all getting displayed way off to the right of the command bar or worse yet, being buried in the ellipses. All the 
out-of-the-box commands (Powerapps, FLow, synch) were taking up precious real estate on the command bar.
When asked if we could just hide those othe actions, we came up with this solution.

## Used SharePoint Framework Version 
![drop](https://img.shields.io/badge/version-GA-green.svg)

## Applies to

* [SharePoint Framework](https://dev.office.com/sharepoint)
* [Office 365 tenant](https://dev.office.com/sharepoint/docs/spfx/set-up-your-development-environment)

> Update accordingly as needed.

## Prerequisites
 
> Any special pre-requisites?

## Solution

Solution|Author(s)
--------|---------
js-command-hide-commands | Russell Gove

## Version history

Version|Date|Comments
-------|----|--------
1.0|Covid 42, 2020,|Initial Release


## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- in the command line run:
  - `npm install`
  - `gulp bundle --ship`
  - `gulp package-solution --ship`
  - `install the app in an app catalog (tenant or site collection)`
  - `add the app to your site`
  - `add entries to the 'Hidden Commands' list that was created when the app was installed to specify which buttons shoudl be hidden in the ribbon, for which lists, and from whom`

> The fields in the 'Hidden Commands' list are as follows:


## Features
Description of the extension with possible additional details than in short summary.
This extension illustrates the following concepts:

- Can hide commmands from specific lists or libraries
- Can hide commands from users who lack specific permissions.




<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/samples/readme-template" />
