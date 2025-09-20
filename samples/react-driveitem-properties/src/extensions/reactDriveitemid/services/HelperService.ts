import { IDriveItemInfo } from "../models/IDriveItemInfo";

// eslint-disable-next-line @rushstack/no-new-null
export function extractDriveAndItem(url: string): IDriveItemInfo | null {
  try {
    const u = new URL(url);
    const path = u.pathname;

    // Case 1: drives/{drive-id}/items/{item-id}
    const itemMatch = path.match(/\/drives\/([^/]+)\/items\/([^/]+)/);
    if (itemMatch) {
      return {
        drive: itemMatch[1],
        driveItem: itemMatch[2]
      };
    }

    // Case 2: drives/{drive-id}/root:/path/to/file
    const pathMatch = path.match(/\/drives\/([^/]+)\/root:(.+)/);
    if (pathMatch) {
      return {
        drive: pathMatch[1],
        driveItem: undefined
      };
    }

    // Case 3: drives/{drive-id}/root
    const rootMatch = path.match(/\/drives\/([^/]+)\/root$/);
    if (rootMatch) {
      return {
        drive: rootMatch[1],
        driveItem: undefined
      };
    }

    return null;
  } catch {
    return null;
  }
}