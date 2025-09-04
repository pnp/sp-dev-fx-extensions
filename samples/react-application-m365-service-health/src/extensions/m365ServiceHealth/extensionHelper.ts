import { Theme as V8Theme, getTheme } from "@fluentui/react";

import { DirectoryRole } from "@microsoft/microsoft-graph-types";
import { IReadonlyTheme } from "@microsoft/sp-component-base";
import { MSGraphClientV3 } from "@microsoft/sp-http";

export const isUserAdmin = async (client: MSGraphClientV3): Promise<boolean> => {
  try {
    const response = await client.api("/me/memberOf").version("v1.0").get();
    type DirectoryRoleWithOData = DirectoryRole & { "@odata.type"?: string };
    const roles: DirectoryRoleWithOData[] = response.value;

    const adminRoles = [
      "Global Administrator",
      "Service Support Administrator",
      "Helpdesk Administrator",
      "Global Reader",
      "Power Platform admin",
      "User admin"
    ].map(role => role.trim().toLowerCase());

    return roles.some(
      role =>
        role.displayName &&
        role["@odata.type"] === "#microsoft.graph.directoryRole" &&
        adminRoles.includes(role.displayName.trim().toLowerCase())
    );
  } catch (error) {
    console.error("Error checking user roles:", error);
    return false;
  }
};
// Load the current theme from the window object
export const loadTheme = (): IReadonlyTheme | undefined => {
  if (typeof window.__loadTheme === "function") {
    return window.__loadTheme();
  }
  console.warn("Theme loading function not found.");
  return undefined;
};

/**
 * Converts an SPFx IReadonlyTheme into a full Fluent UI v8 Theme
 * by using Fluent's DefaultTheme as fallback.
 */
export const convertToV8Theme = (spfxTheme: IReadonlyTheme): V8Theme => {   
    const DefaultTheme = getTheme();
    return {
        ...DefaultTheme,
        palette: {
          ...DefaultTheme.palette,
          ...(spfxTheme.palette || {}),
        },
      };
  }