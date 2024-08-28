import { AzureFunction, Context } from '@azure/functions';
import { getEnviromentVariable } from '../Common/Utils';
import DataService from '../DataServices/AzureStorageTableService';
import * as moment from 'moment';
import { addSubscription, updateSubscription } from '../DataServices/MSGraphServices';
import { IReturnEntity } from '../DataServices/IReturnEntity';
import { ISubscriptionResult } from '../DataServices/ISubscriptionResult';
import { IEntity } from '../DataServices/IEntity';

const azure_storage_uri = getEnviromentVariable('azure_storage_uri');
const azure_storage_sas = getEnviromentVariable('azure_storage_sas');
const table_name = getEnviromentVariable('TableName');
const dataService = new DataService(table_name, azure_storage_uri, azure_storage_sas);

const timerTrigger: AzureFunction = async function(context: Context, myTimer: any): Promise<void> {
  let timeStamp = new Date().toISOString();

  if (myTimer.IsPastDue) {
    context.log('Timer function is running late!');
  }
  try {
    const _subsEntities: IReturnEntity[] = await dataService.listEntities();
    if (_subsEntities && _subsEntities.length > 0) {
      for (const _subsEntity of _subsEntities) {
        // se subscription expired or will be expired in 15 mins
        // renew subscriptions
        const _expired: boolean = moment(_subsEntity.ExpirationDateTime).isBefore(moment());
        if (_expired) {
          const _subsResult: ISubscriptionResult = await addSubscription(_subsEntity.RowKey);
          let _entity: IEntity = {
            PartitionKey: 'TeamsChats',
            RowKey: _subsEntity.RowKey,
            SubscriptionId: _subsResult.id,
            ExpirationDateTime: _subsResult.expirationDateTime
          };
          await dataService.insertOrUpdateEntity(_entity);
          context.log(
            `Renew Subscriptions:  created new Id: ${_subsEntity.SubscriptionId}  expired DateTime: ${_subsResult.expirationDateTime}`
          );
        } else {
          const _willExpired: boolean = moment(_subsEntity.ExpirationDateTime).isBefore(moment().subtract(15, 'minute'));
          if (_willExpired) {
            const _subsResult: ISubscriptionResult = await updateSubscription(_subsEntity.SubscriptionId);
            let _entity: IEntity = {
              PartitionKey: 'TeamsChats',
              RowKey: _subsEntity.RowKey,
              SubscriptionId: _subsResult.id,
              ExpirationDateTime: _subsResult.expirationDateTime
            };
            await dataService.insertOrUpdateEntity(_entity);
            context.log(`Renew Subscriptions Id ${_subsEntity.SubscriptionId} new expired DateTime: ${_subsResult.expirationDateTime}`);
          }
        }
      }
    }
  } catch (error) {
    context.log(`Renew Subs : ${error}`);
  }

  context.log('Timer trigger function ran!', timeStamp);
};

export default timerTrigger;
