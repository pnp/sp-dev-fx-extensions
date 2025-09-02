import {
	BaseApplicationCustomizer,
	PlaceholderContent,
	PlaceholderName
} from '@microsoft/sp-application-base';
import { ListSubscriptionFactory } from "@microsoft/sp-list-subscription";
import { Guid } from "@microsoft/sp-core-library";
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Toast } from "./components/Toast";
import { INotifyChangeArgs } from "./INotifyChangeArgs";
import {
	IReadonlyTheme,
	ThemeProvider,
} from "@microsoft/sp-component-base";
import * as strings from 'NotificationApplicationCustomizerStrings';

const LOG_SOURCE: string = 'NotificationApplicationCustomizer';

export interface INotificationApplicationCustomizerProperties {
	listId: string; //"44c29d1b-e53d-42cb-9369-1a566db4373e"
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class NotificationApplicationCustomizer extends BaseApplicationCustomizer<INotificationApplicationCustomizerProperties> {
	private _notificationPlaceholder: PlaceholderContent | undefined;
	private _reactContainer?: HTMLDivElement;
	private _themeProvider: ThemeProvider;
	private _themeVariant: IReadonlyTheme | undefined;

	public async onInit(): Promise<void> {
		console.log(`${LOG_SOURCE} Initialized ${strings.Title}`);

		this._registerThemeProvider();

		this.createListSubscription().catch((error) => {
			console.error(`${LOG_SOURCE} Error creating list subscription:`, error);
		});

		return Promise.resolve();
	}

	private _listSubscriptionFactory: ListSubscriptionFactory;

	private async createListSubscription(): Promise<void> {
		this._listSubscriptionFactory = new ListSubscriptionFactory(this);

		console.debug(`${LOG_SOURCE} Creating list subscription...`);

		await this._listSubscriptionFactory.createSubscription({
			listId: Guid.parse(this.properties.listId),
			callbacks: {
				notification: this._notifyChange,
				connect: () => {
					console.debug(`${LOG_SOURCE} List subscription connected.`);
				},
				disconnect: () => {
					console.debug(`${LOG_SOURCE} List subscription disconnected.`);
				},
			},
		});
	}

	private _notifyChange = async (
		changeEvent?: INotifyChangeArgs
	): Promise<void> => {
		console.debug(`${LOG_SOURCE} List has changed!`);

		const sp = spfi().using(SPFx(this.context));
		try {
			// Get the latest item (ordered by Modified desc)
			const itemResult = await sp.web.lists
				.getById(this.properties.listId)
				.items.orderBy("Modified", false)
				.top(1)();

			if (!itemResult || itemResult.length === 0) {
				console.warn(`${LOG_SOURCE} No items found in the list.`);
				return;
			}

			const item = itemResult[0];
			console.debug(`${LOG_SOURCE} Latest item:`);
			console.debug(item);

			const editor = await sp.web.getUserById(item.EditorId)();
			console.debug(`${LOG_SOURCE} Item modified by:`);
			console.debug(editor);

			if (!this._notificationPlaceholder) {
				this._notificationPlaceholder =
					this.context.placeholderProvider.tryCreateContent(
						PlaceholderName.Top,
						{ onDispose: this._onDispose }
					);

				if (!this._notificationPlaceholder) {
					console.warn(`${LOG_SOURCE} Top placeholder not available.`);
					return;
				}
			}

			if (this._notificationPlaceholder.domElement) {
				const componentElement: React.ReactElement = React.createElement(
					Toast,
					{
						message: `${item.Title}`,
						key: Date.now(),
						editor: editor
					}
				);

				ReactDOM.render(
					componentElement,
					this._notificationPlaceholder.domElement
				);

				this._handleTheme();
			}
		} catch (err) {
			console.error(`${LOG_SOURCE} Error fetching latest item:`, err);
		}
	};

	private _onDispose = (): void => {
		if (this._reactContainer) {
			try {
				ReactDOM.unmountComponentAtNode(this._reactContainer);
			} catch {
				/* noop */
			}
			this._reactContainer = undefined;
		}
		console.debug(`${LOG_SOURCE} Disposed Top placeholder content.`);
	};

	private _registerThemeProvider(): void {
		// Register the theme provider
		this._themeProvider = this.context.serviceScope.consume(
			ThemeProvider.serviceKey
		);

		this._themeVariant = this._themeProvider.tryGetTheme();
	}

	private _handleTheme(): void {
		// If the semanticColors and the placeholder are available
		if (this._themeVariant?.semanticColors && this._notificationPlaceholder) {
			const isDarkTheme: boolean = this._themeVariant.isInverted || false;
			const colors = this._themeVariant.palette;

			// Set the css variables
			this._notificationPlaceholder.domElement.style.setProperty(
				"--bodyText",
				(isDarkTheme ? colors?.white : colors?.black) || null
			);

			this._notificationPlaceholder.domElement.style.setProperty(
				"--bodyBackground",
				(isDarkTheme ? colors?.themeDark : colors?.themeLight) || null
			);

			this._notificationPlaceholder.domElement.style.setProperty(
				"--themePrimary",
				colors?.themePrimary || null
			);
		}
	}
}
