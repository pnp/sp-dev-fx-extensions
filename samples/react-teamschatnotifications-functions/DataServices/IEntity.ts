export interface IEntity {
    PartitionKey: string;
    RowKey: string;
    SubscriptionId: string | undefined;
    ExpirationDateTime: string | undefined;
  
  }