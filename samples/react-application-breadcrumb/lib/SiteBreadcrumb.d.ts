import * as React from "react";
import { ISiteBreadcrumbProps, ISiteBreadcrumbState } from "./ISiteBreadcrumb";
export default class SiteBreadcrumb extends React.Component<ISiteBreadcrumbProps, ISiteBreadcrumbState> {
    private _linkItems;
    constructor(props: ISiteBreadcrumbProps);
    /**
     * React component lifecycle hook, runs after render
     */
    componentDidMount(): void;
    /**
     * Start the link generation for the breadcrumb
     */
    private _generateLinks;
    /**
     * Retrieve the parent web URLs
     * @param webUrl Current URL of the web to process
     */
    private _getParentWeb;
    /**
     * Set the current breadcrumb data
     */
    private _setBreadcrumbData;
    /**
     * Default React component render method
     */
    render(): React.ReactElement<ISiteBreadcrumbProps>;
}
//# sourceMappingURL=SiteBreadcrumb.d.ts.map