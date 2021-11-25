import { IFileProperties } from "../../FollowDocuments/FollowDocumentsCommandSet";
import {
    ListViewCommandSetContext,
} from "@microsoft/sp-listview-extensibility";
export interface IfollowDocumentProps {
    close: () => void;
    fileInfo: IFileProperties[];
    context: ListViewCommandSetContext;
}