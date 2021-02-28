import * as React from 'react';

import TreeMap, { ColorModel } from "react-d3-treemap";
import { DialogContent } from 'office-ui-fabric-react/lib/Dialog';
// Be sure to include styles at some point
import "react-d3-treemap/dist/react.d3.treemap.css";

export interface IFileSizeViewerProps {
    data: any;
    close: () => void;
}

const FileSizeViewer: React.FC<IFileSizeViewerProps> = (props) => {
    return (
        <DialogContent
            title="File Size Viewer"
            showCloseButton={true}
            onDismiss={props.close}
        >
            <TreeMap
                height={300}
                width={600}
                data={props.data}
                valueUnit={"KB"}
                colorModel={ColorModel.Depth}
                disableBreadcrumb={false}
                bgColorRangeLow={"#757575"}
                bgColorRangeHigh={"#33ccff"}
            />
        </DialogContent>
    );
};

export default FileSizeViewer;
