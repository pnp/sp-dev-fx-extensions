import { BaseComponentContext } from "@microsoft/sp-component-base"

// import pnp and pnp logging system
import { spfi, SPFI, SPFx } from "@pnp/sp"
import { LogLevel, PnPLogging } from "@pnp/logging"
import "@pnp/sp/webs"
import "@pnp/sp/lists"
import "@pnp/sp/items"
import "@pnp/sp/site-users/web"
import "@pnp/sp/items"
import "@pnp/sp/comments"

// eslint-disable-next-line no-var, @rushstack/no-new-null
var _sp: SPFI | null = null

export const getSP = (context?: BaseComponentContext): SPFI => {
  if (context !== null) {
    //You must add the @pnp/logging package to include the PnPLogging behavior it is no longer a peer dependency
    // The LogLevel set's at what level a message will be written to the console
    _sp = spfi().using(SPFx(context)).using(PnPLogging(LogLevel.Warning))
  }
  return _sp!
}
