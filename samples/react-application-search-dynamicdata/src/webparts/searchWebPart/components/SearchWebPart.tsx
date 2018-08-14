import * as React from 'react';
import { ISearchWebPartProps } from './ISearchWebPartProps';
import * as moment from 'moment';
import searchStore from '../flux/stores/searchStore';
import { IQuery } from '../../../data/IQuery';
import searchActions from '../flux/actions/searchActions';

export interface ISearchWebPartWebPartState {
	results?: any[];
	loaded?: Boolean;
}
export default class SearchWebPart extends React.Component<ISearchWebPartProps, ISearchWebPartWebPartState> {
  private iconUrl: string = "https://spoprod-a.akamaihd.net/files/odsp-next-prod_ship-2016-08-15_20160815.002/odsp-media/images/filetypes/16/";
  private unknown: string[] = ["aspx", "null"];
  constructor (props:any) {
		super(props);
    let data:any=[];
		this.state= {results:data,loaded:false};
	this._onChange=	this._onChange.bind(this);
  }
  private _onChange(): void {
		this.setState({
			results: searchStore.getSearchResults(),
			loaded: true
        });
    }
    public componentWillReceiveProps(nextProps: ISearchWebPartProps): void {
      this._getResults(nextProps.context,nextProps.query);
    }
  
  public componentDidMount(): void {
    searchStore.addChangeListener(this._onChange);
    this._getResults(this.context,this.props.query);
}

public componentWillUnmount(): void {
    searchStore.removeChangeListener(this._onChange);
}


private _getResults(context:any, crntProps: IQuery): void {

	if ( crntProps!==undefined) {
	searchActions.get(context, crntProps.text,10,"asc" );
	}
}
	private getAuthorDisplayName(author: string): string {
		if (author !== undefined) {
			const splits: string[] = author.split("|");
			return splits[1].trim();
		} else {
			return "";
		}
	}

	private getDateFromString(retrievedDate: string): string {
		if (retrievedDate !== undefined) {
			return moment(retrievedDate).format("DD/MM/YYYY");
		} else {
			return "";
		}
	}
  public render(): React.ReactElement<ISearchWebPartProps> {

		return (
			<div>
					<table className={`ms-Table`}>
					<thead>
						<tr>
							<th>Type</th>
							<th>Name</th>
							<th>Modified</th>
							<th>Modified by</th>
						</tr>
					</thead>
					<tbody>
						{
							this.state.results.map((result, index) => {
								return (<tr key={index}>
											<td>
												<a href={result.path} target="_blank">
                          <img src={`${this.iconUrl}${result.Fileextension !== undefined && this.unknown.indexOf(result.Fileextension) === -1 ? result.Fileextension : 'code'}.png`} alt="File extension"/>
                        </a>
											</td>
											<td>
												{result.title}
											</td>
											<td>{this.getDateFromString(result.ModifiedOWSDATE)}</td>
											<td>{this.getAuthorDisplayName(result.EditorOWSUSER)}</td>
										</tr>);
							})
						}
					</tbody>
				</table>
			</div>
		);
	}}
