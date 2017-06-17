import { Log } from '@microsoft/sp-core-library';
import { override } from '@microsoft/decorators';
import * as React from 'react';
import { Toggle as ReactToggle } from 'office-ui-fabric-react';

import styles from './Toggle.module.scss';
import { IToggleProps } from './IToggleProps'
import { IToggleState } from './IToggleState'

const LOG_SOURCE: string = 'Toggle';

export default class Toggle extends React.Component<IToggleProps, IToggleState> {
  constructor(props: IToggleProps, state: IToggleState) {
    super(props, state);

    const curVal = props.checked === 'Yes' ? true : false;

    this.state = {
      checked: curVal
    };
  }

  @override
  public componentDidMount(): void {
    Log.info(LOG_SOURCE, 'React Element: Toggle mounted');
  }

  @override
  public componentWillUnmount(): void {
    Log.info(LOG_SOURCE, 'React Element: Toggle unmounted');
  }

  @override
  public render(): React.ReactElement<{}> {
    return (
      <div className={styles.cell}>
        <ReactToggle
          defaultChecked={ this.state.checked }
          onText='Yes'
          offText='No'
          onChanged={this.onChanged.bind(this)}
          disabled={this.props.disabled} />
      </div>
    );
  }

  private onChanged(checked: boolean): void {
    if (this.props.onChanged)
      this.props.onChanged(checked, this.props.id);
  }
}
