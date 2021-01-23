import * as React from 'react';
import { ActionButton, BaseButton, DefaultButton } from '@fluentui/react';
import styles from './FolderHierarchyGenerator.module.scss';

interface IFolderButtonProps {
  onClick(ev: React.MouseEvent<HTMLElement | BaseButton, MouseEvent>): void;
  render: JSX.Element;
  isNested: boolean;
}

const FolderButton: React.FunctionComponent<IFolderButtonProps> = (props) => {
  let buttonRendered: JSX.Element;

  if (props.isNested) {
    buttonRendered = (<DefaultButton className={styles['folders-brdcrmb__button']} onClick={props.onClick}>{props.render}</DefaultButton>);
  }
  else {
    buttonRendered = (<ActionButton iconProps={{iconName: 'Folder'}} onClick={props.onClick}>{props.render}</ActionButton>);
  }

  return buttonRendered;
};

export default FolderButton;
