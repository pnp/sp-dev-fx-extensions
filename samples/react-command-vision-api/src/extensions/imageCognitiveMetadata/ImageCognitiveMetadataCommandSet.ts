import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import { Dialog } from '@microsoft/sp-dialog';
import { SPHttpClient, ISPHttpClientOptions, SPHttpClientResponse, IHttpClientOptions, HttpClientResponse, HttpClient } from '@microsoft/sp-http';

import * as strings from 'ImageCognitiveMetadataCommandSetStrings';

import { ICognitiveServicesImage, Metadata, Description, Tag, Color, Caption } from './ICognitiveServicesImage';
import CognitiveServicesImageDialog from './components/CognitiveServicesImageDialog';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IImageCognitiveMetadataCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
  sampleTextTwo: string;
}

const LOG_SOURCE: string = 'ImageCognitiveMetadataCommandSet';
const GET_TAGS_COMMAND: string = "GET_TAGS_COMMAND";

export default class ImageCognitiveMetadataCommandSet extends BaseListViewCommandSet<IImageCognitiveMetadataCommandSetProperties> {

  private cognitiveServicesKey: string = '';
  private cognitiveServicesVisionUrl: string = `https://westus.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=Adult,Categories,Color,Description,Faces,ImageType,Tags`;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized ImageCognitiveMetadataCommandSet');

    // Getting Vision API Key from Tenant Properties (First Release only: https://docs.microsoft.com/en-us/sharepoint/dev/spfx/tenant-properties)
    if (this.cognitiveServicesKey === '') {
      this.context.spHttpClient.get(`${this.context.pageContext.web.absoluteUrl}/_api/web/GetStorageEntity('VisionAPIKey')`, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        response.json().then((responseJson: any) => {
          //console.log(LOG_SOURCE, responseJson);
          this.cognitiveServicesKey = responseJson.Value;
        });
      });
    }

    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    this._enableCommandWhenItemIsSelected(event);
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case GET_TAGS_COMMAND:

        Log.info(LOG_SOURCE, GET_TAGS_COMMAND);

        const imageInfoUrl = event.selectedRows[0].getValueByName('.spItemUrl') + '&$select=@content.downloadUrl';

        this._visionApiAnalyse(imageInfoUrl)
          .then((image: ICognitiveServicesImage) => {
            //console.log(image);
            //Dialog.alert(tags.map(tag => { return tag.name; }).join(', '));
            const dialog: CognitiveServicesImageDialog = new CognitiveServicesImageDialog();
            dialog.image = image;
            dialog.show();
          })
          .catch(error => {
            console.log(error);
            Dialog.alert(`Error getting data. Ex: ${error}`);
          });

        break;
      default:
        throw new Error('Unknown command');
    }
  }

  private _enableCommandWhenItemIsSelected(event: IListViewCommandSetListViewUpdatedParameters): void {
    const compareOneCommand: Command = this.tryGetCommand(GET_TAGS_COMMAND);
    if (compareOneCommand) {
      compareOneCommand.visible = event.selectedRows.length === 1;
    }
  }

  private async _getDownloadUrl(imageInfoUrl: string): Promise<string> {
    const imageInfoOptions: ISPHttpClientOptions = { };
    const response: SPHttpClientResponse = await this.context.spHttpClient.fetch(imageInfoUrl, SPHttpClient.configurations.v1, imageInfoOptions);
    const responseJson: any = await response.json();
    const imageDownloadUrl: string = responseJson['@content.downloadUrl'];

    return imageDownloadUrl;
  }

  private async _visionApiAnalyse(imageInfoUrl: string): Promise<ICognitiveServicesImage> {
    const downloadUrl: string = await this._getDownloadUrl(imageInfoUrl);
    const httpOptions: IHttpClientOptions = this._prepareHttpOptionsForVisionApi(downloadUrl);

    const cognitiveResponse: HttpClientResponse = await this.context.httpClient.post(this.cognitiveServicesVisionUrl, HttpClient.configurations.v1, httpOptions);

    if (!cognitiveResponse.ok) {
      throw new Error("Invalid image. Ensure the Image size is not too big");
    }

    const cognitiveResponseJSON: any = await cognitiveResponse.json();

    return this._toCognitiveServicesImage(cognitiveResponseJSON);
  }

  private _toCognitiveServicesImage(json: any): ICognitiveServicesImage {
    const metadata: Metadata = {
      width: json.metadata.width,
      height: json.metadata.height,
      format: json.metadata.format
    };

    const description: Description = {
      tags: json.description.tags,
      captions: json.description.captions.map(item => {
        const caption: Caption = {
          text: item.text,
          confidence: item.confidence
        };
        return caption;
      })
    };

    const color: Color = {
      dominantColorForeground: json.color.dominantColorForeground,
      dominantColorBackground: json.color.dominantColorBackground,
      accentColor: json.color.accentColor
    };

    const image: ICognitiveServicesImage = {
      requestId: json.requestId,
      metadata: metadata,
      description: description,
      color: color
    };

    return image;
  }

  private _prepareHttpOptionsForVisionApi(imageDownloadUrl: string): IHttpClientOptions {
    const body: string = JSON.stringify({
      'Url': imageDownloadUrl
    });

    const httpOptions: IHttpClientOptions = {
      body: body,
      headers: this._prepareHeadersForVisionApi()
    };

    return httpOptions;
  }

  private _prepareHeadersForVisionApi(): Headers {
    const requestHeaders: Headers = new Headers();
    requestHeaders.append('Content-type', 'application/json');
    requestHeaders.append('Cache-Control', 'no-cache');
    requestHeaders.append('Ocp-Apim-Subscription-Key', this.cognitiveServicesKey);

    return requestHeaders;
  }

}
