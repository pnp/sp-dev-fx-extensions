
export class EMailAttachment {
    FileName: string;
    ContentBytes: string;

    constructor(options: EMailAttachment) {
        this.FileName = options.FileName;
        this.ContentBytes = options.ContentBytes;
    }
}