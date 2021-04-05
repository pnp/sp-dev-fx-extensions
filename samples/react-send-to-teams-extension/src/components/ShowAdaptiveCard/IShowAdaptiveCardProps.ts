
import { ICardFields } from "../../models";
export interface IShowAdaptiveCardProps {
  title: string;
  subtitle: string;
  text: string;
  itemImage?: string;
  buttons?: ICardButton[];
  fields: ICardFields[];
  onSendCard: () => void;
  onCancelPanel: () => void;
}

export interface ICardButton {
  type: string;
  title: string;
  value: string;
}
