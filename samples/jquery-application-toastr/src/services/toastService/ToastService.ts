import { IToast } from './IToast';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

interface IToastCache {
	Toasts: IToast[];
	Loaded?: Date;
}

export class ToastService {
	private static storageKey: string = 'spfxToastr';

	public static getToasts(spHttpClient: SPHttpClient, baseUrl: string): Promise<IToast[]> {
		return new Promise<IToast[]>((resolve: (toasts: IToast[]) => void, reject: (error: any) => void): void => {
			this.ensureToasts(spHttpClient, baseUrl)
				.then((toasts: IToast[]): void => {
					resolve(toasts);
				}).catch((error: any): void => {
					reject(error);
				});
		});
	}

	private static ensureToasts(spHttpClient: SPHttpClient, baseUrl: string): Promise<IToast[]> {
		return new Promise<IToast[]>((resolve: (toasts: IToast[]) => void, reject: (error: any) => void): void => {
			let cachedData: IToastCache = localStorage ? JSON.parse(localStorage.getItem(ToastService.storageKey)) : undefined;

			if(cachedData) {
				//Cache found, use it!
				console.log('Pulled from cache');
				resolve(cachedData.Toasts);
				return;
			} else {
				//Initialize the object
				cachedData = {
					Toasts: []
				};
			}

			if ((window as any).spfxToastrLoadingData) {
				// Toasts are already being loaded, briefly wait and try again
				window.setTimeout((): void => {
					ToastService.ensureToasts(spHttpClient, baseUrl)
						.then((toasts: IToast[]): void => {
							resolve(toasts);
						});
				}, 100);
			} else {
				(window as any).spfxToastrLoadingData = true;
				// Toasts need to be loaded, so let's go get them!
				ToastService.getToastsFromList(spHttpClient, baseUrl)
					.then((toasts: IToast[]): void => {
						console.log('pulled from the list');
						cachedData.Toasts = toasts;
						cachedData.Loaded = new Date();
						//TODO: Root out disabled from toasts
						//TODO: Root out status from missing entries
						if(localStorage){
							localStorage.setItem(ToastService.storageKey, JSON.stringify(cachedData));
						}

						resolve(cachedData.Toasts);

						(window as any).spfxToastrLoadingData = false;
					}).catch((error: any): void => {
						reject(error);
					});
			}
		});
	}

	private static getToastsFromList(spHttpClient: SPHttpClient, baseUrl: string): Promise<IToast[]>{
		return spHttpClient.get(`${baseUrl}/_api/web/lists/getbytitle('Toast')/items?$select=Id,Title,Severity,Frequency,Enabled,Message`,SPHttpClient.configurations.v1)
			.then((response: SPHttpClientResponse): Promise<{ value: IToast[] }> => {
				if(!response.ok) {
					throw `Unable to get items: ${response.status} (${response.statusText})`;
				}
				return response.json();
			})
			.then((results: {value: IToast[]}) => {
				//Clean up extra properties
				let toasts:IToast[] = [];
				for (let v of results.value){
					toasts.push({
						Title: v.Title,
						Id: v.Id,
						Severity: v.Severity,
						Frequency: v.Frequency,
						Enabled: v.Enabled,
						Message: v.Message
					});
				}
				return toasts;
			});
	}
}