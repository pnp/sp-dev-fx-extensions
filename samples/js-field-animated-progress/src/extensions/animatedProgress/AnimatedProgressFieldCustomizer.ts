import { Log } from '@microsoft/sp-core-library';
import { override } from '@microsoft/decorators';
import {
  BaseFieldCustomizer,
  IFieldCustomizerCellEventParameters,
} from '@microsoft/sp-listview-extensibility';

import * as strings from 'AnimatedProgressFieldCustomizerStrings';
import styles from './AnimatedProgressFieldCustomizer.module.scss';

/**
 * If your field customizer uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IAnimatedProgressFieldCustomizerProperties {
  // This is an example; replace with your own property
  sampleText?: string;
}

const LOG_SOURCE: string = 'AnimatedProgressFieldCustomizer';

export default class AnimatedProgressFieldCustomizer extends BaseFieldCustomizer<IAnimatedProgressFieldCustomizerProperties> {
  private readonly _maxLowLevel = 0.3;
  private readonly _maxMiddleLevel = 0.7;
  private readonly _baseId = 'animated-progress-';
  private initializedCells = [];

  @override
  public onInit(): Promise<void> {
    // Add your custom initialization to this method.  The framework will wait
    // for the returned promise to resolve before firing any BaseFieldCustomizer events.
    Log.info(
      LOG_SOURCE,
      'Activated AnimatedProgressFieldCustomizer with properties:'
    );
    Log.info(LOG_SOURCE, JSON.stringify(this.properties, undefined, 2));
    Log.info(
      LOG_SOURCE,
      `The following string should be equal: "AnimatedProgressFieldCustomizer" and "${strings.Title}"`
    );
    return Promise.resolve();
  }

  @override
  public onRenderCell(event: IFieldCustomizerCellEventParameters): void {
    // Get percentage value
    const percentage = event.fieldValue * 100;

    // Determine the type: low/middle/top
    let typeClass;
    if (event.fieldValue <= this._maxLowLevel) {
      typeClass = styles.lowLevel;
    } else if (event.fieldValue <= this._maxMiddleLevel) {
      typeClass = styles.middleLevel;
    } else {
      typeClass = styles.topLevel;
    }

    // Generate uinque id for element
    const id = this._baseId + event.listItem.getValueByName('ID');
    event.domElement.innerHTML = `
    <div id="${id}" class="${styles.progress} ${typeClass}">
      <span style="width: ${percentage}%">${percentage}%</span>
    </div>
    `;

    const progressBar = event.domElement.getElementsByTagName('span')[0];
    if (this.initializedCells.indexOf(id) == -1) {
      // Animate the initial progress grow
      progressBar.animate(
        [
          // keyframes
          { width: 0 },
          { width: percentage + '%' },
        ],
        {
          // timing options
          duration: 1000,
          iterations: 1,
        }
      );
      this.initializedCells.push(id);
    } else {
      progressBar.style.width = percentage + '%';
    }
  }

  @override
  public onDisposeCell(event: IFieldCustomizerCellEventParameters): void {
    // This method should be used to free any resources that were allocated during rendering.
    // For example, if your onRenderCell() called ReactDOM.render(), then you should
    // call ReactDOM.unmountComponentAtNode() here.
    super.onDisposeCell(event);
  }
}
