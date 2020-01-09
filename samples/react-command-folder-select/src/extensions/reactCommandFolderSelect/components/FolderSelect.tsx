import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Callout, Text, Button, PrimaryButton, Link } from 'office-ui-fabric-react';
import { BaseDialog } from '@microsoft/sp-dialog';
import { IFolderSelectProps } from './IFolderSelectProps';
import { Dropdown, DropdownMenuItemType, IDropdownStyles, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import style from './FolderSelect.module.scss';
import { IFolderState } from './IFolderSelectState';

const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: {width: 300}
};

export default class FolderSelect extends BaseDialog {
  public folderOptions: any;

  public render(): void {
    ReactDOM.render(
      <FolderSelectContext
      element={document.activeElement.parentElement}
      folderOptions={this.folderOptions}
      dismiss={this.dismiss.bind(this)}
      />, this.domElement);
  }

  private dismiss() {
    ReactDOM.unmountComponentAtNode(this.domElement);
  }

}

class FolderSelectContext extends React.Component<IFolderSelectProps, IFolderState> {

  constructor(props: IFolderSelectProps){
    super(props);

    this.state = {
      selectedFolderUrl: ""
    };

  }

  public render(): JSX.Element {
    return (
      <div className={style.callout}>
        <Callout
          className={style.callout}
          role={'alertDialog'}
          gapSpace={0}
          target={this.props.element}
          setInitialFocus={true}
          hidden={false}
          onDismiss={this.props.dismiss}
          >
            <div className={style.container}>
              <div className={style.dropDown}>
                <Text variant={'medium'}>Select Folder:</Text>
                <Dropdown
                  options={this.props.folderOptions}
                  styles={dropdownStyles}
                  placeHolder="Select Folder"
                  onChange={this._onChange}
                />
                <Link href={this.state.selectedFolderUrl}><PrimaryButton className={style.buttons} text="Go" /></Link>
              </div>
            </div>
          </Callout>
      </div>
    );
  }

  private _onChange = (event: React.FormEvent<HTMLDivElement>,item: IDropdownOption): void => {
    this.setState({
      selectedFolderUrl: item.key
    });
  }



}
