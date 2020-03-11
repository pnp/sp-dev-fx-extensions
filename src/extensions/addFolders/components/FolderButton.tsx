import * as React from 'react';
import { ActionButton, BaseButton, Button, DefaultButton } from 'office-ui-fabric-react';

interface IFolderButtonProps {
  onClick(ev: React.MouseEvent<HTMLElement | BaseButton | Button, MouseEvent>): void;
  render: JSX.Element;
  isNested: boolean;
}

const FolderButton: React.FunctionComponent<IFolderButtonProps> = (props) => {
  let buttonRendered: JSX.Element;

  if (props.isNested) {
    buttonRendered = (<DefaultButton onClick={props.onClick}>{props.render}</DefaultButton>);
  }
  else {
    buttonRendered = (<ActionButton iconProps={{iconName: 'Folder'}} onClick={props.onClick}>{props.render}</ActionButton>);
  }

  return buttonRendered;
};

export default FolderButton;
