import IPrintTemplate from "./print-template";

export default interface IPrintDialogContentState {
    hideLoading: boolean;
    loadingMessage: string;
    templates: any[];
    items:any[];
    showPanel:boolean;
    hideTemplateLoading:boolean;
    printTemplate: IPrintTemplate;
    itemContent:any;
    selectedTemplateIndex:number;
    isSiteAdmin:boolean;
}