import { IHealthServices } from "../../models/IServiceHealthResults";

export interface IIssueDetailsProps {
  selectedItem: IHealthServices;
  onDismiss: () => void;
  isOpen: boolean;
}
