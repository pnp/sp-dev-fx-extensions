import * as React from 'react';
import styles from './components.module.scss';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { MessageScope } from '../Models/IModel';
import { css } from '@fluentui/react/lib/Utilities';

export interface IMessageContainerProps {
    Message?: string;
    MessageScope: MessageScope;
}

const MessageContainer: React.FunctionComponent<IMessageContainerProps> = (props) => {
    return (
        <div className={styles.MessageContainer}>
            {
                props.MessageScope === MessageScope.Success &&
                <MessageBar messageBarType={MessageBarType.success} className={styles.msgText}>{props.Message}</MessageBar>
            }
            {
                props.MessageScope === MessageScope.Failure &&
                <MessageBar messageBarType={MessageBarType.error} className={styles.msgText}>{props.Message}</MessageBar>
            }
            {
                props.MessageScope === MessageScope.Warning &&
                <MessageBar messageBarType={MessageBarType.warning} className={styles.msgText}>{props.Message}</MessageBar>
            }
            {
                props.MessageScope === MessageScope.Info &&
                <MessageBar className={css(styles.infoMessage, styles.msgText)}>{props.Message}</MessageBar>
            }
        </div>
    );
};

export default MessageContainer;