import { MSGraphClientFactory } from '@microsoft/sp-http';

export interface ISmartContextPanelProps {
  isOpen: boolean;
  onDismiss: () => void;
  graphClientFactory: MSGraphClientFactory;
  currentPageUrl: string;
}
