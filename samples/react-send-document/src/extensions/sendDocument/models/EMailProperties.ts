import { EMailAttachment } from ".";

export class EMailProperties {
    To: string;
    Subject: string;
    Body: string;
    Attachment?: EMailAttachment;

    constructor(options: EMailProperties) {
        this.To = options.To;
        this.Subject = options.Subject;
        this.Body = options.Body;
        this.Attachment = options.Attachment;
    }
}