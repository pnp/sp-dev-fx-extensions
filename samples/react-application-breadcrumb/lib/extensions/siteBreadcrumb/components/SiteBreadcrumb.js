var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import * as React from "react";
import { Breadcrumb } from 'office-ui-fabric-react/lib/Breadcrumb';
import { SPHttpClient } from "@microsoft/sp-http";
import styles from './SiteBreadcrumb.module.scss';
var SiteBreadcrumb = /** @class */ (function (_super) {
    __extends(SiteBreadcrumb, _super);
    function SiteBreadcrumb(props) {
        var _this = _super.call(this, props) || this;
        // Initiate the private link items variable
        _this._linkItems = [];
        // Initiate the component state
        _this.state = {
            breadcrumbItems: []
        };
        return _this;
    }
    /**
     * React component lifecycle hook, runs after render
     */
    SiteBreadcrumb.prototype.componentDidMount = function () {
        // Start generating the links for the breadcrumb
        this._generateLinks();
    };
    /**
     * Start the link generation for the breadcrumb
     */
    SiteBreadcrumb.prototype._generateLinks = function () {
        // Add the current site to the links list
        this._linkItems.push({
            text: this.props.context.pageContext.web.title,
            key: this.props.context.pageContext.web.id.toString(),
            href: this.props.context.pageContext.web.absoluteUrl,
            isCurrentItem: !this.props.context.pageContext.list.serverRelativeUrl
        });
        // Check if the current list URL is available
        if (!!this.props.context.pageContext.list.serverRelativeUrl) {
            // Add the current list to the links list
            this._linkItems.push({
                text: this.props.context.pageContext.list.title,
                key: this.props.context.pageContext.list.id.toString(),
                href: this.props.context.pageContext.list.serverRelativeUrl,
                isCurrentItem: true
            });
        }
        // Check if you are already on the root site
        if (this.props.context.pageContext.site.serverRelativeUrl === this.props.context.pageContext.web.serverRelativeUrl) {
            this._setBreadcrumbData();
        }
        else {
            // Retrieve the parent webs information
            this._getParentWeb(this.props.context.pageContext.web.absoluteUrl);
        }
    };
    /**
     * Retrieve the parent web URLs
     * @param webUrl Current URL of the web to process
     */
    SiteBreadcrumb.prototype._getParentWeb = function (webUrl) {
        var _this = this;
        // Retrieve the parent web info
        var apiUrl = webUrl + "/_api/web/parentweb?$select=Id,Title,ServerRelativeUrl";
        this.props.context.spHttpClient.get(apiUrl, SPHttpClient.configurations.v1)
            .then(function (response) {
            return response.json();
        })
            .then(function (webInfo) {
            if (!webInfo.error) {
                // Check if the correct data is retrieved
                if (!webInfo.ServerRelativeUrl && !webInfo.Title) {
                    _this._setBreadcrumbData();
                    return;
                }
                // Store the current site
                _this._linkItems.unshift({
                    text: webInfo.Title,
                    key: webInfo.Id,
                    href: webInfo.ServerRelativeUrl
                });
                // Check if you retrieved all the information up until the root site
                if (webInfo.ServerRelativeUrl === _this.props.context.pageContext.site.serverRelativeUrl) {
                    _this._setBreadcrumbData();
                }
                else {
                    // retrieve the information from the parent site
                    webUrl = webUrl.substring(0, (webUrl.indexOf(webInfo.ServerRelativeUrl + "/") + webInfo.ServerRelativeUrl.length));
                    _this._getParentWeb(webUrl);
                }
            }
            else {
                // Set the current breadcrumb data which is already retrieved
                _this._setBreadcrumbData();
            }
        });
    };
    /**
     * Set the current breadcrumb data
     */
    SiteBreadcrumb.prototype._setBreadcrumbData = function () {
        this.setState({
            breadcrumbItems: this._linkItems
        });
    };
    /**
     * Default React component render method
     */
    SiteBreadcrumb.prototype.render = function () {
        return (React.createElement("div", { className: styles.breadcrumb },
            React.createElement("div", { className: styles.msBgColorThemePrimary },
                React.createElement(Breadcrumb, { items: this.state.breadcrumbItems, ariaLabel: 'Website breadcrumb', className: styles.breadcrumbLinks }))));
    };
    return SiteBreadcrumb;
}(React.Component));
export default SiteBreadcrumb;
//# sourceMappingURL=SiteBreadcrumb.js.map