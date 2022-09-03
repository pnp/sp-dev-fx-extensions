import { IMessageBannerProperties } from "../../../../models/IMessageBannerProperties";

export interface IBannerPanelProps {
  settings: IMessageBannerProperties;
  isOpen: boolean;
  isSaving: boolean;
  onSave: () => Promise<void>;
  onCancelOrDismiss: () => void;
  onFieldChange: (newSetting: {[ key: string ]: unknown }) => void;
  resetToDefaults: () => void;
}
