## custom-header-footer

Header and footer application extension shows data retrieved from a JSON file
or simple web service

Here is a sample of the JSON
{
    "headerLinks": [
        {"name": "Link 1", "url": "#"},
        {"name": "Link 2", "url": "#"}
    ],
    "footerMessage": 'Contoso corporation, all rights reserved',
    "footerLinks": [
        {"name": "Link 1", "url": "#"},
        {"name": "Link 2", "url": "#"}
    ]
}


### Building the code

```bash
git clone the repo
npm i
npm i -g gulp
gulp
```

This package produces the following:

* lib/* - intermediate-stage commonjs build artifacts
* dist/* - the bundled script, along with other resources
* deploy/* - all resources which should be uploaded to a CDN.

### Build options

gulp clean - TODO
gulp test - TODO
gulp serve - TODO
gulp bundle - TODO
gulp package-solution - TODO


### Test URL

?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"485e8b06-95bb-4a8c-b5b2-5ca0f1c28c8c":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{}}}