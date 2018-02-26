import * as React from 'react';
import * as strings from 'QnAChatApplicationCustomizerStrings';
import styles from './FooterChat.module.scss';
import { IFooterChatProps, IFooterChatState } from './IFooterChatProps';
import { Widget, addResponseMessage } from 'react-chat-widget';

export default class FooterChat extends React.Component<IFooterChatProps, IFooterChatState> {
    constructor(props: IFooterChatProps, state: IFooterChatState) {
        super(props);

        this.state = {
            items: []
        };
    }

    private _handleNewUserMessage = (newMessage) => {
        this.props.cognitiveService.getQnaAnswer(newMessage).then((answer) => {
            addResponseMessage(answer);
        });
    }

    public render() {
        return (
            <div className={styles.FooterChat}>
                <Widget
                    handleNewUserMessage={this._handleNewUserMessage}
                    title={strings.ChatTitle}
                    subtitle={strings.ChatSubtitle}
                />
            </div>
        );
    }
}