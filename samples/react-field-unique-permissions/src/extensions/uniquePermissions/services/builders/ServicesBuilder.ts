import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { ICustomSPHttpClient, IOptionsRenderer, IPermissionsService } from "../interfaces";
import { PermissionsService, CustomSPHttpClient, PermissionsServiceMock, CustomSPHttpClientMock } from "..";
import { OptionsRenderer } from "../OptionsRenderer";
import { IServiceBuilder } from "./IServiceBuilder";

export class PermissionsServiceBuilder implements IServiceBuilder<IPermissionsService> {
    public static readonly serviceKey: ServiceKey<IServiceBuilder<IPermissionsService>> = ServiceKey.create<IServiceBuilder<IPermissionsService>>('PermissionsServiceBuilder', PermissionsServiceBuilder);
    
    private spHttpClient: ICustomSPHttpClient;

    constructor(protected serviceScope: ServiceScope) {

    }

    public withProduction(): PermissionsServiceBuilder {
        this.spHttpClient = this.serviceScope.consume(CustomSPHttpClient.serviceKey);
        return this;
    }

    public withMock(): PermissionsServiceBuilder {
        this.spHttpClient = new CustomSPHttpClientMock();
        return this;
    }

    public buildService = (): IPermissionsService => {
        return new PermissionsService(this.spHttpClient);
    }
}

export class OptionsRendererBuilder implements IServiceBuilder<IOptionsRenderer> {
    public static readonly serviceKey: ServiceKey<IServiceBuilder<IOptionsRenderer>> = ServiceKey.create<IServiceBuilder<IOptionsRenderer>>('OptionsRendererBuilder', OptionsRendererBuilder);

    private permissionsService: IPermissionsService;
    private spHttpClient: ICustomSPHttpClient;

    constructor(protected serviceScope: ServiceScope) {
        serviceScope.whenFinished(() => {
            this.spHttpClient = serviceScope.consume(CustomSPHttpClient.serviceKey);
        });
    }

    public withProduction(): OptionsRendererBuilder {
        this.spHttpClient = this.serviceScope.consume(CustomSPHttpClient.serviceKey);
        this.permissionsService = new PermissionsService(this.spHttpClient);
        return this;
    }

    public withMock(): OptionsRendererBuilder {
        this.spHttpClient =  new CustomSPHttpClientMock();
        this.permissionsService = new PermissionsServiceMock();
        return this;
    }

    public buildService = (): IOptionsRenderer => {
        return new OptionsRenderer(this.permissionsService);
    }

}