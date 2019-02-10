import { EMailProperties } from "./EMailProperties";
import { MSGraphClientFactory } from "@microsoft/sp-http";

export interface IService {
    webUri: string;
    msGraphClientFactory: MSGraphClientFactory;
    fileName: string;
    fileUri: string;
    sendEMail(emailProperties: EMailProperties): Promise<boolean | Error>;
    getFileContentAsBase64(fileUri: string): Promise<string>;
}