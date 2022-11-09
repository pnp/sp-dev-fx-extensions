import { BaseComponentContext } from "@microsoft/sp-component-base";
import { IMessageBannerProperties } from "../../../../models/IMessageBannerProperties";
import ClientSideComponentService from "../../../../services/ClientSideComponentService";

export interface IBannerProps {
  context: BaseComponentContext;
  settings: IMessageBannerProperties;
  clientSideComponentService: ClientSideComponentService;
}
