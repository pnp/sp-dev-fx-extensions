export interface IToggleProps {
  checked: string;
  id: string;
  disabled: boolean;
  onChanged: (checked: boolean, id: string) => void;
}