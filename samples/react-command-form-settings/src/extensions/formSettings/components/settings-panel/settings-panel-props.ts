import IFormItem from "../../models/form-item";

export default interface ISettingsPanelProps{
    showPanel:boolean;
    listId:string;
    formSettings:IFormItem[];
    contentTypes:any[];
    setShowPanel: (showPanel: boolean)=> void;
}