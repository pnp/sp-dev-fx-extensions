import * as React from "react";

import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  FluentProvider,
  webLightTheme,
  IdPrefixProvider,
} from "@fluentui/react-components";
import { IDriveItemInfo, IDriveItemInfoProps } from "../models/IDriveItemInfo";
import { extractDriveAndItem } from "../services/HelperService";

import { Detail } from "./Detail";

export const DriveItemInfo = (props: IDriveItemInfoProps): JSX.Element => {
  const [open, setOpen] = React.useState(false);
  const [driveDetails, setDriveDetails] = React.useState<IDriveItemInfo>({
    drive: undefined,
    driveItem: undefined,
  });
  React.useEffect(() => {
    if (props.itemUrl) {
      const driveInfo = extractDriveAndItem(props.itemUrl);
      setDriveDetails({
        drive: driveInfo?.drive,
        driveItem: driveInfo?.driveItem,
      });
      setOpen(true);
    }
  }, [props]);

  return (
    <IdPrefixProvider value="react-driveitem-properties-1">
      <FluentProvider theme={webLightTheme}>
        <Dialog
          modalType="non-modal"
          open={open}
          onOpenChange={(_, data) => setOpen(data.open)}
        >
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Drive Item Properties</DialogTitle>
              <DialogContent>
                <Detail value={driveDetails.drive} label={"Drive Id"} />
                <Detail
                  value={driveDetails.driveItem}
                  label={"Drive Item Id"}
                />
              </DialogContent>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </FluentProvider>
    </IdPrefixProvider>
  );
};
