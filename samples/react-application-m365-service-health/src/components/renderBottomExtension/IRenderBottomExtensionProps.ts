import { EScope } from "../../constants/EScope";
import { MSGraphClientV3 } from "@microsoft/sp-http-msgraph";
import { Theme } from "@fluentui/react-components";

export interface IRenderBottomExtensionProps {
  graphClientFactory: MSGraphClientV3;
  theme: Theme | undefined;
  scope: EScope;
}