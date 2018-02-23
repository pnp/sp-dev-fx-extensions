
import { HttpClient, IHttpClientOptions, HttpClientConfiguration } from "@microsoft/sp-http";
import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";

export interface CognitiveServiceConfiguration {
    context: ApplicationCustomizerContext;
}

export class CognitiveService {
    private context: ApplicationCustomizerContext;
    private qnamakerSubscriptionKey: string = "f70b4e27b14e48af8e876005c71f6de3";
    private knowledgebaseId: string = "0746b970-3da5-41f8-b1c8-624d0527a19a";

    constructor(config: CognitiveServiceConfiguration) {
        this.context = config.context;
    }

    public async getQnaAnswer(userQuery: string): Promise<String> {
        let answer: string = 'Could not find the answer to your question... sorry!';
        // Build URI
        const postURL = `https://westus.api.cognitive.microsoft.com/qnamaker/v2.0/knowledgebases/${this.knowledgebaseId}/generateAnswer`;

        // Build body
        const body: string = JSON.stringify({
            'question': userQuery
        });

        // Build headers
        const requestHeaders: Headers = new Headers();
        requestHeaders.append('Content-type', 'application/json');
        requestHeaders.append('Ocp-Apim-Subscription-Key', this.qnamakerSubscriptionKey);

        const httpClientOptions: IHttpClientOptions = {
            body: body,
            headers: requestHeaders
        };

        let response = await this.context.httpClient.post(
            postURL,
            HttpClient.configurations.v1,
            httpClientOptions
        );

        if (response.ok) {
            let json = await response.json();
            if (json.answers[0].answer != 'No good match found in the KB')
                answer = json.answers[0].answer;
        }
        return answer;
    }
}