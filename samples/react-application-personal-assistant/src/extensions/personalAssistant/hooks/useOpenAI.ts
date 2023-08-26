import * as React from 'react';
import { HttpClient } from "@microsoft/sp-http";
import { OPENAI_API_KEY, OPENAI_API_ENDPOINT, GPT_MODELTO_USE } from '../constants/constants';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useOpenAI = (httpClient: HttpClient) => {

    const callOpenAI = React.useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (messages: any[], functions: any[]) => {
            try {

                const endpoint: string = OPENAI_API_ENDPOINT;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const requestHeaders: any = {};
                requestHeaders['Content-Type'] = 'application/json';
                // eslint-disable-next-line dot-notation
                requestHeaders['Authorization'] = `Bearer ${OPENAI_API_KEY}`;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const request: any = {};
                request.model = GPT_MODELTO_USE;
                request.messages = messages;
                request.functions = functions;
                /* 
                    "temperature": 0,
                    "max_tokens": 256,
                    "top_p": 1.0,
                    "frequency_penalty": 0.0,
                    "presence_penalty": 0.0
                 */

                request.temperature = 0;
                request.max_tokens = 256;
                request.top_p = 1.0;
                request.frequency_penalty = 0.0;
                request.presence_penalty = 0.0;

                const response = await httpClient.post(
                    endpoint,
                    HttpClient.configurations.v1,
                    {
                        headers: requestHeaders,
                        body: JSON.stringify(request)
                    }
                );

                console.log('response', response);

                if(!response.ok) {
                    console.error('Error:', response);
                    return undefined;
                }

                const result = await response.json();
                console.log('OpenAI API result - ', result);
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

    /* const callOpenAI_GPT35 = React.useCallback(
        async (messages: any[], functions: any[]) => {
            return await callOpenAI(messages, functions, "gpt-3.5-turbo-0613");
        },
        [callOpenAI]
    );

    const callOpenAI_GPT4 = React.useCallback(
        async (messages: any[], functions: any[]) => {
            return await callOpenAI(messages, functions, "gpt-4-0613");
        },
        [callOpenAI]
    ); */

    return { callOpenAI };
};