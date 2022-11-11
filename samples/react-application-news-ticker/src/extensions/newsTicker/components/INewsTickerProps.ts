import { News } from "../models/News";
import SpService from "../service/SpService";

export default interface INewsTickerProps {
  items: News[];
  bgColor: string;
  textColor: string;
  spService: SpService;
}