import { ServiceScope } from "@microsoft/sp-core-library";
import { IListViewCommandSetListViewUpdatedParameters, ListViewCommandSetContext } from "@microsoft/sp-listview-extensibility";
import {
  IReadonlyTheme,

} from "@microsoft/sp-component-base";
export interface ISendToTeamsProps {
  showPanel?:boolean;
  context:ListViewCommandSetContext;
  event: IListViewCommandSetListViewUpdatedParameters;
}
