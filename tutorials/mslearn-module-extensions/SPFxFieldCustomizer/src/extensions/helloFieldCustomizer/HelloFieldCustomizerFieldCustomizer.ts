import { Log } from '@microsoft/sp-core-library';
import {
  BaseFieldCustomizer,
  type IFieldCustomizerCellEventParameters
} from '@microsoft/sp-listview-extensibility';

import * as strings from 'HelloFieldCustomizerFieldCustomizerStrings';
import styles from './HelloFieldCustomizerFieldCustomizer.module.scss';

/**
 * If your field customizer uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IHelloFieldCustomizerFieldCustomizerProperties {
  greenMinLimit?: string;
  yellowMinLimit?: string;
}

const LOG_SOURCE: string = 'HelloFieldCustomizerFieldCustomizer';

export default class HelloFieldCustomizerFieldCustomizer
  extends BaseFieldCustomizer<IHelloFieldCustomizerFieldCustomizerProperties> {

  public onInit(): Promise<void> {
    // Add your custom initialization to this method.  The framework will wait
    // for the returned promise to resolve before firing any BaseFieldCustomizer events.
    Log.info(LOG_SOURCE, 'Activated HelloFieldCustomizerFieldCustomizer with properties:');
    Log.info(LOG_SOURCE, JSON.stringify(this.properties, undefined, 2));
    Log.info(LOG_SOURCE, `The following string should be equal: "HelloFieldCustomizerFieldCustomizer" and "${strings.Title}"`);
    return Promise.resolve();
  }

  public onRenderCell(event: IFieldCustomizerCellEventParameters): void {
    event.domElement.classList.add(styles.cell);

    // determine color and text to use
    const fieldValue = parseInt(event.fieldValue);
    let filledColor: string = '';

    if (isNaN(fieldValue) || fieldValue === 0) {
      event.domElement.innerHTML = `
        <div class="${styles.helloFieldCustomizer}">
          <div class="">
            <div style="width: 100px; color:#000000;">
              &nbsp; no progress
            </div>
          </div>
        </div>
      `;
    } else {
      if (fieldValue >= parseInt(this.properties.greenMinLimit as string)) {
        filledColor = '#00ff00';
      } else if (fieldValue >= parseInt(this.properties.yellowMinLimit as string)) {
        filledColor = '#ffff00';
      } else {
        filledColor = '#ff0000';
      }

      event.domElement.innerHTML = `
        <div class="${styles.helloFieldCustomizer}">
          <div class="${styles.filledBackground}">
            <div style="width: ${fieldValue}px; background:${filledColor}; color:#000000;">
              &nbsp; ${fieldValue}% completed
            </div>
          </div>
        </div>`;
    }
  }

  public onDisposeCell(event: IFieldCustomizerCellEventParameters): void {
    // This method should be used to free any resources that were allocated during rendering.
    // For example, if your onRenderCell() called createRoot(), then you should
    // call root.unmount() here.
    super.onDisposeCell(event);
  }
}
