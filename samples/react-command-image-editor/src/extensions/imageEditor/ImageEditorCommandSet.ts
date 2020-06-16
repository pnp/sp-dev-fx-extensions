import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';

import * as reactDom from 'react-dom';
import { EditImage } from '../../components/ImageEditor';

import * as strings from 'ImageEditorCommandSetStrings';
import React from 'react';
import { ThemeProvider, ThemeChangedEventArgs, IReadonlyTheme } from '@microsoft/sp-component-base';
/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deseria lized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IImageEditorCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;

}

const LOG_SOURCE: string = 'ImageEditorCommandSet';

export default class ImageEditorCommandSet extends BaseListViewCommandSet<IImageEditorCommandSetProperties> {
  private _container = document.createElement('div');
  private showPanel:boolean  = false;
  private _themeProvider: ThemeProvider;
  private _themeVariant: IReadonlyTheme | undefined;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized ImageEditorCommandSet');
    this._themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey);
    // If it exists, get the theme variant
    this._themeVariant = this._themeProvider.tryGetTheme();
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const editImageCommand: Command = this.tryGetCommand('EditImage');
    if (editImageCommand) {
      // This command should be hidden unless exactly one row is selected. and the file is jpeg or png
     if ( event.selectedRows.length === 1 ) {
      const _field:any = event.selectedRows[0];
      const _fileType:string = _field._values.get('File_x0020_Type');
      if (_fileType === 'jpeg' || _fileType === 'png' || _fileType === 'jpg'){
        editImageCommand.visible = true;
      }
     }else{
      editImageCommand.visible = false;
    }

    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {

    const _imageUrl = `${this.context.pageContext.list.serverRelativeUrl}/${event.selectedRows[0].getValueByName('FileLeafRef')}`;
    const _fileName = event.selectedRows[0].getValueByName('FileLeafRef');
    Log.info(LOG_SOURCE, `Load Image Editor for ${_fileName}`);
    switch (event.itemId) {
      case 'EditImage':
        document.body.appendChild(this._container);
        this.showPanel = true;
        let _renderImage = React.createElement(
          EditImage,
          {
           imageUrl: _imageUrl,
           fileName: _fileName,
           showPanel: this.showPanel,
           themeVariant: this._themeVariant

          }
        );
        reactDom.render(_renderImage,this._container);
        break;
      default:
        throw new Error('Unknown command');
    }
  }
}
