import { IToast } from './IToast';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

interface IToastStatus {
	Id: number;
	Ack: Date;
}

interface IToastCache {
	Toasts: IToast[];
	Loaded?: Date;
	ToastStatuses: IToastStatus[];
}

export class ToastService {
	private static readonly storageKey: string = 'spfxToastr';
	private static readonly getFromListAlways: boolean = true; //useful for testing

	//***********************
	//Public Methods
	//***********************

	/** Retrieves toasts that should be displayed for the given user*/
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

	/** Stores the date/time a toast was acknowledged, used to control what shows on the next refresh 
	 * @param {number} id - The list ID of the toast to acknowledge
	*/
	public static acknowledgeToast(id: number): void {
		console.log('Toast Acknowledged: ' + id);
		let cachedData: IToastCache = ToastService.retrieveCache();

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
		ToastService.storeCache(cachedData);
	}

	
	//***********************
	//localStorage Management
	//***********************

	/** Rehydrates spfxToastr data from localStorage (or creates a new empty set) */
	private static retrieveCache(): IToastCache {
		//pull data from the localStorage if it is available and we previously cached it
		let cachedData: IToastCache = localStorage ? JSON.parse(localStorage.getItem(ToastService.storageKey)) : undefined;
		if (cachedData) {
			cachedData.Loaded = new Date(cachedData.Loaded); //rehydrate date from JSON
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
	private static storeCache(cachedData: IToastCache): void {
		//Cache the data into localStorage, if possible
		if(localStorage){
			localStorage.setItem(ToastService.storageKey, JSON.stringify(cachedData));
		}
	}


	//***********************
	//Toast Retrieval
	//***********************

	/** Retrieves toasts from either the cache or the list depending on the cache's freshness */
	private static ensureToasts(spHttpClient: SPHttpClient, baseUrl: string): Promise<IToast[]> {
		return new Promise<IToast[]>((resolve: (toasts: IToast[]) => void, reject: (error: any) => void): void => {
			
			let cachedData: IToastCache = ToastService.retrieveCache();

			if(cachedData.Loaded) {
				// True Cache found, check if it is stale
				//  Anything older than 2 minutes will be considered stale
				let now = new Date();
				let staleTime = new Date(now.getTime() + -2*60000);

				if(cachedData.Loaded > staleTime && !ToastService.getFromListAlways){
					console.log('Pulled from cache');
					resolve(ToastService.reduceToasts(cachedData.Toasts));
					return;
				}
			}

			if ((window as any).spfxToastrLoadingData) {

				// Toasts are already being loaded! Briefly wait and try again
				window.setTimeout((): void => {
					ToastService.ensureToasts(spHttpClient, baseUrl)
						.then((toasts: IToast[]): void => {
							resolve(toasts);
						});
				}, 100);

			} else {

				// Set a loading flag to prevent multiple data queries from firing
				//  This will be important should there be multiple consumers of the service on a single page
				(window as any).spfxToastrLoadingData = true;

				// Toasts need to be loaded, so let's go get them!
				ToastService.getToastsFromList(spHttpClient, baseUrl)
					.then((toasts: IToast[]): void => {
						console.log('pulled from the list');
						cachedData.Toasts = toasts;
						cachedData.Loaded = new Date(); //reset the cache timeout to now
						cachedData = ToastService.processCache(cachedData);

						ToastService.storeCache(cachedData);

						// Clear the loading flag
						(window as any).spfxToastrLoadingData = false;

						// Give them some toast!
						resolve(ToastService.reduceToasts(cachedData.Toasts));

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
	private static getToastsFromList(spHttpClient: SPHttpClient, baseUrl: string): Promise<IToast[]>{
		let now: string = new Date().toISOString();
		let filter: string = `(StartDate le datetime'${now}') and (EndDate ge datetime'${now}')`;
		return spHttpClient.get(`${baseUrl}/${ToastService.apiEndPoint}?$select=${ToastService.select}&$filter=${filter}&$orderby=${ToastService.orderby}`,SPHttpClient.configurations.v1)
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


	//***********************
	//Helper Functions
	//***********************

	/** Helper function to return the index of an IToastStatus object by the Id property */
	private static indexOfToastStatusById(Id: number, toastStatuses: IToastStatus[]): number {
		for (let i: number = 0; i < toastStatuses.length; i++){
			if (toastStatuses[i].Id == Id){
				return i;
			}
		}
		return -1;
	}

	/** Helper function to clean up the toast statuses by removing old toasts */
	private static processCache(cachedData: IToastCache): IToastCache {
		//setup a temporary array of Ids (makes the filtering easier)
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

	//Remove disabled, and already viewed from array
	private static reduceToasts(rawToasts: IToast[]): IToast[] {
		return rawToasts.filter((toast: IToast): boolean => {
			return toast.Enabled;
		});
	}
}