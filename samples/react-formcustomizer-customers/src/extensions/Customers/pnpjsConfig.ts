import { FormCustomizerContext } from "@microsoft/sp-listview-extensibility";

// import pnp and pnp logging system
import { ISPFXContext, spfi, SPFI, SPFx } from "@pnp/sp";
import { LogLevel, PnPLogging } from "@pnp/logging";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/items/get-all";
import "@pnp/sp/batching";
import "@pnp/sp/fields";


var _sp: SPFI = null;

export const getSP = (context?: FormCustomizerContext): SPFI => {
    if (_sp === null && context != null) {
        _sp = spfi().using(SPFx((context as unknown) as ISPFXContext)).using(PnPLogging(LogLevel.Info));
    }
    return _sp;
}