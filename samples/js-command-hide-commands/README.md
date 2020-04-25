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
List Title -- the title of the list Wher you want to hide a command
Is Enabled -- Yes or No, should this rule be enforced
Exlude Permission -- the name of an SPPermission (i.e. manageLists). If the user has this permission on the list the rule will not apply. The permissions can be found here: https://docs.microsoft.com/en-us/previous-versions/office/developer/sharepoint-2010/ee556747(v=office.14)
CSS Selector -- the CSS Seelctor for the command (or actually any element) to be hidden in the list view (for example button[name="PowerApps"]	) will hide the powerapps command.
AllowMultipleMatches -- determines if multiple items match the CSS Selector if the rule will apply to all matched. For the most part , leave it set to No.


To determine the CSS Selector to be used, open the list or library in your browser of choice (i,e. Edge)abd open the debugger tools (F12). Click on the Elements tab and click the icon to select an element. Select the element in the browser. 

Here i have selected the 'Quick Edit' button:
![CSS SELECTOR](./CSSSelector.png)

So the CSS Selector to hide this  button would be  button[name="Quick edit"]

Note that the CSS Selector can be used to hoed ANY element on the list views for the selected list/library (for fun we could hide every 5th row in the view for anyone who has addListItems permission :-))



## Features
Description of the extension with possible additional details than in short summary.
This extension illustrates the following concepts:

- Can hide commmands from specific lists or libraries
- Can hide commands from users who lack specific permissions.




<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/samples/readme-template" />
