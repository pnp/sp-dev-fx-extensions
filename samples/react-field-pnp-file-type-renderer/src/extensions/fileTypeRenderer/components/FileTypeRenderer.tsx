import { Log } from '@microsoft/sp-core-library';
import { override } from '@microsoft/decorators';
import * as React from 'react';
import { FieldFileTypeRenderer } from "@pnp/spfx-controls-react/lib/FieldFileTypeRenderer";

import styles from './FileTypeRenderer.module.scss';

export interface IFileTypeRendererProps {
  /**
   * Path (url) to the file or folder
   */
  path: string;
  /**
   * Specifies if the current item is a folder
   */
  isFolder: boolean;
}

const LOG_SOURCE: string = 'FileTypeRenderer';

export default class FileTypeRenderer extends React.Component<IFileTypeRendererProps, {}> {
  @override
  public componentDidMount(): void {
    Log.info(LOG_SOURCE, 'React Element: FileTypeRenderer mounted');
  }

  @override
  public componentWillUnmount(): void {
    Log.info(LOG_SOURCE, 'React Element: FileTypeRenderer unmounted');
  }

  @override
  public render(): React.ReactElement<{}> {
    const {
      path,
      isFolder
    } = this.props;

    return (
      <div className={styles.cell}>
        <FieldFileTypeRenderer path={path} isFolder={isFolder} cssProps={{
          color: isFolder ? '#000' : '#000077' // the icon will have different color for folder and file
        }}
        className={isFolder ? styles.folderOverride : ''} />
      </div>
    );
  }
}
