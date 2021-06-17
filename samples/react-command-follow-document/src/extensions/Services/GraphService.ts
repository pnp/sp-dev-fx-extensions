import { AadHttpClient } from "@microsoft/sp-http";
import { ListViewCommandSetContext } from "@microsoft/sp-listview-extensibility";

export default class Graph {
  public async getGraphContent(
    graphQuery: string,
    context: ListViewCommandSetContext
  ) {
    // Using Graph here, but any 1st or 3rd party REST API that requires Azure AD auth can be used here.
    return new Promise<any>((resolve, reject) => {
      context.aadHttpClientFactory
        .getClient("https://graph.microsoft.com")
        .then((client: AadHttpClient) => {
          // Querys to Graph base on url
          return client.get(`${graphQuery}`, AadHttpClient.configurations.v1);
        })
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          resolve(json);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  }
}
