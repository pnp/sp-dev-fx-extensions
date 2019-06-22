import * as React from "react";

import { IUserMenuProps } from "./IUserMenuProps";
import styles from "./UserMenu.module.scss";

import * as strings from 'InternalUserMenuApplicationCustomizerStrings';

export default class UserMenu extends React.Component<IUserMenuProps, {}> {

  public render(): React.ReactElement<IUserMenuProps> {
    return <div className={styles.topPanel}>
      <ul className={styles.row}>
        <li className={styles.col2}>
          <a href="#" className={styles.menuItem}>{strings.InternalLink1}</a>
        </li>
        <li className={styles.col2}>
          <a href="#" className={styles.menuItem}>{strings.InternalLink2}</a>
        </li>
      </ul>
    </div>;
  }
}