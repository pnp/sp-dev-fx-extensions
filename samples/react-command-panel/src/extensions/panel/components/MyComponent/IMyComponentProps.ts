import { ListViewCommandSetContext, RowAccessor } from "@microsoft/sp-listview-extensibility";
import { IStatefulPanelProps } from "../StatefulPanel/IStatefulPanelProps";

export interface IMyComponentProps { 
    selectedRows: readonly RowAccessor[];
    context: ListViewCommandSetContext;
    panelConfig: IStatefulPanelProps;
}