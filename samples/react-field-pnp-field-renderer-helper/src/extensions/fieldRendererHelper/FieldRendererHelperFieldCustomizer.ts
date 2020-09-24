import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Log } from '@microsoft/sp-core-library';
import { override } from '@microsoft/decorators';
import {
  BaseFieldCustomizer,
  IFieldCustomizerCellEventParameters
} from '@microsoft/sp-listview-extensibility';

import * as strings from 'FieldRendererHelperFieldCustomizerStrings';
import FieldRendererHelper, { IFieldRendererHelperProps } from './components/FieldRendererHelper';
import { IContext } from '@pnp/spfx-controls-react/lib/common/Interfaces';

/**
 * If your field customizer uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IFieldRendererHelperFieldCustomizerProperties {
}

const LOG_SOURCE: string = 'FieldRendererHelperFieldCustomizer';

export default class FieldRendererHelperFieldCustomizer
  extends BaseFieldCustomizer<IFieldRendererHelperFieldCustomizerProperties> {

  @override
  public onInit(): Promise<void> {
    // Add your custom initialization to this method.  The framework will wait
    // for the returned promise to resolve before firing any BaseFieldCustomizer events.
    Log.info(LOG_SOURCE, 'Activated FieldRendererHelperFieldCustomizer with properties:');
    Log.info(LOG_SOURCE, JSON.stringify(this.properties, undefined, 2));
    Log.info(LOG_SOURCE, `The following string should be equal: "FieldRendererHelperFieldCustomizer" and "${strings.Title}"`);
    return Promise.resolve();
  }

  @override
  public onRenderCell(event: IFieldCustomizerCellEventParameters): void {

    const fieldRendererHelper: React.ReactElement<{}> =
      React.createElement(FieldRendererHelper, {
        context: this.context as IContext,
        fieldValue: event.fieldValue,
        listItemAccessor: event.listItem,
        cssProps: {
          backgroundColor: '#C3C3C3',
          color: '#000'
        }
       } as IFieldRendererHelperProps);

    ReactDOM.render(fieldRendererHelper, event.domElement);
  }

  @override
  public onDisposeCell(event: IFieldCustomizerCellEventParameters): void {
    // This method should be used to free any resources that were allocated during rendering.
    // For example, if your onRenderCell() called ReactDOM.render(), then you should
    // call ReactDOM.unmountComponentAtNode() here.
    ReactDOM.unmountComponentAtNode(event.domElement);
    super.onDisposeCell(event);
  }
}
