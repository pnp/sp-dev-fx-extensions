import { Icon } from "office-ui-fabric-react/lib/Icon";
import * as React from "react";

import styles from "./ReactFieldVotes.module.scss";

interface IReactFieldVotesProps {
  totalVoters: number;
  isVoted: boolean;
  loginName: string;
}

const ReactFieldVotes = (props: IReactFieldVotesProps) => {
  return (
    <div className={styles.reactFieldVotes}>
      <div>{props.totalVoters}</div>
      {props.isVoted ? (
        <button className={styles.voted} type="button">
          <Icon iconName="Like" />
          <span>Voted</span>
        </button>
      ) : (
        <button type="button">
          <Icon iconName="LikeSolid" />
          <span>Vote</span>
        </button>
      )}
    </div>
  );
};

export { IReactFieldVotesProps, ReactFieldVotes };
