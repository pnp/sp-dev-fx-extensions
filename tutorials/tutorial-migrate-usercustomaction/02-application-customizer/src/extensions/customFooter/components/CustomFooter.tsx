import * as React from 'react';

import { CommandButton } from 'office-ui-fabric-react/lib/Button';
import styles from './CustomFooter.module.scss';


export default class CustomFooter extends React.Component<{}, {}> {

  public render(): React.ReactElement<{}> {

    return (
      <div className={styles.customFooter} >
        <div className={`${styles.container}`}>
            <div className={`${styles.grid}`}>
                <div className={`${styles.grid}`}>
                    <div className={`${styles.column}`}>
                        <CommandButton
                            data-automation="CopyRight"
                            href={`CRM.aspx`}>&copy; 2017, Contoso Inc.</CommandButton>
                    </div>
                    <div className={`${styles.column}`}>
                        <CommandButton
                            data-automation="CRM"
                            href={`CRM.aspx`}>CRM</CommandButton>
                    </div>
                    <div className={`${styles.column}`}>
                        <CommandButton
                            data-automation="SearchCenter"
                            iconProps={ { iconName: 'Search' } }
                            href={`SearchCenter.aspx`}>Search Center</CommandButton>
                    </div>
                    <div className={`${styles.column}`}>
                        <CommandButton
                            data-automation="Privacy"
                            href={`Privacy.aspx`}>Privacy Policy</CommandButton>
                    </div>
                    <div className={`${styles.column}`}>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }
}
