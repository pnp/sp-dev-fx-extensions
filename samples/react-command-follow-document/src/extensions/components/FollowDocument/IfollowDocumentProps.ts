import { IFileProperties } from "../../FollowDocuments/FollowDocumentsCommandSet";

export interface IfollowDocumentProps {
    close: () => void;
    fileInfo: IFileProperties[];
}