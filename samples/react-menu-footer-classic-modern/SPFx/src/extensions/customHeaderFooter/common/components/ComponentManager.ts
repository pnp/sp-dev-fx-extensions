import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { IHeaderProps, Header } from './Header';
import { IFooterProps, Footer } from './Footer';

import IHeaderFooterData from '../model/IHeaderFooterData';

import { languageManager } from '../../languageManager';

export default class ComponentManager {

    public static render(headerDomElement: HTMLElement, footerDomElement: HTMLElement,
        data: IHeaderFooterData): void {

        const strings = languageManager.GetStrings();
        
        // If there is a header DOM element, make the react element and render it
        if (headerDomElement) {
            const reactElt: React.ReactElement<IHeaderProps> = React.createElement(Header, {
                links: data.headerLinks
            });
            ReactDOM.render(reactElt, headerDomElement);
        }

        // If there is a footer DOM element, make the react element and render it
        if (footerDomElement) {
            const reactElt: React.ReactElement<IFooterProps> = React.createElement(Footer, {
                message: strings.FooterMessage,
                links: data.footerLinks
            });
            ReactDOM.render(reactElt, footerDomElement);
        }
    }
}