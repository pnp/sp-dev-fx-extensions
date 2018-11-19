export interface IMailMessage {
    message: {
        subject: string;
        body: {
            contentType: string;
            content: string;
        },
        toRecipients: IRecipient[],
        impotance?: string,
        attachments?: IAttachment[]
    };
    saveToSentItems: boolean;
}

export interface IRecipient {
    emailAddress: {
        address: string;
    }
}

export interface IAttachment {
    "@odata.type": string,
    name: string,
    contentBytes: string
}