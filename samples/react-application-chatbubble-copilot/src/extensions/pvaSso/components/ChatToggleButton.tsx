import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';

interface IChatToggleButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
  iconClassName?: string;
}

const ChatToggleButton: React.FC<IChatToggleButtonProps> = (props) => {
  const handleClick = (e: React.MouseEvent) => {
    console.log('ChatToggleButton: handleClick');
    e.preventDefault();
    e.stopPropagation();
    props.onClick();
  };

  return (
    <button
      className={props.className}
      title={props.label}
      onClick={handleClick}
      aria-label={props.label}
      type="button"
    >
      <Icon iconName="Chat" className={props.iconClassName} />
    </button>
  );
};

export default ChatToggleButton;