import { Log, Guid } from '@microsoft/sp-core-library';
import { override } from '@microsoft/decorators';
import * as React from 'react';
import { sp, PermissionKind } from '@pnp/sp';
import { Spinner } from 'office-ui-fabric-react';
import PermissionContent from './PermissionContent';

import styles from './UserPermission.module.scss';

export interface IUserPermissionProps {
  listId: Guid;
  itemId: string;
  webUrl: string;
}

export interface IUserPermissionState {
  isEditor: boolean;
  isLoading: boolean;
}


const LOG_SOURCE: string = 'UserPermission';

export default class UserPermission extends React.Component<IUserPermissionProps, IUserPermissionState> {
  constructor(props: IUserPermissionProps, state: IUserPermissionState) {
    super(props);
    this.state = {
      isEditor: false,
      isLoading: false,
    };
  }


  @override
  public async componentDidMount(): Promise<void> {
    Log.info(LOG_SOURCE, 'React Element: UserPermission mounted');
    this.setState({
      isLoading: true,
    });

    // Get if editor or reader
    const isEdit = await this._getUserHasPermissionOnItem(this.props.listId.toString(), +this.props.itemId, PermissionKind.EditListItems);

    this.setState({
      isEditor: isEdit,
      isLoading: false,
    });
  }

  @override
  public componentWillUnmount(): void {
    Log.info(LOG_SOURCE, 'React Element: UserPermission unmounted');
  }

  @override
  public render(): React.ReactElement<{}> {
    return (
      <div className={styles.cell}>
        {this.state.isLoading ? <Spinner /> : <PermissionContent isEditor={this.state.isEditor}></PermissionContent>}
      </div>
    );
  }

  // Check if the current user has Edit permissions
  private async _getUserHasPermissionOnItem(listId: string, itemId: number, hasPermissionKind: PermissionKind): Promise<boolean> {
    const response = await sp.web.lists.getById(listId).items.getById(itemId).currentUserHasPermissions(hasPermissionKind);
    return response;
  }
}
