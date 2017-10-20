import { GraphHttpClient, GraphHttpClientResponse } from '@microsoft/sp-http';
import { Log } from '@microsoft/sp-core-library';

export class MSGraph {
    public static async Get(graphClient: GraphHttpClient, url: string) {
        let values: any[] = [];
        while (true) {
            let response: GraphHttpClientResponse = await graphClient.get(url, GraphHttpClient.configurations.v1);
            // Check that the request was successful
            if (response.ok) {
                let result = await response.json();
                let nextLink = result["@odata.nextLink"];
                // Check if result is single entity or an array of results
                if (result.value && result.value.length > 0) {
                    values.push.apply(values, result.value);
                }
                result.value = values;
                if (nextLink) {
                    url = result["@odata.nextLink"].replace("https://graph.microsoft.com/", "");
                } else {
                    return result;
                }
            }
            else {
                // Reject with the error message
                let error = new Error(response.statusText);
                Log.error("Graph call", error);
                throw error;
            }
        }
    }

    public static async Patch(graphClient: GraphHttpClient, url: string, payload: object): Promise<boolean> {
        let response: GraphHttpClientResponse = await graphClient.fetch(url, GraphHttpClient.configurations.v1, {
            body: payload,
            method: "PATCH",
            headers: {
                "Content-Type": "image/jpeg"
            }
        });
        // Check that the request was successful
        if (response.ok) {
            return true;
        }
        else {
            // Reject with the error message
            let error = new Error(response.statusText);
            Log.error("Graph call", error);
            throw error;
        }
    }
}
