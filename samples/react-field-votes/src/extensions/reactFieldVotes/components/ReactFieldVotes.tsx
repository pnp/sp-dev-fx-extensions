import { Log } from '@microsoft/sp-core-library';
import * as React from 'react';

import styles from './ReactFieldVotes.module.scss';

export interface IReactFieldVotesProps {
  text: string;
}

const LOG_SOURCE: string = 'ReactFieldVotes';

export default class ReactFieldVotes extends React.Component<IReactFieldVotesProps, {}> {
  public componentDidMount(): void {
    Log.info(LOG_SOURCE, 'React Element: ReactFieldVotes mounted');
  }

  public componentWillUnmount(): void {
    Log.info(LOG_SOURCE, 'React Element: ReactFieldVotes unmounted');
  }

  public render(): React.ReactElement<{}> {
    return (
      <div className={styles.reactFieldVotes}>
        { this.props.text }
      </div>
    );
  }
}
