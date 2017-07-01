import * as React from 'react';
import {
    MessageBar,
    MessageBarType
} from 'office-ui-fabric-react/lib/components/MessageBar';
import { DefaultButton } from 'office-ui-fabric-react/lib/components/Button';

export interface IAnnouncementProps {
    title: string;
    announcement: string;
    urgent: boolean;
    acknowledge: () => void;
}

export default class Announcement extends React.Component<IAnnouncementProps, {}> {
  constructor(props) {
    super(props);
  }

  public render(): JSX.Element {
    return <MessageBar
            messageBarType={(this.props.urgent ? MessageBarType.error : MessageBarType.warning )}
            isMultiline={false}
            onDismiss={null}
            actions={<DefaultButton onClick={this.props.acknowledge}>OK</DefaultButton>}>
            <strong>{this.props.title}</strong>&nbsp;
            <span dangerouslySetInnerHTML={{__html: this.props.announcement.replace(/https?:[^\s]+/g, '<a href="$&">$&</a>')}} />
        </MessageBar>;
  }
}