import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';

import * as strings from 'PowerVirtualAgentsHostApplicationCustomizerStrings';
import { Chatbot } from './controls/Chatbot';
import { IChatbotProps } from './controls/IChatbotProps';

const LOG_SOURCE: string = 'PowerVirtualAgentsHostApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IPowerVirtualAgentsHostApplicationCustomizerProperties {
   /**
 * The bot id guid
 */
    botId: string;

    /**
     * The tenant id guid
     */
    tenantId: string;

    /**
     * The bot friendly name (optional). Will be displayed on the bot dialog
     */
    botFriendlyName?: string;

    /**
     * The label that you want to show on the button to launch the bot dialog (optional)
     */
    buttonLabel?: string;

    /**
     * The avatar image URL for the the bot (optional)
     */
    botAvatarImage?: string;

    /**
     * The avatar initials. Will be used as alternative text for the bot avatar
     */
    botAvatarInitials?: string;

    /**
     * Automatically greet user?
     */
    greet?: boolean;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class PowerVirtualAgentsHostApplicationCustomizer
  extends BaseApplicationCustomizer<IPowerVirtualAgentsHostApplicationCustomizerProperties> {
    private _bottomPlaceholder: PlaceholderContent | undefined;

    @override
    public onInit(): Promise<void> {
      Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

      // Use default value for chatbot friendly name if not provided
      if (!this.properties.botFriendlyName || this.properties.botFriendlyName === "") {
        this.properties.botFriendlyName = strings.ChatbotFriendlyNameDefault;
      }

      // Use default value for chatbot friendly name if not provided
      if (!this.properties.buttonLabel || this.properties.buttonLabel === "") {
        this.properties.buttonLabel = strings.ButtonLabelDefaultValue;
      }

      // By default, don't greet users
      if (this.properties.greet !== true) {
        this.properties.greet = false;
      }

      // Wait for the placeholders to be created (or handle them being changed) and then
      // render.
      this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);


      return Promise.resolve();
    }


    private _renderPlaceHolders(): void {
      // Handling the bottom placeholder
      if (!this._bottomPlaceholder) {
        this._bottomPlaceholder = this.context.placeholderProvider.tryCreateContent(
          PlaceholderName.Bottom,
          { onDispose: this._onDispose }
        );

        // The extension should not assume that the expected placeholder is available.
        if (!this._bottomPlaceholder) {
          console.error("The expected placeholder (Bottom) was not found.");
          return;
        }

        // Get the current user to retrieve the user display name and email
        const user = this.context.pageContext.user;
        const elem: React.ReactElement = React.createElement<IChatbotProps>(Chatbot, {
          ...this.properties,
          userEmail: user.email,
          userDisplayName: user.displayName
        });
        ReactDOM.render(elem, this._bottomPlaceholder.domElement);
      }
    }

    private _onDispose(): void {
    }
  }
