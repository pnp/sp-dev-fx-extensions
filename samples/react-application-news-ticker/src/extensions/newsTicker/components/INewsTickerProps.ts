import { News } from "../models/News";

export default interface INewsTickerProps {
  items: News[];
  bgColor: string;
  textColor: string;
}