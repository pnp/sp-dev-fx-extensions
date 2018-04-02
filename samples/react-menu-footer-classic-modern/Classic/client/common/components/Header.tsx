import * as React from 'react';
import * as ReactDOM from 'react-dom';

import ILink from '../model/ILink';

require ('./HeaderFooter.scss');

export interface IHeaderProps {
    links: ILink[];
}

export class Header extends React.Component<IHeaderProps, {}> {

    constructor(props: IHeaderProps) {
        super(props);
    }

    public render(): JSX.Element {
        return (
            <div className="topNav">
            {/* Render hamburger menu */}
            <label htmlFor="show-menu" className="show-menu">
                <div className="show-menu"><div className="hamburger">
                    <div></div><div></div><div></div>
                </div></div>
            </label>
            <input type="checkbox" id="show-menu" role="button" />
            {/* Render the main menu */}
            <ul>
            {this.props.links.map(l => (
                <li>
                    <a href={l.url}>{l.name}</a>
                    {/* Render a child menu */}
                    <ul className="hidden">
                        {l.children ? l.children.map(m => (
                            <li>
                                <a href={m.url}>{m.name}</a>
                            </li>
                        )) : null}
                    </ul>
                    {/* End child menu */}
                </li>
            ))}
            </ul>
            {/* End main menu */}
            </div>
        );
    }
}