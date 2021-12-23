import { override } from '@microsoft/decorators';
import {
  BaseFieldCustomizer,
  IFieldCustomizerCellEventParameters
} from '@microsoft/sp-listview-extensibility';
import {
  ConsoleListener, Logger
} from "@pnp/logging";
import { sp } from "@pnp/sp/presets/all";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as strings from 'ShowEntriesFieldCustomizerStrings';
import { IShowEntriesProps } from './components/IShowEntriesProps';
import ShowEntries from './components/ShowEntries';

export interface IShowEntriesFieldCustomizerProperties {
  logLevel?: number;
}

const LOG_SOURCE: string = 'ShowEntriesFieldCustomizer';

export default class ShowEntriesFieldCustomizer
  extends BaseFieldCustomizer<IShowEntriesFieldCustomizerProperties> {

  @override
  public onInit(): Promise<void> {
     Logger.subscribe(new ConsoleListener());

    if (this.properties.logLevel && this.properties.logLevel in [0, 1, 2, 3, 99]) {
      Logger.activeLogLevel = this.properties.logLevel;
    }

    Logger.write(`${LOG_SOURCE} Activated ShowEntriesFieldCustomizer with properties:`);  
    Logger.write(`${LOG_SOURCE} ${JSON.stringify(this.properties, undefined, 2)}`);
    Logger.write(`${LOG_SOURCE} The following string should be equal: "ShowEntriesFieldCustomizer" and "${strings.Title}"`);

    sp.setup(this.context);
    return Promise.resolve();
  }

  @override
  public onRenderCell(event: IFieldCustomizerCellEventParameters): void {
        if (this.context.field.fieldType == "Note") {
      const showEntries: React.ReactElement<IShowEntriesProps> = React.createElement(ShowEntries, {
        listId: this.context.pageContext.list.id.toString(),    
        itemId: event.listItem.getValueByName("ID"),
        fieldName: this.context.field.internalName,
        currentValue: event.fieldValue 
      });

      ReactDOM.render(showEntries, event.domElement);
    }
    else { 
      event.domElement.innerText = "Field type not supported";
      Logger.write(`${LOG_SOURCE} Field customizer ShowEntriesFieldCustomizer (0b44d87a-1de2-4f21-9f67-3bcd0d3cab34) can only be used with MultilineText field types.`);
      Logger.write(`${LOG_SOURCE} Detach it from this field using:`);
      Logger.write(`${LOG_SOURCE} Connect-PnPOnline -Url "SITE_URL" -Interactiv`);
      Logger.write(`${LOG_SOURCE} Set-PnPField -List "LIST_NAME" -Identity "${this.context.field.internalName}" -Values @{ClientSideComponentId=$null}`);
    }
  }

  @override
  public onDisposeCell(event: IFieldCustomizerCellEventParameters): void {
    ReactDOM.unmountComponentAtNode(event.domElement);
    super.onDisposeCell(event);
  }
}
