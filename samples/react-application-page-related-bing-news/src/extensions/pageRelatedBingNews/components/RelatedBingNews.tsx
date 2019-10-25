import * as React from "react";
import { override } from "@microsoft/decorators";
import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import INewsArticle from '../models/INewsArticle';
import { SPHttpClient, HttpClient, SPHttpClientResponse, HttpClientResponse, IHttpClientOptions } from "@microsoft/sp-http";
import { ProgressIndicator } from "office-ui-fabric-react/lib/ProgressIndicator";
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Image, ImageFit } from 'office-ui-fabric-react/lib/Image';
import { List } from 'office-ui-fabric-react/lib/List';
import { ITheme, mergeStyleSets, getTheme, getFocusStyle } from 'office-ui-fabric-react/lib/Styling';

export interface IRelatedBingNewsProps {
  context: ApplicationCustomizerContext;
  bingSearchApiKey: string;
}

export interface IRelatedBingNewsState {
  relatedNews: INewsArticle[];
  showPanel: boolean;
}

export default class RelatedBingNews extends React.Component<IRelatedBingNewsProps, IRelatedBingNewsState> {

  private _baseUrl: string;
  private _listId: string;
  private _listItemId: string;
  private _spHttpClient: SPHttpClient;
  private _httpClient: HttpClient;

  constructor(props: IRelatedBingNewsProps) {
    super(props);

    this.state = {
      relatedNews: [],
      showPanel: false
    };
  }

  private _isContentPage(): boolean {
    return this._listId !== undefined && this._listItemId !== undefined;
  }

  public componentWillMount(): void {
    this._baseUrl = this.props.context.pageContext.web.absoluteUrl;
    this._listId = this.props.context.pageContext.list && this.props.context.pageContext.list.id.toString();
    this._listItemId = this.props.context.pageContext.listItem && this.props.context.pageContext.listItem.id.toString();
    this._spHttpClient = this.props.context.spHttpClient;
    this._httpClient = this.props.context.httpClient;
  }

  private async _getPageCategory(): Promise<string> {
    const getItemByIdEndpoint: string =
      `${this._baseUrl}/_api/web/lists('${this._listId}')/GetItemById(${this._listItemId})?$select=id,title,NewsCategory`;

    const response: SPHttpClientResponse = await this._spHttpClient.get(getItemByIdEndpoint, SPHttpClient.configurations.v1);
    const responseJson: any = await response.json();

    console.log(responseJson);

    return responseJson.NewsCategory.Label;
  }

  private async _getBingRelatedNews(category: string): Promise<INewsArticle[]> {
    const bingEndpoint: string = `https://api.cognitive.microsoft.com/bing/v7.0/news?mkt=en-GB&category=${category}`;

    const httpOptions: IHttpClientOptions = {
      headers: this._prepareHeadersForBingApi()
    };

    const response: HttpClientResponse = await this._httpClient.get(
      bingEndpoint,
      HttpClient.configurations.v1,
      httpOptions);
    const responseJson: any = await response.json();

    const relatedNews: INewsArticle[] = responseJson.value.map((item: any) => {
      const article: INewsArticle = {
        name: item.name,
        category: item.category,
        description: item.description,
        thumbnailUrl: item.image.thumbnail.contentUrl,
        datePublished: new Date(item.datePublished),
        url: item.url
      };
      return article;
    });

    return relatedNews;
  }

  public componentDidMount(): void {
    if (this._isContentPage()) {
      this._getPageCategory().then((category: string) => {
        this._getBingRelatedNews(category).then(
          (relatedNews: INewsArticle[]) => {
            this.setState({
              relatedNews: relatedNews
            });
          }
        );
      });
    }
  }

  @override
  public render(): React.ReactElement<{}> {
    if (!this._isContentPage()) {
      console.log("not a content page!...");
      return <div>Please, go to a Content Page and try again</div>;
    }

    if (this.state.relatedNews.length < 1) {
      return <ProgressIndicator label="Getting related news..." description="We are using Bing Search to get related news to the current page." />;
    }

    return (
      <React.Fragment>
        <DefaultButton secondaryText="Show related news in a side panel" onClick={this._showPanel} text="Bing related news" />
        <Panel
          isOpen={this.state.showPanel}
          type={PanelType.medium}
          onDismiss={this._hidePanel}
          headerText="Bing related news"
          closeButtonAriaLabel="Close"
        >
          <List items={this.state.relatedNews} onRenderCell={this._onRenderCell} />
        </Panel>
      </React.Fragment>);
  }

  private _onRenderCell(item: INewsArticle, index: number | undefined): JSX.Element {
    return (
      <div className={classNames.itemCell} data-is-focusable={false}>
        <Image className={classNames.itemImage} src={item.thumbnailUrl} width={100} height={100} imageFit={ImageFit.cover} />
        <div className={classNames.itemContent}>
          <div className={classNames.itemName}><a href={item.url} target="_blank">{item.name}</a></div>
          <div className={classNames.itemIndex}>{item.category}</div>
          <div>{item.description}</div>
        </div>
      </div>
    );
  }

  private _prepareHeadersForBingApi(): Headers {
    const requestHeaders: Headers = new Headers();
    requestHeaders.append("Content-type", "application/json");
    requestHeaders.append("Cache-Control", "no-cache");
    requestHeaders.append("Ocp-Apim-Subscription-Key", this.props.bingSearchApiKey);

    return requestHeaders;
  }

  private _showPanel = () => {
    this.setState({ showPanel: true });
  }

  private _hidePanel = () => {
    this.setState({ showPanel: false });
  }
}

interface IListBasicExampleClassObject {
  itemCell: string;
  itemImage: string;
  itemContent: string;
  itemName: string;
  itemIndex: string;
  chevron: string;
}

const theme: ITheme = getTheme();
const { palette, semanticColors, fonts } = theme;

const classNames: IListBasicExampleClassObject = mergeStyleSets({
  itemCell: [
    getFocusStyle(theme, { inset: -1 }),
    {
      minHeight: 54,
      padding: 10,
      boxSizing: 'border-box',
      borderBottom: `1px solid ${semanticColors.bodyDivider}`,
      display: 'flex',
      selectors: {
        '&:hover': { background: palette.neutralLight }
      }
    }
  ],
  itemImage: {
    flexShrink: 0
  },
  itemContent: {
    marginLeft: 10,
    overflow: 'hidden',
    flexGrow: 1
  },
  itemName: [
    fonts.xLarge,
    {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  ],
  itemIndex: {
    fontSize: fonts.small.fontSize,
    color: palette.neutralTertiary,
    marginBottom: 10
  },
  chevron: {
    alignSelf: 'center',
    marginLeft: 10,
    color: palette.neutralTertiary,
    fontSize: fonts.large.fontSize,
    flexShrink: 0
  }
});
