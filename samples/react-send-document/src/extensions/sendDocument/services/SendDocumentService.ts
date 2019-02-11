import {
    MSGraphClientFactory,
    MSGraphClient
} from '@microsoft/sp-http';
import { IService, EMailProperties, Constants } from '../models';
import { Web } from '@pnp/sp';

export class SendDocumentService implements IService {
    webUri: string;
    msGraphClientFactory: MSGraphClientFactory;
    fileName: string;
    fileUri: string;

    private static instance: SendDocumentService;

    private constructor() {
    }

    static getInstance() {
        if (!SendDocumentService.instance) {
            SendDocumentService.instance = new SendDocumentService();
        }
        return SendDocumentService.instance;
    }

    /**
     *  PUBLIC METHODS
     */

    getFileContentAsBase64(fileUri: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let web = new Web(this.webUri);
            web.getFileByServerRelativeUrl(fileUri).getBuffer().then((buffer: ArrayBuffer) => {
                var base64 = this.base64ArrayBuffer(buffer);
                resolve(base64);
            })
                .catch((err) => {
                    reject(err);
                });
        });


    }

    sendEMail(emailProperties: EMailProperties): Promise<boolean | Error> {
        return new Promise((resolve, reject) => {

            this.msGraphClientFactory
                .getClient()
                .then((client: MSGraphClient) => {
                    client
                        .api(`${Constants.GRAPH_API_BASE_URI}${Constants.GRAPH_API_SEND_EMAIL_URI}`)
                        .post({
                            "message": {
                                "subject": emailProperties.Subject,
                                "body": {
                                    "contentType": "Text",
                                    "content": emailProperties.Body
                                },
                                "toRecipients": [
                                    {
                                        "emailAddress": {
                                            "address": emailProperties.To
                                        }
                                    }
                                ],
                                "attachments": [
                                    {
                                        "@odata.type": "#microsoft.graph.fileAttachment",
                                        "name": emailProperties.Attachment.FileName,
                                        "contentBytes": emailProperties.Attachment.ContentBytes
                                    }
                                ]
                            }
                        })
                        .then(() => {
                            resolve(true);
                        })
                        .catch((err) => {
                            reject(err);
                        })
                })
        });
    }

    /**
     *  ORIVATE METHODS
     */


    private base64ArrayBuffer(arrayBuffer) {
        var base64 = ''
        var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

        var bytes = new Uint8Array(arrayBuffer)
        var byteLength = bytes.byteLength
        var byteRemainder = byteLength % 3
        var mainLength = byteLength - byteRemainder

        var a, b, c, d
        var chunk

        // Main loop deals with bytes in chunks of 3
        for (var i = 0; i < mainLength; i = i + 3) {
            // Combine the three bytes into a single integer
            chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

            // Use bitmasks to extract 6-bit segments from the triplet
            a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
            b = (chunk & 258048) >> 12 // 258048   = (2^6 - 1) << 12
            c = (chunk & 4032) >> 6 // 4032     = (2^6 - 1) << 6
            d = chunk & 63               // 63       = 2^6 - 1

            // Convert the raw binary segments to the appropriate ASCII encoding
            base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
        }

        // Deal with the remaining bytes and padding
        if (byteRemainder == 1) {
            chunk = bytes[mainLength]

            a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

            // Set the 4 least significant bits to zero
            b = (chunk & 3) << 4 // 3   = 2^2 - 1

            base64 += encodings[a] + encodings[b] + '=='
        } else if (byteRemainder == 2) {
            chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

            a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
            b = (chunk & 1008) >> 4 // 1008  = (2^6 - 1) << 4

            // Set the 2 least significant bits to zero
            c = (chunk & 15) << 2 // 15    = 2^4 - 1

            base64 += encodings[a] + encodings[b] + encodings[c] + '='
        }

        return base64
    }
}

export default SendDocumentService.getInstance();