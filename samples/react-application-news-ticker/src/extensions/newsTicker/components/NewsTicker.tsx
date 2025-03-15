import * as React from "react";
import INewsTickerProps from "./INewsTickerProps";
import Constants from "../helpers/Constants";
import styles from './NewsTicker.module.scss';
import Ticker from "./react-ticker";

const NewsTicker: React.FC<INewsTickerProps> = ({ bgColor, textColor, items }) => {
  const [isMove, setIsMove] = React.useState<boolean>(true);

  const generateNewsText = (date: Date): string => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const handleMouseEnter = () => setIsMove(false);
  const handleMouseLeave = () => setIsMove(true);

  const newsContainerStyle: React.CSSProperties = {
    backgroundColor: bgColor || "#48c78e",
    color: textColor || "white",
  };

  return (
    <div
      id={Constants.ROOT_ID}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={styles.newsTicker}
      style={newsContainerStyle}
    >
      <Ticker isMove={isMove} speed={20}>
        {items?.map((news, index) => (
          <React.Fragment key={index}>
            <span className={styles.tickerItem}>|</span>
            <span className={styles.tickerItem}>
              <b>{generateNewsText(news.publishDate)}</b>: {news.content}
            </span>
          </React.Fragment>
        ))}
      </Ticker>
    </div>
  );
};

export default NewsTicker;
