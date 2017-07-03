import * as React from 'react';

import TreeMap, { ColorModel } from "react-d3-treemap";
// Be sure to include styles at some point
import "react-d3-treemap/dist/react.d3.treemap.css";

import { IFileSizeViewerProps } from "./IFileSizeViewerProps";

export class FileSizeViewer extends React.Component<IFileSizeViewerProps, {}> {

  constructor(props) {
    super(props);
  }

  public render(): JSX.Element {
    return (
      <TreeMap
        height={300}
        width={600}
        data={this.props.data}
        valueUnit={"KB"}
        colorModel={ColorModel.Depth}
        disableBreadcrumb={true}
        bgColorRangeLow={"#757575"}
        bgColorRangeHigh={"#33ccff"}
      />
    );
  }

}


