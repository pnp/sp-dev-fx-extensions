import { Log } from '@microsoft/sp-core-library';
import { override } from '@microsoft/decorators';
import {
  CellFormatter,
  BaseFieldCustomizer,
  IFieldCustomizerCellEventParameters
} from '@microsoft/sp-listview-extensibility';

import * as strings from 'taskPriorityStrings';
import styles from './TaskPriority.module.scss';

export interface ITaskPriorityProperties {
}

const LOG_SOURCE: string = 'TaskPriorityFieldCustomizer';

export default class TaskPriorityFieldCustomizer
  extends BaseFieldCustomizer<ITaskPriorityProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Activated TaskPriorityFieldCustomizer with properties:');
    Log.info(LOG_SOURCE, JSON.stringify(this.properties, undefined, 2));
    Log.info(LOG_SOURCE, `The following string should be equal: "TaskPriority" and "${strings.Title}"`);
    return Promise.resolve<void>();
  }

  @override
  public onRenderCell(event: IFieldCustomizerCellEventParameters): void {
    
    //Get the value of the column
    event.cellDiv.innerText = CellFormatter.renderAsText(this.context.column, event.cellValue);

    // Format each cell with the appropriate color based on the Priority column value
    if (this.context.column.field.internalName === 'Priority') {
      switch (event.cellValue) {
        case '(1) High':
            event.cellDiv.classList.add(styles.high);
            console.log('(1) High Switch Hit');
            break;
        case '(2) Normal':
            event.cellDiv.classList.add(styles.normal);
        console.log('(2) Normal Switch Hit');
            break;
        case '(3) Low':
            event.cellDiv.classList.add(styles.low);
            console.log('(3) Low Switch Hit');
            break;
        default:
            break;
      }
    }

    console.log('Cell value: ' + event.cellValue);  }

  @override
  public onDisposeCell(event: IFieldCustomizerCellEventParameters): void {
    super.onDisposeCell(event);
  }
}
