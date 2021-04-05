import "@pnp/sp/regional-settings/web";
import "@pnp/sp/webs";
import { SPComponentLoader } from "@microsoft/sp-loader";
import { sp } from "@pnp/sp";
import { IRegionalSettingsInfo } from "@pnp/sp/regional-settings";
const DEFAULT_PERSONA_IMG_HASH: string = "7ad602295f8386b7615b582d87bcc294";
const DEFAULT_IMAGE_PLACEHOLDER_HASH: string ="4a48f26592f4e1498d7a478a4c48609c";
const MD5_MODULE_ID: string = "8494e7d7-6b99-47b2-a741-59873e42f16f";
const PROFILE_IMAGE_URL: string = "/_layouts/15/userphoto.aspx?size=M&accountname=";

/**
 * Gets user photo
 * @param userId
 * @returns user photo
 */
export const getUserPhoto = async (userId): Promise<string> => {
  const personaImgUrl = PROFILE_IMAGE_URL + userId;
  const url: string = await getImageBase64(personaImgUrl);
  return url;
};

/**
 * Get MD5Hash for the image url to verify whether user has default image or custom image
 * @param url
 */
export const getMd5HashForUrl = async (url: string) => {
  return new Promise(async (resolve, reject) => {
    // tslint:disable-next-line: no-use-before-declare
    const library: any = await loadSPComponentById(MD5_MODULE_ID);
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
};

/**
 * Load SPFx component by id, SPComponentLoader is used to load the SPFx components
 * @param componentId - componentId, guid of the component library
 */
export const loadSPComponentById = async (componentId: string) => {
  return new Promise((resolve, reject) => {
    SPComponentLoader.loadComponentById(componentId)
      .then((component: any) => {
        resolve(component);
      })
      .catch((error) => {});
  });
};
/**
 * Gets image base64
 * @param pictureUrl
 * @returns image base64
 */
export const getImageBase64 = async (pictureUrl: string): Promise<string> => {

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
};

 export const  blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = _ => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
  });
};

export const zeroPad = (num, places) => {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
};

export const getSiteRegionalSettings = async (): Promise<
  IRegionalSettingsInfo
> => {
  try {
    const s = await sp.web.regionalSettings();
    return s;
  } catch (error) {
    console.error(error);
    Promise.reject(error);
  }
};


export const b64toBlob = async (b64Data:any, contentType:string, sliceSize?:number):Promise<Blob>  => {
  contentType = contentType || 'image/png';
  sliceSize = sliceSize || 512;

  let byteCharacters:string = atob(b64Data);
  let byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    let slice = byteCharacters.slice(offset, offset + sliceSize);

    let byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
    }

    let byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  let blob = new Blob(byteArrays, {type: contentType});
  return blob;
};

