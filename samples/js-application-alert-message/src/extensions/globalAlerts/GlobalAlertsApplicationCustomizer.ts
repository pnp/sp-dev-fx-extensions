import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
    BaseApplicationCustomizer, PlaceholderName, PlaceholderContent
} from '@microsoft/sp-application-base';
import * as strings from 'GlobalAlertsApplicationCustomizerStrings';
import { sp } from "@pnp/sp";
import Alerts, { IAlertsProps } from './Alerts';

const LOG_SOURCE: string = 'GlobalAlertsApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IGlobalAlertsApplicationCustomizerProperties {
    // This is an example; replace with your own property
    animationType: string;
    animationDelay: number;
    alertBackgroundColor: string;
    textColor: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class GlobalAlertsApplicationCustomizer
    extends BaseApplicationCustomizer<IGlobalAlertsApplicationCustomizerProperties> {
    private _topPlaceholder: PlaceholderContent | undefined;
    private _renderPlaceHolders(): void {
        // Handling the top placeholder
        if (!this._topPlaceholder) {
            this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(
                PlaceholderName.Top,
                { onDispose: this._onDispose }
            );
            // The extension should not assume that the expected placeholder is available.
            if (!this._topPlaceholder) {
                console.error("The expected placeholder (Top) was not found.");
                return;
            }
            if (this._topPlaceholder.domElement) {
                const elem: React.ReactElement<IAlertsProps> = React.createElement(Alerts, {
                    animationType: this.properties.animationType,
                    animationDelay: this.properties.animationDelay,
                    alertBackgroundColor: this.properties.alertBackgroundColor,
                    textColor: this.properties.textColor
                });
                ReactDOM.render(elem, this._topPlaceholder.domElement);
            }
        }
    }
    private _onDispose(): void {
        console.log('[GlobalAlertApplicationCustomizer._onDispose] Disposed custom top placeholders.');
    }
    @override
    public onInit(): Promise<void> {
        sp.setup(this.context);
        // Wait for the placeholders to be created (or handle them being changed) and then render.
        this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);
        return Promise.resolve();
    }
}
