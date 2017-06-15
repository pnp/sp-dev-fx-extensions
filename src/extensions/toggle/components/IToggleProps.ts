export interface IToggleProps {
  value: string;
  id: string;
  disabled: boolean;
  onChange: (value: string, id: string) => void;
}