import * as moment from "moment";
import { graph } from "@pnp/graph";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import {
  MSGraphClient,
  SPHttpClient,
  SPHttpClientResponse,
  HttpClient,
  HttpClientResponse
} from "@microsoft/sp-http";
import { IChat } from "../entities/IChat";
import { ISubAddResult } from "../entities/ISubAddResult";
import { IChatMember } from "../entities/IChatMember";
import * as constants from "../common/constants";
import { sp } from "@pnp/pnpjs";
import { SPComponentLoader } from "@microsoft/sp-loader";
import * as $ from "jquery";
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import { IChatMessage } from "../entities/IChatMessage";

export default class spservices {
  private static _graphClient: MSGraphClient = null;
  private static _currentUser: string = undefined;
  private static _context: ApplicationCustomizerContext = undefined;
  private static _functionAppUrl: string;

  public static init(
    context: ApplicationCustomizerContext,
    functionAppUrl: string
  ) {
    /*
    Initialize MSGraph
    */
    this._context = context;
    this._functionAppUrl = functionAppUrl;

    console.log("context", this._context);
    sp.setup({
      spfxContext: this._context
    });
    graph.setup({
      spfxContext: this._context
    });
    this._currentUser = this._context.pageContext.user.email;
  }

  /**
   *  Get Chat Members
   *
   * @param {string} chatId
   * @returns {Promise<IChatMember[]>}
   * @memberof spservices
   */
  public static async getChatMembers(chatId: string): Promise<IChatMember[]> {
    let chatMembers: IChatMember[] = [];
    try {
      this._graphClient = await this._context.msGraphClientFactory.getClient();
      const results = await this._graphClient
        .api(`me/chats/${chatId}/members`)
        .version("beta")
        .get();
      return (chatMembers = results.value);
    } catch (error) {
      console.log(error);
      throw new Error(`Error Get Chat Members: ${error.message}`);
    }
    return null;
  }

  /**
   *  Get Chat Message
   *
   * @param {string} URI
   * @memberof spservices
   */
  public static async getChatMessage(URI: string): Promise<IChatMessage> {
    try {
      this._graphClient = await this._context.msGraphClientFactory.getClient();
      const chatMessage: IChatMessage = await this._graphClient
        .api(`me/${URI}`)
        .version("beta")
        .get();
      return chatMessage;
    } catch (error) {
      console.log(error);
      throw new Error(`Error Getting Chat Message ${error.message}`);
    }
    return;
  }

  /**
   * create subscriptions to chat messages
   * resource : /chat/<chatid>/messages
   *
   * @param {string} chatId
   * @memberof spservices
   */
  public static async createMessageSubs(chatId: string): Promise<string> {
    try {
      //const restUrl = `https://teamschatfunctions.azurewebsites.net/api/CreateChatMessageWebhook?code=dYGa5wrsdmSjB8xEndbbXbCt/9Yx6I4JQxIaPxE6e6iQv3XtLnpgFA==&chatId=${chatId}`;
      // const restUrl = `https://teamschatfunctions.azurewebsites.net/api/CreateMessageSubscription?chatId=${chatId}`;
      const restUrl = `${this._functionAppUrl}/api/CreateMessageSubscription?chatId=${chatId}`;
      const response: HttpClientResponse = await this._context.httpClient.fetch(
        restUrl,
        HttpClient.configurations.v1,
        {
          method: "GET"
        }
      );
      const results = await response.json();
      return results.subscriptionId;
    } catch (error) {
      console.log('error');
      throw new Error(`Error creating Chat Message Subscriptions : ${error.message}`);
    }
  }

  /**
   * Get User Chats
   *
   * @returns {Promise<IChat[]>}
   * @memberof spservices
   */
  public static async getChats(): Promise<IChat[]> {
    let chats: IChat[] = [];

    let currentDate = moment().toISOString();
    let startDate = moment()
      .subtract(60, "days")
      .toISOString(); // load 2 months of chats

    try {
      this._graphClient = await this._context.msGraphClientFactory.getClient();
      let returnChats: any = await this._graphClient
        .api(`me/chats`)
        .filter(
          `lastUpdatedDateTime ge ${startDate} and lastUpdatedDateTime le ${currentDate}`
        )
        .version("beta")
        .get();
      // Get user chats
      //
      chats = returnChats.value;
    } catch (error) {
      console.log(error);
      throw new Error(`Error getting users Chats: ${error.message}`);
    }

    return chats;
  }

  public static async getHostedContentImage(uri: string): Promise<any> {
    return new Promise(async (resolve, rejected) => {
      try {

        const accesstoken = await this._context.aadTokenProviderFactory.getTokenProvider();
        const token = await accesstoken.getToken("https://graph.microsoft.com");

        const body = await $.ajax({
          url: uri,
          method: "GET",
          crossDomain: true,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          xhrFields: {
            responseType: "blob"
          }
        });

        let reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(body);
      } catch (error) {
        console.log(error);
        resolve(null);
      }
    });
  }

  /**
   * Gets user
   * @param userId
   * @returns user
   */
  public static async getUser(userId: string): Promise<any> {
    try {
      const user: any = await graph.users.getById(userId).get();
      return user;
    } catch (error) {
      console.log("error get user info", error);
      throw new Error(`error get user info, ${error.message}`);
    }
  }


  /**
   * Gets user photo
   * @param userId
   * @returns user photo
   */
  public static async getUserPhoto(userId): Promise<string> {
    const personaImgUrl = constants.PROFILE_IMAGE_URL + userId;
    const url: string = await this.getImageBase64(personaImgUrl);
    const newHash = await this.getMd5HashForUrl(url);

    if (
      newHash !== constants.DEFAULT_PERSONA_IMG_HASH &&
      newHash !== constants.DEFAULT_IMAGE_PLACEHOLDER_HASH
    ) {
      return "data:image/png;base64," + url;
    } else {
      return "undefined";
    }
  }

  /**
   * Get MD5Hash for the image url to verify whether user has default image or custom image
   * @param url
   */
  private static getMd5HashForUrl(url: string) {
    return new Promise(async (resolve, reject) => {
      const library: any = await this.loadSPComponentById(
        constants.MD5_MODULE_ID
      );
      try {
        const md5Hash = library.Md5Hash;
        if (md5Hash) {
          const convertedHash = md5Hash(url);
          resolve(convertedHash);
        }
      } catch (error) {
        resolve(url);
      }
    });
  }

  /**
   * Load SPFx component by id, SPComponentLoader is used to load the SPFx components
   * @param componentId - componentId, guid of the component library
   */
  private static loadSPComponentById(componentId: string) {
    return new Promise((resolve, reject) => {
      SPComponentLoader.loadComponentById(componentId)
        .then((component: any) => {
          resolve(component);
        })
        .catch(error => {
          console.log("Error load component from library", error);
        });
    });
  }
  /**
   * Gets image base64
   * @param pictureUrl
   * @returns image base64
   */
  private static getImageBase64(pictureUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let image = new Image();
      image.addEventListener("load", () => {
        let tempCanvas = document.createElement("canvas");
        (tempCanvas.width = image.width),
          (tempCanvas.height = image.height),
          tempCanvas.getContext("2d").drawImage(image, 0, 0);
        let base64Str;
        try {
          base64Str = tempCanvas.toDataURL("image/png");
        } catch (e) {
          return "";
        }
        base64Str = base64Str.replace(/^data:image\/png;base64,/, "");
        resolve(base64Str);
      });
      image.src = pictureUrl;
    });
  }
}
