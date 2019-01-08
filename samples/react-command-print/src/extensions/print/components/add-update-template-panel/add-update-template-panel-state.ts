import { IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import ISection from '../../models/section';
export default interface AddUpdateTemplatePanelState {
    helperItems: any[];
    fields: any[];
    selectionDetails?: string;
    columns: IColumn[];
    itemColumns: IColumn[];
    isColumnReorderEnabled: boolean;
    frozenColumnCountFromStart: string;
    frozenColumnCountFromEnd: string;
    templateColumns: any[];
    listId: string;
    section: ISection;
    showColorPicker: boolean;
    isFontColorPicker: boolean;
    sectionErrorMessage: string;
    titleErrorMessage: string;
}