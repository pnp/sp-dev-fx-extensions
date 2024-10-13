import * as React from 'react';
import { SubscriptionModel } from "../ManageSubscriptionsCommandSet";
import { ListViewCommandSetContext } from "@microsoft/sp-listview-extensibility";
import {
    DetailsList, DetailsListLayoutMode, SelectionMode, 
    IColumn, mergeStyles, Link, Panel, PanelType,MessageBar, MessageBarType,Spinner
  } from '@fluentui/react';
import { SubscriptionService } from '../services/SubscriptionService';
import { Log } from '@microsoft/sp-core-library';

  interface SubscriptionPanelProps{
    subscriptions:SubscriptionModel[];
    selectedListID:string|number;
    _context: ListViewCommandSetContext;
    selectedSite:string|number;
    closePanel: () => void;
    showPanel:boolean;
}

interface SubscriptionPanelState{
    subscriptions?:SubscriptionModel[];
    columns: IColumn[];
    selectedListID:string|number;
    renewedMessage ? : string;
    renewedMessageBarType? : MessageBarType;
    showRenewedMessage ? : boolean;
    showSpinner? : boolean;
    showTable?: boolean;
}

const LOG_SOURCE: string = 'ManageSubscriptionsCommandSet - Component';

export default class SubscriptionPanel extends React.Component<SubscriptionPanelProps, SubscriptionPanelState> {
    private service : SubscriptionService = new SubscriptionService();

    constructor(props:any) {
        super(props);
        this._renderItemColumn = this._renderItemColumn.bind(this);
        const columns : IColumn[] = [
            {
              key: 'id',
              name: 'Subscription ID',
              fieldName: 'id',
              minWidth: 100,
              maxWidth: 125,
              isRowHeader: true,
              isResizable: true,
              isSorted: true,
              isSortedDescending: true,
              sortAscendingAriaLabel: 'Sorted A to Z',
              sortDescendingAriaLabel: 'Sorted Z to A',
              onColumnClick: this._onColumnClick,
              data: 'string',
              isPadded: true,
            },
            {
              key: 'expirationDateTime',
              name: 'Expiration Date',
              fieldName: 'expirationDateTime',
              minWidth: 100,
              maxWidth: 125,
              isRowHeader: true,
              isResizable: true,
              isSorted: false,
              isSortedDescending: false,
              sortAscendingAriaLabel: 'Sorted A to Z',
              sortDescendingAriaLabel: 'Sorted Z to A',
              onColumnClick: this._onColumnClick,
              data: 'string',
              isPadded: true,
            }
        ];

        this.state = {
            columns : columns,
            subscriptions: this.props.subscriptions,
            selectedListID:this.props.selectedListID,
            showRenewedMessage : false,
            showSpinner: false
        }
    }

    public async componentDidUpdate(prevProps: Readonly<SubscriptionPanelProps>, prevState: Readonly<SubscriptionPanelState>, snapshot?: any) {

        prevProps.selectedListID !== this.props.selectedListID && this.setState({selectedListID:this.props.selectedListID});
        if(prevState.showRenewedMessage !== this.state.showRenewedMessage){
          let newSubscriptionsData : SubscriptionModel[] = await this.service.GetSubscriptions(this.props._context, this.props.selectedSite.toString(), this.props.selectedListID.toString());
          this.setState({subscriptions:newSubscriptionsData});
          this.state.showRenewedMessage && this.setState({showRenewedMessage:false});
        }
    }

    public render(){
        const {subscriptions, columns,showRenewedMessage, renewedMessage, renewedMessageBarType, showSpinner} = this.state;
        return (
        <React.Fragment>
            <div>
                <Panel isOpen={this.props.showPanel} type={PanelType.medium} onDismiss={this.props.closePanel}>
                    {showRenewedMessage && 
                      <MessageBar messageBarType={renewedMessageBarType}>
                        {renewedMessage}
                      </MessageBar>
                    }
                    {showSpinner ? (<Spinner label="Please wait..." ariaLive="assertive" labelPosition="bottom" />) : 
                      <div>
                        <h4 style={{ paddingTop: '5px' }}>Subscriptions on {this.props._context.pageContext.list?.title}</h4>
                        <DetailsList
                            items={subscriptions?subscriptions:[]}
                            columns={columns}
                            onRenderItemColumn={this._renderItemColumn}
                            selectionMode={SelectionMode.none}
                            setKey="none"
                            layoutMode={DetailsListLayoutMode.justified}
                            isHeaderVisible={true}
                        />
                      </div>
                    }
                </Panel>
            </div>

        </React.Fragment>
        );
    }

    public onButtonClick = async (item: any): Promise<void> => { 
        this.setState({showSpinner:true});
        if (!this.service) {
          Log.warn(LOG_SOURCE, "subscriptionService is undefined");
          return;
        }
        const renewSubscriptionEndpoint = this.props.selectedSite+`/_api/web/lists('${this.props.selectedListID}')/subscriptions('${item.id}')`;
        const renewSubscriptionRequestHeaders: Headers = new Headers();
        renewSubscriptionRequestHeaders.append('Content-Type', 'application/json');
        const payload = {
            expirationDateTime: this.getNewSubscriptionDate(),
            notificationUrl: item.notificationUrl,
        };
        const renewResults = await this.service.PatchMethod(this.props._context, renewSubscriptionEndpoint, renewSubscriptionRequestHeaders, payload);
        if(renewResults == 204){
          this.setState({showRenewedMessage:true,renewedMessageBarType:MessageBarType.success, renewedMessage:"Subcription renewed", showSpinner:false});
        } else{
          this.setState({showRenewedMessage:true,renewedMessageBarType:MessageBarType.error, renewedMessage:"Something went wrong, please try after sometime.", showSpinner:false});
        }
    }

    public _onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
        const { columns, subscriptions } = this.state;
        const newColumns: IColumn[] = columns.slice();
        const currColumn: IColumn = newColumns.filter(currCol => column.key === currCol.key)[0];
        newColumns.forEach((newCol: IColumn) => {
          if (newCol === currColumn) {
            currColumn.isSortedDescending = !currColumn.isSortedDescending;
            currColumn.isSorted = true;
          } else {
            newCol.isSorted = false;
            newCol.isSortedDescending = true;
          }
        });
        const newItems = this._copyAndSort(subscriptions?subscriptions:[], currColumn.fieldName!, currColumn.isSortedDescending); // eslint-disable-line @typescript-eslint/no-non-null-assertion
        this.setState({
          columns: newColumns,
          subscriptions: newItems
        });
    }

    private _copyAndSort<T>(items: T[], columnKey: string, isSortedDescending?: boolean): T[] {
        const key = columnKey as keyof T;
        return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
    }

    public _renderItemColumn(item : SubscriptionModel, index: number, column: IColumn) {
        const fieldContent = item[column.fieldName as keyof SubscriptionModel] as string;
        let fieldColor = "green";
        let showLink : boolean = false;
        switch (column.fieldName) {
          case 'expirationDateTime':
            const parsedDate = new Date(fieldContent);
            const formattedDate = parsedDate.toISOString().substring(0, 10);
            let isExpired :boolean = false;
            const currentDate = new Date();
            const parsedFormattedDate = new Date(formattedDate);
            parsedFormattedDate < currentDate ? isExpired = true : isExpired
            isExpired ? fieldColor = "red" : fieldColor;
            isExpired ? showLink = true : showLink;
            return (
                showLink ? 
                  (<div>
                    <span data-selection-disabled={true} className={mergeStyles({ color: fieldColor, height: '100%', display: 'block' })}>
                      {formattedDate}
                    </span>
                    <div>
                      <Link onClick={()=> this.onButtonClick(item) }>Renew Subscription</Link>
                    </div>
                  </div> ): 
                  (
                    <span data-selection-disabled={true} className={mergeStyles({ color: fieldColor, height: '100%', display: 'block' })}>
                      {formattedDate}
                    </span>
                  )
            );
          default:
            return <span>{fieldContent}</span>;
        }
    }

    public getNewSubscriptionDate(){
        const currentDate = new Date();
        // Add 179 days
        currentDate.setDate(currentDate.getDate() + 179);
        const formattedDate = currentDate.toISOString();
        return formattedDate;
    }
}