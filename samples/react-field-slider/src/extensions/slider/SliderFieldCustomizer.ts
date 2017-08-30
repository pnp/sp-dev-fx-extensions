import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Log } from '@microsoft/sp-core-library';
import { override } from '@microsoft/decorators';
import {
  CellFormatter,
  BaseFieldCustomizer,
  IFieldCustomizerCellEventParameters
} from '@microsoft/sp-listview-extensibility';
import { SPPermission } from "@microsoft/sp-page-context";
import pnp, { List, ItemUpdateResult, Item } from 'sp-pnp-js';

import * as strings from 'sliderStrings';
import Slider, { ISliderProps } from './components/Slider';

/**
 * If your field customizer uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ISliderProperties {
  // This is an example; replace with your own property
  value?: string;
}

const LOG_SOURCE: string = 'SliderFieldCustomizer';

export default class SliderFieldCustomizer
  extends BaseFieldCustomizer<ISliderProperties> {
  private _timerId: number = -1;

  @override
  public onInit(): Promise<void> {
    // Add your custom initialization to this method.  The framework will wait
    // for the returned promise to resolve before firing any BaseFieldCustomizer events.
    Log.info(LOG_SOURCE, 'Activated SliderFieldCustomizer with properties:');
    Log.info(LOG_SOURCE, JSON.stringify(this.properties, undefined, 2));
    Log.info(LOG_SOURCE, `The following string should be equal: "Slider" and "${strings.Title}"`);
    return Promise.resolve<void>();
  }

  @override
  public onRenderCell(event: IFieldCustomizerCellEventParameters): void {
    // Use this method to perform your custom cell rendering.  The CellFormatter is a utility
    // that you can use to convert the cellValue to a text string.
    const value: string = event.cellValue;
    const id: string = event.listItem.getValueByName('ID').toString();
    const hasPermissions: boolean = this.context.pageContext.list.permissions.hasPermission(SPPermission.editListItems);


    const slider: React.ReactElement<{}> =
      React.createElement(Slider, { value: value, id: id, disabled: !hasPermissions, onChange: this.onSliderValueChanged.bind(this) } as ISliderProps);

    ReactDOM.render(slider, event.cellDiv);
  }

  @override
  public onDisposeCell(event: IFieldCustomizerCellEventParameters): void {
    // This method should be used to free any resources that were allocated during rendering.
    // For example, if your onRenderCell() called ReactDOM.render(), then you should
    // call ReactDOM.unmountComponentAtNode() here.
    ReactDOM.unmountComponentAtNode(event.cellDiv);
    super.onDisposeCell(event);
  }

  private onSliderValueChanged(value: number, id: string): void {
    if (this._timerId !== -1)
      clearTimeout(this._timerId);

    this._timerId = setTimeout(() => {
      let updateObj: any = {};
      updateObj[this.context.field.internalName] = value;
      pnp.sp.web.lists.getByTitle(this.context.pageContext.list.title).items.getById(parseInt(id))
        .update(updateObj)
        .then((result: ItemUpdateResult): void => {
          console.log(`Item with ID: ${id} successfully updated`);
        }, (error: any): void => {
          console.log('Loading latest item failed with error: ' + error);
        });
    }, 1000);
  }
}
