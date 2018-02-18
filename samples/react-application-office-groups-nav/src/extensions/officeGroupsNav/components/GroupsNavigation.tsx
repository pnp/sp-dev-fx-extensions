import * as React from 'react';
import { CommandBar, IContextualMenuItem } from 'office-ui-fabric-react';

export interface IGroup {
    name: string;
    url: string;
}

export interface IGroupsNavigationProps {
    groups: IGroup[];
}

export default class GroupsNavigation extends React.Component<IGroupsNavigationProps, {}> {
    public constructor(props: IGroupsNavigationProps) {
        super(props);
    }

    public render(): JSX.Element {
        const groups: IContextualMenuItem[] = this.props.groups.map(gr => { return { key: gr.url, name: gr.name, href: gr.url }; });
        return (
            <CommandBar items={groups} />
        );
    }
}