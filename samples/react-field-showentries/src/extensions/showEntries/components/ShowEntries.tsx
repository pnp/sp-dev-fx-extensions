import { override } from '@microsoft/decorators';
import { Logger } from '@pnp/logging';
import { sp } from "@pnp/sp";
import "@pnp/sp/fields";
import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/webs";
import { FieldTextRenderer } from "@pnp/spfx-controls-react/lib/FieldTextRenderer";
import { IShimmerElement, IShimmerStyles, Shimmer, ShimmerElementType } from 'office-ui-fabric-react/lib/Shimmer';
import { IStackStyles, IStackTokens, Stack } from 'office-ui-fabric-react/lib/Stack';
import * as React from 'react';
import { handleError } from '../../../common/errorhandler';
import { IShowEntriesProps } from "./IShowEntriesProps";
import { IShowEntriesState } from './IShowEntriesState';

const shimmerDropdownElement: IShimmerElement[] = [{ type: ShimmerElementType.line, width: '100%', }];
const shimmerStyles: Partial<IShimmerStyles> = { root: { fontSize: "inherit" }, dataWrapper: { fontSize: "inherit" } };
const stackStyles: Partial<IStackStyles> = { root: { marginTop: 5, fontSize: "inherit" } };
const stackTokens: IStackTokens = { childrenGap: '10 20' };

const LOG_SOURCE: string = 'ShowEntries';

export default class ShowEntries extends React.Component<IShowEntriesProps, IShowEntriesState> {

  constructor(props: IShowEntriesProps) {
    super(props);
    this.state = {
      entries: [],
      isDataLoaded: false
    };
  }
  
  private getHistory = async () => {
    try {
      let currField = await sp.web.lists.getById(this.props.listId).fields.getByInternalNameOrTitle(this.props.fieldName).select("AppendOnly")();
      if (currField["AppendOnly"] == true) {
        let fieldNames: Array<string> = new Array<string>(this.props.fieldName, 'Editor/Id', 'Versions');
        let expansions: Array<string> = new Array<string>('Editor', 'Versions');

        let history: any[] = await sp.web.lists.getById(this.props.listId).items.getById(this.props.itemId).select(...fieldNames).expand(...expansions).get();
        let commentsHistory: string[] = history["Versions"].filter(v => v[this.props.fieldName] != null).map(v => { return `${v["Editor"]["LookupValue"]} (${(new Date(v["Modified"])).toLocaleDateString()}): ${v[this.props.fieldName]}`; });
        this.setState({
          entries: commentsHistory,
          isDataLoaded: true
        });
      }
      else {
        //if no "AppendText", display current value
        this.setState({
          entries: [this.props.currentValue],
          isDataLoaded: true
        });
      }
    }
    catch (e) {
      await handleError(e);
    }
  }
  
  @override
  public componentDidMount(): void {
    Logger.write(`${LOG_SOURCE} React Element: ShowEntries mounted`);
    if (this.props.itemId && this.props.itemId != 0) {
      this.getHistory();
    }
  }

  @override
  public componentWillUnmount(): void {
    Logger.write(`${LOG_SOURCE} React Element: ShowEntries unmounted`);
  }

  @override
  public render(): React.ReactElement<IShowEntriesProps> {
    return (
      <Shimmer isDataLoaded={this.state.isDataLoaded} shimmerElements={shimmerDropdownElement} styles={shimmerStyles} ariaLabel="Loading content">
        <Stack styles={stackStyles} tokens={stackTokens} >
          {this.state.entries.map((entry) => {
            return (
              <FieldTextRenderer text={entry} />
            );
          })}
        </Stack>
      </Shimmer>
    );
  }
}
