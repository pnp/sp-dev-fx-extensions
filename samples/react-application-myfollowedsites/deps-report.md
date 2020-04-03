# Externalizing dependencies of project D:\Rahul\SPGS\GIT\SharePoint\PnP\sp-dev-fx-extensions\samples\react-application-myfollowedsites

Date: 2019-12-5

## Findings

### Modify files

#### [config.json](config/config.json)

Replace the externals property (or add if not defined) with

```json
{
  "externals": {
    "@pnp/odata": {
      "path": "https://unpkg.com/@pnp/odata@^1.3.7/dist/odata.es5.umd.min.js",
      "globalName": "pnp.odata",
      "globalDependencies": [
        "@pnp/common",
        "@pnp/logging",
        "tslib"
      ]
    },
    "@pnp/common": {
      "path": "https://unpkg.com/@pnp/common@^1.3.7/dist/common.es5.umd.bundle.min.js",
      "globalName": "pnp.common"
    },
    "@pnp/logging": {
      "path": "https://unpkg.com/@pnp/logging@^1.3.7/dist/logging.es5.umd.min.js",
      "globalName": "pnp.logging",
      "globalDependencies": [
        "tslib"
      ]
    },
    "@pnp/sp": {
      "path": "https://unpkg.com/@pnp/sp@^1.3.7/dist/sp.es5.umd.min.js",
      "globalName": "pnp.sp",
      "globalDependencies": [
        "@pnp/logging",
        "@pnp/common",
        "@pnp/odata",
        "tslib"
      ]
    },
    "tslib": {
      "path": "https://unpkg.com/tslib@^1.10.0/tslib.js",
      "globalName": "tslib"
    }
  }
}
```
