import { IBreadcrumbItem, IOverflowSetItemProps } from "@fluentui/react";
import { FolderStatus } from "../constants/FolderStatus";

export default interface ICustomItem extends IBreadcrumbItem, IOverflowSetItemProps {
  status: FolderStatus;
  hidden: boolean;
  value: string;
}
