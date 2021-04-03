import * as React from "react";
import Ticker from "react-ticker";

import styles from "./NewsTicker.module.scss";

export default function NewsTicker() {
  const [isMove, setIsMove] = React.useState(true);

  return (
    <div
      onMouseEnter={() => {
        setIsMove(false);
      }}
      onMouseLeave={() => {
        setIsMove(true);
      }}
      className={styles.newsTicker}
    >
      <Ticker move={isMove}>
        {({ index }) => (
          <>
            <span style={{ margin: "0 10px" }}>This is old News</span>
            <span style={{ margin: "0 10px" }}>This is new News</span>
          </>
        )}
      </Ticker>
    </div>
  );
}
