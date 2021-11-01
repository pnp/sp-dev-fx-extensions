import { IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { IFlowItem } from '../../model/listItem/IFlowItem';

export interface IMyFlowsApplicationCustomizerState {
    sidePanelOpen: boolean;
    showLoader: boolean;
    items: IFlowItem[];
    columns: IColumn[];
}