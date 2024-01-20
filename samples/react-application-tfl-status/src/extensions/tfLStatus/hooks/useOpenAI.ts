import * as React from 'react';
import { HttpClient } from "@microsoft/sp-http";
import { OPENAI_API_KEY, OPENAI_API_ENDPOINT, GPT_MODELTO_USE } from '../constants/constants';
import { fetchEventSource } from '@microsoft/fetch-event-source';

export const useOpenAI = (httpClient: HttpClient) => {

    // function to call OpenAI API with stream
    const callOpenAIStream = React.useCallback(
        async (messages: any[], functions: any[], processFunctionCall: any, processContent: any) => {
            try {
                let functionName: string = "";
                let functionArguments: string = "";
                let messageCount: number = 0;
                await fetchEventSource(
                    OPENAI_API_ENDPOINT,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'text/event-stream',
                            'Authorization': `Bearer ${OPENAI_API_KEY}`
                        },
                        body: JSON.stringify({
                            model: GPT_MODELTO_USE,
                            messages: messages,
                            functions: functions,
                            temperature: 0,
                            max_tokens: 256,
                            top_p: 1.0,
                            frequency_penalty: 0.0,
                            presence_penalty: 0.0,
                            stream: true
                        }),

                        async onopen(response) {
                            console.log('onopen', response);
                        },

                        async onmessage(response) {
                            if (response.data !== '[DONE]') {
                                const data = JSON.parse(response.data);
                                
                                const delta = data.choices[0].delta;
                                const finishReason = data.choices[0].finish_reason;

                                if (delta.function_call) {
                                    if (delta.function_call.name) {
                                        functionName = delta.function_call.name;
                                    }

                                    if (delta.function_call.arguments) {
                                        functionArguments += delta.function_call.arguments;
                                    }
                                }

                                if (finishReason === 'function_call') {
                                    if (functionName && functionArguments) {
                                        processFunctionCall(functionName, functionArguments);
                                    }
                                }

                                if (finishReason === 'stop') {
                                    messageCount = 0;
                                    processContent(null, messageCount);
                                }

                                if (delta.content) {
                                    processContent(delta.content, messageCount);
                                    messageCount++;
                                }
                            }
                        },

                        onclose() {
                            console.log('Connection closed');
                        },

                        onerror(error) {
                            console.log('Error:', error);
                        }
                    });
            } catch (error) {
                console.log('Error:', error);
            }
        }, []);

    const callOpenAI = React.useCallback(
        async (messages: any[], functions: any[]) => {
            try {

                let endpoint: string = OPENAI_API_ENDPOINT;

                let requestHeaders: any = {};
                requestHeaders['Content-Type'] = 'application/json';
                requestHeaders['Authorization'] = `Bearer ${OPENAI_API_KEY}`;

                let request: any = {};
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

                if (!response.ok) {
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

    return { callOpenAIStream, callOpenAI };
};