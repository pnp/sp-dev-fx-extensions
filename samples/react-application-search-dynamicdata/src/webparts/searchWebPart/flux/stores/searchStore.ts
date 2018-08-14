
import { IWebPartContext } from "@microsoft/sp-webpart-base";

import { SPHttpClient } from "@microsoft/sp-http";
import { EventEmitter } from "fbemitter";
import { ICells, ICellValue } from "../../utils/ISearchResults";
import appDispatcher from "../dispatcher/appDispatcher";
import searchActionIDs from "../actions/searchActionIDs";
import SearchTokenHelper from "../helpers/SearchTokenHelper";

const CHANGE_EVENT: string = "change";

export class SearchStoreStatic extends EventEmitter {
	private _results: any[] = [];
	private _url: string;
	private _response: any;

	/**
	 * @param {function} callback
	 */
	public addChangeListener(callback): void {
		this.addListener(CHANGE_EVENT, callback);
    }

	/**
	 * @param {function} callback
	 */
    public removeChangeListener(callback): void {
		this.removeCurrentListener();
    }

    public emitChange(): void {
        this.emit(CHANGE_EVENT);
    }

	public getSearchResults(): ICells[] {
		return this._results;
	}

	public setSearchResults(crntResults: ICells[], fields: string): void {
		if (crntResults.length > 0) {
			const flds: string[] = fields.toLowerCase().split(",");
			const temp: any[] = [];
			crntResults.forEach((result) => {
				// Create a temp value
				var val: Object = {};
				result.Cells.forEach((cell: ICellValue) => {
					if (flds.indexOf(cell.Key.toLowerCase()) !== -1) {
						// Add key and value to temp value
						val[cell.Key] = cell.Value;
					}
				});
				// Push this to the temp array
				temp.push(val);
			});
			this._results = temp;
		} else {
			this._results = [];
		}
	}

	/**
	 * @param {IWebPartContext} context
	 * @param {string} url
	 */
	public GetSearchData (context: IWebPartContext, url: string): Promise<any> {
		return context.spHttpClient.get(url, SPHttpClient.configurations.v1).then((res: any) => {
			return res.json();
		});
	}

	/**
	 * @param {string} value
	 */
	public isEmptyString (value: string): boolean {
		return value === null || typeof value === "undefined" || !value.length;
	}

	/**
	 * @param {any} value
	 */
	public isNull (value: any): boolean {
		return value === null || typeof value === "undefined";
	}

	public setLoggingInfo(url: string, response: any) {
		this._url = url;
		this._response = response;
	}

	public getLoggingInfo(): any {
		return {
			URL: this._url,
			Response: this._response
		};
	}
}

const searchStore: SearchStoreStatic = new SearchStoreStatic();

appDispatcher.register((action) => {
	switch (action.actionType) {
		case searchActionIDs.SEARCH_GET:
		debugger;
			const tokenHelper:SearchTokenHelper = new SearchTokenHelper();
			let url: string = action.context.pageContext.web.absoluteUrl + "/_api/search/query?querytext=";
			// Check if a query is provided
			url += !searchStore.isEmptyString(action.query) ? `'${tokenHelper.replaceTokens(action.query, action.context)}'` : "'*'";
			// Check if there are fields provided
			url += '&selectproperties=';
			url += !searchStore.isEmptyString(action.fields) ? `'${action.fields}'` : "'path,title,ModifiedOWSDATE,EditorOWSUSER,Fileextension'";
			// Add the rowlimit
			url += "&rowlimit=";
			url += !searchStore.isNull(action.maxResults) ? action.maxResults : 10;
			url += "&clienttype='ContentSearchRegular'";

			searchStore.GetSearchData(action.context, url).then((res: any) => {
				searchStore.setLoggingInfo(url, res);
				let resultsRetrieved:boolean = false;
				if (res !== null) {
					if (typeof res.PrimaryQueryResult !== 'undefined') {
						if (typeof res.PrimaryQueryResult.RelevantResults !== 'undefined') {
							if (typeof res.PrimaryQueryResult.RelevantResults !== 'undefined') {
								if (typeof res.PrimaryQueryResult.RelevantResults.Table !== 'undefined') {
									if (typeof res.PrimaryQueryResult.RelevantResults.Table.Rows !== 'undefined') {
										if ( res.PrimaryQueryResult.RelevantResults.Table.Rows.length >0) {
										resultsRetrieved = true;
										searchStore.setSearchResults(res.PrimaryQueryResult.RelevantResults.Table.Rows, "path,title,ModifiedOWSDATE,EditorOWSUSER,Fileextension");
									}}
								}
							}
						}
					}
				}

				// Reset the store its search result set on error
				if (!resultsRetrieved) {
					searchStore.setSearchResults([], null);
				}
				searchStore.emitChange();
			});

			break;
	}
});


export default searchStore;