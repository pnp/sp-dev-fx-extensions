import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,  
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';
import { SPPermission } from '@microsoft/sp-page-context';
import { ITopCommandBarProps } from './components/ITopCommandBarProps';
import { TopCommandBar } from './components/TopCommandBar';

const LOG_SOURCE: string = 'CommandBarNavigationApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ICommandBarNavigationApplicationCustomizerProperties {
  useTeamsites: boolean;
  useCommsites: boolean;
  useHubsites: boolean;
  useTeams: boolean;
  useGraph: boolean;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class CommandBarNavigationApplicationCustomizer
  extends BaseApplicationCustomizer<ICommandBarNavigationApplicationCustomizerProperties> {

  private _topPlaceholder: PlaceholderContent | undefined;

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized GlobalNavigation`);

    this.context.placeholderProvider.changedEvent.add(this, this.renderGlobalNavigation);
    
    this.renderGlobalNavigation();
    return Promise.resolve();
  }

  private renderGlobalNavigation(): void {
    if (!this._topPlaceholder) {
      this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, { onDispose: this._onDispose });
    
      if (!this._topPlaceholder) {
        console.error('The expected placeholder was not found!');
      }
      // Default handling config properties.
      if (typeof this.properties.useTeamsites !== 'boolean') {
        this.properties.useTeamsites = true;
      }
      if (typeof this.properties.useCommsites !== 'boolean') {
        this.properties.useCommsites = true;
      }      
      if (typeof this.properties.useHubsites !== 'boolean') {
        this.properties.useHubsites = true;
      }
      if (typeof this.properties.useTeams !== 'boolean') {
        this.properties.useTeams = true;
      }
      const isSiteOwner = this.context.pageContext.web.permissions.hasAllPermissions(SPPermission.manageWeb, SPPermission.managePermissions);          
      if (this._topPlaceholder && this._topPlaceholder.domElement) {
        const element: React.ReactElement<ITopCommandBarProps> = React.createElement(
          TopCommandBar,
          {
            currentSiteUrl: this.context.pageContext.site.absoluteUrl,
            siteId: `${this.context.pageContext.site.id.toString()},${this.context.pageContext.web.id.toString()}`,
            serviceScope: this.context.serviceScope,
            msGraphClientFactory: this.context.msGraphClientFactory,
            useGraph: this.properties.useGraph,
            useTeamsites: this.properties.useTeamsites,
            useCommsites: this.properties.useCommsites,
            useHubsites: this.properties.useHubsites,
            useTeams: this.properties.useTeams,
            isSiteOwner: isSiteOwner
          }
        );
        // eslint-disable-next-line @microsoft/spfx/pair-react-dom-render-unmount
        ReactDom.render(element, this._topPlaceholder.domElement); 
      }
    }
  }

  private _onDispose(): void {
    console.log('Disposed custom top navigation placeholder.');
  }
}
