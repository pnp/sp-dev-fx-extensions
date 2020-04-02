import { Log } from '@microsoft/sp-core-library';
import { override } from '@microsoft/decorators';
import * as React from 'react';
import * as strings from 'AttachmentCountFieldCustomizerStrings';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { IStackProps, Stack } from 'office-ui-fabric-react/lib/Stack';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { mergeStyles } from 'office-ui-fabric-react/lib/Styling';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items/list";
import styles from './AttachmentCount.module.scss';

const rowProps: IStackProps = { horizontal: true, verticalAlign: 'center' };
const tokens = {
  sectionStack: {
    childrenGap: 5,
  }
};
const linkClass = mergeStyles({
  textOverflow: 'ellipsis',
  overflow: 'hidden'
});
const spinnerClass = mergeStyles({
  margin: '0px auto',
  display: 'inline-flex',
  position: 'absolute',
  left: '40px'
});
const noAttachClass = mergeStyles({
  color: 'darkorange'
});

export interface IAttachmentCountProps {
  listid: string;
  itemid: number;
  showTotal: boolean;
  showAttachmentList: boolean;
  showNoAttachmentMsg: boolean;
}

export interface IAttachmentCountState {
  showProgress: boolean;
  attachments: any[];
}

const LOG_SOURCE: string = 'AttachmentCount';

export default class AttachmentCount extends React.Component<IAttachmentCountProps, IAttachmentCountState> {
  constructor(props: IAttachmentCountProps) {
    super(props);
    this.state = {
      showProgress: true,
      attachments: []
    };
  }
  @override
  public componentDidMount(): void {
    Log.info(LOG_SOURCE, 'React Element: AttachmentCount mounted');
    if (this.props.itemid != 0) this.getAttachmentCount();
  }

  @override
  public componentWillUnmount(): void {
    Log.info(LOG_SOURCE, 'React Element: AttachmentCount unmounted');
  }

  private getAttachmentCount = async () => {
    const { listid, itemid } = this.props;
    let attachments: any[] = await sp.web.lists.getById(listid).items.getById(itemid).attachmentFiles.get();
    this.setState({
      attachments,
      showProgress: false
    });
  }

  @override
  public render(): React.ReactElement<{}> {
    return (
      <div className={styles.cell}>
        {(this.props.listid != "" && this.props.itemid != 0) ? (
          <>
            {this.state.showProgress ? (
              <Spinner size={SpinnerSize.xSmall} className={spinnerClass} />
            ) : (
                <>
                  {this.props.showTotal &&
                    <div className={styles.totalDiv}>Total: {this.state.attachments.length}</div>
                  }
                  {this.props.showAttachmentList && this.state.attachments.map(attach => {
                    return (
                      <Stack {...rowProps}>
                        <Icon iconName="Attach" />
                        <div className={linkClass}><Link href={attach.ServerRelativeUrl} target="_blank">{attach.FileName}</Link></div>
                      </Stack>
                    );
                  })}
                </>
              )
            }
          </>
        ) : (
            <>
              {this.props.showNoAttachmentMsg &&
                <Stack {...rowProps} tokens={tokens.sectionStack}>
                  <Icon iconName="ReportHacked" className={noAttachClass} />
                  <div>{strings.NoAttachmentMsg}</div>
                </Stack>
              }
            </>
          )}
      </div>
    );
  }
}
