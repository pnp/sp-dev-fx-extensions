
export interface IReturnEntity {
    'odata.metadata': string;
    'odata.etag': string;
    PartitionKey: string;
    RowKey: string;
    Timestamp: string;
    SubscriptionId: string | undefined;
    ExpirationDateTime: string | undefined;
}

 