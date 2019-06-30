import IFormItem from "../../models/form-item";

export default interface ISettingsPanelState{
    contentTypes:any[];
    formSettings: IFormItem[];
    form:Partial<IFormItem>;
    showTemplatePanel:boolean;
    formUpdated:boolean;
}