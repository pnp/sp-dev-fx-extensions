import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import ITenantDataProvider from "../../../dataProviders/ITenantDataProvider";

interface IGraphBotProps {
    context: ApplicationCustomizerContext;
    tenantDataProvider: ITenantDataProvider;
}

export default IGraphBotProps;