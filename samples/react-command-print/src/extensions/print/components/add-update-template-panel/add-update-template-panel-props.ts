import ITemplateItem from "../../models/template-item";

export default interface AddUpdateTemplatePanelProps{
    showTemplatePanel:boolean;
    listId:string;
    template:ITemplateItem;
    onTemplateChanged : (t : ITemplateItem)=>void;
    onTemplateSaved : ()=>void;
    setShowTemplatePanel: (showPanel: boolean, template?:any)=> () => void ;
}