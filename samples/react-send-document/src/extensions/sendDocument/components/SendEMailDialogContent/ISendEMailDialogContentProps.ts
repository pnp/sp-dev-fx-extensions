import { EMailProperties, IService } from "../../models";

export interface ISendEMailDialogContentProps {
    close: () => void;
    submit: (eMailProperties:EMailProperties) => void;
    eMailProperties: EMailProperties;
    sendDocumentService:IService;
}
