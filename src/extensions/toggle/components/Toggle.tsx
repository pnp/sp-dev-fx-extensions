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

    const curVal = props.value === 'Yes' ? true : false;

    this.state = {
      value: curVal
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
        { this.state.value &&
        (
          <ReactToggle
            defaultChecked={ this.state.value }
            onText='Yes'
            offText='No'
            onChange={this.onChange.bind(this)}
            disabled={this.props.disabled} />
        )}
      </div>
    );
  }

  private onChange(value: string): void {
    if (this.props.onChange)
      this.props.onChange(value, this.props.id);
  }
}
