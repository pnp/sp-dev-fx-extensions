import Guid from '@microsoft/sp-core-library/lib/Guid';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

import { IToast } from './IToast';

interface IToastStatus {
	Id: number;
	Ack: Date;
}

interface IToastCache {
	Loaded?: Date;
	Toasts: IToast[];
	ToastStatuses: IToastStatus[];
}

/** Returns items from the Toast list and caches the results */
export class ToastService {
	private static readonly storageKeyBase: string = 'spfxToastr'; //Key used for localStorage
	private static readonly getFromListAlways: boolean = false; //Useful for testing


	//***********************
	//Public Methods
	//***********************

	/** Retrieves toasts that should be displayed for the given user*/
	public static getToasts(spHttpClient: SPHttpClient, baseUrl: string, webId: Guid): Promise<IToast[]> {
		return new Promise<IToast[]>((resolve: (toasts: IToast[]) => void, reject: (error: any) => void): void => {
			this.ensureToasts(spHttpClient, baseUrl, webId)
				.then((toasts: IToast[]): void => {
					resolve(toasts);
				}).catch((error: any): void => {
					reject(error);
				});
		});
	}

	/** Stores the date/time a toast was acknowledged, used to control what shows on the next refresh 
	 * @param {number} id - The list ID of the toast to acknowledge
	*/
	public static acknowledgeToast(id: number, webId: Guid): void {
		let cachedData: IToastCache = ToastService.retrieveCache(webId);

		// Check if the status already exists, and if so update it
		//  otherwise, add a new status for the id
		let index: number = ToastService.indexOfToastStatusById(id, cachedData.ToastStatuses);
		if (index >= 0) {
			cachedData.ToastStatuses[index].Ack = new Date();
		} else {
			cachedData.ToastStatuses.push({
				Id: id,
				Ack: new Date()
			});
		}
		ToastService.storeCache(cachedData, webId);
	}

	
	//***********************
	//localStorage Management
	//***********************

	private static webStorageKey(webId: Guid): string {
		return `${ToastService.storageKeyBase}_${webId}`;
	}

	/** Rehydrates spfxToastr data from localStorage (or creates a new empty set) */
	private static retrieveCache(webId: Guid): IToastCache {
		//Pull data from localStorage if available and we previously cached it
		let cachedData: IToastCache = localStorage ? JSON.parse(localStorage.getItem(this.webStorageKey(webId))) : undefined;
		if (cachedData) {
			cachedData.Loaded = new Date(cachedData.Loaded.valueOf()); //Rehydrate date from JSON (serializes to string)
		} else {
			//Initialize a new, empty object
			cachedData = {
				Toasts: [],
				ToastStatuses: []
			};
		}
		return cachedData;
	}

	/** Serializes spfxToastr data into localStorage */
	private static storeCache(cachedData: IToastCache, webId: Guid): void {
		//Cache the data in localStorage when possible
		if (localStorage) {
			localStorage.setItem(this.webStorageKey(webId), JSON.stringify(cachedData));
		}
	}


	//***********************
	//Toast Retrieval
	//***********************

	/** Retrieves toasts from either the cache or the list depending on the cache's freshness */
	private static ensureToasts(spHttpClient: SPHttpClient, baseUrl: string, webId: Guid): Promise<IToast[]> {
		return new Promise<IToast[]>((resolve: (toasts: IToast[]) => void, reject: (error: any) => void): void => {
			
			let cachedData: IToastCache = ToastService.retrieveCache(webId);

			if(cachedData.Loaded) {
				//True Cache found, check if it is stale
				// anything older than 2 minutes will be considered stale
				let now: Date = new Date();
				let staleTime: Date = new Date(now.getTime() + -2*60000);

				if (cachedData.Loaded > staleTime && !ToastService.getFromListAlways) {
					//console.log('Pulled toasts from localStorage');
					resolve(ToastService.reduceToasts(cachedData));
					return;
				}
			}

			if ((window as any).spfxToastrLoadingData) {
				//Toasts are already being loaded! Briefly wait and try again
				window.setTimeout((): void => {
					ToastService.ensureToasts(spHttpClient, baseUrl, webId)
						.then((toasts: IToast[]): void => {
							resolve(toasts);
						});
				}, 100);
			} else {
				//Set a loading flag to prevent multiple data queries from firing
				//  this will be important should there be multiple consumers of the service on a single page
				(window as any).spfxToastrLoadingData = true;

				//Toasts need to be loaded, so let's go get them!
				ToastService.getToastsFromList(spHttpClient, baseUrl)
					.then((toasts: IToast[]): void => {
						//console.log('Pulled toasts from the list');
						cachedData.Toasts = toasts;
						cachedData.Loaded = new Date(); //Reset the cache timeout
						cachedData = ToastService.processCache(cachedData);

						//Update the cache
						ToastService.storeCache(cachedData, webId);

						//Clear the loading flag
						(window as any).spfxToastrLoadingData = false;

						//Give them some toast!
						resolve(ToastService.reduceToasts(cachedData));
					}).catch((error: any): void => {
						reject(error);
					});
			}
		});
	}

	//Breaking up the URL like this isn't necessary, but can be easier to update
	private static readonly apiEndPoint: string = "_api/web/lists/getbytitle('Toast')/items";
	private static readonly select: string = "Id,Title,Severity,Frequency,Enabled,Message";
	private static readonly orderby: string = "StartDate asc";

	/** Pulls the active toast entries directly from the underlying list */
	private static getToastsFromList(spHttpClient: SPHttpClient, baseUrl: string): Promise<IToast[]> {
		//Toasts are only shown during their scheduled window
		let now: string = new Date().toISOString();
		let filter: string = `(StartDate le datetime'${now}') and (EndDate ge datetime'${now}')`;
		
		return spHttpClient.get(`${baseUrl}/${ToastService.apiEndPoint}?$select=${ToastService.select}&$filter=${filter}&$orderby=${ToastService.orderby}`,SPHttpClient.configurations.v1)
			.then((response: SPHttpClientResponse): Promise<{ value: IToast[] }> => {
				if (!response.ok) {
					//Failed requests don't automatically throw exceptions which
					// can be problematic for chained promises, so we throw one
					throw `Unable to get items: ${response.status} (${response.statusText})`;
				}
				return response.json();
			})
			.then((results: {value: IToast[]}) => {
				//Clean up extra properties
				// Even when your interface only defines certain properties, SP sends many
				// extra properties that you may or may not care about (we don't)
				// (this isn't strictly necessary but makes the cache much cleaner)
				let toasts:IToast[] = [];
				for (let v of results.value) {
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


	//***********************
	//Helper Functions
	//***********************

	/** Helper function to return the index of an IToastStatus object by the Id property */
	private static indexOfToastStatusById(Id: number, toastStatuses: IToastStatus[]): number {
		for (let i: number = 0; i < toastStatuses.length; i++) {
			if (toastStatuses[i].Id == Id) {
				return i;
			}
		}
		return -1;
	}

	/** Helper function to clean up the toast statuses by removing old toasts */
	private static processCache(cachedData: IToastCache): IToastCache {
		//Setup a temporary array of Ids (makes the filtering easier)
		let activeIds: number[] = [];
		for (let toast of cachedData.Toasts) {
			activeIds.push(toast.Id);
		}

		//only keep the status info for toast that still matter (active)
		cachedData.ToastStatuses = cachedData.ToastStatuses.filter((value: IToastStatus): boolean => {
			return activeIds.indexOf(value.Id) >= 0;
		});

		return cachedData;
	}

	/** Adjusts the toasts to display based on what the user has already acknowledged and the toast's frequency value*/
	private static reduceToasts(cachedData: IToastCache): IToast[] {
		return cachedData.Toasts.filter((toast: IToast): boolean => {
			if (!toast.Enabled) {
				//Disabled toasts are still queried so that their status isn't lost
				// however, they shouldn't be displayed
				return false;
			}

			let tsIndex: number = ToastService.indexOfToastStatusById(toast.Id, cachedData.ToastStatuses);
			if (tsIndex >= 0) {
				let lastShown: Date = new Date(cachedData.ToastStatuses[tsIndex].Ack.valueOf()); //Likely needs to be rehyrdated from JSON
				switch (toast.Frequency) {
					case 'Once':
						//Already shown
						return false;
					case 'Always':
						return true;
					default:
						//Default behavior is Once Per Day
						let now: Date = new Date();
						if (now.getFullYear() !== lastShown.getFullYear()
								|| now.getMonth() !== lastShown.getMonth()
								|| now.getDay() !== lastShown.getDay()) {
							//Last shown on a different day, so show it!
							return true;
						} else {
							//Already shown today
							return false;
						}
				}
			} else {
				//No previous status means it needs to be shown
				return true;
			}
		});
	}
}