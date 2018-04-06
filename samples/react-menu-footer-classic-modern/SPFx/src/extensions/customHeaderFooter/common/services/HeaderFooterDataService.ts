import IHeaderFooterData from '../model/IHeaderFooterData';
import ILink from '../model/ILink';

export default class HeaderFooterDataService {

    // Get the header/footer data from the specifed URL
    public static get (url: string): Promise<IHeaderFooterData | string> {

        return new Promise <IHeaderFooterData | string>((resolve, reject) => {

            fetch(url, {
                method: 'GET',
                headers: { "Accept": "application/json; odata=verbose" },
                credentials: 'same-origin'    // sends cookies, need for SharePoint AuthN
            })
            .then ((response) => {
                if (response.status === 200) {
                    // We have some data, now parse it
                    response.json().then((data: IHeaderFooterData) => {
                        // It parsed OK, fulfull the promise
                        resolve(data);
                    })
                    .catch((error) => {
                        // Bad news, couldn't parse the JSON
                        reject(`Error parsing header footer data`);
                    });
                } else {
                    // Bad news, the HTTP request failed
                    reject (`Error ${response.status} retrieving header footer data: ${response.statusText}`);
                }
            })
            .catch ((error) => {
                // Bad news, we couldn't even issue an HTTP request
                reject(`Error requesting header footer data`);
            });
            
        });
    }
}