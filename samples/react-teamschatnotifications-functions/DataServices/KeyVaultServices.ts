import * as request from 'request-promise';
import { getEnviromentVariable } from '../Common/Utils';
import { IKeyVaultSecretResponse } from './IKeyVaultSecretResponse';
import { IKeyVaultCertificateResponse } from './IKeyVaultCertificateResponse';

const keyVaultUrl = getEnviromentVariable('KeyVaultUrl');
const msi_endpoint = getEnviromentVariable('MSI_ENDPOINT');
const msi_secret = getEnviromentVariable('MSI_SECRET');

async function getAzureMSIAccessToken(): Promise<string>{
  try {
    const URI: string = `${msi_endpoint}?resource=https://vault.azure.net&api-version=2017-09-01`;
    let options = {
      method: 'GET',
      uri: URI,
      headers: {
        'Secret': `${msi_secret}`
      }
    };
    const results = await request(options);
    const tokenJSON  = JSON.parse(results);
     return tokenJSON .access_token;
  } catch (error) {
    throw new Error(`Erro on Get Access Token: ${error.message}`);
  }
}

export  async function  getKeyVaultSecret(secretName:string): Promise<string>{
 try {
     const accessToken = await getAzureMSIAccessToken();
     const URI: string = `${keyVaultUrl}/secrets/${secretName}?api-version=7.0`;
     let options = {
       method: 'GET',
       uri: URI,
       headers: {
         'Content-Type': 'application/json',
         Accept: 'application/json',
         Authorization: `Bearer ${accessToken}`
       }
     };
     const results = await request(options);
     const secretResponse: IKeyVaultSecretResponse  = JSON.parse(results);
      return secretResponse.value;
    } catch (error) { 
      throw new Error(`Error get Key Vault Secret: ${error.message}`);
    }
}

export  async function  getKeyVaultCertificate(certificateName:string): Promise<string>{
    try {
      const accessToken = await getAzureMSIAccessToken();
         const URI: string = `${keyVaultUrl}/certificates/${certificateName}?api-version=7.0`;
         let options = {
           method: 'GET',
           uri: URI,
           headers: {
             'Content-Type': 'application/json',
             Accept: 'application/json',
             Authorization: `Bearer ${accessToken}`
           }
         };
         const results = await request(options);
         const certificateResponse: IKeyVaultCertificateResponse  = JSON.parse(results);
         return certificateResponse.cer;
       } catch (error) {
        throw new Error(`Error get Key Vault Certificate: ${error.message}`);
       }
   }