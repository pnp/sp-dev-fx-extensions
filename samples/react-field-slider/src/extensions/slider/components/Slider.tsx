import { Log } from '@microsoft/sp-core-library';
import { override } from '@microsoft/decorators';
import * as React from 'react';
import { Slider as ReactSlider } from 'office-ui-fabric-react';

import styles from './Slider.module.scss';

export interface ISliderProps {
  value: string;
  id: string;
  disabled: boolean;
  onChange: (value: number, id: string) => void;
}

export interface ISliderState {
  value?: number;
}

const LOG_SOURCE: string = 'Slider';

export default class Slider extends React.Component<ISliderProps, ISliderState> {
  constructor(props: ISliderProps, state: ISliderState) {
    super(props, state);

    const intVal = parseInt(props.value);

    this.state = {
      value: isNaN(intVal) ? null : intVal
    };
  }

  @override
  public componentDidMount(): void {
    Log.info(LOG_SOURCE, 'React Element: Slider mounted');
  }

  @override
  public componentWillUnmount(): void {
    Log.info(LOG_SOURCE, 'React Element: Slider unmounted');
  }

  @override
  public render(): React.ReactElement<{}> {
    return (
      <div className={styles.cell}>
        {this.state.value &&
        (
          <ReactSlider
            value={this.state.value}
            max={100}
            onChange={this.onChange.bind(this)}
            disabled={this.props.disabled} />
        )}
      </div>
    );
  }

  private onChange(value: number): void {
    if (this.props.onChange)
      this.props.onChange(value, this.props.id);
  }
}
