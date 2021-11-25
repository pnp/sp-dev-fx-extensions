import { IFileProperties } from "../../FollowDocuments/FollowDocumentsCommandSet";
import {
    ListViewCommandSetContext,
} from "@microsoft/sp-listview-extensibility";
export interface IfollowDocumentState {
    fileInfo: IFileProperties[];
    followStatus?: boolean;
    context: ListViewCommandSetContext;
}