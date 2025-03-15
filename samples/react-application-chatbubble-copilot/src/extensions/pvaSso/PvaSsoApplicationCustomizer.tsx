import React from 'react';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';
import * as ReactDOM from 'react-dom';
import * as strings from 'PvaSsoApplicationCustomizerStrings';
import { override } from '@microsoft/decorators';
import { initializeIcons } from '@fluentui/react';
import styles from './styles/PvaSsoApplicationCustomizer.module.scss';
import ChatbotContainer from './components/ChatbotContainer';
import { ConfigurationService } from './services/ConfigurationService';

initializeIcons();

const LOG_SOURCE: string = 'PvaSsoApplicationCustomizer';

export default class PvaSsoApplicationCustomizer
  extends BaseApplicationCustomizer<any> {

  private _placeholder: PlaceholderContent | undefined;
  private _configurationService: ConfigurationService;

  @override
  public async onInit(): Promise<void> {
    try {
      console.log('PvaSsoApplicationCustomizer: onInit');
      this._configurationService = new ConfigurationService(this.context);
      const configuration = await this._configurationService.getConfiguration();
      
      Log.info(LOG_SOURCE, `Bot URL from configuration: ${configuration.botURL}`);
      
      // Important: Initialize placeholder immediately
      await this._renderPlaceholders();
      
      // Also listen for changes
      this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceholders);

      return Promise.resolve();
    } catch (error) {
      Log.error(LOG_SOURCE, error);
      console.error('Failed to initialize application customizer:', error);
      return Promise.reject(error);
    }
  }

  private _renderPlaceholders = async (): Promise<void> => {
    console.log('PvaSsoApplicationCustomizer: _renderPlaceholders');
    
    if (!this._placeholder) {
      this._placeholder = this.context.placeholderProvider.tryCreateContent(
        PlaceholderName.Bottom
      );
    }

    if (!this._placeholder) {
      console.error('Could not find placeholder');
      return;
    }

    try {
      const configuration = await this._configurationService.getConfiguration();
      const user = this.context.pageContext.user;

      console.log('Rendering ChatbotContainer with configuration:', configuration);

      this._placeholder.domElement.className = styles.modernChatContainer;
      
      ReactDOM.render(
        <ChatbotContainer
          botURL={configuration.botURL}
          botName={configuration.botName || strings.DefaultBotName}
          userEmail={user.email}
          userFriendlyName={user.displayName}
          customScope={configuration.customScope}
          clientID={configuration.clientID}
          authority={configuration.authority}
          botAvatarInitials={configuration.botAvatarInitials}
          greet={configuration.greet}
          context={this.context}
        />,
        this._placeholder.domElement
      );
    } catch (error) {
      console.error('Error rendering chat container:', error);
    }
  }

  protected onDispose(): void {
    if (this._placeholder?.domElement) {
      ReactDOM.unmountComponentAtNode(this._placeholder.domElement);
    }
  }
}