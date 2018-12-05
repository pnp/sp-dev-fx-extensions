import ITemplateItem from "../../models/template-item";

export default interface ISettingsPanelProps{
    showPanel:boolean;
    listId:string;
    templates: any[];
    setShowPanel: (showPanel: boolean)=> () => void;
    onTemplateAdded: (template: ITemplateItem)=>void;
    onTemplateRemoved: (id: number, template:ITemplateItem)=>void;
    onTemplateUpdated: (index:number, template:ITemplateItem)=>void;
}