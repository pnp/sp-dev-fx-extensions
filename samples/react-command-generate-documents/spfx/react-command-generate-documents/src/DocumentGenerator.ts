import { sp, EmailProperties, Items, Item, Web } from "@pnp/sp";
import { HttpClient, AadHttpClient, IHttpClientOptions, HttpClientResponse } from '@microsoft/sp-http';

import { Guid } from "@microsoft/sp-core-library";
import { Dialog } from '@microsoft/sp-dialog';
class ReplacementParameters {
    public plainTextParameters: { replacementType: string, token: string, value: string }[];
    public constructor() {
        this.plainTextParameters = [];
    }
}
export default class DocumentGenerator {
    /**
     * 
     * @param aadHttpClient AadHhttpClient used to call the Azure function that generates the documents 
     * @param web  The SPWeb where the sharepoint lists containing the data to be put in the document can be found.
     * @param listId the listID of the main list containing the data to be put in the document can be found
     * @param itemId The ItemID of the item containing the data to be put in the document can be found
     * @param azureFunctionUrl  The url of the azure finction that populates the document template with data .
     * @param templateServerRelativeUrl the relative url of the word template (.docx) to use.
     * @param destinationFolderServerRelativeURL the relative folder where the final document (word or pdf) should be placed
     * @param temporaryFolderServerRelativeURL a temporary folder to use when generating PDFs (can be ommitted if SaveAsFormat is docx)
     * @param webServerRelativeURL the webServerRelative url of the templateServerRelativeUrl, destinationFolderServerRelativeURL and the temporaryFolderServerRelativeURL 
     * @param saveAsFormat  pdf or docx
     */
    public static async generateDocument(
        aadHttpClient: AadHttpClient,
        web: Web,
        listId: Guid,
        itemId: number,
        azureFunctionUrl: string,
        templateServerRelativeUrl: string,
        destinationFolderServerRelativeUrl: string,
        temporaryFolderServerRelativeUrl: string,
        webServerRelativeUrl: string,
        saveAsFormat: string): Promise<string> {
    
        var rp: ReplacementParameters = await this.getData(web, listId, itemId, new ReplacementParameters());
        var ifr = await web.lists.getById(listId.toString()).items.getById(itemId).get();
        var newFileName = ifr["Title"].replace(/\//g, "-").replace(":", "-");
        const body: string = JSON.stringify({
            'plainTextParameters': rp.plainTextParameters,
            "temporaryFolderServerRelativeUrl": temporaryFolderServerRelativeUrl,
            "webServerRelativeUrl": webServerRelativeUrl,
            'templateServerRelativeUrl': templateServerRelativeUrl,
            'destinationFolderServerRelativeUrl': destinationFolderServerRelativeUrl,
            'fileName': newFileName,
            "saveAsFormat": saveAsFormat
        });
        const requestHeaders: Headers = new Headers();
        requestHeaders.append('Content-type', 'application/json');
        return aadHttpClient.fetch(azureFunctionUrl,
            AadHttpClient.configurations.v1,
            {
                method: "POST",
                body: body,
                headers: requestHeaders,
            })
            .then((response: HttpClientResponse) => {
                if (response.status === 200) {
                    return response.json().then((responseObject) => {
                        debugger;
                        return responseObject.url;

                    });

                } else {
                    console.log(`Error http Reponse follows`);
                    console.log(response);
                    Dialog.alert(`Error-- Code: ${response.status} Message:${response.statusText}`);
                    return null;
                }

            }).catch((err) => {
                Dialog.alert(`an error occurred on the back-end server`);
                debugger;
                return null;
            });
    }

    public static async  PreviewPDF(
        aadHttpClient: AadHttpClient,
        web: Web,
        listId: Guid,
        itemId: number,
        azureFunctionUrl: string,
        templateServerRelativeUrl: string,
        destinationFolderServerRelativeUrl: string,
        temporaryFolderServerRelativeUrl: string,
        webServerRelativeUrl: string,
        saveAsFormat: string): Promise<string> {
        
        var rp: ReplacementParameters = await this.getData(web, listId, itemId, new ReplacementParameters());
        var ifr = await web.lists.getById(listId.toString()).items.getById(itemId).get();
        var newFileName = ifr["Title"].replace(/\//g, "-").replace(":", "-");
        const body: string = JSON.stringify({
            'plainTextParameters': rp.plainTextParameters,
            "temporaryFolderServerRelativeUrl": temporaryFolderServerRelativeUrl,
            "webServerRelativeUrl": webServerRelativeUrl,
            'templateServerRelativeUrl': templateServerRelativeUrl,
            'fileName': newFileName

        });
        const requestHeaders: Headers = new Headers();
        requestHeaders.append('Content-type', 'application/json');
        console.log(`About to make REST API request to function with URL ${azureFunctionUrl} `);
        return aadHttpClient.fetch(azureFunctionUrl,
            AadHttpClient.configurations.v1,
            {
                method: "POST",
                body: body,
                headers: requestHeaders,
            })
            .then((response: HttpClientResponse) => {
                if (response.status === 200) {
                    return response.json().then((responseObject) => {
                        debugger;
                        return responseObject.url;

                    });

                } else {
                    console.log(`http Reponse follows`);
                    console.log(response);
                    Dialog.alert(`Error-- Code: ${response.status} Message:${response.statusText}`);
                    return null;
                }

            }).catch((err) => {
                Dialog.alert(`an error occurred on the back-end server ${err}`);
                debugger;
                return null;
            });
    }

    public static async   getData(web: Web, listId: Guid, itemId: number, replacementParameters: ReplacementParameters): Promise<ReplacementParameters> {
        var ifr = await web.lists.getById(listId.toString()).items.getById(itemId)
        .expand('Author')
        .select('Title,Created,IsComplete,Author/Title')
        .get();
        replacementParameters.plainTextParameters.push({ "replacementType": "PlainText", "token": "ptTitle", "value": ifr.Title });
        replacementParameters.plainTextParameters.push({ "replacementType": "PlainText", "token": "ptCreated", "value": ifr.Created });
        replacementParameters.plainTextParameters.push({ "replacementType": "PlainText", "token": "ptAuthor", "value": ifr.Author.Title });
        var ifrAttachementFiles = await web.lists.getById(listId.toString()).items.getById(itemId).attachmentFiles.get();
      
        if (ifrAttachementFiles.length > 0) {
            replacementParameters.plainTextParameters.push({ "replacementType": "Image", "token": "pic1", "value": ifrAttachementFiles[0].ServerRelativeUrl+"XX" });
        }
        replacementParameters.plainTextParameters.push({ "replacementType": "PlainText", "token": "ptIsComplete", "value": ifr["IsComplete"] === "Yes" ? "☒" : "☐" });
        return replacementParameters;

    }

}