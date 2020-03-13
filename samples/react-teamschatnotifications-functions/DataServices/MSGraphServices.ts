import * as request from 'request-promise';
import * as moment from 'moment';
import { ISubscriptionResult } from './ISubscriptionResult';
import { IAADToken } from './IAADToken';
import { isContext } from 'vm';
import { getEnviromentVariable } from '../Common/Utils';
import { getKeyVaultSecret, getKeyVaultCertificate } from './KeyVaultServices';
import * as nodeRSA from 'node-rsa';

const keyVaultClientIdSecretName: string = getEnviromentVariable('KeyVault_ClientId_Secret_Name');
const keyVaultClientSecretSecretName: string = getEnviromentVariable('KeyVault_ClientSecret_Secret_Name');
const keyVaultEncriptionCertificateSecretName:string = getEnviromentVariable('KeyVault_EncriptionCertificate_Secret_Name');
const chatMessageNotificationURL:string = getEnviromentVariable('chatMessageNotificationURL');

//const encryptionCertificate = getEnviromentVariable('encryptioncertificate');
const tenantId = getEnviromentVariable('TenantId');
/**
 *  Get Access Token to MSGraph
 *
 * @returns {Promise<string>}
 */
export async function getAccessToken(): Promise<string> {
  try {
    const clientId: string = await getKeyVaultSecret(keyVaultClientIdSecretName);
    const clientSecret: string = await getKeyVaultSecret(keyVaultClientSecretSecretName);
    let options = {
      method: 'POST',
      uri: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      // uri: 'https://login.microsoftonline.com/a0cb7b70-2a99-4bf1-b92a-ee32ca12fb3d/oauth2/v2.0/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: {
        grant_type: 'client_credentials',
        client_id: `${clientId}`,
        client_secret: `${clientSecret}`,
        scope: 'https://graph.microsoft.com/.default'
      }
    };
    const results = await request(options);
    const aadToken: IAADToken = JSON.parse(results);
    return aadToken.access_token;
  } catch (error) {
    throw new Error(`Error getting MSgraph token: ${error.message}`);
  }
}

/**
 * Create subscriptionsfor Chat Message
 *
 * @param {string} chatId
 * @returns {Promise<ISubscriptionAddResult>}
 */
export async function addSubscription(chatId: string): Promise<ISubscriptionResult> {
  let accessToken = await getAccessToken();
  const encryptionCertificate = await getKeyVaultSecret(keyVaultEncriptionCertificateSecretName);
  try {
    let options = {
      method: 'POST',
      uri: 'https://graph.microsoft.com/beta/subscriptions',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },

      body: JSON.stringify({
        changeType: 'created,updated',
        notificationUrl: chatMessageNotificationURL,
        resource: `/chats/${chatId}/messages`,
        expirationDateTime: moment()
          .add(55, 'minutes')
          .toISOString(),
        clientState: `${chatId}`,
        encryptionCertificate: encryptionCertificate,
        encryptionCertificateId: 'teamsChat',
        includeResourceData: true
      })
    };
    const results = await request(options);
    return JSON.parse(results);
  } catch (error) {
    throw new Error(`Error adding Subscriptions: ${error.message}`);
  }
}

/**
 *   Update Web hook expiration date and time
 *
 * @export
 * @param {string} subscriptionId
 * @returns {Promise<ISubscriptionResult>}
 */
export async function updateSubscription(subscriptionId: string): Promise<ISubscriptionResult> {
  let accessToken = await getAccessToken();

  try {
    let options = {
      method: 'PATCH',
      uri: `https://graph.microsoft.com/beta/subscriptions/${subscriptionId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },

      body: JSON.stringify({
        expirationDateTime: moment()
          .add(55, 'minutes')
          .toISOString()
      })
    };

    const results = await request(options);
    return JSON.parse(results);
  } catch (error) {
    throw new Error(`Error on updating subscriptions: ${error.message}`);
  }
}
