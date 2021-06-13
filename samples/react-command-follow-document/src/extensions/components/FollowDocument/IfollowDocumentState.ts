import { IFileProperties } from "../../FollowDocuments/FollowDocumentsCommandSet";

export interface IfollowDocumentState {
    fileInfo: IFileProperties[];
    followStatus?: boolean;
}