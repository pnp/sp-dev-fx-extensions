import * as React from 'react';
import styles from './Chatbot.module.scss';
import { ChatbotDialog } from './ChatbotDialog';
import { IChatbotProps } from './IChatbotProps';

export class Chatbot extends React.Component<IChatbotProps> {
  public render(): React.ReactElement<IChatbotProps> {
    return (
        <div className={styles.chatbot}>
        <ChatbotDialog
        {...this.props}
        />
    </div>
    );
  }
}
