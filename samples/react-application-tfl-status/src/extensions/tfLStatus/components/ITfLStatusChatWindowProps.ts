import { HttpClient } from '@microsoft/sp-http';

export interface ITfLStatusChatWindowProps {
    httpClient: HttpClient;
    stream: boolean;
}