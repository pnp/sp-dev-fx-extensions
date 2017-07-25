import { override } from '@microsoft/decorators';
import * as React from 'react';

import { CommandBar, IContextualMenuItem, CommandButton } from 'office-ui-fabric-react';

export interface ICustomCommandBarProps {

}

export interface ICustomCommandBarState {

}

export default class CustomCommandBar extends React.Component<ICustomCommandBarProps, ICustomCommandBarState> {
    public constructor(props: ICustomCommandBarProps, state: ICustomCommandBarState) {
        super(props, state);
    }

    @override
    public render(): JSX.Element {
        return (
            <CommandBar
                isSearchBoxVisible={false}
                items={
                    [
                        {
                            key: 'New',
                            name: 'New',
                            onRender: this._renderNewItem.bind(this)
                        },
                        {
                            key: 'Upload',
                            name: 'Upload',
                            onRender: this._renderUpladItem.bind(this)
                        }
                    ]
                }
            >
            </CommandBar>
        );
    }

    private _renderNewItem(item: IContextualMenuItem): JSX.Element {
        return (
            <CommandButton
                className={'ms-CommandBarItem-link'}
                onRenderIcon={this._renderNewIcon.bind(this)}
                text={'New'}
                menuProps={{
                    items: [
                        {
                            key: 'email',
                            name: 'Email message',
                            icon: 'Mail'
                        },
                        {
                            key: 'Calendar event',
                            name: 'Calendar event',
                            icon: 'Calendar'
                        }
                    ]
                }}
            >
            </CommandButton>
        );
    }

    private _renderNewIcon(): JSX.Element {
        return (
            <i className={'ms-Icon css-liugll ms-CommandBarItem-icon ms-CommandBarItem-iconColor ms-Icon--Add'} aria-hidden="true"></i>
        );
    }

    private _renderUpladItem(item: IContextualMenuItem): JSX.Element {
        return (
            <CommandButton
                className={'ms-CommandBarItem-link'}
                iconProps={{ iconName: 'Upload' }}
            >
                Upload
            </CommandButton>
        );
    }
}