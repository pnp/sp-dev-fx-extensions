import * as React from 'react';
import { DefaultButton } from '@fluentui/react';
import CopyPageDialog from './CopyPageDialog';
import { useBoolean } from '@fluentui/react-hooks';
import { ISPFXContext } from '@pnp/sp';
import styles from './CopyPage.module.scss';

export interface ICopyPageComponentProps {
  context: ISPFXContext;
  pageName: string;
  pageUrl: string;
  siteUrl: string;
}

const CopyPageComponent: React.FC<ICopyPageComponentProps> = (props) => {
  const [hideDialog, { toggle }] = useBoolean(true);
  return (
    <div className={styles.appContainer}>

      {/* Button to toggle the Copy Page Dialog */}
      <DefaultButton
        className={styles.appButton}
        onClick={toggle}
        iconProps={{ iconName: 'Copy' }} // Add the "Copy" icon
      >
        Copy Page
      </DefaultButton>

      {/* Copy Page Dialog */}
      <CopyPageDialog hidden={hideDialog} onDismiss={toggle} {...props} />

    </div>
  );
};

export default CopyPageComponent;