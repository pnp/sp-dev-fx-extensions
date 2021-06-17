import { IFileProperties } from "../../FollowDocuments/FollowDocumentsCommandSet";

export interface IfollowDocumentBulkProps {
    close: () => void;
    fileInfo: IFileProperties[];
}