import { Log, Guid } from '@microsoft/sp-core-library';
import { override } from '@microsoft/decorators';
import * as React from 'react';

import styles from './SentimentAnalytics.module.scss';
import { HttpClient, IHttpClientOptions, HttpClientResponse } from '@microsoft/sp-http';
import SentimentIcon from './SentimentIcon';

export interface ISentimentAnalyticsProps {
  id: number;
  text: string;
  httpClient: HttpClient;
  textAnalyticsApiKey: string;
}

export interface ISentimentAnalyticsState {
  score: number;
}

const LOG_SOURCE: string = 'SentimentAnalytics';

export default class SentimentAnalytics
  extends React.Component<ISentimentAnalyticsProps, ISentimentAnalyticsState> {

  private cognitiveServicesTextUrl: string = `https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/`;

  constructor(props: ISentimentAnalyticsProps, state: ISentimentAnalyticsState) {
    super(props, state);

    this.state = {
      score: 0
    };
  }

  @override
  public componentDidMount(): void {
    Log.info(LOG_SOURCE, 'React Element: SentimentAnalytics mounted');

    const documentId = Guid.newGuid().toString();

    this._getSentiment(this.props.text, documentId)
      .then(score => {
        this.setState({ score: score });
      })
      .catch(error => {
        console.log(error);
      });
  }

  @override
  public componentWillUnmount(): void {
    Log.info(LOG_SOURCE, 'React Element: SentimentAnalytics unmounted');
  }

  @override
  public render(): React.ReactElement<{}> {
    return (
      <div className={styles.cell}>
        <SentimentIcon score={this.state.score} />
      </div>
    );
  }

  private async _autodetectLanguage(text: string, id: string): Promise<string> {

    if (this.props.textAnalyticsApiKey !== '') {
      const httpOptions: IHttpClientOptions = this._prepareHttpOptionsForTextApi(text, id);
      const cognitiveResponse: HttpClientResponse = await this.props.httpClient.post(`${this.cognitiveServicesTextUrl}/languages`, HttpClient.configurations.v1, httpOptions);
      const cognitiveResponseJSON: any = await cognitiveResponse.json();

      console.log(cognitiveResponseJSON);

      const language = cognitiveResponseJSON.documents[0].detectedLanguages[0].iso6391Name; //getting First language detected (i.e: "en")      

      return language;
    }

    return null;
  }

  private async _getSentiment(text: string, id: string): Promise<number> {

    if (this.props.textAnalyticsApiKey == '') return -1;

    const language: string = await this._autodetectLanguage(text, id);

    if (language == null) return -1;

    const httpOptions: IHttpClientOptions = this._prepareHttpOptionsForTextApi(text, id, language);
    const cognitiveResponse: HttpClientResponse = await this.props.httpClient.post(`${this.cognitiveServicesTextUrl}/sentiment`, HttpClient.configurations.v1, httpOptions);
    const cognitiveResponseJSON: any = await cognitiveResponse.json();

    const score = cognitiveResponseJSON.documents[0].score;

    console.log(score);

    return score;
  }

  private _prepareHttpOptionsForTextApi(text: string, id: string, language:string = null): IHttpClientOptions {
    const body: any = {
      "documents": [
        {
          "id": id,
          "text": text
        }
      ]
    };

    if (language) {
      body.language = language;
    }

    const httpOptions: IHttpClientOptions = {
      body: JSON.stringify(body),
      headers: this._prepareHeadersForTextApi()
    };

    return httpOptions;
  }

  private _prepareHeadersForTextApi(): Headers {
    const requestHeaders: Headers = new Headers();
    requestHeaders.append('Content-type', 'application/json');
    requestHeaders.append('Cache-Control', 'no-cache');
    requestHeaders.append('Ocp-Apim-Subscription-Key', this.props.textAnalyticsApiKey);

    return requestHeaders;
  }
}
