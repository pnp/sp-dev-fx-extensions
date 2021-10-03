import { HttpClientResponse } from '@microsoft/sp-http';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import * as React from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import styles from './MyFlowsApplicationCustomizer.module.scss';
import { IMyFlowsApplicationCustomizerProps } from './IMyFlowsApplicationCustomizerProps';
import { IMyFlowsApplicationCustomizerState } from './IMyFlowsApplicationCustomizerState';
import * as strings from 'MyFlowsListApplicationCustomizerStrings';
import { DetailsListLayoutMode, IColumn, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { IFlowItem } from '../../model/listItem/IFlowItem';
import { Link } from 'office-ui-fabric-react/lib/Link';
import Constants from '../../model/Constants';
import { default as classnames } from 'classnames';
import { IStackStyles, Stack } from 'office-ui-fabric-react/lib/Stack';
import { FontIcon } from '@microsoft/office-ui-fabric-react-bundle';
import { ShimmeredDetailsList } from 'office-ui-fabric-react/lib/ShimmeredDetailsList';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { DirectionalHint, HoverCard, IExpandingCardProps } from 'office-ui-fabric-react/lib/HoverCard';
import { Label } from 'office-ui-fabric-react/lib/Label';

export default class MyFlowsApplicationCustomizer extends React.Component<IMyFlowsApplicationCustomizerProps, IMyFlowsApplicationCustomizerState> {

  private containerStyles: IStackStyles = {};

  constructor(props) {
    super(props);

    const columns: IColumn[] = [
      { key: 'flowName', name: strings.FlowsListName, fieldName: 'name', minWidth: 200, maxWidth: 250, isResizable: true },
      { key: 'flowStatus', name: strings.FlowsListStatus, fieldName: 'status', minWidth: 50, maxWidth: 50, isResizable: true },
      { key: 'flowType', name: strings.FlowsListType, fieldName: 'type', minWidth: 50, maxWidth: 100, isResizable: true },
    ];

    if (this.props.showInHeaderButtonRegion) {
      this.containerStyles = {
        root: {
          width: 48,
          height: 48,
          color: '#FFFFFF',
          position: 'fixed',
          overflow: 'hidden',
          fontFamily: 'inherit',
          cursor: 'pointer',
          top: 0,
          right: this.props.siteTemplate === 'SITEPAGEPUBLISHING#0' ? Constants.communicationSiteIconPosition : Constants.teamSiteIconPosition,
          zIndex: 100000
        }
      };
    }

    this.state = {
      sidePanelOpen: false,
      showLoader: true,
      items: [],
      columns
    };
  }

  public render(): React.ReactElement<IMyFlowsApplicationCustomizerProps> {

    const {
      sidePanelOpen,
      showLoader,
      items,
      columns
    } = this.state;

    const {
      showInHeaderButtonRegion
    } = this.props;

    return (
      <div className={styles.content}>
        {!showInHeaderButtonRegion ?
          <div className={styles.grid}>
            <div className={styles.row}>
              <div className={styles.columnFullWidth}>
                <div className={styles.topBarControls}>
                  <PrimaryButton iconProps={{ iconName: 'MicrosoftFlowLogo' }}
                    onClick={() => this.onShowPanel()}>{strings.ShowFlowsButtonLabel}</PrimaryButton>
                </div>
              </div>
            </div>
          </div> :
          <Stack horizontal
            verticalAlign='center'
            horizontalAlign={'end'}
            styles={this.containerStyles}
            onClick={() => this.onShowPanel()}>
            <FontIcon iconName='MicrosoftFlowLogo'
              style={{ fontSize: 20, width: 20, height: 20, margin: 'auto' }} />
          </Stack>
        }
        <Panel
          isOpen={sidePanelOpen}
          isLightDismiss={true}
          headerText={strings.FlowsPanelTitle}
          type={PanelType.medium}
          onDismiss={this.onPanelClosed.bind(this)}>
          <ShimmeredDetailsList
            items={items}
            columns={columns}
            onRenderItemColumn={this.RenderItemColumn}
            selectionMode={SelectionMode.none}
            enableShimmer={showLoader}
            layoutMode={DetailsListLayoutMode.justified}
            onColumnHeaderClick={this.onColumnHeaderClick}
          />
        </Panel>
      </div>
    );
  }

  private onColumnHeaderClick = (event: React.MouseEvent<HTMLElement>, column: IColumn): void => {
    const { columns } = this.state;
    let { items } = this.state;
    let isSortedDescending = column.isSortedDescending;

    if (column.isSorted) {
      isSortedDescending = !isSortedDescending;
    }

    items = this.copyAndSort(items, column.fieldName!, isSortedDescending);

    this.setState({
      items,
      columns: columns.map(col => {
        col.isSorted = col.key === column.key;

        if (col.isSorted) {
          col.isSortedDescending = isSortedDescending;
        }

        return col;
      }),
    });
  }

  private copyAndSort<T>(items: T[], columnKey: string, isSortedDescending?: boolean): T[] {
    const key = columnKey as keyof T;
    return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
  }

  private async onShowPanel(): Promise<void> {
    this.setState({ sidePanelOpen: true });
    const { flowService } = this.props;
    const items: IFlowItem[] = await flowService.getFlowsData();

    for (let i = 0; i < items.length; i++) {
      const detailsResponse: HttpClientResponse = await flowService.getFlowDetails(items[i]);
      const detailsResult = await detailsResponse.json();
      if (detailsResult.value.length > 0) {
        const details = detailsResult.value[0].properties;
        items[i].status = details.status;
        items[i].startTime = new Date(details.startTime);
        items[i].endTime = new Date(details.endTime);
        items[i].errorMessage = details.error ? details.error.message : null;
      }
    }

    this.setState({
      items,
      showLoader: false
    });
  }

  private onPanelClosed(): void {
    this.setState({ sidePanelOpen: false });
  }

  private RenderItemColumn(item: IFlowItem, index: number, column: IColumn) {
    const fieldContent = item[column.fieldName as keyof IFlowItem] as string;
    const url = Constants.urlToFlowDetail.replace('{tenantId}', item.tenantId).replace('{flowId}', item.id);
    const expandingCardProps: IExpandingCardProps = {
      onRenderCompactCard: (hoverItem: IFlowItem): JSX.Element => {
        return (
          <div className={styles.compactCard}>
            <Label>{hoverItem.name}</Label>
          </div>
        );
      },
      onRenderExpandedCard: (hoverItem: IFlowItem): JSX.Element => {
        return (
          <div className={styles.expandedCard}>
            <div className={styles.row}>
              <Label>{strings.FlowTypeLabel} </Label> <Label className={styles.property}>{hoverItem.type}</Label>
            </div>
            <div className={styles.row}>
              <Label>{strings.FlowStatusLabel} </Label> <Label className={styles.property}>{hoverItem.enabled ? hoverItem.status : strings.FlowDisabledLabel}</Label>
            </div>
            {hoverItem.startTime ?
              <div className={styles.row}>
                <Label>{strings.FlowStartTimeLabel} </Label> <Label className={styles.property}>{hoverItem.startTime.toLocaleString()}</Label>
              </div> : ''}
            {hoverItem.endTime ?
              <div className={styles.row}>
                <Label>{strings.FlowEndTimeLabel} </Label> <Label className={styles.property}>{hoverItem.endTime.toLocaleString()}</Label>
              </div> : ''}
            {hoverItem.errorMessage ?
              <div className={styles.row}>
                <Label>{strings.FlowErrorMessageLabel} </Label> <Label className={styles.property}>{hoverItem.errorMessage}</Label>
              </div> : ''}
            <div className={styles.details}>
              <Link href={url} target='_blank'>{strings.FlowDetailsLabel}</Link>
            </div>
          </div>
        );
      },
      directionalHint: DirectionalHint.rightTopEdge,
      renderData: item
    };
    const optionalClasses: any = {};
    optionalClasses[styles.opacity] = !item.enabled;
    const className = classnames(optionalClasses);

    let iconName: string = '';
    switch (item.status) {
      case 'Succeeded':
        iconName = 'Like';
        break;
      case 'Failed':
        iconName = 'Warning';
        break;
      case 'Running':
        iconName = 'Sync';
        break;
      default:
        iconName = '';
    }

    switch (column.key) {
      case 'flowName':
        return <HoverCard expandingCardProps={expandingCardProps}><Link className={className} href={url} target='_blank'>{fieldContent}</Link></HoverCard>;
      case 'flowStatus':
        return <Icon iconName={iconName} className={styles.icon} title={item.status} />;
      default:
        return <span className={className}>{fieldContent}</span>;
    }
  }
}