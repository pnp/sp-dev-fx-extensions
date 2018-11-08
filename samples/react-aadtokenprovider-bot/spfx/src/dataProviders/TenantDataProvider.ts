import ITenantDataProvider from "./ITenantDataProvider";
import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import { SPHttpClient } from "@microsoft/sp-http";
import { Text } from "@microsoft/sp-core-library";
import { Logger } from "@pnp/logging";

class TenantDataProvider implements ITenantDataProvider {

    private _context: ApplicationCustomizerContext;

    constructor(context: ApplicationCustomizerContext) {
        this._context = context;
    }

    /**
     * Get the value of a tenant property bag property
     * @param key the property bag key
     */
    public async getTenantPropertyValue(key: string): Promise<any> {
        // Get settings from tenant properties
        const url = Text.format("{0}/_api/web/GetStorageEntity('{1}')", this._context.pageContext.site.absoluteUrl, key);

        try {
            const response = await this._context.spHttpClient.get(url, SPHttpClient.configurations.v1);            
            const data = await response.json();
                
            if (response.ok) {
                return data.Value;
            } else {

                // Expected response for errors
                const errorDetails = data["ExceptionMessage"];
                throw(errorDetails);
            }

        } catch (error) {
            Logger.write(Text.format("[TenantDataProvider_getTenantProperty]: Error: {0}", error));
        }    
    }
}

export default TenantDataProvider;