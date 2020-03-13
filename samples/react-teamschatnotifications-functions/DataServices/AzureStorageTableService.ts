import * as request from 'request-promise';
import { IReturnEntity } from './IReturnEntity';
import { IEntity } from './IEntity';

class DataService {
  constructor(private table_name: string, private azure_storage_uri: string, private azure_storage_sas: string) {}

  /**
   *  Create Table
   *
   * @returns {Promise<string>}
   * @memberof DataService
   */
  public async createTableIfNotExists(): Promise<string> {
    try {
      const tableExists: boolean = await this.checkIfTableExists();
      if (tableExists) {
        return this.table_name;
      } else {
        const URI: string = `${this.azure_storage_uri}/tables?${this.azure_storage_sas}`;
        let options = {
          method: 'POST',
          uri: URI,
          headers: {
            'Content-Type': 'application/json;odata=nometadata'
          },
          body: {
            TableName: this.table_name
          },
          json: true,
          resolveWithFullResponse: true
        };
        const results = await request(options);
        const tablesResult = JSON.parse(results);
        return tablesResult.table_name;
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   *  Check if Table Exists
   *
   * @returns {Promise<boolean>}
   * @memberof DataService
   */
  public async checkIfTableExists(): Promise<boolean> {
    try {
      const URI: string = `${this.azure_storage_uri}/tables?$filter=TableName eq '${this.table_name}'&${this.azure_storage_sas}`;
      let options = {
        method: 'GET',
        uri: URI,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      };
      const results = await request(options);
      const tablesResult = JSON.parse(results);
      return (tablesResult.value && tablesResult.value.length) > 0 ? true : false;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Insert Entity
   *
   * @param {IEntity} entity
   * @returns {Promise<IReturnEntity>}
   * @memberof DataService
   */
  public async insertEntity(entity: IEntity): Promise<IReturnEntity> {
    try {
      await this.createTableIfNotExists();

      const URI: string = `${this.azure_storage_uri}/${this.table_name}?${this.azure_storage_sas}`;
      let options = {
        method: 'POST',
        uri: URI,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: {
          PartitionKey: entity.PartitionKey,
          RowKey: entity.RowKey,
          SubscriptionId: entity.SubscriptionId,
          ExpirationDateTime: entity.ExpirationDateTime
        },
        json: true,
        resolveWithFullResponse: true
      };
      const results = await request(options);
      const entityAddedResult: IReturnEntity = JSON.parse(results);
      return entityAddedResult;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Insert or Upadate Entity
   *
   * @param {IEntity} entity
   * @returns {Promise<void>}
   * @memberof DataService
   */
  public async insertOrUpdateEntity(entity: IEntity): Promise<void> {
    try {
      await this.createTableIfNotExists();

      const URI: string = `${this.azure_storage_uri}/${this.table_name}(PartitionKey='${entity.PartitionKey}', RowKey='${entity.RowKey}')?${this.azure_storage_sas}`;
      let options = {
        method: 'PUT',
        uri: URI,
        headers: {
          'Content-Type': 'Application/json',
          Accept: 'Aplication/json'
        },
        body: {
          PartitionKey: entity.PartitionKey,
          RowKey: entity.RowKey,
          SubscriptionId: entity.SubscriptionId,
          ExpirationDateTime: entity.ExpirationDateTime
        },
        json: true,
        resolveWithFullResponse: true
      };
      const results = await request(options);
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   *  Update Entity
   *
   * @param {IEntity} entity
   * @returns {Promise<void>}
   * @memberof DataService
   */
  public async updateEntity(entity: IEntity): Promise<void> {
    try {
      await this.createTableIfNotExists();

      const URI: string = `${this.azure_storage_uri}/${this.table_name}(PartitionKey='${entity.PartitionKey}', RowKey='${entity.RowKey}')?${this.azure_storage_sas}`;
      let options = {
        method: 'PUT',
        uri: URI,
        headers: {
          'Content-Type': 'Application/json',
          Accept: 'Application/json',
          'if-match': '*'
        },
        body: {
          PartitionKey: entity.PartitionKey,
          RowKey: entity.RowKey,
          SubscriptionId: entity.SubscriptionId,
          ExpirationDateTime: entity.ExpirationDateTime
        },
        json: true,
        resolveWithFullResponse: true
      };
      const results = await request(options);
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Remove Entity
   *
   * @param {IEntity} entity
   * @returns {Promise<void>}
   * @memberof DataService
   */
  public async removeEntity(entity: IEntity): Promise<void> {
    try {
      await this.createTableIfNotExists();

      const URI: string = `${this.azure_storage_uri}/${this.table_name}(PartitionKey='${entity.PartitionKey}', RowKey='${entity.RowKey}')?${this.azure_storage_sas}`;
      let options = {
        method: 'DELETE',
        uri: URI,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      };
      const results = await request(options);
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   *  Get Entity by Partition and rowKey
   *
   * @param {string} partitionKey
   * @param {string} rowKey
   * @returns {Promise<IReturnEntity>}
   * @memberof DataService
   */
  public async getEntity(partitionKey: string, rowKey: string): Promise<IReturnEntity> {
    try {
      await this.createTableIfNotExists();

      const URI: string = `${this.azure_storage_uri}/${this.table_name}(PartitionKey='${partitionKey}', RowKey='${rowKey}')?${this.azure_storage_sas}`;
      console.log('URI', URI);
      let options = {
        method: 'GET',
        uri: URI,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
        
      };
      var results = await request(options);

      var entityResult: IReturnEntity = JSON.parse(results);
      return entityResult;
    } catch (error) {
        if (error.statusCode == 404){ // not found
            return entityResult = undefined;
        }
      throw new Error(error);
    }
  }

  /**
   *
   *  Get Entities from Table base on Query 
   *   accepts ODATA $filter and $select
   * @param {string} query
   * @returns {Promise<IReturnEntity[]>}
   * @memberof DataService
   */
  public async listEntities(query?: string): Promise<IReturnEntity[]> {
    try {
    let _query:string = '';
      await this.createTableIfNotExists();
      if (query){
        _query=`&$filter=${query}`;
      }
      const URI: string = `${this.azure_storage_uri}/${this.table_name}()?${this.azure_storage_sas}${_query}`;
      let options = {
        method: 'GET',
        uri: URI,
        headers: {
          'Content-Type': 'application/json;odata=nometadata',
          Accept: 'application/json'
        }
      };
      const results = JSON.parse(await request(options));
      const entitiesListResults: IReturnEntity[] = results.value;
      return entitiesListResults;
    } catch (error) {
      throw new Error(error);
    }
  }
}

export default DataService;
