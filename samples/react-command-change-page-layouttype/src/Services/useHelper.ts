import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { useCallback } from 'react';

export const useHelper = (spHttpClient: SPHttpClient, webUrl: string) => {

    const getPageInfo = useCallback(async (pagePath: string) => {
        if (spHttpClient) {
            const pageInfo = (await spHttpClient.get(`${webUrl}/_api/web/GetFileByServerRelativeUrl('${pagePath}')/ListItemAllFields?$select=Title,ID,PageLayoutType`,
                SPHttpClient.configurations.v1)) as SPHttpClientResponse;
            const pageInfoJson: any = await pageInfo.json();
            return pageInfoJson;
        }
    }, [spHttpClient]);

    const updatePage = useCallback(async (listTitle: string, pageId: string, pageLayoutType: string) => {
        if (spHttpClient) {
            let finalPageLayoutType: string = pageLayoutType.toLowerCase() === "article" ? "Home" :
                pageLayoutType.toLowerCase() === "home" ? "Article" : "Unknown";
            if (finalPageLayoutType.toLowerCase() !== 'unknown') {
                const body: string = JSON.stringify({
                    'PageLayoutType': finalPageLayoutType
                });
                await spHttpClient.post(`${webUrl}/_api/web/lists/getByTitle('${listTitle}')/items(${pageId})`,
                    SPHttpClient.configurations.v1, {
                    headers: {
                        'Accept': 'application/json;odata=nometadata',
                        'Content-type': 'application/json;odata=nometadata',
                        'odata-version': '',
                        'IF-MATCH': '*',
                        'X-HTTP-Method': 'MERGE'
                    },
                    body: body
                });
            }
        }
    }, [spHttpClient]);

    return {
        getPageInfo,
        updatePage
    };
};