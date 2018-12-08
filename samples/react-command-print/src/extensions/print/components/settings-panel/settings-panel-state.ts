import ITemplateItem from "../../models/template-item";

export default interface ISettingsPanelState{
    activeTemplate: ITemplateItem;
    activateTemplateIndex: number;
    activateTemplateId: number;
    showTemplatePanel:boolean;
    showDeleteDialog:boolean;
}