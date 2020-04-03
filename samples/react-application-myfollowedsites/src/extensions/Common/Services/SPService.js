import { sp, Web } from "@pnp/sp";
var CONFIG_LIST_TITLE = "ConfigList";
var SPService = /** @class */ (function () {
    /*
      @description - Constructor
    */
    function SPService(context) {
        this.appCustomizerContext = undefined;
        this.appCustomizerContext = context;
        sp.setup({
            spfxContext: context
        });
    }
    Object.defineProperty(SPService.prototype, "GetConfigStoreSiteUrl", {
        /**
         * @description - Property to get Config Store Site URL based on context
         */
        get: function () {
            try {
                if (this.appCustomizerContext && undefined !== this.appCustomizerContext) {
                    //getting context site URL
                    var contextSiteUrl = this.appCustomizerContext.pageContext.site.absoluteUrl;
                    if (contextSiteUrl && undefined !== contextSiteUrl) {
                        var domainURL = contextSiteUrl.substring(0, contextSiteUrl.lastIndexOf("/sites/") + 7);
                        return domainURL + "cdn";
                    }
                }
            }
            catch (error) {
                console.error(error);
            }
        },
        enumerable: true,
        configurable: true
    });
    /*
    @description - Get Config Store Items
    */
    SPService.prototype.GetConfigStoreItems = function (category, key) {
        var filterString = "";
        if (key && key.length > 0) {
            filterString = "(SettingCategory eq '" + category + "' and SettingKey eq '" + key + "')";
        }
        else {
            filterString = "(SettingCategory eq '" + category + "')";
        }
        var selectString = "SettingCategory,SettingKey,SettingValue";
        //Getting instance of target config store site web
        var targetWeb = new Web(this.GetConfigStoreSiteUrl);
        //Returning all items based on config store category and/or key
        return targetWeb.lists.getByTitle(CONFIG_LIST_TITLE).items
            .filter(filterString)
            .select(selectString)
            .get()
            .then(function (response) {
            if (response && response.length > 0) {
                return response.map(function (r) {
                    return {
                        Category: r.SettingCategory,
                        Key: r.SettingKey,
                        Value: r.SettingValue
                    };
                });
            }
        });
    };
    /*
    * @description - Get Site Properties
    */
    SPService.prototype.GetCurrentSiteProperties = function () {
        return sp.site.rootWeb.expand("allproperties").get().then(function (pbPropertiesResult) {
            if (pbPropertiesResult) {
                return pbPropertiesResult.AllProperties;
                //return pbPropertiesResult;
            }
        });
    };
    /*
    *@description - Get Installed Apps
    */
    SPService.prototype.GetSiteInstalledApp = function () {
        var siteSPApps = null;
        return sp.site.rootWeb.select("AppId, Title").expand("appTiles").get().then(function (siteApps) {
            if (siteApps && siteApps.AppTiles && siteApps.AppTiles !== undefined) {
                siteSPApps = siteApps.AppTiles.map(function (app) {
                    if (app) {
                        return {
                            AppId: app.AppId,
                            AppTitle: app.Title
                        };
                    }
                });
                return Promise.resolve(siteSPApps);
            }
        });
    };
    /**
     * @description - Returns User
     * @param userUPN -User Office Login ID
     */
    SPService.prototype.GetUserProfileByLoginID = function (userLogin) {
        var userEmail = undefined;
        if (userLogin.indexOf('i:0#.f|membership|') === -1) {
            userLogin = 'i:0#.f|membership|' + userLogin;
        }
        return sp.profiles.getPropertiesFor(userLogin).then(function (userProps) {
            if (userProps && undefined !== userProps) {
                return Promise.resolve(userProps);
            }
            else {
                return Promise.resolve(undefined);
            }
        });
    };
    return SPService;
}());
export { SPService };
//# sourceMappingURL=SPService.js.map