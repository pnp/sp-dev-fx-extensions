import { IFileProperties } from "../../FollowDocuments/FollowDocumentsCommandSet";

export interface IfollowDocumentBulkState {
    fileInfo: IFileProperties[];
    followStatus?: boolean;
    outPutResult?:any;
}