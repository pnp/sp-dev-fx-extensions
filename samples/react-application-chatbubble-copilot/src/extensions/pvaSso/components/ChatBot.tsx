import * as React from 'react';
import { IChatbotProps } from '../types/IChatBotProps';
import { PVAChatbotDialog } from './PVAChatbotDialog';

const Chatbot: React.FC<IChatbotProps> = (props) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <PVAChatbotDialog {...props} />
    </div>
  );
};

export default Chatbot;
