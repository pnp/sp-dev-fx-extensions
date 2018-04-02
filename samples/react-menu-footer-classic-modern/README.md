# Future-Proof Headings

This is a sample showing how to create custom headers and footers that work on classic pages using JavaScript injection, and on modern pages using a SharePoint Framework Application Customizer extension. The vast majority of code is common, including all rendering, localized strings, and a simple data service.

Figure 1 shows how it looks on a classic publishing site. A simple navigation menu is added on the top of the page, and a footer containing a message and a set of links appears at the bottom.

![Classic full screen](./Documentation/images/ClassicFullHeaderFooter.png "Classic full screen")
<br /><small style="font-style: italic">Figure 1</small>

The menu and footer look the same in a modern team site, as shown in Figure 2. The only difference is that the modern footer is stuck to the bottom of the browser window instead of floating at the end of the page.

This helps with the user experience of modern list pages in classic Publishing sites. If both the classic and SPFx versions of this solution are installed in a Publishing site, the transition to modern list and library pages is less jarring since the header and footer are the same.

This may also be useful in hybrid environments, as the classic solution should work the same on premises as online (though you will probably need a separate JSON file to hold the links due to cross-site scripting issues.)

![Modern full screen](./Documentation/images/ModernFullHeaderFooter.png "Modern full screen")
<br /><small style="font-style: italic">Figure 2</small>

When the screen becomes narrow, the top menu switches to a hamburger style menu that pushes the screen down with a hierarchy of options. Figure 3 shows this on the classic publishing page, which is clearly not responsive.

<img alt="Classic phone screen" src="./Documentation/images/ClassicPhoneHeaderFooter.png" style="width:300px;" />
<br /><small style="font-style: italic">Figure 3</small>

The hamburger menu looks right at home on the modern site, viewed here in an iPhone emulator.

<img alt="Modern phone screen" src="./Documentation/images/ModernPhoneHeaderFooter.png" style="width:300px;" />
<br /><small style="font-style: italic">Figure 4</small>

# Build and Installation Instructions

## Classic Version

Ensure Node and Node Package Manager are installed on your computer. This sample was developed with [node](https://nodejs.org/en/download/) version 8.9.4 and npm version 5.6.0.

The development approach was based on a series of articles by [Julie Turner](https://twitter.com/jfj1997), [Conquer your dev toolchain in ‘Classic’ SharePoint](http://julieturner.net/2018/01/conquer-your-dev-toolchain-in-classic-sharepoint-part-1/). Her articles will show you how to automate building and uploading the bundle to classic sites. These are the simplified instructions to get you started, and should work with only node/npm installed.

### Clone the respository and install local packages

 ```shell
 npm install
 ```

### Plan for script deployment

You will need a location to store your webpack bundle (that contains the code) and the content JSON file (that contains the menu and footer data). It's a good idea to dedicate a site collection for storing scripts like these, so you can set security appropriate to a code deployment. If you don't already have such a site collection, create one, and ensure everybody has read access and only appropriate developers or admins have write access.

### Modify files for your tenant.

* In Classic\client\bootHeaderFooter.ts, modify the `url` constant to point to the location where you will upload JSON file that contains the menu and footer content
* In Classic\install\Add-HeaderFooter.ps1, modify the 3rd `Add-PnPJavaScriptLink` command to point to the location where you will upload the 
* If you have set up gulp to upload the bundle, as in Julie's article, you'll need to update settings.json and settings_security.json with values for your tenant.

### Set up your JSON data file

In Classic\client\sample, you will find a file HeaderFooterData.json.txt. It's a text file to avoid SharePoint's restriction on uploading json file, but the contents must be well-formed JSON. It's not a bad idea to start with the sample and get everything working before entering your own data.

Upload the json.txt file to SharePoint at the location you set in the bootHeaderFooter.ts file.

### Build and upload the bundle

In your command line tool, ensure you're in the Classic directory and enter the command

```sh
npm run build
```

This should build your webpack bundle in the Classic\build directory. Upload it to the location you entered in the \Add-HeaderFooter.ps1 file.

### Add the header and footer to a site

Ensure that [PnP PowerShell](https://github.com/SharePoint/PnP-PowerShell) is installed on your computer and use the Add-HeaderFooter.ps1 command to add the menu and footer to a classic SharePoint site. It will have no effect on a modern site, or on modern site pages.

## Modern Version

This solution requires the toolchain for SharePoint Framework version 1.4.1. See [Set up your SharePoint Framework development environment](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-development-environment) for details.

### Clone the respository and install local packages

 ```shell
 npm install
 ```

### Plan for script deployment

You will need a location to store the content JSON file that contains the menu and footer data. It's a good idea to dedicate a site collection for storing scripts like these, so you can set security appropriate to a code deployment. If you don't already have such a site collection, create one, and ensure everybody has read access and only appropriate developers or admins have write access. If you are also using the Classic version of this solution, you'll probably want to use the same file in the same location.

### Modify files for your tenant.

* In SPFx\src\extensions\customHeaderFooter\CustomHeaderFooterApplicationCustomizer.ts, modify the `url` constant to point to the location where you will upload JSON file that contains the menu and footer content

### Set up your JSON data file

In SPFx\src\extensions\customHeaderFooter\common\sample, you will find a file HeaderFooterData.json.txt. It's a text file to avoid SharePoint's restriction on uploading json file, but the contents must be well-formed JSON. It's not a bad idea to start with the sample and get everything working before entering your own data.

Upload the json.txt file to SharePoint at the location you set in the CustomHeaderFooterApplicationCustomizer.ts file.

### Build and upload the bundle

In your command line tool, ensure you're in the SPFx directory and enter the command

```sh
gulp build
gulp bundle --ship
gulp package-solution --ship
```

This should build your SharePoint Framework solutionb package in the sharepoint\solution directory. Install it in your tenant app catalog as explained [here](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/serve-your-web-part-in-a-sharepoint-page).

### Add the header and footer to a site

Add the app to any modern site and it will display the header and footer.

# Design and develop your own

Though it might be useful as-is (if your needs are simple), the real intent of this solution is to show how you can build your own headers and footers that work on both classic and modern sites.

You will find a complete write-up [here](./Documentation/Article.md).
