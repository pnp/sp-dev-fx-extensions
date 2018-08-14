import * as React from "react";
import { override } from "@microsoft/decorators";

import styles from "./PageSentimentHeader.module.scss";
import IPageSentimentHeaderState from "./IPageSentimentHeaderState";
import IPageSentimentHeaderProps from "./IPageSentimentHeaderProps";
import IPageComment from "./IPageComment";
import { SPHttpClient, HttpClient, SPHttpClientResponse, IHttpClientOptions, HttpClientResponse } from "@microsoft/sp-http";

import { Rating, RatingSize } from "office-ui-fabric-react/lib/Rating";
import { ProgressIndicator } from "office-ui-fabric-react/lib/ProgressIndicator";

export default class PageSentimentHeader extends React.Component<IPageSentimentHeaderProps, IPageSentimentHeaderState> {

    private _cognitiveServicesTextUrl: string = `https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/`;
    private _baseUrl: string;
    private _listId: string;
    private _listItemId: string;
    private _spHttpClient: SPHttpClient;
    private _httpClient: HttpClient;

    constructor(props: IPageSentimentHeaderProps) {
        super(props);

        this.state = {
            score: -1
        };
    }

    public componentWillMount(): void {
        this._baseUrl = this.props.context.pageContext.web.absoluteUrl;
        this._listId = this.props.context.pageContext.list && this.props.context.pageContext.list.id.toString();
        this._listItemId = this.props.context.pageContext.listItem && this.props.context.pageContext.listItem.id.toString();
        this._spHttpClient = this.props.context.spHttpClient;
        this._httpClient = this.props.context.httpClient;
    }

    private async _getTop3PageComments(): Promise<IPageComment[]> {
        const pageCommentsEndpoint: string =
            `${this._baseUrl}/_api/web/lists('${this._listId}')/GetItemById(${this._listItemId})/Comments?$top=3&$inlineCount=AllPages`;

        const response: SPHttpClientResponse = await this._spHttpClient.get(pageCommentsEndpoint, SPHttpClient.configurations.v1);
        const responseJson: any = await response.json();
        const comments: IPageComment[] = responseJson.value.map((c) => {
            const comment: IPageComment = {
                id: c.id,
                author: c.author.name,
                comment: c.text
            };
            return comment;
        });

        return comments;
    }

    private async _getSentimentFromPageComments(comments: IPageComment[]): Promise<number> {
        const httpOptions: IHttpClientOptions = this._prepareHttpOptionsForTextApi(comments);
        const cognitiveResponse: HttpClientResponse =
            await this._httpClient.post(`${this._cognitiveServicesTextUrl}/sentiment`, HttpClient.configurations.v1, httpOptions);
        const cognitiveResponseJSON: any = await cognitiveResponse.json();


        if (cognitiveResponseJSON.documents.length === 1) {
            return cognitiveResponseJSON.documents[0].score;
        }

        const scoreSum: any = cognitiveResponseJSON.documents.reduce((total, item) => {
            return total.score + item.score;
        });

        return scoreSum;
    }

    private async _getSentimentScore(): Promise<number> {
        const comments: IPageComment[] = await this._getTop3PageComments();
        if (comments.length > 0) {
            const score: number = await this._getSentimentFromPageComments(comments);
            const averageScore: number = score / comments.length;
            return averageScore;
        }
        return -2;
    }

    public componentDidMount(): void {
        if (this._isContentPage()) {
            this._getSentimentScore().then(sentimentScore => {
                this.setState({
                    score: sentimentScore
                });
            });
        }
    }

    @override
    public render(): React.ReactElement<{}> {
        if (!this._isContentPage() || this.state.score < -1) {
            console.log("not a content page, or page without comments!...");
            return <div></div>;
        }

        if (this.state.score === -1) {
            return <ProgressIndicator label="" description="" />;
        }

        const rating: number = this.state.score * 5;
        console.log(this.state.score);
        console.log(rating);
        return (
            <div className={styles.sentimentHeader}>
                <Rating size={RatingSize.Large}
                    rating={rating}
                    readOnly={true} />
            </div>
        );
    }

    private _prepareHttpOptionsForTextApi(comments: IPageComment[]): IHttpClientOptions {
        const body: any = {
            language: "en",
            documents: [
            ]
        };

        body.documents = comments.map((comment: IPageComment) => {
            return {
                id: comment.id,
                text: comment.comment
            };
        });

        const httpOptions: IHttpClientOptions = {
            body: JSON.stringify(body),
            headers: this._prepareHeadersForTextApi()
        };

        return httpOptions;
    }

    private _prepareHeadersForTextApi(): Headers {
        const requestHeaders: Headers = new Headers();
        requestHeaders.append("Content-type", "application/json");
        requestHeaders.append("Cache-Control", "no-cache");
        requestHeaders.append("Ocp-Apim-Subscription-Key", this.props.textAnalyticsApiKey);

        return requestHeaders;
    }

    private _isContentPage(): boolean {
        return this._listId !== undefined && this._listItemId !== undefined;
    }
}