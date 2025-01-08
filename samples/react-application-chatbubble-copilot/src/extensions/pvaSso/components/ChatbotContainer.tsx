import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import ChatToggleButton from './ChatToggleButton';
import { PVAChatbotDialog } from './PVAChatbotDialog';
import styles from '../styles/PvaSsoApplicationCustomizer.module.scss';

interface ChatbotContainerProps {
  botURL: string;
  userEmail: string;
  customScope: string;
  clientID: string;
  authority: string;
  botName?: string;
  userFriendlyName?: string;
  context: any;
  botAvatarInitials?: string;
  greet?: boolean;
}

const ChatbotContainer: React.FC<ChatbotContainerProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    console.log('ChatbotContainer mounted');
  }, []);

  const handleOpenChat = useCallback(() => {
    console.log('ChatbotContainer: handleOpenChat called');
    setIsOpen(true);
  }, []);

  const handleDismiss = useCallback(() => {
    console.log('ChatbotContainer: handleDismiss called');
    setIsOpen(false);
  }, []);

  // Log state changes
  useEffect(() => {
    console.log('ChatbotContainer: isOpen changed to:', isOpen);
  }, [isOpen]);

  return (
    <div className={styles.modernChatContainer}>
      <ChatToggleButton
        label={props.botName || 'Chat'}
        onClick={handleOpenChat}
        className={styles.modernChatButton}
        iconClassName={styles.modernChatIcon}
      />
      {isOpen && (
        <PVAChatbotDialog
          botURL={props.botURL}
          userEmail={props.userEmail}
          customScope={props.customScope}
          clientID={props.clientID}
          authority={props.authority}
          botName={props.botName}
          userFriendlyName={props.userFriendlyName}
          context={props.context}
          botAvatarInitials={props.botAvatarInitials}
          greet={props.greet}
          isOpen={isOpen}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
};

export default ChatbotContainer;