import * as React from 'react';
import { HttpClient } from "@microsoft/sp-http";
import { ILine } from '../interfaces';

export const useTfL = (httpClient: HttpClient) => {

    const callTfL = React.useCallback(
        async (endpoint: string) => {
            try {

                const response = await httpClient.get(
                    endpoint,
                    HttpClient.configurations.v1
                );

                console.log('response', response);
                const result = await response.json();
                console.log('TfL API result - ', result);
                return result;
            } catch (error) {
                if (!DEBUG) {
                    console.error('Error:', error);
                }
                return undefined;
            }
        },
        [httpClient]
    );

    const getLineStatus = React.useCallback(
        async (lineId: string): Promise<ILine[]> => {
            return await callTfL(`https://api.tfl.gov.uk/Line/${lineId}/Status`) as ILine[];
        },
        [callTfL]
    );

    return { getLineStatus };
};