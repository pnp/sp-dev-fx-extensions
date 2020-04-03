import * as React from 'react';
import styles from './CustomPanel.module.scss';
import { Panel, PanelType } from "office-ui-fabric-react/lib/Panel";
import { PrimaryButton, DefaultButton } from "office-ui-fabric-react/lib/Button";
import { FolderExplorer, IFolder } from '@pnp/spfx-controls-react';

import { ICustomPanelState, ICustomPanelProps } from '.';

export class CustomPanel extends React.Component<ICustomPanelProps, ICustomPanelState> {

  constructor(props: ICustomPanelProps) {
    super(props);
    this.state = {
      isOpen: true,
      selectedFolder: null,
    };

  }

  public async componentWillReceiveProps(nextProps: ICustomPanelProps): Promise<void> {
    // open panel
    this.setState({
      isOpen: nextProps.isOpen,
    });
  }

  public render(): React.ReactElement<ICustomPanelProps> {

    return (
      <Panel isOpen={this.state.isOpen}
        type={PanelType.medium}
        isLightDismiss
        onRenderFooterContent={this._onRenderFooterContent}
        onDismiss={this._closePanel}
      >
        <h2 className={styles.panelTitle}>{'Folder Filter'}</h2>

        <div className={styles.listContainer}>
          <FolderExplorer
            context={this.props.context}
            rootFolder={this.props.rootFolder}
            defaultFolder={this.props.defaultFolder}
            onSelect={this._onFolderSelect}
          />
        </div>

      </Panel>
    );
  }

  private _onRenderFooterContent = () => {
    return (
      <div className={styles.footerSection}>
        <PrimaryButton text='Go to Folder' href={this.state.selectedFolder ? this.state.selectedFolder.ServerRelativeUrl : '#'} />
        <DefaultButton text="Cancel" onClick={this._closePanel} />
      </div>
    );
  }

  private _onFolderSelect = (folder: IFolder): void => {
    this.setState({
      selectedFolder: folder,
    });
  }

  /**
   * Close extension panel
   */
  private _closePanel = () => {
    this.setState({ isOpen: false });
  }

}

