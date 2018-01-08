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
  
  private cognitiveServicesTextUrl: string = `https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment`;
  
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

    this._getSentiment(this.props.text, 'en', documentId)
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

  private async _getSentiment(text: string, language: string, id: string): Promise<number> {

    if (this.props.textAnalyticsApiKey !== '') {
      const httpOptions: IHttpClientOptions = this._prepareHttpOptionsForTextApi(text, language, id);
      const cognitiveResponse: HttpClientResponse = await this.props.httpClient.post(this.cognitiveServicesTextUrl, HttpClient.configurations.v1, httpOptions);
      const cognitiveResponseJSON: any = await cognitiveResponse.json();
  
      const score = cognitiveResponseJSON.documents[0].score;
  
      console.log(score);
          
      return score;
    }    

    return -1;
  }

  private _prepareHttpOptionsForTextApi(text: string, language: string, id: string): IHttpClientOptions {
    const body: string = JSON.stringify({
      "documents": [
        {
          "language": language,
          "id": id,
          "text": text
        }
      ]
    });

    const httpOptions: IHttpClientOptions = {          
      body: body,
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
