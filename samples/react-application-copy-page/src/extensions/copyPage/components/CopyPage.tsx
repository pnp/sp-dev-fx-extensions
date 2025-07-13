import * as React from 'react';
import { useBoolean } from '@fluentui/react-hooks';
import CopyPageButton from './CopyPageButton';
import CopyPageDialog from './CopyPageDialog';
import { ISPFXContext } from '@pnp/sp';

export interface ICopyPageProps {
  context: ISPFXContext;
  pageName: string;
  pageId: number;
  pageUrl: string;
  contentType?: string;
  hubSiteUrl?: string;
}

const CopyPage: React.FC<ICopyPageProps> = props => {
  const [hideDialog, { toggle }] = useBoolean(true);

  return (
    <>
      <CopyPageButton/>
      <CopyPageDialog hidden={hideDialog} onDismiss={toggle} {...props} />
    </>
  );
};

export default CopyPage;
