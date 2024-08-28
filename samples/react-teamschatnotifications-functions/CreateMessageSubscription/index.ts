import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import * as moment from 'moment';
import DataService from '../DataServices/AzureStorageTableService';
import { ISubscriptionResult } from '../DataServices/ISubscriptionResult';
import { IEntity } from '../DataServices/IEntity';
import { addSubscription, updateSubscription } from '../DataServices/MSGraphServices';
import { IReturnEntity } from '../DataServices/IReturnEntity';
import { getEnviromentVariable } from '../Common/Utils';

const azure_storage_uri = getEnviromentVariable('azure_storage_uri');
const azure_storage_sas = getEnviromentVariable('azure_storage_sas');
const table_name = getEnviromentVariable('TableName');

const dataService = new DataService(table_name, azure_storage_uri, azure_storage_sas);

const httpTrigger: AzureFunction = async function(context: Context, req: HttpRequest): Promise<void> {
  context.log('HTTP trigger function processed a request.');
  const chatId = req.query.chatId || (req.body && req.body.chatId);

  let _subscriptionId: string = '';
  let _subsResult: ISubscriptionResult = {} as ISubscriptionResult;
  let _entity: IEntity = {} as IEntity;
  if (chatId) {
    try {
      // Try to Get a Saved ChatId from Table Storage
      context.log('Trying create Subscription for chat id)', chatId);
      const _returnSubsEntity: IReturnEntity = await dataService.getEntity('TeamsChats', chatId);
      if (!_returnSubsEntity) {
        context.log('creating subscription');
        // New CHatId add subscriptions and add to Table Storage
        _subsResult = await addSubscription(chatId);
        context.log('subscription created', _subsResult.id);
      } else {
        // subs exist in Table , check expeiration Date
        _subscriptionId = _returnSubsEntity.SubscriptionId;
        const _expired: boolean = moment(_returnSubsEntity.ExpirationDateTime).isBefore(moment());
        // exprired ? Add new subscriptions
        if (_expired) {
          context.log('subscription experied, create new');
          _subsResult = await addSubscription(chatId);
        } else {
          // update subscriptions expiration date
          context.log('Update subscription');
          _subsResult = await updateSubscription(_subscriptionId);
        }
      }

      // update Table with new data
      _entity = {
        PartitionKey: 'TeamsChats',
        RowKey: chatId,
        SubscriptionId: _subsResult.id,
        ExpirationDateTime: _subsResult.expirationDateTime
      };
      context.log('entity', _entity);
      await dataService.insertOrUpdateEntity(_entity);

      context.res = {
        // status: 200, /* Defaults to 200 */
        body: { subscriptionId: _subsResult.id }
      };
    } catch (error) {
      context.log(error);
      context.res = {
        status: 400,
        body: JSON.stringify(error)
      };
    }
  } else {
    context.res = {
      status: 400,
      body: 'ChatId is Missing'
    };
  }
};

export default httpTrigger;
