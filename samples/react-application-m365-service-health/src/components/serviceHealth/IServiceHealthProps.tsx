import { EScope } from "../../constants/EScope";
import { IHealthServices } from "../../models/IServiceHealthResults";
import { MSGraphClientV3 } from "@microsoft/sp-http-msgraph";

export interface IServiceHealthProps {
  graphClientFactory: MSGraphClientV3;
  onSelected?: (item: IHealthServices | undefined) => void;
  refresh?: number;
  scope: EScope;
}
