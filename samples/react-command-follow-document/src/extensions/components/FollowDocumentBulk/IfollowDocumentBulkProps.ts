import { IFileProperties } from "../../FollowDocuments/FollowDocumentsCommandSet";
import {
    ListViewCommandSetContext,
} from "@microsoft/sp-listview-extensibility";
export interface IfollowDocumentBulkProps {
    close: () => void;
    fileInfo: IFileProperties[];
    context: ListViewCommandSetContext;
}