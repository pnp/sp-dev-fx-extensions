import { News } from "../models/News";

export default interface INewsTickerProps {
  items: News[];
  bgColor?: string;
  textColor?: string;
  speed?: number;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  showDate?: boolean;
  dateFormat?: 'short' | 'medium' | 'long';
  maxItems?: number;
  onClick?: (news: News) => void;
  locale?: string;
  respectMotionPreference?: boolean;
}