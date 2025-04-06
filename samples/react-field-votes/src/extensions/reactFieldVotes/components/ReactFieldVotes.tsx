import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

import { Icon } from "@fluentui/react/lib/Icon";
import * as React from "react";

import { SharePointService } from "../utils/SharePointService";
import styles from "./ReactFieldVotes.module.scss";

interface IReactFieldVotesProps {
  totalVoters: number;
  isVoted: boolean;
  sharePointService: SharePointService;
}

const ReactFieldVotes = (props: IReactFieldVotesProps): JSX.Element => {
  const [totalVoters, setTotalVoters] = React.useState(props.totalVoters);
  const [isVoted, setIsVoted] = React.useState(props.isVoted);

  async function onVote(): Promise<void> {
    await props.sharePointService.addVote();
    setIsVoted(true);
    setTotalVoters((prevValue) => prevValue + 1);
  }

  async function onUnVote(): Promise<void> {
    await props.sharePointService.removeVote();
    setIsVoted(false);
    setTotalVoters((prevValue) => prevValue - 1);
  }

  return (
    <div className={styles.reactFieldVotes}>
      <div>{totalVoters}</div>
      {isVoted ? (
        <button onClick={() => onUnVote()} type="button">
          <Icon iconName="LikeSolid" />
          <span>Voted</span>
        </button>
      ) : (
        <button onClick={() => onVote()} className={styles.vote} type="button">
          <Icon iconName="Like" />
          <span>Vote</span>
        </button>
      )}
    </div>
  );
};

export { IReactFieldVotesProps, ReactFieldVotes };
