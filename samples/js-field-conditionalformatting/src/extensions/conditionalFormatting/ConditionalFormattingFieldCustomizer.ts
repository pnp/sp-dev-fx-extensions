import { Log } from '@microsoft/sp-core-library';
import { LogHandler, LogLevel } from '../../common/LogHandler';
import { override } from '@microsoft/decorators';
import {
  CellFormatter,
  BaseFieldCustomizer,
  IFieldCustomizerCellEventParameters
} from '@microsoft/sp-listview-extensibility';

import styles from './ConditionalFormatting.module.scss';

export interface IConditionalFormattingProperties {
  midStart?: number;
  midEnd?: number;
}

const LOG_SOURCE: string = 'ConditionalFormattingFieldCustomizer';

export default class ConditionalFormattingFieldCustomizer
  extends BaseFieldCustomizer<IConditionalFormattingProperties> {

  @override
  public onInit(): Promise<void> {
    Log._initialize(new LogHandler((window as any).LOG_LEVEL || LogLevel.Error));
    Log.verbose(LOG_SOURCE, 'Activated ConditionalFormattingFieldCustomizer with properties:');
    Log.verbose(LOG_SOURCE, JSON.stringify(this.properties, undefined, 2));
    return Promise.resolve<void>();
  }

  @override
  public onRenderCell(event: IFieldCustomizerCellEventParameters): void {
    event.cellDiv.parentElement.classList.add(styles.ConditionalFormatting);

    event.cellDiv.innerText = CellFormatter.renderAsText(this.context.column, event.cellValue);

    let midStart: number = this.properties.midStart;
    let midEnd: number = this.properties.midEnd;

    if (!midStart && !midEnd) {
      Log.error(LOG_SOURCE, new Error('Field customizer configuration missing. midStart or midEnd parameter must be specified'));
      return;
    }
    else {
      if (midStart && !midEnd) {
        Log.verbose(LOG_SOURCE, `midEnd not specified. Setting to midStart:${midStart}`);
        midEnd = midStart;
      }
      else if (!midStart && midEnd) {
        Log.verbose(LOG_SOURCE, `midStart not specified. Setting to midEnd:${midEnd}`);
        midStart = midEnd;
      }
    }

    let value: number = parseInt(event.cellValue);
    if (isNaN(value)) {
      Log.info(LOG_SOURCE, `'${event.cellValue}' is not a number. Aborting conditional formatting`);
      return;
    }

    if (value < midStart) {
      event.cellDiv.parentElement.classList.add(styles.min);
    }
    else if (value >= midStart && value <= midEnd) {
      event.cellDiv.parentElement.classList.add(styles.mid);
    }
    else if (value > midEnd) {
      event.cellDiv.parentElement.classList.add(styles.max);      
    }
  }

  @override
  public onDisposeCell(event: IFieldCustomizerCellEventParameters): void {
    super.onDisposeCell(event);
  }
}
