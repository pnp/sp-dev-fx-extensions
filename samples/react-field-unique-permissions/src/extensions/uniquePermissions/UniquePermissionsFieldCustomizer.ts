import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {
  BaseFieldCustomizer,
  IFieldCustomizerCellEventParameters,
} from '@microsoft/sp-listview-extensibility';

import { override } from '@microsoft/decorators';
import UniquePermissions, { IUniquePermissionsProps } from './components/UniquePermissions/UniquePermissions';
import { IOptionsRenderer, IPermissionsService, OptionsRendererBuilder, PermissionsServiceBuilder } from './services';

export default class UniquePermissionsFieldCustomizer
  extends BaseFieldCustomizer<{}> {
  private permissionsService: IPermissionsService;
  private optionsRenderer: IOptionsRenderer;

  @override
  public async onInit(): Promise<void> {
    const optionsRendererBuilder = this.context.serviceScope.consume(OptionsRendererBuilder.serviceKey);
    const permissionsServiceBuilder = this.context.serviceScope.consume(PermissionsServiceBuilder.serviceKey);

    this.permissionsService = permissionsServiceBuilder.withProduction().buildService();
    this.optionsRenderer = optionsRendererBuilder.withProduction().buildService();

    this.optionsRenderer.renderAdditionalOptions(this.context);

    return Promise.resolve();
  }

  @override
  public onRenderCell(event: IFieldCustomizerCellEventParameters): void {
    const webUrl = this.context.pageContext.web.absoluteUrl;
    const listId = this.context.pageContext.list.id;
    const itemId = event.listItem.getValueByName('ID');

    const uniquePermissions: React.ReactElement<{}> =
      React.createElement(UniquePermissions, {
        itemData: {
          itemId: itemId,
          listId: listId,
          webUrl: webUrl
        },
        permissionsService: this.permissionsService,
        currentUserLoginName: `i:0#.f|membership|${this.context.pageContext.user.loginName}`
      } as IUniquePermissionsProps);

    ReactDOM.render(uniquePermissions, event.domElement);
  }

  public onDisposeCell(event: IFieldCustomizerCellEventParameters): void {
    ReactDOM.unmountComponentAtNode(event.domElement);
    this.optionsRenderer.unMountAdditionalOptions()
    super.onDisposeCell(event);
  }
}
